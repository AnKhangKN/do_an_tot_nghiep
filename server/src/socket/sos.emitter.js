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
        const victimId = data.victimId || data.userId || data.user_id;
        const sosId = data.sosId || data.sosRequestId || data.sos_request_id;

        if (victimId) {
            io.to(`victim:${victimId}`).emit("sos:not_found", { sosId, victimId });
            io.to(`user:${victimId}`).emit("sos:not_found", { sosId, victimId });
        }
        io.emit("sos:not_found", { sosId, victimId });

        console.log(`[SOS EMITTER] Emitted 'sos:not_found' for SOS: ${sosId} (Victim: ${victimId})`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting sos:not_found:`, err);
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

/**
 * Emit sự kiện chat:conversation_closed khi kênh chat ca cứu hộ bị đóng
 * @param {Object} io - Socket.IO Server
 * @param {Object} data - Dữ liệu parse từ Redis PubSub
 */
const handleChatConversationClosed = (io, data) => {
    try {
        const { conversationId, sosRequestId, message } = data;
        const payload = {
            conversationId,
            sosRequestId,
            isClosed: true,
            message: message || "Cuộc trò chuyện này đã tự động đóng do ca cứu hộ đã hoàn thành hoặc bị hủy.",
        };
        if (conversationId) {
            io.to(`conversation:${conversationId}`).emit("chat:conversation_closed", payload);
        }
        if (data.victimId) {
            io.to(`user:${data.victimId}`).emit("chat:conversation_closed", payload);
            io.to(`victim:${data.victimId}`).emit("chat:conversation_closed", payload);
        }
        if (data.rescuerId) {
            io.to(`user:${data.rescuerId}`).emit("chat:conversation_closed", payload);
            io.to(`rescuer:${data.rescuerId}`).emit("chat:conversation_closed", payload);
        }
        io.to("admin_room").emit("chat:conversation_closed", payload);
        console.log(`[SOS EMITTER] Emitted 'chat:conversation_closed' for conversation: ${conversationId}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting chat:conversation_closed:`, err);
    }
};

module.exports = {
    handleSosOffer,
    handleSosNotFound,
    handleSosCancelled,
    handleSosAccepted,
    handleChatConversationClosed,
};