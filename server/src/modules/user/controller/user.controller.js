const userService = require('../services/user.service');

class UserController {

    getUserInfoById = async (req, res, next) => {
        try {
            const userId = req.userId;

            const user = await userService.getUserInfoById({ userId });

            res.status(200).json(
                {
                    success: true,
                    message: "Get user info successfully",
                    data: user
                });

        } catch (error) {
            next(error);
        }
    }

    getUsersAdmin = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await userService.getUsersAdmin({ page, limit });

            res.status(200).json({
                success: true,
                message: "Lấy danh sách người dùng thành công",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // TODO: xử lý sau

    updateUserInfo = async (req, res, next) => { }

    // user tự khóa - sẽ khóa tạm thời có thể mở lại được
    deactivateMyAccount = async (req, res, next) => { }

    // user gửi yêu cầu xóa tài khoản dữ liệu sẽ mất - sẽ xóa sau 30 ngày nếu không có yêu cầu khôi phục nào được gửi lên
    requestDeleteMyAccount = async (req, res, next) => { }

    // user hủy yêu cầu xóa
    cancelDeleteMyAccount = async (req, res, next) => { }

    // system job (cron) - xóa user sau thời gian chờ
    processPendingDeletes = async () => { }

}

module.exports = new UserController();