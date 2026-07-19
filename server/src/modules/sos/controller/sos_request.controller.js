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

    getActiveSOS = async (req, res, next) => {
        try {
            const userId = req.userId;
            const role = req.role;

            const result = await sos_requestService.getActiveSOS({ userId, role });

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin cứu hộ hiện tại thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    getSOSHistory = async (req, res, next) => {
        try {
            const userId = req.userId;
            const role = req.role;

            const result = await sos_requestService.getSOSHistory({ userId, role });

            return res.status(200).json({
                success: true,
                message: "Lấy lịch sử cứu hộ thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SosRequestController()