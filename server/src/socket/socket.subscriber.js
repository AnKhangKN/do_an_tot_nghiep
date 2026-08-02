const redis = require("../config/redis.config");
const { handleSosOffer, handleSosNotFound, handleSosCancelled, handleSosAccepted, handleChatConversationClosed, handleSosCompleted, handleRescueCancelled, handleRescuerSuspended, handleVictimCancelBlocked } = require("./sos.emitter");

const subscriber = redis.duplicate();

module.exports = async (io) => {

    subscriber.on("error", (err) => {
        console.error("REDIS SUB ERROR", err);
    });

    // Lắng nghe tất cả message từ Redis
    subscriber.on("message", (channel, message) => {

        try {
            const data = JSON.parse(message);

            // Phân luồng (Route) theo tên channel
            switch (channel) {
                case "sos:offer":
                    // Truyền data và io qua file emit để xử lý
                    handleSosOffer(io, data); 
                    break;

                case "sos:not_found":
                    // Thông báo về victim khi không tìm được rescuer
                    handleSosNotFound(io, data);
                    break;

                case "sos:cancelled":
                    // Thông báo về tất cả rescuer khi nạn nhân hủy SOS
                    handleSosCancelled(io, data);
                    break;

                case "sos:accepted":
                    // Thông báo về cả victim và rescuer khi nhận ca cứu hộ (socket hoặc QR)
                    handleSosAccepted(io, data);
                    break;

                case "sos:completed":
                    // Thông báo về cả victim và rescuer khi hoàn thành ca cứu hộ
                    handleSosCompleted(io, data);
                    break;

                case "rescue:cancelled":
                    // Thông báo về cả victim và rescuer khi cứu hộ viên hủy ca cứu hộ đang thực hiện
                    handleRescueCancelled(io, data);
                    break;

                case "rescuer:suspended":
                    // Thông báo tới rescuer khi tài khoản bị tạm khóa do hủy ca nhiều lần
                    handleRescuerSuspended(io, data);
                    break;

                case "victim:cancel_blocked":
                    // Thông báo tới victim khi tài khoản bị tạm khóa gửi yêu cầu cứu hộ do hủy ca nhiều lần
                    handleVictimCancelBlocked(io, data);
                    break;

                case "chat:conversation_closed":
                    // Thông báo đóng kênh chat ca cứu hộ
                    handleChatConversationClosed(io, data);
                    break;

                default:
                    console.warn(`[REDIS SUB] Unhandled channel: ${channel}`);
            }
        } catch (err) {
            console.error("[REDIS SUB] JSON Parse Error:", err);
        }
    });

    // Subscribe các channels
    await subscriber.subscribe("sos:offer", "sos:not_found", "sos:cancelled", "sos:accepted", "sos:completed", "chat:conversation_closed", "rescue:cancelled", "rescuer:suspended", "victim:cancel_blocked");
};