import { axiosJWT } from "../shared/AuthApi";

export const getAdminProfile = async () => {
    try {
        const response = await axiosJWT.get(`/api/admin/profile`);
        return response.data;
    } catch (error) {
        console.error("Get admin profile error:", error);
        throw error;
    }
};

export const updateAdminProfile = async ({ fullName, phone }) => {
    try {
        const response = await axiosJWT.patch(`/api/admin/profile`, { fullName, phone });
        return response.data;
    } catch (error) {
        console.error("Update admin profile error:", error);
        throw error;
    }
};

export const uploadAdminAvatar = async (formData) => {
    try {
        const response = await axiosJWT.patch(`/api/admin/profile/avatar`, formData);
        return response.data;
    } catch (error) {
        console.error("Upload admin avatar error:", error);
        throw error;
    }
};

export const changeAdminPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
        const response = await axiosJWT.post(`/api/admin/profile/change-password`, {
            currentPassword,
            newPassword,
            confirmPassword
        });
        return response.data;
    } catch (error) {
        console.error("Change admin password error:", error);
        throw error;
    }
};
