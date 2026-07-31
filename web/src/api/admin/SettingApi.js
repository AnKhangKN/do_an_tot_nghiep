import { axiosJWT } from "../shared/AuthApi";

export const getSystemSettings = async () => {
    try {
        const response = await axiosJWT.get("/api/admin/settings");
        return response.data;
    } catch (error) {
        console.error("Get system settings error:", error);
        throw error;
    }
};

export const updateSystemSettings = async (settingsData) => {
    try {
        const response = await axiosJWT.put("/api/admin/settings", settingsData);
        return response.data;
    } catch (error) {
        console.error("Update system settings error:", error);
        throw error;
    }
};
