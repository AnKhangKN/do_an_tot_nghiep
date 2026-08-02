const crypto = require("crypto");
const ratingRepository = require("../repository/rating.repository");
const sosRequestRepository = require("@/modules/sos/repository/sos_request.repository");
const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
const aiClassifierService = require("@utils/ai_classifier.service");

class RatingService {
    async submitRating({ sosRequestId, victimId, rating, responseSpeed, attitude, supportLevel, comment, cancelledUnreasonably = false }) {
        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Điểm đánh giá phải từ 1 đến 5 sao");
        }

        const aspects = { responseSpeed, attitude, supportLevel };
        for (const [key, value] of Object.entries(aspects)) {
            if (value !== undefined && value !== null && (value < 1 || value > 5)) {
                throw new Error("Điểm đánh giá theo từng khía cạnh phải từ 1 đến 5 sao");
            }
        }

        if (comment) {
            const spamCheck = await aiModerationService.checkKnownSpamText(comment);
            if (spamCheck.isBlocked) {
                throw new Error(`Đánh giá bị từ chối: ${spamCheck.reason || "Nội dung nhận xét đã bị đánh dấu vi phạm tiêu chuẩn cộng đồng."}`);
            }
        }

        const sos = await sosRequestRepository.findSOSById(sosRequestId);
        if (!sos) {
            throw new Error("Không tìm thấy thông tin ca cứu hộ");
        }

        // Chỉ đánh giá được khi: ca HOÀN THÀNH (DONE) hoặc ca bị CHÍNH CỨU HỘ VIÊN hủy (CANCELLED bởi rescuer)
        const canRateCancelled = sos.status === "CANCELLED" && sos.cancelled_by === "RESCUER";
        if (sos.status !== "DONE" && !canRateCancelled) {
            throw new Error("Chỉ có thể đánh giá ca cứu hộ đã hoàn thành hoặc bị cứu hộ viên hủy");
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
            responseSpeed: responseSpeed !== undefined && responseSpeed !== null ? parseInt(responseSpeed, 10) : null,
            attitude: attitude !== undefined && attitude !== null ? parseInt(attitude, 10) : null,
            supportLevel: supportLevel !== undefined && supportLevel !== null ? parseInt(supportLevel, 10) : null,
            comment,
            cancelledUnreasonably
        });

        if (comment) {
            aiModerationService.processModerationAsync("RESCUER_RATING", ratingId, comment);
            this.processSentimentAsync(ratingId, comment);
        }

        return newRating;
    }

    /**
     * Phân tích cảm xúc không chặn luồng (non-blocking) sau khi lưu rating
     */
    processSentimentAsync(ratingId, comment) {
        setImmediate(async () => {
            try {
                const result = await aiClassifierService.classifySentiment(comment);
                await ratingRepository.updateRatingSentiment({
                    ratingId,
                    sentiment: result.sentiment,
                    confidence: result.confidence
                });
                console.log(`[AI Sentiment] Rating ${ratingId} => ${result.sentiment} (${result.confidence}, ${result.source})`);
            } catch (error) {
                console.warn("[AI Sentiment] Lỗi cập nhật sentiment cho rating:", error.message);
            }
        });
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

    async getAllRatingsAdmin({ page = 1, limit = 20, ratingFilter = null, sentimentFilter = null } = {}) {
        return await ratingRepository.getAllRatingsAdmin({ page, limit, ratingFilter, sentimentFilter });
    }

    async getRatingTrends({ days = 7 } = {}) {
        if (!days || Number(days) < 1 || Number(days) > 90) {
            throw new Error("Khoảng thời gian phải từ 1 đến 90 ngày");
        }
        return await ratingRepository.getRatingTrends({ days });
    }
}

module.exports = new RatingService();
