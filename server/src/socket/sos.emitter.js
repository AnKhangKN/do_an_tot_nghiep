/**
 * Xử lý emit sự kiện sos:offer tới room của Rescuer
 * @param {Object} io - Đối tượng Socket.IO Server chính
 * @param {Object} data - Dữ liệu đã được parse từ Redis
 */
const handleSosOffer = (io, data) => {
    try {
        const room = `rescuer:${data.rescuerId}`;

        console.log("Mã phòng: ", room);
        
        // Phát dữ liệu tới room tương ứng
        io.to(room).emit("sos:offer", data);
        
        console.log(`[SOS EMITTER] Emitted 'sos:offer' to ${room}`, data);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting to rescuer:${data?.rescuerId}:`, err);
    }
};

/**
 * Emit sự kiện sos:not_found tới room của Victim khi hết attempt tìm không ra rescuer
 * @param {Object} io - Đối tượng Socket.IO Server chính
 * @param {Object} data - Dữ liệu đã được parse từ Redis: { sosId, victimId }
 */
const handleSosNotFound = (io, data) => {
    try {
        const room = `victim:${data.victimId}`;
        io.to(room).emit("sos:not_found", { sosId: data.sosId });
        console.log(`[SOS EMITTER] Emitted 'sos:not_found' to ${room}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting sos:not_found to victim:${data?.victimId}:`, err);
    }
};

/**
 * Emit sự kiện sos:cancelled tới tất cả các Rescuer (hoặc phòng cụ thể) khi Nạn nhân hủy SOS
 * @param {Object} io - Đối tượng Socket.IO Server chính
 * @param {Object} data - { sosId, sosRequestId, rescuerId, victimId, message }
 */
const handleSosCancelled = (io, data) => {
    try {
        const sosRequestId = data.sosRequestId || data.sosId;
        const payload = {
            sosRequestId,
            sosId: sosRequestId,
            message: data.message || "Nạn nhân đã hủy yêu cầu cứu hộ.",
        };

        if (data.rescuerId) {
            io.to(`rescuer:${data.rescuerId}`).emit("sos:cancelled", payload);
        }

        // Broadcast tới tất cả Rescuer để đóng offer trên các thiết bị đang nhận offer
        io.emit("sos:cancelled", payload);
        console.log(`[SOS EMITTER] Emitted 'sos:cancelled' for SOS: ${sosRequestId}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting sos:cancelled:`, err);
    }
};

module.exports = {
    handleSosOffer,
    handleSosNotFound,
    handleSosCancelled,
};