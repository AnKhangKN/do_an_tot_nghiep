const rescuerService = require(
    "@modules/rescuer/service/rescuer.service"
);

const rescuerLocationService = require(
    "@modules/location/service/rescuer_location.service"
);

module.exports = (socket, io) => {
    // Heartbeat mỗi 15s
    socket.on("rescuer:heartbeat", async () => {
        try {
            const userId = socket.user.userId;

            await rescuerService.updateLastSeen({ userId });
        } catch (error) {
            console.error(error);
        }
    });

    // Bật chế độ sẵn sàng nhận SOS
    socket.on("rescuer:online", async () => {
        
        try {

            const userId = socket.user.userId;

            await rescuerService.goOnline({ userId });

        } catch (error) {
            console.error(error);
        }
    });

    // Client chủ động offline
    socket.on("rescuer:offline", async () => {
        try {
            const userId = socket.user.userId;

            await rescuerService.goOffline({ userId });

        } catch (error) {
            console.error(error);
        }
    });

    // Mất kết nối socket tự động offline
    socket.on("rescuer:disconnect", async () => {
        try {
            const userId = socket.user?.userId;

            if (!userId) return;

            await rescuerService.goOffline({ userId });

        } catch (error) {
            console.error(error);
        }
    });


    // Client quyết định khi nào gửi
    // (ví dụ đã di chuyển > 10m)
    socket.on("rescuer:location:update", async (data) => {
        try {
            const userId = socket.user.userId;

            await rescuerLocationService.updateLocation({
                userId,
                latitude: data.latitude,
                longitude: data.longitude
            });

        } catch (error) {
            console.error(error);
        }
    });



};