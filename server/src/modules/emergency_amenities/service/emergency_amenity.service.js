const { v4: uuidv4 } = require("uuid");
const amenityCategoryRepository = require("../repository/amenity_category.repository");
const emergencyAmenityRepository = require("../repository/emergency_amenity.repository");

class EmergencyAmenityService {
    async getActiveCategories() {
        return await amenityCategoryRepository.getActiveCategories();
    }

    async getApprovedAmenities({ amenityCategoryId }) {
        return await emergencyAmenityRepository.getApprovedAmenities({ amenityCategoryId });
    }

    async createAmenity({ amenityCategoryId, phone, latitude, longitude, openingHours, reportedBy, userRole }) {
        const amenityId = uuidv4();
        const isAdmin = userRole === 'ADMIN';
        const status = isAdmin ? 'APPROVED' : 'PENDING';
        const amenityData = {
            amenityId,
            amenityCategoryId,
            phone: phone || null,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            openingHours: openingHours || '07:00 - 21:00',
            status,
            reportedBy: reportedBy || null,
            approvedBy: isAdmin ? reportedBy : null
        };

        return await emergencyAmenityRepository.createAmenity(amenityData);
    }

    // Admin methods
    async getAllCategoriesAdmin() {
        return await amenityCategoryRepository.getAllCategoriesAdmin();
    }

    async createCategoryAdmin({ categoryName, iconName }) {
        const amenityCategoryId = uuidv4();
        return await amenityCategoryRepository.createCategory({
            amenityCategoryId,
            categoryName,
            iconName
        });
    }

    async updateCategoryAdmin({ amenityCategoryId, categoryName, iconName, status }) {
        return await amenityCategoryRepository.updateCategory({
            amenityCategoryId,
            categoryName,
            iconName,
            status
        });
    }

    async getAmenitiesAdmin({ page, limit, status, categoryId }) {
        return await emergencyAmenityRepository.getAmenitiesAdmin({
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            status,
            categoryId
        });
    }

    async updateAmenityStatusAdmin({ amenityId, status, adminId }) {
        return await emergencyAmenityRepository.updateStatus({
            amenityId,
            status,
            approvedBy: adminId
        });
    }

    async deleteAmenityAdmin(amenityId) {
        return await emergencyAmenityRepository.deleteAmenity(amenityId);
    }
}

module.exports = new EmergencyAmenityService();
