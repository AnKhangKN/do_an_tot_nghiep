import { io } from "socket.io-client";
import { store } from "@/store";

let socketInstance = null;

export const getSocketInstance = () => {
  const token = store.getState().auth?.accessToken;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  if (!socketInstance) {
    socketInstance = io(backendUrl, {
      auth: {
        token: token || "",
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  } else {
    // Đồng bộ token mới nếu có thay đổi trong Redux state
    if (token && socketInstance.auth && socketInstance.auth.token !== token) {
      socketInstance.auth.token = token;
      if (!socketInstance.connected) {
        socketInstance.connect();
      }
    }
  }

  if (socketInstance && !socketInstance.connected && token) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
