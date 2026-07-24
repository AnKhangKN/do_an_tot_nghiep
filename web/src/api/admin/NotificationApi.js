import { axiosJWT } from "../shared/AuthApi";

export const getNotifications = async (page = 1, limit = 20, targetGroup = "ALL") => {
  try {
    const response = await axiosJWT.get("/api/notifications", {
      params: { page, limit, targetGroup },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách thông báo:", error);
    throw error;
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const response = await axiosJWT.post("/api/notifications/broadcast", notificationData);
    return response.data;
  } catch (error) {
    console.error("Lỗi gửi thông báo:", error);
    throw error;
  }
};
