const rescuer_locationService = require("@modules/location/service/rescuer_location.service");
const rescuerService = require("@modules/rescuer/service/rescuer.service");
const redis = require("../config/redis.config");

module.exports = (socket, io) => {
    // Cập nhật vị trí khi cách vị trí ban đầu 20m
    socket.on("rescuer:location:update", async ({ lat, lng }) => {

        try {
            const userId = socket.user.userId;
            console.log(`[SOCKET] Nhận location update từ user: ${userId} (${lat}, ${lng})`);
            await rescuer_locationService.updateLocation({
                userId,
                lat,
                lng
            });
            
            // Cập nhật thời điểm hoạt động cuối cùng trong DB để matching service tìm thấy
            await rescuerService.updateLastSeen({ userId });

            // Kiểm tra cuộc cứu hộ đang hoạt động của Rescuer để stream tọa độ cho Victim
            const activeRescue = await redis.hget("active_rescues", userId);
            if (activeRescue) {
                const { victimId, sosRequestId } = JSON.parse(activeRescue);
                io.to(`victim:${victimId}`).emit("rescuer:location:updated", {
                    rescuerId: userId,
                    sosRequestId,
                    lat,
                    lng
                });
                console.log(`[SOCKET] Streamed location update of Rescuer ${userId} to Victim ${victimId}`);
            }
        }
        catch (error) {
            console.error("Location update error:", error);
        }
    });
}