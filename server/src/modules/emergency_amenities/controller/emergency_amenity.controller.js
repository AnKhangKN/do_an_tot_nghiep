const emergencyAmenityService = require("../service/emergency_amenity.service");

class EmergencyAmenityController {
    async getCategories(req, res) {
        try {
            const categories = await emergencyAmenityService.getActiveCategories();
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách danh mục tiện ích thành công",
                data: categories
            });
        } catch (error) {
            console.error("Error in getCategories:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh mục tiện ích"
            });
        }
    }

    async getApprovedAmenities(req, res) {
        try {
            const { amenityCategoryId } = req.query;
            const amenities = await emergencyAmenityService.getApprovedAmenities({ amenityCategoryId });
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách tiện ích công khai thành công",
                data: amenities
            });
        } catch (error) {
            console.error("Error in getApprovedAmenities:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh sách tiện ích"
            });
        }
    }

    async getMyAmenities(req, res) {
        try {
            const userId = req.userId;
            const amenities = await emergencyAmenityService.getMyAmenities(userId);
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách tiện ích đã tạo thành công",
                data: amenities
            });
        } catch (error) {
            console.error("Error in getMyAmenities:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh sách tiện ích đã tạo"
            });
        }
    }

    async createAmenity(req, res) {
        try {
            const { amenityCategoryId, phone, latitude, longitude, openingHours } = req.body;
            const reportedBy = req.userId || null;
            const imageUrl = req.file ? req.file.path : (req.body.imageUrl || null);

            const amenity = await emergencyAmenityService.createAmenity({
                amenityCategoryId,
                phone,
                latitude,
                longitude,
                openingHours,
                reportedBy,
                userRole: req.role,
                imageUrl
            });

            return res.status(201).json({
                success: true,
                message: "Đóng góp điểm tiện ích thành công",
                data: amenity
            });
        } catch (error) {
            console.error("Error in createAmenity:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo điểm tiện ích"
            });
        }
    }

    async createFeedback(req, res) {
        try {
            const amenityId = req.params.id;
            const userId = req.userId;
            const { reason, comment } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng chọn lý do báo cáo"
                });
            }

            const feedback = await emergencyAmenityService.createFeedback({
                amenityId,
                userId,
                reason,
                comment
            });

            return res.status(201).json({
                success: true,
                message: "Báo cáo của bạn đã được ghi nhận và đang được Admin xử lý!",
                data: feedback
            });
        } catch (error) {
            console.error("Error in createFeedback:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi gửi báo cáo phản hồi"
            });
        }
    }

    async getFeedbacksAdmin(req, res) {
        try {
            const { page, limit, status } = req.query;
            const result = await emergencyAmenityService.getFeedbacksAdmin({ page, limit, status });
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách báo cáo tiện ích thành công",
                data: result
            });
        } catch (error) {
            console.error("Error in getFeedbacksAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh sách báo cáo"
            });
        }
    }

    async updateFeedbackStatusAdmin(req, res) {
        try {
            const feedbackId = req.params.id;
            const { status, amenityId, action } = req.body;
            const adminId = req.userId;

            const updated = await emergencyAmenityService.updateFeedbackStatusAdmin({
                feedbackId,
                status,
                amenityId,
                action,
                adminId
            });

            return res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái xử lý báo cáo thành công",
                data: updated
            });
        } catch (error) {
            console.error("Error in updateFeedbackStatusAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi cập nhật báo cáo"
            });
        }
    }
}

module.exports = new EmergencyAmenityController();

