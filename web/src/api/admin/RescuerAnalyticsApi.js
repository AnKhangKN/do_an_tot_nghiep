import { axiosJWT } from "../shared/AuthApi";

export const getRescuerAnalytics = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await axiosJWT.get('/api/rescuer/admin/analytics', {
            params: { page, limit, search }
        });
        return response.data;
    } catch (error) {
        console.error("Get rescuer analytics error:", error);
        throw error;
    }
};
