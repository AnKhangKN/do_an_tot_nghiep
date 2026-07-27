/**
 * Xử lý emit sự kiện sos:offer tới room của Rescuer
 * @param {Object} io - Đối tượng Socket.IO Server chính
 * @param {Object} data - Dữ liệu đã được parse từ Redis
 */
const handleSosOffer = (io, data) => {
    try {
        const rescuerId = data.rescuerId || data.rescuer_id;
        const room = `rescuer:${rescuerId}`;

        console.log("Mã phòng rescuer: ", room);
        
        // Phát dữ liệu tới room rescuer, room user và broadcast toàn bộ
        io.to(room).emit("sos:offer", data);
        io.to(`user:${rescuerId}`).emit("sos:offer", data);
        io.emit("sos:offer", data);
        
        console.log(`[SOS EMITTER] Emitted 'sos:offer' to ${room} & user:${rescuerId}`, data);
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

/**
 * Emit sự kiện rescue:accepted (tới Victim) và rescue:accept:success (tới Rescuer) khi ca SOS được tiếp nhận
 * @param {Object} io - Socket.IO Server
 * @param {Object} data - Dữ liệu parse từ Redis PubSub
 */
const handleSosAccepted = (io, data) => {
    try {
        const victimRoom = `victim:${data.victimId}`;
        const rescuerRoom = `rescuer:${data.rescuerId}`;

        // 1. Emit tới Victim
        io.to(victimRoom).emit("rescue:accepted", {
            sosRequestId: data.sosRequestId,
            status: "IN_PROGRESS",
            rescuer: data.rescuer
        });

        // 2. Emit tới Rescuer
        io.to(rescuerRoom).emit("rescue:accept:success", {
            sosRequestId: data.sosRequestId,
            status: "IN_PROGRESS",
            victim: data.victim
        });

        // 3. Emit tới Admin Dashboard
        io.to("admin:dashboard").emit("SOS_ACCEPTED", {
            sosId: data.sosRequestId,
            rescuerId: data.rescuerId,
            viaQR: data.via === 'QR_CODE'
        });

        console.log(`[SOS EMITTER] Emitted 'rescue:accepted' and 'rescue:accept:success' for SOS: ${data.sosRequestId}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting handleSosAccepted:`, err);
    }
};

module.exports = {
    handleSosOffer,
    handleSosNotFound,
    handleSosCancelled,
    handleSosAccepted,
};