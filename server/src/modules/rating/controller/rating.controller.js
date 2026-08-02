const ratingService = require("../service/rating.service");

class RatingController {
    async submitRating(req, res, next) {
        try {
            const { sosRequestId, rating, responseSpeed, attitude, supportLevel, comment, cancelledUnreasonably } = req.body;
            const victimId = req.userId;

            const result = await ratingService.submitRating({
                sosRequestId,
                victimId,
                rating,
                responseSpeed,
                attitude,
                supportLevel,
                comment,
                cancelledUnreasonably: cancelledUnreasonably === true
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
            const { page, limit, ratingFilter, sentimentFilter } = req.query;
            const result = await ratingService.getAllRatingsAdmin({ page, limit, ratingFilter, sentimentFilter });
            return res.status(200).json({
                success: true,
                message: "Lấy toàn bộ danh sách đánh giá thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getRatingTrends(req, res, next) {
        try {
            const { days } = req.query;
            const result = await ratingService.getRatingTrends({ days });
            return res.status(200).json({
                success: true,
                message: "Lấy báo cáo xu hướng chất lượng thành công!",
                data: {
                    days: days ? Number(days) : 7,
                    data: result
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RatingController();
