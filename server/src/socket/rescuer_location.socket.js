const rescuer_locationService = require("@modules/location/service/rescuer_location.service");

module.exports = (socket, io) => {
    // Cập nhật vị trí khi cách vị trí ban đầu 20m
    socket.on("rescuer:location:update", async ({ lat, lng }) => {

        try {
            const userId = socket.user.userId;
            await rescuer_locationService.updateLocation({
                userId,
                lat,
                lng
            });
        }
        catch (error) {
            console.error("Location update error:", error);
        }
    });
}