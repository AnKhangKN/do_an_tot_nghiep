const sos_requestService = require("../service/sos_request.service");

class SosRequestController {
    createSOS = async (req, res, next) => {
        try {
            const userId = req.userId;
            const { phone, incidentTypeId, description, victimLat, victimLng } = req.body;

            const result = await sos_requestService.createSOS({ userId, phone, incidentTypeId, description, victimLat, victimLng });

            return res.status(201).json({
                success: true,
                message: "Gửi cầu cứu thành công!",
                data: result,
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new SosRequestController()