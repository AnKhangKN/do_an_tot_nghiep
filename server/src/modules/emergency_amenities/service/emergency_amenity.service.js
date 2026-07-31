const { v4: uuidv4 } = require("uuid");
const amenityCategoryRepository = require("../repository/amenity_category.repository");
const emergencyAmenityRepository = require("../repository/emergency_amenity.repository");
const amenityFeedbackRepository = require("../repository/amenity_feedback.repository");
const imageService = require("@modules/image/service/image.service");
const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
const { transaction } = require("@/config/database.config");

class EmergencyAmenityService {
    async getActiveCategories() {
        return await amenityCategoryRepository.getActiveCategories();
    }

    async getApprovedAmenities({ amenityCategoryId }) {
        return await emergencyAmenityRepository.getApprovedAmenities({ amenityCategoryId });
    }

    async createAmenity({ amenityCategoryId, phone, latitude, longitude, openingHours, reportedBy, userRole, imageUrl }) {
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

        const amenity = await emergencyAmenityRepository.createAmenity(amenityData);

        if (imageUrl) {
            await imageService.createImage(null, {
                url: imageUrl,
                entityType: 'EMERGENCY_AMENITY',
                entityId: amenityId
            });
        }

        const result = {
            ...amenity,
            imageUrl: imageUrl || null
        };

        return result;
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

    // Feedback & Report methods
    async createFeedback({ amenityId, userId, reason, comment }) {
        const textContent = [reason, comment].filter(Boolean).join(" - ");
        if (textContent) {
            const spamCheck = await aiModerationService.checkKnownSpamText(textContent);
            if (spamCheck.isBlocked) {
                throw new Error(`Báo cáo bị từ chối: ${spamCheck.reason || "Nội dung báo cáo đã bị đánh dấu vi phạm tiêu chuẩn cộng đồng."}`);
            }
        }

        const feedbackId = uuidv4();
        const feedback = await amenityFeedbackRepository.createFeedback({
            feedbackId,
            amenityId,
            userId,
            reason,
            comment
        });

        if (textContent) {
            aiModerationService.processModerationAsync("AMENITY_FEEDBACK", feedbackId, textContent);
        }

        return feedback;
    }

    async getFeedbacksAdmin({ page, limit, status }) {
        return await amenityFeedbackRepository.getFeedbacksAdmin({
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            status
        });
    }

    async updateFeedbackStatusAdmin({ feedbackId, status, amenityId, action, adminId }) {
        const updatedFeedback = await amenityFeedbackRepository.updateFeedbackStatus({
            feedbackId,
            status
        });

        // Nếu Admin chọn gỡ/từ chối điểm tiện ích khi xử lý báo cáo
        if (action === 'REJECT_AMENITY' && amenityId) {
            await emergencyAmenityRepository.updateStatus({
                amenityId,
                status: 'REJECTED',
                approvedBy: adminId
            });
        }

        return updatedFeedback;
    }

    // Duplicate Detection & Merge methods
    async getDuplicateAmenitiesAdmin() {
        return await emergencyAmenityRepository.findDuplicatePairs(200);
    }

    async mergeAmenitiesAdmin({ primaryAmenityId, duplicateAmenityId }) {
        return await transaction(async (client) => {
            return await emergencyAmenityRepository.mergeAmenities(client, primaryAmenityId, duplicateAmenityId);
        });
    }
}

module.exports = new EmergencyAmenityService();

