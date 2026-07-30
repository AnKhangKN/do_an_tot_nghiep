const throwError = require("@/utils/throw_error.util");
const { isValidUUID } = require("@/utils/uuid.util");

const DANGEROUS_SCRIPT_REGEX = /<script|javascript:|data:|onload=|onerror=/i;

const validateBanUser = (req, res, next) => {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!isValidUUID(userId)) {
        throwError("Mã người dùng không đúng định dạng UUID!", 400);
    }

    if (userId === req.userId) {
        throwError("Bạn không thể tự khóa tài khoản của chính mình!", 400);
    }

    if (!reason || typeof reason !== "string" || !reason.trim()) {
        throwError("Lý do khóa tài khoản không được để trống!", 400);
    }

    const trimmed = reason.trim();
    if (trimmed.length < 5 || trimmed.length > 500) {
        throwError("Lý do khóa tài khoản phải có độ dài từ 5 đến 500 ký tự!", 400);
    }

    if (DANGEROUS_SCRIPT_REGEX.test(trimmed)) {
        throwError("Dữ liệu chứa ký tự không hợp lệ hoặc mã độc!", 400);
    }

    req.body.reason = trimmed;
    next();
};

const validateUnbanUser = (req, res, next) => {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
        throwError("Mã người dùng không đúng định dạng UUID!", 400);
    }

    next();
};

const validateGetBannedUsers = (req, res, next) => {
    let { page, limit } = req.query;

    if (page !== undefined) {
        const parsedPage = parseInt(page, 10);
        if (isNaN(parsedPage) || parsedPage <= 0) {
            throwError("Số trang (page) phải là số nguyên dương hợp lệ!", 400);
        }
        req.query.page = parsedPage;
    } else {
        req.query.page = 1;
    }

    if (limit !== undefined) {
        const parsedLimit = parseInt(limit, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
            throwError("Số lượng bản ghi (limit) phải từ 1 đến 100!", 400);
        }
        req.query.limit = parsedLimit;
    } else {
        req.query.limit = 10;
    }

    next();
};

module.exports = {
    validateBanUser,
    validateUnbanUser,
    validateGetBannedUsers
};
