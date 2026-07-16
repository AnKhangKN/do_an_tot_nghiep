const rescuer_locationService = require("@modules/location/service/rescuer_location.service");
const rescuerService = require("@modules/rescuer/service/rescuer.service");

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
        }
        catch (error) {
            console.error("Location update error:", error);
        }
    });
}