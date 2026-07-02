const rescuerService = require("@modules/rescuer/service/rescuer.service")

module.exports = (socket, io) => {
    // Disconnect
    socket.on("disconnect", async (reason) => {
        console.log(
            "User disconnected:",
            socket.user?.userId,
            "Reason:",
            reason
        );

        try {
            const userId = socket.user?.userId;

            return await rescuerService.goOffline({ userId });
        } catch (error) {
            console.error("Error occurred while handling disconnect:", error);
        }
    });

}