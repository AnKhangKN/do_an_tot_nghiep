const rescuerService = require("@modules/rescuer/service/rescuer.service");

// Lưu trữ các timeout offline đang chờ xử lý theo userId
const pendingOfflineTimeouts = new Map();

const cancelPendingOffline = (userId) => {
    const timeoutId = pendingOfflineTimeouts.get(userId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        pendingOfflineTimeouts.delete(userId);
        console.log(`[SOCKET] Hủy tự động offline cho cứu hộ viên: ${userId} (đã kết nối lại)`);
        return true;
    }
    return false;
};

module.exports = (socket, io) => {
    socket.on("disconnect", async (reason) => {
        console.log("User disconnected:", socket.user?.userId, "Reason:", reason);

        if (socket.user?.role === "RESCUER") {
            const userId = socket.user.userId;

            // Hủy lịch cũ nếu có
            cancelPendingOffline(userId);

            // Đặt lịch hẹn chờ 15 giây trước khi tự động chuyển offline
            const timeoutId = setTimeout(async () => {
                try {
                    console.log(`[SOCKET] Thực hiện chuyển offline cho cứu hộ viên: ${userId} (hết thời gian chờ kết nối lại)`);
                    await rescuerService.goOffline({ userId });
                } catch (error) {
                    // Bỏ qua lỗi
                } finally {
                    pendingOfflineTimeouts.delete(userId);
                }
            }, 15000); // 15 giây

            pendingOfflineTimeouts.set(userId, timeoutId);
        }
    });
};

module.exports.cancelPendingOffline = cancelPendingOffline;
