const rescueService = require("../service/rescue.service");

class RescueController {
    rescueRegister = async (req, res, next) => {
        try {
            const { phone, gender, area, currentLat, currentLng, incidentTypeId } = req.body;

            const userId = "019edf9a-de0b-729e-b19a-f569384e6ea0"

            const result = await rescueService.rescueRegister({
                userId, phone, gender, area, currentLat, currentLng, incidentTypeId
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
}

module.exports = new RescueController()