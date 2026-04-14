const incident_typeService = require("./incident_type.service")

class IncidentTypeController {
    constructor() {
        this.incident_typeService = incident_typeService
    }

    createIncidentType = async (req, res, next) => {
        try {
            const { incidentType } = req.body;

            const result = await this.incident_typeService.createIncidentType({ incidentType });

            return res.status(201).json({
                success: true,
                message: "Tạo loại sự cố thành công!",
                data: result,
            })
        } catch (error) {
            next(error)
        }
    }

    getIncidentTypes = async (req, res, next) => {
        try {

            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);


            const result = await this.incident_typeService.getIncidentTypes({ page, limit })

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

module.exports = new IncidentTypeController()