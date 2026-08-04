import { axiosJWT } from "../shared/AuthApi";

export const getAppFeedbacksAdmin = async (page = 1, limit = 10, status = "", category = "", search = "") => {
  try {
    const response = await axiosJWT.get("/api/app-feedbacks/admin", {
      params: { page, limit, status, category, search },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách báo cáo ứng dụng:", error);
    throw error;
  }
};

export const getAppFeedbackStatsAdmin = async () => {
  try {
    const response = await axiosJWT.get("/api/app-feedbacks/admin/stats");
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy thống kê báo cáo ứng dụng:", error);
    throw error;
  }
};

export const updateAppFeedbackStatusAdmin = async (feedbackId, status, adminNote = "") => {
  try {
    const response = await axiosJWT.put(`/api/app-feedbacks/admin/${feedbackId}/status`, {
      status,
      adminNote,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái báo cáo ứng dụng:", error);
    throw error;
  }
};
