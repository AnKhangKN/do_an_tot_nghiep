import { axiosJWT } from "../shared/AuthApi";

export const getAppeals = async (page, limit, status) => {
    try {
        const params = { page, limit };
        if (status) params.status = status;
        const response = await axiosJWT.get("/api/admin/appeals", { params });
        return response.data;
    } catch (error) {
        console.error("Get appeals error:", error);
        throw error;
    }
};

export const approveAppeal = async (id, adminNote) => {
    try {
        const response = await axiosJWT.post(`/api/admin/appeals/${id}/approve`, { adminNote });
        return response.data;
    } catch (error) {
        console.error("Approve appeal error:", error);
        throw error;
    }
};

export const rejectAppeal = async (id, adminNote) => {
    try {
        const response = await axiosJWT.post(`/api/admin/appeals/${id}/reject`, { adminNote });
        return response.data;
    } catch (error) {
        console.error("Reject appeal error:", error);
        throw error;
    }
};
