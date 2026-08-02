const rescuerService = require('@modules/rescuer/service/rescuer.service');

class MatchingService {

    constructor() {
        this.rescuerService = rescuerService;
    }

    /**
     * MAIN: find suitable rescuers for SOS
     */
    findNearbyRescuersForSOS = async (sos, radius) => {
        const sosId = sos.sos_request_id;
        const redis = require("@/config/redis.config");

        // Lấy danh sách cứu hộ viên đã từ chối SOS này từ Redis
        const rejectedRescuers = await redis.smembers(`sos:${sosId}:rejected_rescuers`) || [];
        console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - rejected rescuers:`, rejectedRescuers);

        // 1. Lấy từ redis (geo search)
        const nearbyRescuers =
            await this.rescuerService.findNearbyRescuers({
                lat: sos.victim_lat,
                lng: sos.victim_lng,
                radius
            });

        console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - nearby rescuer raw:`, nearbyRescuers);

        if (!nearbyRescuers || nearbyRescuers.length === 0) {
            console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - no nearby rescuers found from GEOSEARCH`);
            return [];
        }

        // 2. NORMALIZE redis result và lọc bỏ những cứu hộ viên đã từ chối
        const nearby = nearbyRescuers
            .map(([userId, distance]) => ({
                userId,
                distance: parseFloat(distance)
            }))
            .filter(r => !rejectedRescuers.includes(r.userId));

        console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - nearby after reject filter:`, nearby);

        const rescuerIds = nearby.map(r => r.userId);
        if (rescuerIds.length === 0) {
            console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - all nearby rescuers were rejected`);
            return [];
        }

        // 3. Sử dụng Pipeline kiểm tra trạng thái hoạt động thực tế (TTL key) để loại bỏ rác
        const pipeline = redis.pipeline();
        rescuerIds.forEach(id => {
            pipeline.exists(`active:rescuer:${id}`);
        });
        const activeResults = await pipeline.exec();

        // 4. Lọc cứu hộ viên đang active và dọn dẹp rác trên Redis Geo
        const activeRescuerIds = [];
        const cleanupPipeline = redis.pipeline();

        rescuerIds.forEach((id, index) => {
            const isExists = activeResults[index][1]; // 1 nếu key tồn tại (active), 0 nếu không
            if (isExists === 1) {
                activeRescuerIds.push(id);
            } else {
                cleanupPipeline.zrem('rescuer_locations', id);
            }
        });

        if (cleanupPipeline.length > 0) {
            cleanupPipeline.exec().catch(err => console.error("Lỗi dọn dẹp Redis Geo:", err));
        }

        if (activeRescuerIds.length === 0) {
            console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - không có rescuer active sau khi check TTL key`);
            return [];
        }

        // Lấy trực tiếp lastSeenAt từ Redis Hash Map cho các cứu hộ viên còn hoạt động
        const lastSeenTimes = await redis.hmget('rescuer:last_seen', ...activeRescuerIds);
        const lastSeenMap = new Map();
        activeRescuerIds.forEach((id, index) => {
            lastSeenMap.set(id, lastSeenTimes[index]);
        });

        // 5. MERGE dữ liệu hoàn toàn từ bộ nhớ Redis (Bypass PostgreSQL)
        const merged = nearby
            .filter(r => activeRescuerIds.includes(r.userId))
            .map(r => {
                const lastSeenAt = lastSeenMap.get(r.userId);
                if (!lastSeenAt) return null;

                return {
                    userId: r.userId,
                    distance: r.distance,
                    status: "ACTIVE",
                    lastSeenAt: lastSeenAt
                };
            })
            .filter(Boolean);

        // 6. FILTER AVAILABLE
        const available = await this.#filterAvailability(merged);
        if (!available.length) {
            console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - không có rescuer khả dụng sau filter cuối`);
            return [];
        }

        // 7. Lấy loại sự cố chuyên môn của các rescuer khả dụng
        const availableRescuerIds = available.map(r => r.userId);
        const incidentTypesMap = await this.rescuerService.getRescuersIncidentTypes(availableRescuerIds);

        // 8. Chia thành 2 nhóm: phù hợp chuyên môn và không phù hợp
        const sosIncidentTypeId = sos.incident_type_id;
        const matchedRescuers = [];
        const unmatchedRescuers = [];

        available.forEach(rescuer => {
            const rescuerIncidentTypes = incidentTypesMap.get(rescuer.userId) || new Set();
            if (rescuerIncidentTypes.has(sosIncidentTypeId)) {
                matchedRescuers.push(rescuer);
            } else {
                unmatchedRescuers.push(rescuer);
            }
        });

        matchedRescuers.sort((a, b) => a.distance - b.distance);
        unmatchedRescuers.sort((a, b) => a.distance - b.distance);

        // Nối 2 nhóm lại: Ưu tiên đúng chuyên môn đứng ĐẦU, cứu hộ viên khác đứng SAU
        const finalRescuers = [...matchedRescuers, ...unmatchedRescuers];
        console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - matched: ${matchedRescuers.length}, unmatched: ${unmatchedRescuers.length}, total: ${finalRescuers.length}`);
        return finalRescuers.slice(0, 5);
    }

    #filterAvailability = async (rescuers) => {
        if (!rescuers || rescuers.length === 0) return [];

        const NOW_LIMIT_SECONDS = 300; // Tăng từ 30s lên 300s (5 phút) để phù hợp với độ trễ di động chạy nền
        const now = Date.now();
        const redis = require("@/config/redis.config");

        const rescuerIds = rescuers.map(r => r.userId);
        const pipeline = redis.pipeline();

        // Kiểm tra xem cứu hộ viên có đang bận cứu nạn (active_rescues) hoặc đang xem xét offer khác không
        rescuerIds.forEach(id => {
            pipeline.hexists("active_rescues", id);
            pipeline.exists(`sos:offer:rescuer:${id}`);
            pipeline.exists(`rescuer:suspended:${id}`);
        });

        const busyResults = await pipeline.exec();

        console.log(
            `[MATCHING] availability check - busy results:`,
            rescuers.map((r, index) => ({
                rescuerId: r.userId,
                isRescuing: busyResults[index * 2]?.[1] === 1,
                hasOffer: busyResults[index * 2 + 1]?.[1] === 1,
                isSuspended: busyResults[index * 2 + 2]?.[1] === 1,
                lastSeenAt: r.lastSeenAt
            }))
        );

        return rescuers.filter((r, index) => {
            // must be active
            if (r.status !== "ACTIVE") {
                console.log(`[MATCHING] loại ${r.userId} vì status != ACTIVE`);
                return false;
            }

            // must have lastSeen
            if (!r.lastSeenAt) {
                console.log(`[MATCHING] loại ${r.userId} vì thiếu lastSeenAt`);
                return false;
            }

            const lastSeen = new Date(r.lastSeenAt).getTime();
            const diffSeconds = (now - lastSeen) / 1000;

            // must be recently online
            if (diffSeconds > NOW_LIMIT_SECONDS) {
                console.log(
                    `[MATCHING] loại ${r.userId} vì lastSeenAt quá cũ: ${diffSeconds.toFixed(1)}s`
                );
                return false;
            }

            const isRescuing = busyResults[index * 2][1] === 1; // hexists trả về 1 nếu field tồn tại
            if (isRescuing) {
                // Tự động kiểm tra giải phóng key rác nếu ca cũ đã kết thúc/hủy
                redis.hget("active_rescues", r.userId).then(async (dataStr) => {
                    if (dataStr) {
                        try {
                            const data = JSON.parse(dataStr);
                            const pool = require("@config/database.config").pool;
                            const res = await pool.query("SELECT status FROM sos_requests WHERE sos_request_id = $1", [data.sosRequestId]);
                            const status = res.rows[0]?.status;
                            if (!status || status === 'COMPLETED' || status === 'CANCELLED') {
                                await redis.hdel("active_rescues", r.userId);
                                console.log(`[MATCHING] Self-healing: Đã xóa active_rescues rác cho Rescuer: ${r.userId}`);
                            }
                        } catch (e) {
                            await redis.hdel("active_rescues", r.userId);
                        }
                    }
                }).catch(() => {});

                console.log(`[MATCHING] loại ${r.userId} vì đang có active_rescues`);
                return false;
            }

            const hasOffer = busyResults[index * 2 + 1][1] === 1; // exists trả về 1 nếu key tồn tại
            if (hasOffer) {
                // Self-healing: Tự động kiểm tra dọn dẹp key offer rác nếu SOS đã kết thúc, bị hủy hoặc gán cho người khác
                redis.get(`sos:offer:rescuer:${r.userId}`).then(async (offeredSosId) => {
                    if (offeredSosId) {
                        try {
                            const pool = require("@config/database.config").pool;
                            const res = await pool.query("SELECT status FROM sos_requests WHERE sos_request_id = $1", [offeredSosId]);
                            const status = res.rows[0]?.status;
                            if (!status || status === 'COMPLETED' || status === 'CANCELLED' || status === 'ASSIGNED' || status === 'IN_PROGRESS') {
                                await redis.del(`sos:offer:rescuer:${r.userId}`);
                                console.log(`[MATCHING] Self-healing: Đã xóa offer rác sos:offer:rescuer cho Rescuer: ${r.userId} (SOS: ${offeredSosId}, status: ${status})`);
                            }
                        } catch (e) {
                            await redis.del(`sos:offer:rescuer:${r.userId}`);
                        }
                    } else {
                        await redis.del(`sos:offer:rescuer:${r.userId}`);
                    }
                }).catch(() => {});

                console.log(`[MATCHING] loại ${r.userId} vì đang có sos:offer:rescuer:${r.userId}`);
                return false;
            }

            // Bị tạm khóa do hủy ca cứu hộ 2 lần liên tiếp (khóa 2 giờ)
            const isSuspended = busyResults[index * 2 + 2][1] === 1; // exists trả về 1 nếu key tồn tại
            if (isSuspended) {
                console.log(`[MATCHING] loại ${r.userId} vì đang bị tạm khóa 2 giờ do hủy ca cứu hộ nhiều lần`);
                return false;
            }

            return true;
        });
    }
}

module.exports = new MatchingService();