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

export const listenChatError = (socket, onError) => {
  if (!socket) return () => {};

  const handleError = (payload) => {
    if (typeof onError === "function") {
      onError(payload);
    }
  };

  socket.on("chat:error", handleError);

  return () => {
    socket.off("chat:error", handleError);
  };
};

export const sendSocketChatMessage = (socket, { conversationId, partnerId, content, messageType = "TEXT", tempId }) => {
  if (!socket) return;
  socket.emit("chat:send_message", {
    conversationId,
    partnerId,
    content,
    messageType,
    tempId,
  });
};
