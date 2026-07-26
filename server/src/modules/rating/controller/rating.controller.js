const ratingService = require("../service/rating.service");

class RatingController {
    async submitRating(req, res, next) {
        try {
            const { sosRequestId, rating, comment } = req.body;
            const victimId = req.userId;

            const result = await ratingService.submitRating({
                sosRequestId,
                victimId,
                rating,
                comment
            });

            return res.status(201).json({
                success: true,
                message: "Đánh giá ca cứu hộ thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getRescuerRatingOverview(req, res, next) {
        try {
            const { rescuerId } = req.params;
            const result = await ratingService.getRescuerRatingOverview(rescuerId);
            return res.status(200).json({
                success: true,
                message: "Lấy tổng quan đánh giá thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getRatingsByRescuerId(req, res, next) {
        try {
            const { rescuerId } = req.params;
            const { page, limit } = req.query;
            const result = await ratingService.getRatingsByRescuerId(rescuerId, { page, limit });
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách đánh giá thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getRatingBySosId(req, res, next) {
        try {
            const { sosRequestId } = req.params;
            const result = await ratingService.getRatingBySosId(sosRequestId);
            return res.status(200).json({
                success: true,
                message: "Lấy đánh giá ca SOS thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllRatingsAdmin(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await ratingService.getAllRatingsAdmin({ page, limit });
            return res.status(200).json({
                success: true,
                message: "Lấy toàn bộ danh sách đánh giá thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RatingController();
