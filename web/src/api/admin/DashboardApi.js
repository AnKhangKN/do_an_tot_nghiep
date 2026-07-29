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

export const getAiDashboardSummary = async (days = 7) => {
  try {
    const response = await axiosJWT.get(`/api/admin/dashboard/ai-summary`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tóm tắt AI admin:", error);
    throw error;
  }
};

export const exportAdminReportApi = async (days = 30) => {
  try {
    const response = await axiosJWT.get(`/api/admin/dashboard/export-report`, {
      params: { days },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Van_Hanh_Cuu_Ho_${days}ngay.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Lỗi khi xuất báo cáo admin:", error);
    throw error;
  }
};
