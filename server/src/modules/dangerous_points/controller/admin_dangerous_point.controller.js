const dangerousPointService = require("../service/dangerous_point.service");

class AdminDangerousPointController {
    async getDangerousPointsAdmin(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await dangerousPointService.getDangerousPointsAdmin({ page, limit });
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách điểm nguy hiểm thành công!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    async approveDangerousPoint(req, res, next) {
        try {
            const { dangerousPointId } = req.params;
            const approvedBy = req.userId;

            const result = await dangerousPointService.approveDangerousPoint({
                dangerousPointId,
                approvedBy
            });

            return res.status(200).json({
                success: true,
                message: "Duyệt điểm nguy hiểm thành công!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    async rejectDangerousPoint(req, res, next) {
        try {
            const { dangerousPointId } = req.params;

            const result = await dangerousPointService.rejectDangerousPoint({
                dangerousPointId
            });

            return res.status(200).json({
                success: true,
                message: "Từ chối điểm nguy hiểm thành công!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AdminDangerousPointController()
