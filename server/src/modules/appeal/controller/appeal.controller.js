const appealService = require("../service/appeal.service");

class AppealController {
    constructor() {
        this.appealService = appealService;
    }

    submit = async (req, res, next) => {
        try {
            const { reason } = req.body;
            const result = await this.appealService.submit({ userId: req.userId, reason });
            return res.status(201).json({
                success: true,
                message: "Gửi đơn kháng cáo thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const result = await this.appealService.getAll({
                page: parseInt(page, 10),
                limit: Math.min(parseInt(limit, 10), 100),
                status: status || null,
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    approve = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { adminNote } = req.body;
            const result = await this.appealService.approve({
                appealId: id,
                adminId: req.userId,
                adminNote: adminNote || null,
            });
            return res.status(200).json({
                success: true,
                message: "Đã duyệt đơn kháng cáo và mở khóa tài khoản!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    reject = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { adminNote } = req.body;
            const result = await this.appealService.reject({
                appealId: id,
                adminId: req.userId,
                adminNote,
            });
            return res.status(200).json({
                success: true,
                message: "Đã từ chối đơn kháng cáo!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AppealController();
