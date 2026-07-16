import { axiosJWT } from "../shared/AuthApi";

export const getRescuersAdmin = async (page, limit) => {
    try {
        const response = await axiosJWT.get(`/api/rescuer/rescuer`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get rescuers admin error:", error);
        throw error;
    }
};

export const verifyRescuerAdmin = async (userId) => {
    try {
        const response = await axiosJWT.patch(`/api/rescuer/rescuer/verify`, {
            userId
        });
        return response.data;
    } catch (error) {
        console.error("Verify rescuer admin error:", error);
        throw error;
    }
};
