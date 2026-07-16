import { axiosJWT } from "../shared/AuthApi";

export const getIncidentTypes = async (page, limit) => {
    try {

        const response = await axiosJWT.get(`/api/incident_types/admin`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Get incident types error:", error);
        throw error;
    }
};

export const createIncidentType = async (incidentType) => {
    try {
        const response = await axiosJWT.post(`/api/incident_types/admin`, { incidentType });
        return response.data;
    } catch (error) {
        console.error("Create incident type error:", error);
        throw error;
    }
};