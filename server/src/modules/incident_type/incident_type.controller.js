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
            const result = await this.incident_typeService.getIncidentTypes()

            console.log("Incident Types:", result);

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