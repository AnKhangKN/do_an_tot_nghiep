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

    // admin dọn rác - xóa vĩnh viễn tài khoản rác
    hardDeleteUser = async (req, res, next) => { }

    // admin khóa tài khoản
    deactivateUser = async (req, res, next) => { }

    // admin mở khóa / khôi phục
    restoreUser = async (req, res, next) => { }
}

module.exports = new UserAdminController();