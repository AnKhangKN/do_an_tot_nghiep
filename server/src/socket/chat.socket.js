const chatService = require('../modules/chat/service/chat.service');

module.exports = (socket, io) => {
    // 1. Tham gia phòng chat của 1 cuộc hội thoại
    socket.on("chat:join", ({ conversationId }) => {
        if (conversationId) {
            socket.join(`conversation:${conversationId}`);
            console.log(`[SOCKET CHAT] User ${socket.user?.userId} joined conversation:${conversationId}`);
        }
    });

    // 2. Tạo hoặc lấy cuộc hội thoại qua Socket
    socket.on("chat:get_or_create_conversation", async (data, ackCallback) => {
        try {
            const userId = socket.user?.userId;
            const { partnerId, sosRequestId } = data;
            if (!userId || !partnerId) {
                if (typeof ackCallback === "function") {
                    ackCallback({ status: "error", message: "partnerId là bắt buộc" });
                }
                return;
            }

            const conversation = await chatService.getOrCreateConversation({ userId, partnerId, sosRequestId });

            if (typeof ackCallback === "function") {
                ackCallback({ status: "success", data: conversation });
            }
        } catch (error) {
            console.error("[SOCKET CHAT ERROR] Tạo hội thoại thất bại:", error);
            if (typeof ackCallback === "function") {
                ackCallback({ status: "error", message: error.message });
            }
        }
    });

    // 3. Gửi tin nhắn qua Socket
    socket.on("chat:send_message", async (data, ackCallback) => {
        try {
            const userId = socket.user?.userId;
            const { conversationId, partnerId, content, messageType } = data;

            if (!userId || (!conversationId && !partnerId) || !content) {
                if (typeof ackCallback === "function") {
                    ackCallback({ status: "error", message: "Thiếu dữ liệu gửi tin nhắn" });
                }
                return;
            }

            // Gọi trực tiếp ChatService để lưu DB và nhận kết quả
            const { message, recipientId, conversation, conversationId: resolvedConversationId } = await chatService.sendMessage({
                conversationId,
                partnerId,
                senderId: userId,
                content,
                messageType,
            });

            if (resolvedConversationId) {
                const convRoom = `conversation:${resolvedConversationId}`;
                socket.join(convRoom);
                if (recipientId) {
                    io.in(`user:${recipientId}`).socketsJoin(convRoom);
                }
            }

            const payload = {
                message,
                conversation,
            };

            // Broadcast sự kiện real-time tới các room phòng chat, phòng người nhận & admin_room (chuỗi room để Socket.IO tự khử trùng lặp)
            let broadcast = io.to(`conversation:${resolvedConversationId}`).to("admin_room");
            if (recipientId) {
                broadcast = broadcast.to(`user:${recipientId}`).to(`rescuer:${recipientId}`).to(`victim:${recipientId}`);
            }
            broadcast.emit("chat:new_message", payload);

            if (typeof ackCallback === "function") {
                ackCallback({ status: "success", data: message });
            }
        } catch (error) {
            console.error("[SOCKET CHAT ERROR] Gửi tin nhắn thất bại:", error);
            if (typeof ackCallback === "function") {
                ackCallback({ status: "error", message: error.message });
            }
            socket.emit("chat:error", {
                status: "error",
                message: error.message,
                content: data?.content,
                conversationId: data?.conversationId,
                tempId: data?.tempId || data?.id
            });
        }
    });
};
