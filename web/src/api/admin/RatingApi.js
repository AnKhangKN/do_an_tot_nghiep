import { axiosJWT } from "../shared/AuthApi";

export const getAllRatingsAdmin = async (page = 1, limit = 20, ratingFilter = "") => {
  try {
    const response = await axiosJWT.get("/api/ratings/admin", {
      params: { page, limit, ratingFilter },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    throw error;
  }
};
