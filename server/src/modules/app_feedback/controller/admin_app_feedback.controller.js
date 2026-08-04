const appFeedbackService = require("../service/app_feedback.service");

class AdminAppFeedbackController {
    constructor() {
        this.appFeedbackService = appFeedbackService;
    }

    // Admin xem danh sách báo cáo
    getAll = async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status, category, search } = req.query;
            const result = await this.appFeedbackService.getAll({
                page: parseInt(page, 10),
                limit: Math.min(parseInt(limit, 10), 100),
                status: status || null,
                category: category || null,
                search: search || null,
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // Admin xem thống kê
    getStats = async (req, res, next) => {
        try {
            const result = await this.appFeedbackService.getStats();
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // Admin cập nhật trạng thái xử lý
    updateStatus = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, adminNote } = req.body;
            const result = await this.appFeedbackService.updateStatus({
                id,
                status,
                adminNote: adminNote || null,
                handledBy: req.userId,
            });
            return res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái báo cáo thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AdminAppFeedbackController();
