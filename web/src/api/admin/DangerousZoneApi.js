import { axiosJWT } from "../shared/AuthApi";

export const getDangerousZones = async (page, limit) => {
    try {
        const response = await axiosJWT.get(`/api/dangerous_points/admin`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get dangerous zones error:", error);
        throw error;
    }
};

export const approveDangerousZone = async (dangerousPointId) => {
    try {
        const response = await axiosJWT.put(`/api/dangerous_points/admin/${dangerousPointId}/approve`);
        return response.data;
    } catch (error) {
        console.error("Approve dangerous zone error:", error);
        throw error;
    }
};

export const rejectDangerousZone = async (dangerousPointId) => {
    try {
        const response = await axiosJWT.put(`/api/dangerous_points/admin/${dangerousPointId}/reject`);
        return response.data;
    } catch (error) {
        console.error("Reject dangerous zone error:", error);
        throw error;
    }
};

export const autoDetectDangerousZones = async () => {
    try {
        const response = await axiosJWT.post(`/api/dangerous_points/admin/auto-detect`);
        return response.data;
    } catch (error) {
        console.error("Auto detect dangerous zones error:", error);
        throw error;
    }
};

export const getDangerousZoneFeedbacks = async (page = 1, limit = 20) => {
    try {
        const response = await axiosJWT.get(`/api/dangerous_points/admin/feedbacks`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get dangerous zone feedbacks error:", error);
        throw error;
    }
};

export const getPointFeedbacks = async (dangerousPointId) => {
    try {
        const response = await axiosJWT.get(`/api/dangerous_points/${dangerousPointId}/feedbacks`);
        return response.data;
    } catch (error) {
        console.error("Get point feedbacks error:", error);
        throw error;
    }
};

export const getApprovedDangerousZones = async () => {
    try {
        const response = await axiosJWT.get('/api/dangerous_points/approved');
        return response.data;
    } catch (error) {
        console.error("Get approved dangerous zones error:", error);
        throw error;
    }
};

