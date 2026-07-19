const rescuerService = require('@modules/rescuer/service/rescuer.service');

class MatchingService {

    constructor() {
        this.rescuerService = rescuerService;
    }

    /**
     * MAIN: find suitable rescuers for SOS
     */
    findNearbyRescuersForSOS = async (sos, radius) => {

        // 1. Lấy từ redis (geo search) {#7a0,10}
        const nearbyRescuers =
            await this.rescuerService.findNearbyRescuers({
                lat: sos.victim_lat,
                lng: sos.victim_lng,
                radius
            });

        if (!nearbyRescuers || nearbyRescuers.length === 0) {
            return [];
        }

        // 2. NORMALIZE redis result
        const nearby = nearbyRescuers.map(([userId, distance]) => ({
            userId,
            distance: parseFloat(distance)
        }));

        const rescuerIds = nearby.map(r => r.userId);
        if (rescuerIds.length === 0) return [];

        const redis = require("@/config/redis.config");

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
                // Lazy Cleanup: Cứu hộ viên đã ngắt kết nối đột ngột > 5 phút, xóa khỏi tập hợp Geo
                cleanupPipeline.zrem('rescuer_locations', id);
                console.log(`[REDIS CLEANUP] Xóa cứu hộ viên không còn hoạt động khỏi Geo Set: ${id}`);
            }
        });

        // Chạy dọn dẹp bất đồng bộ trong background
        if (cleanupPipeline.length > 0) {
            cleanupPipeline.exec().catch(err => console.error("Lỗi dọn dẹp Redis Geo:", err));
        }

        if (activeRescuerIds.length === 0) return [];

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
                    status: "ACTIVE", // Đang online trong Redis Geo mặc định là ACTIVE
                    lastSeenAt: lastSeenAt
                };
            })
            .filter(Boolean);

        // 6. FILTER AVAILABLE
        const available = await this.#filterAvailability(merged);

        if (!available.length) {
            return [];
        }

        // 7. SORT BY DISTANCE (closest first)
        available.sort((a, b) => a.distance - b.distance);

        // 8. RETURN TOP 5
        return available.slice(0, 5);
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
        });

        const busyResults = await pipeline.exec();

        return rescuers.filter((r, index) => {
            // must be active
            if (r.status !== "ACTIVE") return false;

            // must have lastSeen
            if (!r.lastSeenAt) return false;

            const lastSeen = new Date(r.lastSeenAt).getTime();
            const diffSeconds = (now - lastSeen) / 1000;

            // must be recently online
            if (diffSeconds > NOW_LIMIT_SECONDS) return false;

            // Lấy kết quả từ Redis pipeline
            const isRescuing = busyResults[index * 2][1] === 1; // hexists trả về 1 nếu field tồn tại
            if (isRescuing) return false;

            const hasOffer = busyResults[index * 2 + 1][1] === 1; // exists trả về 1 nếu key tồn tại
            if (hasOffer) return false;

            return true;
        });
    }
}

module.exports = new MatchingService();