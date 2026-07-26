const crypto = require("crypto");
const ratingRepository = require("../repository/rating.repository");
const sosRequestRepository = require("@/modules/sos/repository/sos_request.repository");

class RatingService {
    async submitRating({ sosRequestId, victimId, rating, comment }) {
        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Điểm đánh giá phải từ 1 đến 5 sao");
        }

        const sos = await sosRequestRepository.findSOSById(sosRequestId);
        if (!sos) {
            throw new Error("Không tìm thấy thông tin ca cứu hộ");
        }

        if (sos.status !== "DONE") {
            throw new Error("Chỉ có thể đánh giá ca cứu hộ đã hoàn thành");
        }

        if (sos.user_id !== victimId) {
            throw new Error("Bạn không phải nạn nhân của ca cứu hộ này");
        }

        if (!sos.rescuer_id) {
            throw new Error("Ca cứu hộ này chưa có cứu hộ viên tiếp nhận");
        }

        const existingRating = await ratingRepository.getRatingBySosId(sosRequestId);
        if (existingRating) {
            throw new Error("Ca cứu hộ này đã được đánh giá trước đó");
        }

        const ratingId = crypto.randomUUID();
        const newRating = await ratingRepository.createRating({
            ratingId,
            sosRequestId,
            victimId,
            rescuerId: sos.rescuer_id,
            rating: parseInt(rating, 10),
            comment
        });

        return newRating;
    }

    async getRescuerRatingOverview(rescuerId) {
        if (!rescuerId) {
            throw new Error("Thiếu ID cứu hộ viên");
        }
        return await ratingRepository.getRescuerRatingStats(rescuerId);
    }

    async getRatingsByRescuerId(rescuerId, { page = 1, limit = 10 } = {}) {
        if (!rescuerId) {
            throw new Error("Thiếu ID cứu hộ viên");
        }
        return await ratingRepository.getRatingsByRescuerId(rescuerId, { page, limit });
    }

    async getRatingBySosId(sosRequestId) {
        if (!sosRequestId) {
            throw new Error("Thiếu ID ca SOS");
        }
        return await ratingRepository.getRatingBySosId(sosRequestId);
    }

    async getAllRatingsAdmin({ page = 1, limit = 20 } = {}) {
        return await ratingRepository.getAllRatingsAdmin({ page, limit });
    }
}

module.exports = new RatingService();
