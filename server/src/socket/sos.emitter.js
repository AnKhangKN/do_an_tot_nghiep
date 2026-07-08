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

// Sau này có thêm các event khác của SOS thì viết thêm function và export ra ở đây
module.exports = {
    handleSosOffer,
};