const throwError = require("@/utils/throw_error.util");
const { isValidUUID } = require("@/utils/uuid.util");

const ALLOWED_CATEGORIES = ["BUG", "SUGGESTION", "CONTENT", "OTHER"];
const ALLOWED_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

// Validate khi user gửi báo cáo ứng dụng
const validateCreate = (req, res, next) => {
    const { category, title, content } = req.body;

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        throwError("Danh mục báo cáo không hợp lệ!", 400);
    }

    if (!title || typeof title !== "string" || !title.trim()) {
        throwError("Vui lòng nhập tiêu đề báo cáo!", 400);
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 5 || trimmedTitle.length > 200) {
        throwError("Tiêu đề báo cáo phải từ 5 đến 200 ký tự!", 400);
    }

    if (!content || typeof content !== "string" || !content.trim()) {
        throwError("Vui lòng nhập nội dung báo cáo!", 400);
    }
    const trimmedContent = content.trim();
    if (trimmedContent.length < 10 || trimmedContent.length > 5000) {
        throwError("Nội dung báo cáo phải từ 10 đến 5000 ký tự!", 400);
    }

    req.body.title = trimmedTitle;
    req.body.content = trimmedContent;
    next();
};

// Validate khi admin cập nhật trạng thái
const validateUpdateStatus = (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidUUID(id)) {
        throwError("Mã báo cáo không hợp lệ!", 400);
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
        throwError("Trạng thái xử lý không hợp lệ!", 400);
    }

    next();
};

module.exports = {
    validateCreate,
    validateUpdateStatus,
};
