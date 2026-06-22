const incident_typeService = require("../service/incident_type.service");

class IncidentTypeController {
    getIncidentType = async (req, res, next) => {
        try {
            
            const result = await incident_typeService.getIncidentType();
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách thành công!",
                data: result
            })

        } catch (error) {
            next(error)
        }
    }
}

module.exports = new IncidentTypeController()