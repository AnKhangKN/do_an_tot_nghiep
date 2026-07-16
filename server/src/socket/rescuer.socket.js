const rescuerService = require("@modules/rescuer/service/rescuer.service");

module.exports = (socket, io) => {
    // Heartbeat mỗi 15s
    socket.on("rescuer:heartbeat", async () => {
        try {
            const userId = socket.user.userId;
            console.log(`[SOCKET] Nhận heartbeat từ user: ${userId}`);
            await rescuerService.updateLastSeen({ userId });
        } catch (error) {
            console.error("Heartbeat error:", error);
        }
    });

    // Bật chế độ sẵn sàng nhận SOS
    socket.on("rescuer:online", async () => {
        try {
            const userId = socket.user.userId;
            console.log("User going online:", userId);

            await rescuerService.goOnline({ userId });
        } catch (error) {
            console.error("Go online error:", error);
        }
    });

    // Client chủ động offline
    socket.on("rescuer:offline", async () => {
        try {
            const userId = socket.user.userId;
            await rescuerService.goOffline({ userId });
        } catch (error) {
            console.error("Go offline error:", error);
        }
    });
};