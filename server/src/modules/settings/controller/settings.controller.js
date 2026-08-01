const settingsService = require("../service/settings.service");

class SettingsController {
    getSettings = async (req, res, next) => {
        try {
            const data = await settingsService.getAllAdmin();
            return res.status(200).json({
                status: 200,
                message: "Lấy cấu hình hệ thống thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    updateSettings = async (req, res, next) => {
        try {
            const data = await settingsService.update(req.body);
            return res.status(200).json({
                status: 200,
                message: "Cập nhật cấu hình hệ thống thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };

    getPublicThesis = async (req, res, next) => {
        try {
            const data = await settingsService.getPublicThesis();
            return res.status(200).json({
                status: 200,
                message: "Lấy thông tin đồ án tốt nghiệp thành công",
                data
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new SettingsController();
