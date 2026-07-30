const throwError = require("@/utils/throw_error.util");
const { isValidUUID } = require("@/utils/uuid.util");

const validateSubmitAppeal = (req, res, next) => {
    const { reason } = req.body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
        throwError("Vui lòng nhập nội dung kháng cáo!", 400);
    }

    const trimmed = reason.trim();
    if (trimmed.length < 10 || trimmed.length > 2000) {
        throwError("Nội dung kháng cáo phải từ 10 đến 2000 ký tự!", 400);
    }

    req.body.reason = trimmed;
    next();
};

const validateResolveAppeal = (req, res, next) => {
    const { id } = req.params;

    if (!isValidUUID(id)) {
        throwError("Mã đơn kháng cáo không hợp lệ!", 400);
    }

    next();
};

module.exports = {
    validateSubmitAppeal,
    validateResolveAppeal,
};
