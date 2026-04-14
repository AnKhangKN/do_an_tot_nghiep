import { axiosJWT } from "../shared/AuthApi";

export const getIncidentTypes = async (page, limit) => {
    try {

        const response = await axiosJWT.get(`/api/incident_types`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get incident types error:", error);
        throw error;
    }
};