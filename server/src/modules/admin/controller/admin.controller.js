const adminService = require("../service/admin.service");

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

    // admin dọn rác - xóa vĩnh viễn tài khoản rác
    hardDeleteUser = async (req, res, next) => { }

    // admin khóa tài khoản
    deactivateUser = async (req, res, next) => { }

    // admin mở khóa / khôi phục
    restoreUser = async (req, res, next) => { }
}

module.exports = new UserAdminController();