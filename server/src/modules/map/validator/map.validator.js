const throwError = require("@/utils/throw_error.util");

const VIETNAMESE_LETTER = /[A-Za-z\u00C0-\u024F\u1EA0-\u1EFF]/;

const validateSearchQuery = (req, res, next) => {
    const { q, limit } = req.query;

    const query = typeof q === "string" ? q.replace(/[\u0000-\u001F\u007F]/g, "").trim() : "";

    if (!query) {
        throwError("Từ khóa tìm kiếm không được rỗng!", 400);
    }

    if (query.length < 2) {
        throwError("Từ khóa tìm kiếm quá ngắn (tối thiểu 2 ký tự).", 400);
    }

    if (query.length > 100) {
        throwError("Từ khóa tìm kiếm quá dài (tối đa 100 ký tự).", 400);
    }

    if (!VIETNAMESE_LETTER.test(query)) {
        throwError("Từ khóa tìm kiếm không hợp lệ. Vui lòng nhập tên địa điểm rõ ràng.", 400);
    }

    let parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 5;
    if (parsedLimit > 10) parsedLimit = 10;

    req.validatedQuery = { query, limit: parsedLimit };
    next();
};

module.exports = {
    validateSearchQuery
};
