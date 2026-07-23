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
}

module.exports = new DangerousPointController()
