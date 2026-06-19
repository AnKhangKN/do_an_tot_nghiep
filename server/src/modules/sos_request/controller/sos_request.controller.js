const sos_requestService = require("../service/sos_request.service");

class SosRequestController {
    sendSOS = async (req, res, next) => {
        const { user_id, latitude, longitude } = req.body

        const result = await sos_requestService.sendSOS({ user_id, latitude, longitude });

        return res.status(201).json({
            success: true,
            message: "Gửi cầu cứu thành công!",
            data: result,
        })
    }
}

module.exports = new SosRequestController()