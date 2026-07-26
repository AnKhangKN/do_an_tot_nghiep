export const initConnectionListeners = (socket, { onConnect, onDisconnect }) => {
  if (!socket) return () => {};

  const handleConnect = () => {
    console.log("⚡ [SOCKET CONNECTION] Kết nối thành công tới server ID:", socket.id);
    if (onConnect) onConnect(socket.id);
  };

  const handleDisconnect = (reason) => {
    console.warn("⚠️ [SOCKET CONNECTION] Ngắt kết nối khỏi server:", reason);
    if (onDisconnect) onDisconnect(reason);
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  if (socket.connected) {
    handleConnect();
  }

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
  };
};
