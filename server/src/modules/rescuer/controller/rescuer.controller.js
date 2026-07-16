const rescuerService = require("../service/rescuer.service");

class RescuerController {
    rescuerRegister = async (req, res, next) => {
        try {
            const userId = req.userId; 

            const { phone, gender, area, incidentTypeId } = req.body;

            const result = await rescuerService.rescuerRegister({
                userId, phone, gender, area, incidentTypeId
            })

            return res.status(201).json({
                success: true,
                message: "Đăng ký cứu hộ thành công!",
                data: result
            })
        } catch (error) {
            next(error);
        }
    }

    getRescuer = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);

            const result = await rescuerService.getRescuer({page, limit});

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách người cứu hộ thành công!",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    verifyRescuer = async (req, res, next) => {
        try {
            const { userId } = req.body;

            const result = await rescuerService.isVerifiedRescuer({ userId });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy hồ sơ người cứu hộ!"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Duyệt người cứu hộ thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RescuerController()