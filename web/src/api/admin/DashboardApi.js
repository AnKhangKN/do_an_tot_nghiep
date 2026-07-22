import { axiosJWT } from "../shared/AuthApi";

export const getDashboardOverview = async (days = 7) => {
  try {
    const response = await axiosJWT.get(`/api/admin/dashboard/overview`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tổng quan admin:", error);
    throw error;
  }
};
