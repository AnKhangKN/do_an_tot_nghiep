const { generateUUID } = require("@utils/uuid.util");
const aiModerationRepository = require("../repository/ai_moderation.repository");
const aiClassifierService = require("@utils/ai_classifier.service");

class AiModerationService {
    /**
     * Kiểm tra nhanh xem đoạn văn bản này đã từng bị Cắm cờ / Duyệt vi phạm chưa
     * Dùng để CHẶN NGAY TỪ ĐẦU (Early Block) khi tạo SOS hoặc Phản hồi, tránh làm phiền AI & tốn Token
     */
    async checkKnownSpamText(textContent) {
        if (!textContent || !textContent.trim()) return { isBlocked: false };

        const existing = await aiModerationRepository.findLogByTextContent(textContent);
        if (existing) {
            // Nếu Admin đã xác nhận Bác bỏ cờ (DISMISSED) -> Minh oan cho nội dung này -> KHÔNG CHẶN
            if (existing.actionTaken === "DISMISSED") {
                return { isBlocked: false };
            }

            // Nếu từng bị cắm cờ và CHƯA được Admin gỡ cờ (hoặc đã duyệt vi phạm APPROVED / AUTO_BLOCKED)
            if (existing.isFlagged || existing.actionTaken === "APPROVED" || existing.actionTaken === "AUTO_BLOCKED") {
                return {
                    isBlocked: true,
                    reason: existing.flagReason || "Nội dung văn bản này đã bị cắm cờ vi phạm tiêu chuẩn cộng đồng trước đó."
                };
            }
        }

        return { isBlocked: false };
    }

    /**
     * Tiến trình Phân loại & Kiểm duyệt AI chạy bất đồng bộ (Non-blocking)
     * Thường được gọi sau khi tạo SOS Request, Báo cáo tiện ích, v.v.
     */
    async processModerationAsync(entityType, entityId, textContent) {
        setImmediate(async () => {
            try {
                // 1. Kiểm tra xem đã có log phân loại cho entityId này chưa
                const existing = await aiModerationRepository.findLogByEntity(entityType, entityId);
                if (existing) return;

                let classification = null;

                // 2. TỐI ƯU TOKEN & BỎ QUA GỬI AI NẾU ĐÃ AN TOÀN:
                // Tra cứu lịch sử kiểm duyệt của loại thực thể trùng nội dung
                const previousLog = await aiModerationRepository.findLogByTextContent(textContent, entityType);

                if (previousLog) {
                    // Nếu nội dung trùng lặp này đã từng được xác nhận AN TOÀN (!isFlagged hoặc actionTaken === 'DISMISSED')
                    if (!previousLog.isFlagged || previousLog.actionTaken === "DISMISSED") {
                        console.log(`[AI Moderation Safe Pass] ${entityType} ${entityId} có nội dung trùng lặp đã xác nhận AN TOÀN. Cho qua hoàn toàn, không gọi AI API và không lưu log trùng lặp vào bảng Admin!`);
                        return; // Cho qua ngay, không lưu log rác trùng lặp vào bảng Kiểm duyệt Admin
                    }

                    // Nếu là nội dung cũ trùng lặp nhưng từng có cờ
                    classification = {
                        aiScore: previousLog.aiScore,
                        isFlagged: previousLog.isFlagged,
                        flagReason: previousLog.flagReason,
                        suggestedCategory: previousLog.suggestedCategory,
                        actionTaken: previousLog.actionTaken
                    };
                } else {
                    // Nếu là nội dung mới hoàn toàn -> Mới gửi lên AI (Groq API / NLP Fallback)
                    classification = await aiClassifierService.classify(textContent, entityType);
                }

                const logData = {
                    logId: generateUUID(),
                    entityType,
                    entityId,
                    textContent,
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

        // Nếu Admin xác nhận vi phạm (APPROVED), kích hoạt xử lý tự động trên thực thể gốc
        if (actionTaken === "APPROVED") {
            try {
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
            }
        } catch (error) {
            console.error(`[AI Moderation Auto-Action Error] Lỗi tự động xử lý ${entityType} ${entityId}:`, error.message);
        }
    }
}

module.exports = new AiModerationService();
