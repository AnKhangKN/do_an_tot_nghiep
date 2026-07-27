import { axiosJWT } from "../shared/AuthApi";

export const getCategoriesAdmin = async () => {
    try {
        const response = await axiosJWT.get('/api/emergency-amenities/admin/categories');
        return response.data;
    } catch (error) {
        console.error("Get categories admin error:", error);
        throw error;
    }
};

export const createCategoryAdmin = async (data) => {
    try {
        const response = await axiosJWT.post('/api/emergency-amenities/admin/categories', data);
        return response.data;
    } catch (error) {
        console.error("Create category admin error:", error);
        throw error;
    }
};

export const updateCategoryAdmin = async (id, data) => {
    try {
        const response = await axiosJWT.put(`/api/emergency-amenities/admin/categories/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Update category admin error:", error);
        throw error;
    }
};

export const getAmenitiesAdmin = async (page = 1, limit = 20, status = '', categoryId = '') => {
    try {
        const response = await axiosJWT.get('/api/emergency-amenities/admin/points', {
            params: { page, limit, status, categoryId }
        });
        return response.data;
    } catch (error) {
        console.error("Get amenities admin error:", error);
        throw error;
    }
};

export const updateAmenityStatusAdmin = async (id, status) => {
    try {
        const response = await axiosJWT.put(`/api/emergency-amenities/admin/points/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Update amenity status error:", error);
        throw error;
    }
};

export const deleteAmenityAdmin = async (id) => {
    try {
        const response = await axiosJWT.delete(`/api/emergency-amenities/admin/points/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete amenity admin error:", error);
        throw error;
    }
};

export const getFeedbacksAdmin = async (page = 1, limit = 10, status = '') => {
    try {
        const response = await axiosJWT.get('/api/emergency-amenities/admin/feedbacks', {
            params: { page, limit, status }
        });
        return response.data;
    } catch (error) {
        console.error("Get feedbacks admin error:", error);
        throw error;
    }
};

export const updateFeedbackStatusAdmin = async (id, data) => {
    try {
        const response = await axiosJWT.put(`/api/emergency-amenities/admin/feedbacks/${id}/status`, data);
        return response.data;
    } catch (error) {
        console.error("Update feedback status admin error:", error);
        throw error;
    }
};

