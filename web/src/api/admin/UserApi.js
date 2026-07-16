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
