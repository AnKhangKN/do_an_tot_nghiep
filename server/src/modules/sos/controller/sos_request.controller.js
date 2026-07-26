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

    cancelSOS = async (req, res, next) => {
        try {
            const { sosRequestId, cancelReason } = req.body;
            const userId = req.userId;

            const result = await sos_requestService.cancelSOS({
                sosRequestId,
                userId,
                cancelReason: cancelReason || "Người gặp nạn tự hủy yêu cầu"
            });

            return res.status(200).json({
                success: true,
                message: "Hủy yêu cầu cứu hộ thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    acceptSOSByQR = async (req, res, next) => {
        try {
            const { sosRequestId } = req.body;
            const rescuerId = req.userId;

            if (!sosRequestId) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin mã ca SOS (sosRequestId)!"
                });
            }

            const result = await sos_requestService.acceptSOSByQR({
                sosRequestId,
                rescuerId
            });

            return res.status(200).json({
                success: true,
                message: "Tiếp nhận ca cứu hộ qua QR code thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SosRequestController()