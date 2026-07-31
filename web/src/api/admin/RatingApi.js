import { axiosJWT } from "../shared/AuthApi";

export const getAllRatingsAdmin = async (page = 1, limit = 20, ratingFilter = "", sentimentFilter = "") => {
  try {
    const response = await axiosJWT.get("/api/ratings/admin", {
      params: { page, limit, ratingFilter, sentimentFilter },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    throw error;
  }
};

export const getRatingTrendsAdmin = async (days = 7) => {
  try {
    const response = await axiosJWT.get("/api/ratings/admin/trends", {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy báo cáo xu hướng chất lượng:", error);
    throw error;
  }
};
