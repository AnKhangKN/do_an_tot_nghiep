export const listenDashboardEvents = (socket, onDashboardEvent) => {
  if (!socket) return () => {};

  const handleEvent = (payload) => {
    console.log("⚡ [SOCKET FEATURE: DASHBOARD] Nhận sự kiện thời gian thực:", payload);
    if (onDashboardEvent) {
      onDashboardEvent(payload);
    }
  };

  socket.on("dashboard:event", handleEvent);

  return () => {
    socket.off("dashboard:event", handleEvent);
  };
};
