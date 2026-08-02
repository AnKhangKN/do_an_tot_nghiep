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

/**
 * Emit sự kiện rescue:completed (tới Victim và Rescuer) khi ca cứu hộ hoàn thành
 * @param {Object} io - Socket.IO Server
 * @param {Object} data - Dữ liệu parse từ Redis PubSub
 */
const handleSosCompleted = (io, data) => {
    try {
        if (data.victimId) {
            io.to(`victim:${data.victimId}`).emit("rescue:completed", { sosRequestId: data.sosRequestId });
        }
        if (data.rescuerId) {
            io.to(`rescuer:${data.rescuerId}`).emit("rescue:completed", { sosRequestId: data.sosRequestId });
        }
        io.to("admin:dashboard").emit("SOS_COMPLETED", { sosId: data.sosRequestId });
        console.log(`[SOS EMITTER] Emitted 'rescue:completed' for SOS: ${data.sosRequestId}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting handleSosCompleted:`, err);
    }
};

/**
 * Emit sự kiện rescue:cancelled (tới Victim và Rescuer) khi Cứu hộ viên hủy ca cứu hộ đang thực hiện
 * @param {Object} io - Socket.IO Server
 * @param {Object} data - Dữ liệu parse từ Redis PubSub
 */
const handleRescueCancelled = (io, data) => {
    try {
        const payload = {
            sosRequestId: data.sosRequestId || data.sosId,
            sosId: data.sosRequestId || data.sosId,
            rescuerId: data.rescuerId,
            victimId: data.victimId,
            reason: data.reason,
            message: data.message || "Cứu hộ viên đã hủy ca cứu hộ.",
        };

        if (data.victimId) {
            io.to(`victim:${data.victimId}`).emit("rescue:cancelled", payload);
            io.to(`user:${data.victimId}`).emit("rescue:cancelled", payload);
        }
        if (data.rescuerId) {
            io.to(`rescuer:${data.rescuerId}`).emit("rescue:cancelled", payload);
            io.to(`user:${data.rescuerId}`).emit("rescue:cancelled", payload);
        }
        io.to("admin:dashboard").emit("SOS_CANCELLED", {
            sosId: data.sosRequestId || data.sosId,
            rescuerId: data.rescuerId
        });
        console.log(`[SOS EMITTER] Emitted 'rescue:cancelled' for SOS: ${payload.sosRequestId}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting rescue:cancelled:`, err);
    }
};

/**
 * Emit sự kiện rescuer:suspended tới Rescuer khi tài khoản bị tạm khóa do hủy ca nhiều lần
 * @param {Object} io - Socket.IO Server
 * @param {Object} data - Dữ liệu parse từ Redis PubSub
 */
const handleRescuerSuspended = (io, data) => {
    try {
        const payload = {
            reason: data.reason || "Bạn đã hủy ca cứu hộ 2 lần liên tiếp. Tài khoản bị tạm khóa nhận ca cứu hộ mới trong 2 giờ.",
            suspendedUntil: data.suspendedUntil,
        };

        if (data.rescuerId) {
            io.to(`rescuer:${data.rescuerId}`).emit("rescuer:suspended", payload);
            io.to(`user:${data.rescuerId}`).emit("rescuer:suspended", payload);
        }
        console.log(`[SOS EMITTER] Emitted 'rescuer:suspended' for Rescuer: ${data.rescuerId}`);
    } catch (err) {
        console.error(`[SOS EMITTER] Error emitting rescuer:suspended:`, err);
    }
};

module.exports = {
    handleSosOffer,
    handleSosNotFound,
    handleSosCancelled,
    handleSosAccepted,
    handleChatConversationClosed,
    handleSosCompleted,
    handleRescueCancelled,
    handleRescuerSuspended,
};