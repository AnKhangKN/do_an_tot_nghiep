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

    async createAmenity(req, res) {
        try {
            const { amenityCategoryId, phone, latitude, longitude, openingHours } = req.body;
            const reportedBy = req.userId || null;

            const amenity = await emergencyAmenityService.createAmenity({
                amenityCategoryId,
                phone,
                latitude,
                longitude,
                openingHours,
                reportedBy,
                userRole: req.role
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
}

module.exports = new EmergencyAmenityController();
