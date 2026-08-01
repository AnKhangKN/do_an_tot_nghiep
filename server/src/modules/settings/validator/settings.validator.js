const throwError = require("@/utils/throw_error.util");
const settingsRepository = require("../repository/settings.repository");
const { DEFAULT_SETTINGS } = settingsRepository;

const validateUpdateSettings = (req, res, next) => {
    try {
        const updates = req.body;

        if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
            throwError("Dữ liệu cập nhật cài đặt không hợp lệ!", 400);
        }

        const keys = Object.keys(updates);
        if (keys.length === 0) {
            throwError("Không có cài đặt nào được gửi lên để cập nhật!", 400);
        }

        const definitionByKey = {};
        DEFAULT_SETTINGS.forEach((s) => {
            definitionByKey[s.key] = s;
        });

        for (const key of keys) {
            const definition = definitionByKey[key];
            if (!definition) {
                throwError(`Cài đặt "${key}" không hợp lệ hoặc không được phép chỉnh sửa!`, 400);
            }

            const value = updates[key];
            if (value === undefined || value === null) {
                throwError(`Giá trị của "${definition.label}" không hợp lệ!`, 400);
            }

            const raw = String(value).trim();
            if (raw === "" && !key.startsWith("thesis_") && key !== "app_apk_url") {
                throwError(`Giá trị của "${definition.label}" không được để trống!`, 400);
            }

            if (definition.type === "number") {
                const num = Number(raw);
                if (!Number.isFinite(num) || num <= 0) {
                    throwError(`Giá trị của "${definition.label}" phải là số dương!`, 400);
                }
            } else if (definition.type === "boolean") {
                if (raw !== "true" && raw !== "false") {
                    throwError(`Giá trị của "${definition.label}" phải là đúng/sai!`, 400);
                }
            }

            updates[key] = raw;
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateUpdateSettings,
};
