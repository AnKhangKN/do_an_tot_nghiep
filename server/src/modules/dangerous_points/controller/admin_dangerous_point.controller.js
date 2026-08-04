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

    async autoDetectDangerousPoints(req, res, next) {
        try {
            const result = await dangerousPointService.autoDetectAndCreateCrowdSourcedZones();
            return res.status(200).json({
                success: true,
                message: `Quét tự động hoàn tất! Đã tạo ${result.createdCount} điểm nguy hiểm mới từ ${result.totalClustersFound} cụm SOS.`,
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    async getDuplicateDangerousPoints(req, res, next) {
        try {
            const duplicates = await dangerousPointService.getDuplicateDangerousPointsAdmin();
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách điểm nguy hiểm nghi ngờ trùng lặp thành công",
                data: duplicates
            })
        } catch (error) {
            next(error)
        }
    }

    async mergeDangerousPoints(req, res, next) {
        try {
            const { primaryDangerousPointId, duplicateDangerousPointId } = req.body;

            if (!primaryDangerousPointId || !duplicateDangerousPointId) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu mã điểm chính hoặc mã điểm bị trùng"
                })
            }

            if (primaryDangerousPointId === duplicateDangerousPointId) {
                return res.status(400).json({
                    success: false,
                    message: "Không thể gộp một điểm với chính nó"
                })
            }

            await dangerousPointService.mergeDangerousPointsAdmin({
                primaryDangerousPointId,
                duplicateDangerousPointId
            });

            return res.status(200).json({
                success: true,
                message: "Gộp điểm nguy hiểm trùng lặp thành công!"
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AdminDangerousPointController()
