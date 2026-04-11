import { axiosJWT } from "../shared/AuthApi";

export const getIncidentTypes = async () => {
    try {
        const response = await axiosJWT.get(`/api/incident_types`);
        return response.data;        
    } catch (error) {
        console.error("Get incident types error:", error);
        throw error;
    }
};