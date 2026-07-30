import { axiosJWT } from "../shared/AuthApi";

export const getUsersAdmin = async (page, limit) => {
    try {
        const response = await axiosJWT.get(`/api/users/admin`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get users admin error:", error);
        throw error;
    }
};

export const banUser = async (userId, reason) => {
    try {
        const response = await axiosJWT.post(`/api/admin/users/${userId}/ban`, { reason });
        return response.data;
    } catch (error) {
        console.error("Ban user error:", error);
        throw error;
    }
};

export const unbanUser = async (userId) => {
    try {
        const response = await axiosJWT.post(`/api/admin/users/${userId}/unban`);
        return response.data;
    } catch (error) {
        console.error("Unban user error:", error);
        throw error;
    }
};

export const getBannedUsers = async (page, limit) => {
    try {
        const response = await axiosJWT.get(`/api/admin/users/banned`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get banned users error:", error);
        throw error;
    }
};
