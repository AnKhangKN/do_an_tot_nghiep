const adminService = require("../service/admin.service");
const { isValidUUID } = require("@utils/uuid.util");

class UserAdminController {
    getDashboardOverview = async (req, res, next) => {
        try {
            const { days } = req.query;
            const data = await adminService.getDashboardOverview(days ? parseInt(days) : 7);
            return res.status(200).json({
                status: 200,
                message: "Lấy thông tin tổng quan thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    getSosHeatmap = async (req, res, next) => {
        try {
            const data = await adminService.getSosHeatmap();
            return res.status(200).json({
                status: 200,
                message: "Lấy dữ liệu điểm nóng tai nạn thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    getAiSummary = async (req, res, next) => {
        try {
            const { days } = req.query;
            const data = await adminService.getAiActivitySummary(days ? parseInt(days) : 7);
            return res.status(200).json({
                status: 200,
                message: "Tạo tóm tắt hoạt động bằng AI thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    exportReport = async (req, res, next) => {
        try {
            const { days } = req.query;
            const daysNum = days ? parseInt(days) : 30;
            const csvData = await adminService.exportOperationalReportCsv(daysNum);

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename=Bao_Cao_Van_Hanh_Cuu_Ho_${daysNum}ngay.csv`);
            return res.status(200).send(csvData);
        } catch (error) {
            next(error);
        }
    };

    // admin khóa tài khoản
    banUser = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { reason } = req.body;
            const result = await adminService.banUser(userId, { reason, bannedBy: req.userId });
            return res.status(200).json({
                status: 200,
                message: "Khóa tài khoản thành công",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    // admin mở khóa / khôi phục
    unbanUser = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const result = await adminService.unbanUser(userId);
            return res.status(200).json({
                status: 200,
                message: "Mở khóa tài khoản thành công",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    // admin xem danh sách tài khoản bị khóa
    getBannedUsers = async (req, res, next) => {
        try {
            const { page, limit } = req.query;
            const data = await adminService.getBannedUsers({ page, limit });
            return res.status(200).json({
                status: 200,
                message: "Lấy danh sách tài khoản bị khóa thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    getAppeals = async (req, res, next) => {
        try {
            const { page, limit, status } = req.query;
            const data = await adminService.getAppeals({ page, limit, status });
            return res.status(200).json({
                status: 200,
                message: "Lấy danh sách kháng cáo thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    approveAppeal = async (req, res, next) => {
        try {
            const { appealId } = req.params;
            if (!isValidUUID(appealId)) {
                return res.status(400).json({ status: 400, message: "ID kháng cáo không hợp lệ!" });
            }
            const result = await adminService.approveAppeal(appealId, req.userId);
            return res.status(200).json({
                status: 200,
                message: "Duyệt kháng cáo thành công! Tài khoản đã được mở khóa và email thông báo đã được gửi.",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    rejectAppeal = async (req, res, next) => {
        try {
            const { appealId } = req.params;
            if (!isValidUUID(appealId)) {
                return res.status(400).json({ status: 400, message: "ID kháng cáo không hợp lệ!" });
            }
            const { reason } = req.body;
            const result = await adminService.rejectAppeal(appealId, req.userId, reason);
            return res.status(200).json({
                status: 200,
                message: "Đã từ chối kháng cáo",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getAdminProfile = async (req, res, next) => {
        try {
            const data = await adminService.getAdminProfile(req.userId);
            return res.status(200).json({
                status: 200,
                message: "Lấy thông tin hồ sơ Admin thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    updateAdminProfile = async (req, res, next) => {
        try {
            const { fullName, phone } = req.body;
            const data = await adminService.updateAdminProfile(req.userId, { fullName, phone });
            return res.status(200).json({
                status: 200,
                message: "Cập nhật hồ sơ cá nhân thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    updateAdminAvatar = async (req, res, next) => {
        try {
            const avatarFile = req.file;
            if (!avatarFile || !avatarFile.path) {
                return res.status(400).json({
                    status: 400,
                    message: "Vui lòng chọn hình ảnh để tải lên làm ảnh đại diện!"
                });
            }

            const data = await adminService.updateAdminAvatar(req.userId, avatarFile.path);
            return res.status(200).json({
                status: 200,
                message: "Cập nhật ảnh đại diện thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    changeAdminPassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            await adminService.changeAdminPassword(req.userId, { currentPassword, newPassword });
            return res.status(200).json({
                status: 200,
                message: "Đổi mật khẩu thành công"
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new UserAdminController();