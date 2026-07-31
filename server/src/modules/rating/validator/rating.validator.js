const throwError = require("@/utils/throw_error.util");

const validatorSubmitRating = (req, res, next) => {
    try {
        const { sosRequestId, rating, responseSpeed, attitude, supportLevel, comment } = req.body;

        if (!sosRequestId || sosRequestId.trim() === "") {
            throwError("Thiếu ID ca cứu hộ!", 400);
        }

        if (rating === undefined || rating === null || Number(rating) < 1 || Number(rating) > 5) {
            throwError("Điểm đánh giá phải từ 1 đến 5 sao!", 400);
        }

        const aspectValues = [
            ["responseSpeed", responseSpeed],
            ["attitude", attitude],
            ["supportLevel", supportLevel]
        ];

        for (const [field, value] of aspectValues) {
            if (value !== undefined && value !== null && value !== "" && (Number(value) < 1 || Number(value) > 5)) {
                throwError(`Điểm đánh giá "${field}" phải từ 1 đến 5 sao!`, 400);
            }
        }

        if (comment !== undefined && comment !== null && String(comment).trim().length > 2000) {
            throwError("Nội dung nhận xét không được vượt quá 2000 ký tự!", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validatorGetAdminRatings = (req, res, next) => {
    try {
        const { page, limit, ratingFilter, sentimentFilter } = req.query;

        if (page !== undefined && Number(page) < 1) {
            throwError("Tham số page không hợp lệ!", 400);
        }

        if (limit !== undefined && (Number(limit) < 1 || Number(limit) > 100)) {
            throwError("Tham số limit phải từ 1 đến 100!", 400);
        }

        if (ratingFilter && (Number(ratingFilter) < 1 || Number(ratingFilter) > 5)) {
            throwError("Tham số ratingFilter phải từ 1 đến 5!", 400);
        }

        if (sentimentFilter && !["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(sentimentFilter)) {
            throwError("Tham số sentimentFilter không hợp lệ!", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validatorGetRatingTrends = (req, res, next) => {
    try {
        const { days } = req.query;

        if (days !== undefined && (Number(days) < 1 || Number(days) > 90)) {
            throwError("Khoảng thời gian (days) phải từ 1 đến 90 ngày!", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validatorSubmitRating,
    validatorGetAdminRatings,
    validatorGetRatingTrends
};
