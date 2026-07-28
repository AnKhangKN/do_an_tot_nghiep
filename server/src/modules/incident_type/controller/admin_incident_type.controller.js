const incident_typeService = require("../service/incident_type.service");

class AdminIncidentTypeController {
    createIncidentType = async (req, res, next) => {
        try {
            const { incidentType } = req.body;

            const result = await incident_typeService.createIncidentType({ incidentType });

            return res.status(201).json({
                success: true,
                message: "Tạo loại sự cố thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    updateIncidentType = async (req, res, next) => {
        try {
            const { incidentTypeId } = req.params;
            const { incidentType, status } = req.body;

            const result = await incident_typeService.updateIncidentType({
                incidentTypeId,
                incidentType,
                status
            });

            return res.status(200).json({
                success: true,
                message: "Cập nhật loại sự cố thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    toggleStatus = async (req, res, next) => {
        try {
            const { incidentTypeId } = req.params;
            const { status } = req.body;

            const result = await incident_typeService.toggleStatus({
                incidentTypeId,
                status
            });

            return res.status(200).json({
                success: true,
                message: `Đã ${status === "ACTIVE" ? "bật" : "tắt"} trạng thái loại sự cố!`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getIncidentTypeAdmin = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;

            const result = await incident_typeService.getIncidentTypeAdmin({ page, limit });

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách sự cố thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AdminIncidentTypeController();