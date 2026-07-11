const rescuerService = require("@modules/rescuer/service/rescuer.service");

module.exports = (socket, io) => {
    socket.on("disconnect", async (reason) => {
        console.log("User disconnected:", socket.user?.userId);

        if (socket.user?.role === "RESCUER") {
            try {
                // Tự động chuyển offline và xóa khỏi Redis
                await rescuerService.goOffline({ userId: socket.user.userId });
            } catch (error) {
                // Bỏ qua lỗi nếu họ đã chủ động bấm offline trước đó
            }
        }
    });
}
