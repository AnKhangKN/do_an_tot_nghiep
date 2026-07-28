const crypto = require("crypto");
const aiModerationRepository = require("../repository/ai_moderation.repository");
const aiClassifierService = require("@utils/ai_classifier.service");

class AiModerationService {
    /**
     * Tiến trình Phân loại & Kiểm duyệt AI chạy bất đồng bộ (Non-blocking)
     * Thường được gọi sau khi tạo SOS Request, Báo cáo tiện ích, v.v.
     */
    async processModerationAsync(entityType, entityId, textContent) {
        setImmediate(async () => {
            try {
                // Kiểm tra xem đã có log phân loại cho entity này chưa
                const existing = await aiModerationRepository.findLogByEntity(entityType, entityId);
                if (existing) return;

                // Phân loại qua AI (Groq API / NLP Fallback)
                const classification = await aiClassifierService.classify(textContent, entityType);

                const logData = {
                    logId: crypto.randomUUID(),
                    entityType,
                    entityId,
                    aiScore: classification.aiScore,
                    isFlagged: classification.isFlagged,
                    flagReason: classification.flagReason,
                    suggestedCategory: classification.suggestedCategory,
                    actionTaken: classification.actionTaken
                };

                const savedLog = await aiModerationRepository.createModerationLog(null, logData);

                if (savedLog.isFlagged) {
                    console.warn(`[AI Moderation Alert] ${entityType} ${entityId} flagged for review: ${savedLog.flagReason}`);
                }
            } catch (error) {
                console.error("[AI Moderation Error] Failed async moderation processing:", error.message);
            }
        });
    }

    /**
     * Lấy danh sách log kiểm duyệt AI cho Admin
     */
    async getModerationLogsForAdmin(query) {
        const { entityType, isFlagged, actionTaken, page, limit } = query;
        const parsedFlagged = typeof isFlagged === "string" ? isFlagged === "true" : isFlagged;

        return await aiModerationRepository.getLogsForAdmin({
            entityType,
            isFlagged: parsedFlagged,
            actionTaken,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20
        });
    }

    /**
     * Admin duyệt hoặc xử lý log kiểm duyệt AI
     */
    async reviewLogByAdmin(logId, adminId, actionTaken) {
        const validActions = ["APPROVED", "AUTO_BLOCKED", "REQUIRES_ADMIN_REVIEW", "DISMISSED"];
        if (!validActions.includes(actionTaken)) {
            throw new Error(`Hành động kiểm duyệt '${actionTaken}' không hợp lệ.`);
        }

        const updated = await aiModerationRepository.updateReviewStatus(logId, adminId, actionTaken);
        if (!updated) {
            throw new Error("Không tìm thấy bản ghi kiểm duyệt AI để cập nhật.");
        }
        return updated;
    }
}

module.exports = new AiModerationService();
