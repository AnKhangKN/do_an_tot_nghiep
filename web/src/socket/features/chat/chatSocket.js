export const listenChatEvents = (socket, onNewMessage) => {
  if (!socket) return () => {};

  const handleNewMessage = (payload) => {
    if (typeof onNewMessage === "function") {
      onNewMessage(payload);
    }
  };

  socket.on("chat:new_message", handleNewMessage);

  return () => {
    socket.off("chat:new_message", handleNewMessage);
  };
};

export const sendSocketChatMessage = (socket, { conversationId, partnerId, content, messageType = "TEXT" }) => {
  if (!socket) return;
  socket.emit("chat:send_message", {
    conversationId,
    partnerId,
    content,
    messageType,
  });
};
