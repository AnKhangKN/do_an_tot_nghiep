const emergencyAmenityService = require("../service/emergency_amenity.service");

class AdminEmergencyAmenityController {
    async getCategoriesAdmin(req, res) {
        try {
            const categories = await emergencyAmenityService.getAllCategoriesAdmin();
            return res.status(200).json({
                success: true,
                message: "Lấy tất cả danh mục (Admin) thành công",
                data: categories
            });
        } catch (error) {
            console.error("Error in getCategoriesAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh mục admin"
            });
        }
    }

    async createCategoryAdmin(req, res) {
        try {
            const { categoryName, iconName } = req.body;
            const category = await emergencyAmenityService.createCategoryAdmin({ categoryName, iconName });
            return res.status(201).json({
                success: true,
                message: "Tạo danh mục tiện ích thành công",
                data: category
            });
        } catch (error) {
            console.error("Error in createCategoryAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo danh mục"
            });
        }
    }

    async updateCategoryAdmin(req, res) {
        try {
            const { id } = req.params;
            const { categoryName, iconName, status } = req.body;
            const category = await emergencyAmenityService.updateCategoryAdmin({
                amenityCategoryId: id,
                categoryName,
                iconName,
                status
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục tiện ích"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Cập nhật danh mục tiện ích thành công",
                data: category
            });
        } catch (error) {
            console.error("Error in updateCategoryAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi cập nhật danh mục"
            });
        }
    }

    async getAmenitiesAdmin(req, res) {
        try {
            const { page, limit, status, categoryId } = req.query;
            const result = await emergencyAmenityService.getAmenitiesAdmin({ page, limit, status, categoryId });
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách điểm tiện ích (Admin) thành công",
                data: result
            });
        } catch (error) {
            console.error("Error in getAmenitiesAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh sách tiện ích admin"
            });
        }
    }

    async updateAmenityStatusAdmin(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const adminId = req.userId;

            const amenity = await emergencyAmenityService.updateAmenityStatusAdmin({
                amenityId: id,
                status,
                adminId
            });

            if (!amenity) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy điểm tiện ích"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái tiện ích thành công",
                data: amenity
            });
        } catch (error) {
            console.error("Error in updateAmenityStatusAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi cập nhật trạng thái tiện ích"
            });
        }
    }

    async deleteAmenityAdmin(req, res) {
        try {
            const { id } = req.params;
            const deleted = await emergencyAmenityService.deleteAmenityAdmin(id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy điểm tiện ích để xóa"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Xóa điểm tiện ích thành công"
            });
        } catch (error) {
            console.error("Error in deleteAmenityAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi xóa tiện ích"
            });
        }
    }

    async getDuplicateAmenitiesAdmin(req, res) {
        try {
            const duplicates = await emergencyAmenityService.getDuplicateAmenitiesAdmin();
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách tiện ích nghi ngờ trùng lặp thành công",
                data: duplicates
            });
        } catch (error) {
            console.error("Error in getDuplicateAmenitiesAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi quét tiện ích trùng lặp"
            });
        }
    }

    async mergeAmenitiesAdmin(req, res) {
        try {
            const { primaryAmenityId, duplicateAmenityId } = req.body;
            if (!primaryAmenityId || !duplicateAmenityId) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu mã tiện ích chính hoặc mã tiện ích bị trùng"
                });
            }

            await emergencyAmenityService.mergeAmenitiesAdmin({ primaryAmenityId, duplicateAmenityId });
            return res.status(200).json({
                success: true,
                message: "Gộp tiện ích trùng lặp thành công!"
            });
        } catch (error) {
            console.error("Error in mergeAmenitiesAdmin:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi gộp tiện ích trùng lặp"
            });
        }
    }
}

module.exports = new AdminEmergencyAmenityController();
