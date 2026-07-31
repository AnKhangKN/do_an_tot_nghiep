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

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const validateUpdateAdminProfile = (req, res, next) => {
    const { fullName, phone } = req.body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        throwError("Họ và tên không được để trống!", 400);
    }

    const trimmedFullName = fullName.trim();
    if (trimmedFullName.length > 100) {
        throwError("Họ và tên không được vượt quá 100 ký tự!", 400);
    }

    if (DANGEROUS_SCRIPT_REGEX.test(trimmedFullName)) {
        throwError("Dữ liệu chứa ký tự không hợp lệ hoặc mã độc!", 400);
    }

    if (phone !== undefined && phone !== null && phone !== "") {
        const trimmedPhone = phone.toString().trim();
        if (!PHONE_REGEX.test(trimmedPhone)) {
            throwError("Số điện thoại không đúng định dạng! Vui lòng nhập SĐT Việt Nam 10 chữ số (ví dụ: 0912345678).", 400);
        }
        req.body.phone = trimmedPhone;
    } else {
        req.body.phone = null;
    }

    req.body.fullName = trimmedFullName;
    next();
};

const validateChangeAdminPassword = (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== "string" || !currentPassword.trim()) {
        throwError("Mật khẩu hiện tại không được để trống!", 400);
    }

    if (!newPassword || typeof newPassword !== "string" || !newPassword.trim()) {
        throwError("Mật khẩu mới không được để trống!", 400);
    }

    if (newPassword.length < 6) {
        throwError("Mật khẩu mới phải có ít nhất 6 ký tự!", 400);
    }

    if (!confirmPassword || confirmPassword !== newPassword) {
        throwError("Xác nhận mật khẩu mới không khớp!", 400);
    }

    next();
};

module.exports = {
    validateBanUser,
    validateUnbanUser,
    validateGetBannedUsers,
    validateUpdateAdminProfile,
    validateChangeAdminPassword
};
