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

// Sau này có thêm các event khác của SOS thì viết thêm function và export ra ở đây
module.exports = {
    handleSosOffer,
    handleSosNotFound,
};