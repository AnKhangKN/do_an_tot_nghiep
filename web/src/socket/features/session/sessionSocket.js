export const listenKickedEvent = (socket, onKicked) => {
  if (!socket) return () => {};

  const handleKicked = (payload) => {
    console.log("⚡ [SOCKET FEATURE: SESSION] Tài khoản đã đăng nhập trên thiết bị khác:", payload);
    if (onKicked) {
      onKicked(payload);
    }
  };

  socket.on("user:kicked", handleKicked);

  return () => {
    socket.off("user:kicked", handleKicked);
  };
};
