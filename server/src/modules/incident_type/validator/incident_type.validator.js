const throwError = require("@/utils/throw_error.util");
const { isValidUUID } = require("@/utils/uuid.util");

const DANGEROUS_SCRIPT_REGEX = /<script|javascript:|data:|onload=|onerror=/i;

/**
 * Validate dữ liệu đầu vào khi tạo loại sự cố mới
 */
const validatorCreateIncidentType = (req, res, next) => {
    const { incidentType } = req.body;

    if (typeof incidentType !== "string" || !incidentType.trim()) {
        throwError("Tên loại sự cố phải là chuỗi văn bản và không được để trống!", 400);
    }

    const trimmed = incidentType.trim();

    if (trimmed.length < 2 || trimmed.length > 100) {
        throwError("Tên loại sự cố phải có độ dài từ 2 đến 100 ký tự!", 400);
    }

    if (DANGEROUS_SCRIPT_REGEX.test(trimmed)) {
        throwError("Dữ liệu chứa ký tự không hợp lệ hoặc mã độc!", 400);
    }

    req.body.incidentType = trimmed;
    next();
};

/**
 * Validate dữ liệu đầu vào khi chỉnh sửa loại sự cố
 */
const validatorUpdateIncidentType = (req, res, next) => {
    const { incidentTypeId } = req.params;
    const { incidentType, status } = req.body;

    if (!isValidUUID(incidentTypeId)) {
        throwError("Mã ID loại sự cố không đúng định dạng UUID!", 400);
    }

    if (!incidentType && !status) {
        throwError("Phải cung cấp ít nhất tên loại sự cố hoặc trạng thái cần cập nhật!", 400);
    }

    if (incidentType !== undefined) {
        if (typeof incidentType !== "string" || !incidentType.trim()) {
            throwError("Tên loại sự cố phải là chuỗi văn bản!", 400);
        }

        const trimmed = incidentType.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
            throwError("Tên loại sự cố phải có độ dài từ 2 đến 100 ký tự!", 400);
        }

        if (DANGEROUS_SCRIPT_REGEX.test(trimmed)) {
            throwError("Dữ liệu chứa ký tự không hợp lệ hoặc mã độc!", 400);
        }

        req.body.incidentType = trimmed;
    }

    if (status !== undefined) {
        if (typeof status !== "string" || !["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
            throwError("Trạng thái hoạt động phải là ACTIVE hoặc INACTIVE!", 400);
        }
        req.body.status = status.toUpperCase();
    }

    next();
};

/**
 * Validate dữ liệu khi bật/tắt trạng thái loại sự cố
 */
const validatorToggleStatusIncidentType = (req, res, next) => {
    const { incidentTypeId } = req.params;
    const { status } = req.body;

    if (!isValidUUID(incidentTypeId)) {
        throwError("Mã ID loại sự cố không đúng định dạng UUID!", 400);
    }

    if (typeof status !== "string" || !["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
        throwError("Trạng thái hoạt động phải là ACTIVE hoặc INACTIVE!", 400);
    }

    req.body.status = status.toUpperCase();
    next();
};

/**
 * Validate tham số phân trang query (page, limit)
 */
const validatorGetIncidentTypeAdmin = (req, res, next) => {
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
    validatorIncidentType: validatorCreateIncidentType,
    validatorCreateIncidentType,
    validatorUpdateIncidentType,
    validatorToggleStatusIncidentType,
    validatorGetIncidentTypeAdmin,
};