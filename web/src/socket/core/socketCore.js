import { io } from "socket.io-client";
import { store } from "@/store";
import { setCredentials } from "@/store/accessToken/accessTokenSlice";
import { refreshToken } from "@/api/shared/AuthApi";

let socketInstance = null;
let isRefreshingSocketToken = false;

export const getSocketInstance = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  if (!socketInstance) {
    socketInstance = io(backendUrl, {
      auth: (cb) => {
        const token = store.getState().auth?.accessToken || "";
        cb({ token });
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
    });

    // Lắng nghe lỗi kết nối để xử lý khi Token hết hạn (jwt expired)
    socketInstance.on("connect_error", async (err) => {
      console.warn("⚠️ [SOCKET] Lỗi kết nối Socket:", err.message);

      if (
        (err.message === "Unauthorized" || err.message === "jwt expired" || err.message === "Token missing") &&
        !isRefreshingSocketToken
      ) {
        isRefreshingSocketToken = true;
        try {
          console.log("🔄 [SOCKET] Đang tự động Refresh Token mới cho Socket...");
          const res = await refreshToken("WEB");
          const newAccessToken = res?.data?.accessToken;

          if (newAccessToken) {
            store.dispatch(setCredentials({ accessToken: newAccessToken }));
            console.log("✅ [SOCKET] Refresh Token cho Socket thành công, đang kết nối lại...");
            socketInstance.connect();
          }
        } catch (refreshErr) {
          console.error("❌ [SOCKET] Refresh Token cho Socket thất bại:", refreshErr);
        } finally {
          isRefreshingSocketToken = false;
        }
      }
    });
  }

  const currentToken = store.getState().auth?.accessToken;
  if (socketInstance && !socketInstance.connected && currentToken) {
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
