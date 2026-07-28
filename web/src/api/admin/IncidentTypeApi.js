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

export const updateIncidentType = async (incidentTypeId, { incidentType, status }) => {
    try {
        const response = await axiosJWT.put(`/api/incident_types/admin/${incidentTypeId}`, {
            incidentType,
            status
        });
        return response.data;
    } catch (error) {
        console.error("Update incident type error:", error);
        throw error;
    }
};

export const toggleIncidentTypeStatus = async (incidentTypeId, status) => {
    try {
        const response = await axiosJWT.patch(`/api/incident_types/admin/${incidentTypeId}/status`, {
            status
        });
        return response.data;
    } catch (error) {
        console.error("Toggle incident type status error:", error);
        throw error;
    }
};