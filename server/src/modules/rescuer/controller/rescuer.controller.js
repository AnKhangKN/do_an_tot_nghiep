const rescuerService = require("../service/rescuer.service");

class RescuerController {
    rescuerRegister = async (req, res, next) => {
        try {
            // const userId = req.userId; 

            const userId = "019effb7-33cb-7018-a9b4-0ad031784eae";

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
}

module.exports = new RescuerController()