const aiModerationService = require("../service/ai_moderation.service");

class AiModerationController {
    /**
     * Lấy danh sách log kiểm duyệt AI cho Admin
     */
    async getLogs(req, res, next) {
        try {
            const result = await aiModerationService.getModerationLogsForAdmin(req.query);
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách log kiểm duyệt AI thành công!",
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin xử lý duyệt log kiểm duyệt AI
     */
    async reviewLog(req, res, next) {
        try {
            const { logId } = req.params;
            const { actionTaken } = req.body;
            const adminId = req.userId;

            const updated = await aiModerationService.reviewLogByAdmin(logId, adminId, actionTaken);
            return res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái kiểm duyệt thành công!",
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AiModerationController();
