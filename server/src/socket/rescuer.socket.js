const rescuerService = require("@modules/rescuer/service/rescuer.service");
const sosRequestService = require("@modules/sos/service/sos_request.service");
const userService = require("@modules/user/services/user.service");
const notificationService = require("@modules/notification/service/notification.service");
const redis = require("../config/redis.config");

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

    // Cứu hộ chấp nhận SOS
    socket.on("rescue:accept", async (payload) => {
        try {
            const rescuerId = socket.user.userId;
            const sosRequestId = payload.sosRequestId || payload.incidentId;

            if (!sosRequestId) {
                throw new Error("Mã yêu cầu cứu hộ là bắt buộc!");
            }

            console.log(`[SOCKET] Rescuer ${rescuerId} accepts SOS ${sosRequestId}`);

            await sosRequestService.acceptSOS({ sosRequestId, rescuerId });

        } catch (error) {
            console.error("Accept SOS error:", error);
            socket.emit("error", { message: error.message || "Không thể nhận cứu hộ!" });
        }
    });


    // Hoàn thành cứu hộ
    socket.on("rescue:complete", async ({ incidentId }) => {
        try {
            const rescuerId = socket.user.userId;
            const sosRequestId = incidentId;
            console.log(`[SOCKET] Rescuer ${rescuerId} completes SOS ${sosRequestId}`);

            const updatedSos = await sosRequestService.completeSOS({ sosRequestId });

            // Xóa active rescue khỏi Redis
            await redis.hdel("active_rescues", rescuerId);

            // Gửi sự kiện hoàn thành về cho cả Victim và Rescuer
            const victimRoom = `victim:${updatedSos.user_id}`;
            io.to(victimRoom).emit("rescue:completed", { sosRequestId });

            socket.emit("rescue:completed", { sosRequestId });
            console.log(`[SOCKET] SOS ${sosRequestId} completed successfully.`);

        } catch (error) {
            console.error("Complete SOS error:", error);
            socket.emit("error", { message: error.message || "Không thể hoàn thành cứu hộ!" });
        }
    });

    // Cứu hộ từ chối hoặc bỏ qua SOS offer
    socket.on("rescue:reject", async (payload) => {
        try {
            const rescuerId = socket.user.userId;
            const sosRequestId = payload?.incidentId || payload?.sosRequestId;
            console.log(`[SOCKET] Rescuer ${rescuerId} rejected or timed out SOS offer: ${sosRequestId}`);

            if (sosRequestId) {
                await sosRequestService.rejectSOS({ sosRequestId, rescuerId });
            } else {
                await redis.del(`sos:offer:rescuer:${rescuerId}`);
            }
        } catch (error) {
            console.error("Reject SOS error:", error);
        }
    });
};