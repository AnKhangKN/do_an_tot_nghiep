const dangerousPointService = require("../service/dangerous_point.service");

class DangerousPointController {
    async createDangerousPoint(req, res, next) {
        try {
            const { zoneName, address, description, latitude, longitude, dangerLevel } = req.body;
            const reportedBy = req.userId;

            const result = await dangerousPointService.createDangerousPoint({
                zoneName,
                address,
                description,
                latitude,
                longitude,
                dangerLevel,
                reportedBy
            });

            return res.status(201).json({
                success: true,
                message: "Báo cáo điểm nguy hiểm thành công!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    async getApprovedDangerousPoints(req, res, next) {
        try {
            const result = await dangerousPointService.getApprovedDangerousPoints();
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách điểm nguy hiểm thành công!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    async createFeedback(req, res, next) {
        try {
            const { id } = req.params;
            const { feedbackType, comment } = req.body;
            const userId = req.userId;

            const result = await dangerousPointService.createFeedback({
                dangerousPointId: id,
                userId,
                feedbackType,
                comment
            });

            return res.status(201).json({
                success: true,
                message: "Gửi phản hồi xác minh điểm nguy hiểm thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getFeedbacksByPointId(req, res, next) {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;

            const [feedbacks, stats] = await Promise.all([
                dangerousPointService.getFeedbacksByPointId(id, { page, limit }),
                dangerousPointService.getFeedbackStatsByPointId(id)
            ]);

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách phản hồi thành công!",
                data: {
                    stats,
                    feedbacks
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getFeedbacksAdmin(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await dangerousPointService.getFeedbacksAdmin({ page, limit });
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách phản hồi điểm nguy hiểm cho Admin thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DangerousPointController()
