import { axiosJWT } from "./AuthApi";

export const getUserInfo = async () => {
    try {
        const response = await axiosJWT.get(`/api/users`);
        return response.data;
    } catch (error) {
        console.error("Get user info error:", error);
        throw error;
    }
};