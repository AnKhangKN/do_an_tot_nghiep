const incident_typeService = require("../service/incident_type.service")

class AdminIncidentTypeController {

    createIncidentType = async (req, res, next) => {
        try {
            const { incidentType } = req.body;

            const result = await incident_typeService.createIncidentType({ incidentType });

            return res.status(201).json({
                success: true,
                message: "Tạo loại sự cố thành công!",
                data: result,
            })
        } catch (error) {
            next(error)
        }
    }

    getIncidentTypeAdmin = async (req, res, next) => {
        try {

            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);


            const result = await incident_typeService.getIncidentTypeAdmin({ page, limit })

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách sự cố thành công!",
                data: result
            })

        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = new AdminIncidentTypeController()