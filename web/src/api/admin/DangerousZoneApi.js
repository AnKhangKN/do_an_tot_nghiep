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
