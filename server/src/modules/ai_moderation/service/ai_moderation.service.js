const { generateUUID } = require("@utils/uuid.util");
const aiModerationRepository = require("../repository/ai_moderation.repository");
const aiClassifierService = require("@utils/ai_classifier.service");

class AiModerationService {
    /**
     * Kiểm tra nhanh từ khóa/cụm từ nhạy cảm từ từ điển nội bộ (Blacklist) & Log lịch sử
     * Dùng để CHẶN NGAY TỪ ĐẦU (Early Block) khi tạo SOS hoặc Phản hồi, tiết kiệm 100% Token AI
     */
    async checkKnownSpamText(textContent) {
        if (!textContent || !textContent.trim()) return { isBlocked: false };

        const lowerText = textContent.toLowerCase().trim();

        // 1. Quét nhanh từ điển từ khóa/cụm từ vi phạm nhạy cảm nội bộ (0 Token AI)
        const blacklisted = await aiModerationRepository.getAllBlacklistedPhrases();
        for (const item of blacklisted) {
            if (item.phrase && lowerText.includes(item.phrase.toLowerCase().trim())) {
                return {
                    isBlocked: true,
                    reason: `Phát hiện cụm từ vi phạm tiêu chuẩn cộng đồng ("${item.phrase}")`
                };
            }
        }

        // 2. Tra cứu danh sách các log vi phạm (is_flagged = true HOẶC action_taken IN ('APPROVED', 'AUTO_BLOCKED'))
        const flaggedLogs = await aiModerationRepository.getAllFlaggedLogs();
        for (const log of flaggedLogs) {
            if (log.actionTaken === "DISMISSED") continue;

            // Quét danh sách cụm từ vi phạm đã trích xuất
            let phrases = [];
            if (log.violatingPhrases) {
                if (Array.isArray(log.violatingPhrases)) {
                    phrases = log.violatingPhrases;
                } else {
                    try {
                        phrases = JSON.parse(log.violatingPhrases);
                    } catch (e) {
                        phrases = [log.violatingPhrases];
                    }
                }
            }
            if (!Array.isArray(phrases)) phrases = [];

            for (const p of phrases) {
                if (p && typeof p === "string" && lowerText.includes(p.toLowerCase().trim())) {
                    return {
                        isBlocked: true,
                        reason: log.flagReason || `Chứa từ ngữ vi phạm tiêu chuẩn cộng đồng ("${p}")`
                    };
                }
            }

            // Quét trùng văn bản gốc
            if (log.textContent && lowerText.includes(log.textContent.toLowerCase().trim())) {
                return {
                    isBlocked: true,
                    reason: log.flagReason || "Nội dung văn bản này đã bị đánh dấu vi phạm tiêu chuẩn cộng đồng trước đó."
                };
            }
        }

        return { isBlocked: false };
    }

    /**
     * Tiến trình Phân loại & Kiểm duyệt AI chạy bất đồng bộ (Non-blocking)
     * TỐI ƯU TOKEN & DB:
     * - Quét từ điển Blacklisted trước (0 Token AI)
     * - Chỉ gửi Groq AI khi chưa có trong từ điển
     * - Chỉ LƯU CSDL khi nội dung VI PHẠM (isFlagged = true) để tiết kiệm 99% DB
     * - Tự động trích xuất & nạp từ vi phạm mới vào từ điển nhạy cảm nội bộ
     */
    async processModerationAsync(entityType, entityId, textContent) {
        setImmediate(async () => {
            try {
                if (!textContent || !textContent.trim()) return;

                // 1. Kiểm tra xem đã có log cho entityId này chưa
                const existing = await aiModerationRepository.findLogByEntity(entityType, entityId);
                if (existing) return;

                const lowerText = textContent.toLowerCase();

                // 2. Quét nhanh từ điển nhạy cảm local trước (0 Token AI)
                const blacklisted = await aiModerationRepository.getAllBlacklistedPhrases();
                const matchedPhrase = blacklisted.find(item => item.phrase && lowerText.includes(item.phrase.toLowerCase()));

                let classification = null;

                if (matchedPhrase) {
                    classification = {
                        aiScore: 0.99,
                        isFlagged: true,
                        flagReason: `Chứa từ/cụm từ vi phạm nhạy cảm: "${matchedPhrase.phrase}"`,
                        violatingPhrases: [matchedPhrase.phrase],
                        actionTaken: "REQUIRES_ADMIN_REVIEW"
                    };
                } else {
                    // 3. Nếu chưa trùng từ điển local -> Mới gửi lên AI phân tích (Groq API)
                    classification = await aiClassifierService.classify(textContent, entityType);
                }

                // 4. TỐI ƯU CSDL: Nếu AI xác nhận AN TOÀN (!isFlagged) -> KHÔNG LƯU DB LOG!
                if (!classification || !classification.isFlagged) {
                    console.log(`[AI Moderation Clean Pass] ${entityType} ${entityId} có nội dung an toàn. Cho qua hoàn toàn và KHÔNG lưu log rác vào DB!`);
                    return;
                }

                // 5. Nếu VI PHẠM (isFlagged = true) -> Mới lưu log vào DB cho Admin kiểm duyệt
                const logData = {
                    logId: generateUUID(),
                    entityType,
                    entityId,
                    textContent,
                    aiScore: classification.aiScore,
                    isFlagged: classification.isFlagged,
                    flagReason: classification.flagReason,
                    violatingPhrases: classification.violatingPhrases || [],
                    actionTaken: classification.actionTaken
                };

                const savedLog = await aiModerationRepository.createModerationLog(null, logData);

                // 6. TỰ ĐỘNG HỌC: Bổ sung các cụm từ vi phạm mới hoặc văn bản gốc vào Từ điển Local
                let phrasesToBlacklist = [];
                if (Array.isArray(classification.violatingPhrases) && classification.violatingPhrases.length > 0) {
                    phrasesToBlacklist = classification.violatingPhrases;
                } else if (textContent && textContent.trim()) {
                    phrasesToBlacklist = [textContent.trim()];
                }

                if (phrasesToBlacklist.length > 0) {
                    await aiModerationRepository.addBlacklistedPhrases(phrasesToBlacklist, "AI_EXTRACTED");
                }

                console.warn(`[AI Moderation Alert] ${entityType} ${entityId} flagged: ${savedLog.flagReason}`);
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

        // Nếu Admin xác nhận vi phạm (APPROVED / AUTO_BLOCKED):
        // 1. Tự động nạp cụm từ vi phạm / nội dung vào bảng từ điển blacklisted_phrases
        // 2. Kích hoạt xử lý tự động trên thực thể gốc
        if (actionTaken === "APPROVED" || actionTaken === "AUTO_BLOCKED") {
            try {
                let phrasesToBlacklist = [];
                if (updated.violatingPhrases) {
                    if (Array.isArray(updated.violatingPhrases)) {
                        phrasesToBlacklist = updated.violatingPhrases;
                    } else {
                        try {
                            phrasesToBlacklist = JSON.parse(updated.violatingPhrases);
                        } catch (e) {
                            phrasesToBlacklist = [updated.violatingPhrases];
                        }
                    }
                }

                if (!phrasesToBlacklist || phrasesToBlacklist.length === 0) {
                    if (updated.textContent && updated.textContent.trim()) {
                        phrasesToBlacklist = [updated.textContent.trim()];
                    }
                }

                if (phrasesToBlacklist && phrasesToBlacklist.length > 0) {
                    await aiModerationRepository.addBlacklistedPhrases(phrasesToBlacklist, "ADMIN_APPROVED");
                }

                await this.handleAutomaticActionOnEntity(updated);
            } catch (autoErr) {
                console.error("[AI Moderation Auto-Action Error] Lỗi xử lý tự động thực thể gốc:", autoErr.message);
            }
        }

        return updated;
    }

    /**
     * Tự động xử lý đối tượng gốc dựa trên loại thực thể (entityType) và gửi thông báo lý do cho người dùng
     */
    async handleAutomaticActionOnEntity(log) {
        const { entityType, entityId, flagReason } = log;
        if (!entityId) return;

        try {
            const notificationService = require("@modules/notification/service/notification.service");

            if (entityType === "SOS_REQUEST") {
                const sos_requestRepository = require("@modules/sos/repository/sos_request.repository");
                const redis = require("@/config/redis.config");

                // Lấy thông tin ca SOS để lấy userId người tạo
                const sos = await sos_requestRepository.findSOSById(entityId);
                const reasonText = flagReason || "Vi phạm tiêu chuẩn nội dung và quy định cộng đồng";

                // 1. Chuyển trạng thái ca SOS thành CANCELLED với lý do vi phạm
                await sos_requestRepository.updateStatusOnly({
                    sosRequestId: entityId,
                    status: "CANCELLED",
                    cancelReason: `Hệ thống kiểm duyệt: ${reasonText}`
                });

                // 2. Xóa vị trí SOS khỏi Redis Geo
                await redis.zrem("sos_locations", entityId);

                // 3. Gửi Thông báo (DB Notification + Firebase Push) báo lý do trực tiếp cho người dùng
                if (sos && sos.user_id) {
                    const title = "Cảnh báo: Yêu cầu cứu hộ bị hủy";
                    const body = `Yêu cầu SOS của bạn đã bị từ chối/hủy bỏ. Lý do: ${reasonText}`;

                    // Lưu thông báo vào CSDL của người dùng
                    notificationService.saveNotification({
                        userId: sos.user_id,
                        title,
                        content: body,
                        type: "WARNING"
                    }).catch(err => console.error("[Notification Error] Lỗi lưu thông báo DB:", err.message));

                    // Đẩy thông báo Push Notification qua FCM tới App Mobile
                    notificationService.sendPushNotification(sos.user_id, {
                        title,
                        body,
                        data: {
                            type: "SOS_MODERATION_BLOCKED",
                            sosId: entityId,
                            reason: reasonText
                        }
                    }).catch(err => console.error("[Notification Error] Lỗi gửi Push notification:", err.message));

                    // 4. Phát Socket Realtime tới Nạn nhân để lập tức ĐÓNG BOX TÌM KIẾM CỨU HỘ VIÊN
                    try {
                        const { getIO } = require("@/socket");
                        const io = getIO();
                        if (io) {
                            const socketPayload = {
                                sosId: entityId,
                                sosRequestId: entityId,
                                status: "CANCELLED",
                                reason: reasonText,
                                action: "CLOSE_SEARCHING_BOX"
                            };

                            io.to(`victim:${sos.user_id}`).emit("sos:cancelled", socketPayload);
                            io.to(`user:${sos.user_id}`).emit("sos:cancelled", socketPayload);
                            io.to(`victim:${sos.user_id}`).emit("sos:moderation_blocked", socketPayload);
                            io.to(`user:${sos.user_id}`).emit("sos:moderation_blocked", socketPayload);

                            console.log(`[Socket] Đã phát sự kiện 'sos:cancelled' tới victim:${sos.user_id} để đóng Box tìm kiếm!`);
                        }
                    } catch (socketErr) {
                        console.error("[Socket Error] Lỗi phát socket hủy ca cho victim:", socketErr.message);
                    }
                }

                console.log(`[AI Moderation Auto-Action] SOS Request ${entityId} đã được tự động HỦY ca và phát cảnh báo tới người dùng ${sos?.user_id}.`);
            } else if (entityType === "AMENITY_FEEDBACK") {
                const amenityFeedbackRepository = require("@modules/emergency_amenities/repository/amenity_feedback.repository");
                if (amenityFeedbackRepository && amenityFeedbackRepository.updateFeedbackStatus) {
                    await amenityFeedbackRepository.updateFeedbackStatus(entityId, "REJECTED");
                }
            } else if (entityType === "RESCUER_RATING") {
                const ratingRepository = require("@modules/rating/repository/rating.repository");
                if (ratingRepository && ratingRepository.flagRating) {
                    await ratingRepository.flagRating(entityId);
                    console.log(`[AI Moderation Auto-Action] Rating ${entityId} đã bị gắn cờ vi phạm tiêu chuẩn cộng đồng.`);
                }
            }
        } catch (error) {
            console.error(`[AI Moderation Auto-Action Error] Lỗi tự động xử lý ${entityType} ${entityId}:`, error.message);
        }
    }
}

module.exports = new AiModerationService();
