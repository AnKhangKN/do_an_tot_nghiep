export const listenBanEvent = (socket, onBanned) => {
  if (!socket) return () => {};

  const handleBanned = (payload) => {
    console.log("⚡ [SOCKET FEATURE: BAN] Tài khoản bị khóa:", payload);
    if (onBanned) {
      onBanned(payload);
    }
  };

  socket.on("user:banned", handleBanned);

  return () => {
    socket.off("user:banned", handleBanned);
  };
};
