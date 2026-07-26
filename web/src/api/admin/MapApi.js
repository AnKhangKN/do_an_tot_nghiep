import { axiosJWT } from "../shared/AuthApi";

export const getSosHeatmap = async () => {
  try {
    const response = await axiosJWT.get("/api/admin/sos-heatmap");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu điểm nóng tai nạn (Heatmap):", error);
    throw error;
  }
};
