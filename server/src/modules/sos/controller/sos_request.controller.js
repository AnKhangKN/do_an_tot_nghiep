const sos_requestService = require("../service/sos_request.service");

class SosRequestController {
    createSOS = async (req, res, next) => {
        try {
            const { victimLat, victimLng, description } = req.body

            const userId = "019ee588-ef3d-71c1-b914-583bfa125401"

            const result = await sos_requestService.createSOS({ userId, victimLat, victimLng, description });

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