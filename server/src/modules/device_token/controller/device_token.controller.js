const deviceTokenService = require("../service/device_token.service");

class DeviceTokenController {
    registerToken = async (req, res, next) => {
        try {
            const userId = req.userId;
            const { token, platform } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "Token là bắt buộc!"
                });
            }

            const result = await deviceTokenService.registerToken({
                userId,
                token,
                platform
            });

            return res.status(200).json({
                success: true,
                message: "Đăng ký thiết bị thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    unregisterToken = async (req, res, next) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "Token là bắt buộc!"
                });
            }

            await deviceTokenService.unregisterToken({ token });

            return res.status(200).json({
                success: true,
                message: "Hủy đăng ký thiết bị thành công!"
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DeviceTokenController();
