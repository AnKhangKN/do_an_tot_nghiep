const rescuer_locationService = require("@modules/location/service/rescuer_location.service");
const rescuerService = require("@modules/rescuer/service/rescuer.service");
const sos_requestRepository = require("@modules/sos/repository/sos_request.repository");
const redis = require("../config/redis.config");

const lastSeenCache = new Map();

module.exports = (socket, io) => {
    socket.on("rescuer:location:update", async ({ lat, lng }) => {
        try {
            const userId = socket.user?.userId;
            if (!userId) return;

            // 1. Cập nhật vị trí vào Redis Geo (siêu nhanh < 1ms)
            await rescuer_locationService.updateLocation({
                userId,
                lat,
                lng
            });

            // 2. Đọc ngay thông tin ca cứu hộ active từ Redis Cache
            const activeRescueRaw = await redis.hget("active_rescues", userId);
            if (activeRescueRaw) {
                const { victimId, sosRequestId } = JSON.parse(activeRescueRaw);

                // STREAM VỊ TRÍ TỨC THÌ TỚI VICTIM (KHÔNG CHỜ DATABASE)
                io.to(`victim:${victimId}`).emit("rescuer:location:updated", {
                    rescuerId: userId,
                    sosRequestId,
                    lat,
                    lng
                });
            }

            // 3. Cập nhật last_seen ngầm (non-blocking) & throttle 10 giây/lần để bảo vệ Database
            const now = Date.now();
            const lastUpdated = lastSeenCache.get(userId) || 0;
            if (now - lastUpdated > 10000) {
                lastSeenCache.set(userId, now);
                rescuerService.updateLastSeen({ userId }).catch(err => 
                    console.error("[SOCKET] Error async updateLastSeen:", err)
                );
            }
        }
        catch (error) {
            console.error("Location update error:", error);
        }
    });
}