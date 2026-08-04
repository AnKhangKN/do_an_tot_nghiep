const appFeedbackService = require("../service/app_feedback.service");

class AppFeedbackController {
    constructor() {
        this.appFeedbackService = appFeedbackService;
    }

    // User gửi báo cáo ứng dụng
    create = async (req, res, next) => {
        try {
            const { category, title, content } = req.body;
            const result = await this.appFeedbackService.create({
                userId: req.userId,
                category,
                title,
                content,
            });
            return res.status(201).json({
                success: true,
                message: "Gửi báo cáo ứng dụng thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // Lịch sử báo cáo của user
    getMy = async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await this.appFeedbackService.getMy({
                userId: req.userId,
                page: parseInt(page, 10),
                limit: Math.min(parseInt(limit, 10), 100),
            });
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AppFeedbackController();
