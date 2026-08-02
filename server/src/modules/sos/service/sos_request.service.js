const uuidUtil = require("@/utils/uuid.util");
const sos_requestRepository = require("../repository/sos_request.repository");
const userService = require("@modules/user/services/user.service");
const sosQueue = require("../../../queues/sos.queue");
const { transaction } = require("@/config/database.config");
const redis = require("../../../config/redis.config");
const dispatchService = require("@modules/dispatch/service/dispatcher.service");
const notificationService = require("@modules/notification/service/notification.service");
const rescuerHistoryRepository = require("../repository/rescuer_history.repository");
const imageService = require("@modules/image/service/image.service");
const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
const chatService = require("@modules/chat/service/chat.service");
const settingsUtil = require("@/utils/settings.util");

class SosRequestService {
    constructor() {
        this.sos_requestRepository = sos_requestRepository;
    }

    // nạn nhân tạo sos
    createSOS = async ({
        userId,
        phone,
        incidentTypeId,
        description,
        victimLat,
        victimLng,
        imageUrl,
    }) => {
        // CHẶN NGAY TỪ ĐẦU (Early Block): Nếu mô tả SOS thuộc danh sách đã từng bị Cắm cờ/Duyệt vi phạm trước đó
        if (description) {
            const spamCheck = await aiModerationService.checkKnownSpamText(description);
            if (spamCheck.isBlocked) {
                throw new Error(`Yêu cầu SOS bị từ chối: ${spamCheck.reason || "Nội dung lời nhắn đã từng bị đánh dấu vi phạm tiêu chuẩn cộng đồng."}`);
            }
        }

        const sos = await transaction(async (client) => {
            const sosRequestId = uuidUtil.generateUUID();

            const sos = await this.sos_requestRepository.createSOS(client, {
                sosRequestId,
                userId,
                incidentTypeId,
                description,
                victimLat,
                victimLng,
            });

            if (phone) {
                await userService.updatePhone(client, {
                    userId,
                    phone,
                });
            }

            if (imageUrl) {
                await imageService.createImage(client, {
                    url: imageUrl,
                    entityType: 'SOS_REQUEST',
                    entityId: sosRequestId,
                });
            }

            return {
                ...sos,
                image_url: imageUrl || null
            };
        });

        await sosQueue.add(
            "process-sos",
            {
                sosId: sos.sos_request_id,
                attempt: 1,
            },
            {
                jobId: `process-sos-${sos.sos_request_id} attempt-1`,
                removeOnComplete: true,
                removeOnFail: true,
            }
        );

// Đặt job tự động hủy yêu cầu SOS sau 30 phút nếu Nạn nhân không hoạt động/không được tiếp nhận
            const autoCancelMs = (await settingsUtil.getSettingNumber("auto_cancel_inactive_minutes", 30)) * 60 * 1000;
            await sosQueue.add(
                "auto-cancel-inactive-sos",
                {
                    sosId: sos.sos_request_id,
                },
                {
                    jobId: `auto-cancel-inactive-sos-${sos.sos_request_id}`,
                    delay: autoCancelMs,
                    removeOnComplete: true,
                    removeOnFail: true,
                }
            );
            console.log(`⏰ [SOS SERVICE] Đã lên lịch job BullMQ 'auto-cancel-inactive-sos' tự động hủy SOS: ${sos.sos_request_id} sau ${autoCancelMs / 60000} phút không tương tác.`);

        const sosLocation = await redis.geoadd(
            "sos_locations",
            victimLng,
            victimLat,
            sos.sos_request_id
        );

        console.log("Sos location", sosLocation);

        try {
            const { emitAdminDashboardEvent } = require("@/socket");
            emitAdminDashboardEvent("SOS_CREATED", {
                sosId: sos.sos_request_id,
                victimLat,
                victimLng,
                incidentTypeId,
                imageUrl: sos.image_url,
                createdAt: sos.created_at
            });
        } catch (e) {
            console.error("[SERVICE] Lỗi phát event socket admin dashboard:", e);
        }

        // Kích hoạt tiến trình phân loại & kiểm duyệt AI bất đồng bộ
        if (description) {
            aiModerationService.processModerationAsync("SOS_REQUEST", sos.sos_request_id, description);
        }

        return sos;
    };


    findSOSById = async (sosId) => {
        const sos = await this.sos_requestRepository.findSOSById(sosId);
        return sos;
    };

    acceptSOS = async ({ sosRequestId, rescuerId }) => {
        const updatedSos = await transaction(async (client) => {
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos) {
                throw new Error("Không tìm thấy yêu cầu cứu hộ!");
            }
            if (sos.status !== "PENDING" && sos.status !== "SEARCHING") {
                throw new Error("Yêu cầu cứu hộ đã được tiếp nhận hoặc đã bị hủy!");
            }

            const now = new Date();
            const updated = await this.sos_requestRepository.updateRescuerAndStatus(client, {
                sosRequestId,
                rescuerId,
                status: "IN_PROGRESS",
                acceptedAt: now
            });

            // Ghi nhật ký hoạt động: ACCEPTED
            await rescuerHistoryRepository.createHistory(client, {
                historyId: uuidUtil.generateUUID(),
                rescuerId,
                sosRequestId,
                action: 'ACCEPTED'
            });

            return updated;
        });

        // Xóa SOS location khỏi Redis Geo
        await redis.zrem("sos_locations", sosRequestId);

        // Ngắt luồng tìm kiếm (bullmq)
        dispatchService.stopSOS(sosRequestId);

        // Dọn dẹp tracking keys trên Redis
        await this.cleanupSosKeys(sosRequestId);

        // Lưu liên kết cứu hộ vào Redis Hash active_rescues
        await redis.hset("active_rescues", rescuerId, JSON.stringify({
            sosRequestId,
            victimId: updatedSos.user_id
        }));

        // Giải phóng trạng thái bận xem xét offer
        await redis.del(`sos:offer:rescuer:${rescuerId}`);

        // Đọc thông tin song song (Parallel) để phản hồi lập tức 0ms
        const [rescuerInfo, victimInfo, pos] = await Promise.all([
            userService.getUserInfoById({ userId: rescuerId }).catch(() => null),
            userService.getUserInfoById({ userId: updatedSos.user_id }).catch(() => null),
            redis.geopos("rescuer_locations", rescuerId).catch(() => null)
        ]);

        let rescuerLat = null;
        let rescuerLng = null;
        if (pos && pos[0]) {
            rescuerLng = parseFloat(pos[0][0]);
            rescuerLat = parseFloat(pos[0][1]);
        }

        // Phát sự kiện Redis PubSub TỨC THÌ cho Socket Server đồng bộ Victim & Rescuer
        const pubsubPayload = JSON.stringify({
            sosRequestId,
            sosId: sosRequestId,
            victimId: updatedSos.user_id,
            rescuerId,
            status: 'IN_PROGRESS',
            rescuer: {
                userId: rescuerId,
                fullName: rescuerInfo?.full_name || 'Người cứu hộ',
                phone: rescuerInfo?.phone || '',
                avatarUrl: rescuerInfo?.avatar_url || null,
                lat: rescuerLat,
                lng: rescuerLng
            },
            victim: {
                userId: updatedSos.user_id,
                fullName: victimInfo?.full_name || 'Người gặp nạn',
                phone: victimInfo?.phone || '',
                avatarUrl: victimInfo?.avatar_url || null,
                imageUrl: updatedSos.image_url || null,
                lat: updatedSos.victim_lat,
                lng: updatedSos.victim_lng,
                description: updatedSos.description,
                incidentTypeName: updatedSos.incident_type_name
            },
            via: 'OFFER_ACCEPT',
        });
        await redis.publish("sos:accepted", pubsubPayload);

        // Gửi Push Notification Firebase KHÔNG CHỜ (non-blocking async)
        notificationService.sendPushNotification(updatedSos.user_id, {
            title: "Yêu cầu cứu hộ đã được tiếp nhận!",
            body: `${rescuerInfo?.full_name || 'Người cứu hộ'} đang trên đường di chuyển đến hỗ trợ bạn.`,
            data: {
                type: "RESCUE_ACCEPTED",
                sosRequestId,
                rescuerId
            }
        }).catch(err => console.error("[SERVICE] Lỗi gửi push notification cho victim:", err));


        try {
            const { emitAdminDashboardEvent } = require("@/socket");
            emitAdminDashboardEvent("SOS_ACCEPTED", {
                sosId: sosRequestId,
                rescuerId
            });
        } catch (e) {
            console.error("[SERVICE] Lỗi phát event socket admin dashboard:", e);
        }

        return updatedSos;
    };




    completeSOS = async ({ sosRequestId }) => {
        const result = await transaction(async (client) => {
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos) {
                throw new Error("Không tìm thấy yêu cầu cứu hộ!");
            }
            if (sos.status !== "IN_PROGRESS") {
                throw new Error("Yêu cầu cứu hộ không ở trạng thái đang thực hiện!");
            }

            const now = new Date();
            const updated = await this.sos_requestRepository.completeSOS(client, {
                sosRequestId,
                completedAt: now
            });

            // Ghi nhật ký hoạt động: COMPLETED
            await rescuerHistoryRepository.createHistory(client, {
                historyId: uuidUtil.generateUUID(),
                rescuerId: sos.rescuer_id,
                sosRequestId,
                action: 'COMPLETED'
            });

            return updated;
        });

        // Xóa cứu hộ viên khỏi danh sách active_rescues để trả về trạng thái rảnh rỗi
        if (result && result.rescuer_id) {
            await redis.hdel("active_rescues", result.rescuer_id);
            console.log(`[SERVICE] Đã giải phóng active_rescues cho Rescuer: ${result.rescuer_id}`);
        }

        // Reset bộ đếm hủy ca liên tiếp khi Rescuer hoàn thành một ca cứu hộ
        if (result && result.rescuer_id) {
            await redis.del(`rescuer:cancel_streak:${result.rescuer_id}`);
            console.log(`[SERVICE] Đã reset bộ đếm hủy ca liên tiếp cho Rescuer: ${result.rescuer_id}`);
        }

        // Lên lịch tự động khóa kênh nhắn tin giữa Nạn nhân và Cứu hộ viên sau 15 phút gia hạn
        const chatGraceMs = (await settingsUtil.getSettingNumber("chat_close_grace_minutes", 15)) * 60 * 1000;
        console.log(`💬 [CHAT AUTO-CLOSE TIMER] Bắt đầu đếm ngược ${chatGraceMs / 60000} phút gia hạn chat cho ca SOS hoàn thành: ${sosRequestId}`);
        setTimeout(async () => {
            try {
                const closedConv = await chatService.closeConversationBySosRequestId(sosRequestId);
                if (closedConv) {
                    const payload = JSON.stringify({
                        conversationId: closedConv.conversation_id,
                        sosRequestId,
                        victimId: closedConv.user1_id,
                        rescuerId: closedConv.user2_id,
                        message: `Hết thời gian ${chatGraceMs / 60000} phút gia hạn. Cuộc trò chuyện này đã tự động đóng.`
                    });
                    await redis.publish("chat:conversation_closed", payload);
                    console.log(`🔒 [CHAT AUTO-CLOSE SUCCESS] Đã tự động đóng kênh nhắn tin ${closedConv.conversation_id} sau ${chatGraceMs / 60000} phút hoàn thành ca SOS: ${sosRequestId}`);
                }
            } catch (convErr) {
                console.error("[SERVICE] Lỗi khóa kênh chat sau gia hạn SOS:", convErr);
            }
        }, chatGraceMs);

        try {
            const { emitAdminDashboardEvent } = require("@/socket");
            emitAdminDashboardEvent("SOS_COMPLETED", {
                sosId: sosRequestId
            });
        } catch (e) {
            console.error("[SERVICE] Lỗi phát event socket admin dashboard:", e);
        }

        return result;
    };

    getActiveSOS = async ({ userId, role }) => {
        const activeSos = await this.sos_requestRepository.findActiveSOSByUser({ userId, role });
        if (!activeSos) return null;

        // Lấy thêm thông tin đối phương (nếu có)
        let partner = null;
        if (role === 'RESCUER') {
            const victimInfo = await userService.getUserInfoById({ userId: activeSos.user_id });
            partner = {
                userId: activeSos.user_id,
                fullName: victimInfo?.full_name,
                phone: victimInfo?.phone,
            };
        } else if (activeSos.rescuer_id) {
            const rescuerInfo = await userService.getUserInfoById({ userId: activeSos.rescuer_id });

            let rescuerLat = null;
            let rescuerLng = null;
            try {
                const pos = await redis.geopos("rescuer_locations", activeSos.rescuer_id);
                if (pos && pos[0]) {
                    rescuerLng = parseFloat(pos[0][0]);
                    rescuerLat = parseFloat(pos[0][1]);
                }
            } catch (err) {
                console.error("[SERVICE] Lỗi lấy tọa độ Rescuer từ Redis:", err);
            }

            partner = {
                userId: activeSos.rescuer_id,
                fullName: rescuerInfo?.full_name,
                phone: rescuerInfo?.phone,
                lat: rescuerLat,
                lng: rescuerLng,
            };
        }

        return {
            sosRequest: activeSos,
            partner
        };
    };

    cleanupSosKeys = async (sosId) => {
        try {
            // Lấy danh sách tất cả rescuers đang giữ offer của SOS này
            const offeredRescuers = await redis.smembers(`sos:${sosId}:offered_rescuers`);

            const pipeline = redis.pipeline();
            if (offeredRescuers && offeredRescuers.length > 0) {
                for (const rescuerId of offeredRescuers) {
                    pipeline.del(`sos:offer:rescuer:${rescuerId}`);
                }
            }
            pipeline.del(`sos:${sosId}:attempt`);
            pipeline.del(`sos:${sosId}:offered_rescuers`);
            pipeline.del(`sos:${sosId}:rejected_rescuers`);
            await pipeline.exec();
            console.log(`[SERVICE] Đã dọn dẹp toàn bộ offer & tracking keys cho SOS: ${sosId}`);
        } catch (err) {
            console.error("[SERVICE] Lỗi dọn dẹp Redis keys của SOS:", err);
        }
    };

    rejectSOS = async ({ sosRequestId, rescuerId }) => {
        const radiusList = settingsUtil.parseRadiusLadder((await settingsUtil.getSettingsMap()).search_radius_ladder);
        try {
            // 1. Xóa offer của rescuer này
            await redis.del(`sos:offer:rescuer:${rescuerId}`);

            // 2. Thêm vào danh sách từ chối và xóa khỏi danh sách đang offer
            const pipeline = redis.pipeline();
            pipeline.sadd(`sos:${sosRequestId}:rejected_rescuers`, rescuerId);
            pipeline.srem(`sos:${sosRequestId}:offered_rescuers`, rescuerId);
            pipeline.expire(`sos:${sosRequestId}:rejected_rescuers`, 3600);
            await pipeline.exec();

            // Ghi nhật ký hoạt động: REJECTED
            await transaction(async (client) => {
                await rescuerHistoryRepository.createHistory(client, {
                    historyId: uuidUtil.generateUUID(),
                    rescuerId,
                    sosRequestId,
                    action: 'REJECTED'
                });
            }).catch(err => console.error("Lỗi ghi log REJECTED vào DB:", err));

            // 3. Kiểm trạng thái SOS trong DB
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos || (sos.status !== "PENDING" && sos.status !== "SEARCHING")) {
                return;
            }

            // 4. Kiểm tra xem còn cứu hộ viên nào khác đang xem xét offer của SOS này không
            const remainingCount = await redis.scard(`sos:${sosRequestId}:offered_rescuers`);
            if (remainingCount === 0) {
                // Lấy attempt hiện tại từ Redis
                const attemptStr = await redis.get(`sos:${sosRequestId}:attempt`);
                const attempt = attemptStr ? parseInt(attemptStr) : 1;

                if (attempt < radiusList.length) {
                    console.log(`[SERVICE] Tất cả rescuers đợt này đã từ chối. Quét tiếp SOS ${sosRequestId} đợt ${attempt + 1}`);
                    await sosQueue.add(
                        "process-sos",
                        {
                            sosId: sosRequestId,
                            attempt: attempt + 1,
                        },
                        {
                            jobId: `process-sos-${sosRequestId} attempt-${attempt + 1}`,
                            removeOnComplete: true,
                            removeOnFail: true,
                        }
                    );
                } else {
                    console.log(`[SERVICE] Tất cả rescuers đợt cuối đã từ chối. SOS ${sosRequestId} không tìm được ai.`);

                    // Cập nhật trạng thái SOS thành CANCELLED trong database trước tiên để kiểm tra race condition
                    const updatedSos = await this.cancelSOS({
                        sosRequestId,
                        cancelReason: "Tất cả người cứu hộ từ chối yêu cầu cứu hộ"
                    });

                    if (updatedSos) {
                        // Thông báo về nạn nhân rằng không tìm được rescuer qua pubsub
                        const payload = JSON.stringify({
                            sosId: sosRequestId,
                            victimId: updatedSos.user_id,
                        });
                        await redis.publish("sos:not_found", payload);

                        // Đồng thời gửi Push Notification báo thất bại cho nạn nhân
                        await notificationService.sendPushNotification(updatedSos.user_id, {
                            title: "Không tìm thấy người cứu hộ",
                            body: "Chưa tìm thấy người cứu hộ phù hợp cho yêu cầu trợ giúp của bạn. Vui lòng thử lại sau.",
                            data: {
                                type: "SOS_NOT_FOUND",
                                sosRequestId
                            }
                        }).catch(err => console.error("Lỗi gửi push notification cho victim:", err));

                        // Dọn dẹp Redis
                        await this.cleanupSosKeys(sosRequestId);
                    } else {
                        console.log(`[SERVICE] Bỏ qua xử lý từ chối đợt cuối do SOS ${sosRequestId} đã được nhận hoặc hủy trước đó`);
                    }
                }
            }
        } catch (error) {
            console.error("[SERVICE] Lỗi trong rejectSOS:", error);
        }
    };

    handleOfferTimeout = async ({ sosRequestId, attempt }) => {
        const radiusList = settingsUtil.parseRadiusLadder((await settingsUtil.getSettingsMap()).search_radius_ladder);
        try {
            // 1. Kiểm xem job check-offer-timeout này có khớp với attempt hiện tại không
            const currentAttemptStr = await redis.get(`sos:${sosRequestId}:attempt`);
            const currentAttempt = currentAttemptStr ? parseInt(currentAttemptStr) : null;
            if (currentAttempt !== null && currentAttempt !== attempt) {
                console.log(`[TIMEOUT] Job check-offer-timeout cho attempt ${attempt} bị bỏ qua vì hiện tại đang là attempt ${currentAttempt}`);
                return;
            }

            // 2. Kiểm tra trạng thái SOS
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos || (sos.status !== "PENDING" && sos.status !== "SEARCHING")) {
                // Đã được nhận hoặc hủy, dọn dẹp các key
                await this.cleanupSosKeys(sosRequestId);
                return;
            }

            // 3. Lấy danh sách rescuers đang được offer đợt này
            const offeredRescuers = await redis.smembers(`sos:${sosRequestId}:offered_rescuers`);
            if (offeredRescuers && offeredRescuers.length > 0) {
                const pipeline = redis.pipeline();
                for (const rescuerId of offeredRescuers) {
                    pipeline.del(`sos:offer:rescuer:${rescuerId}`);
                    pipeline.sadd(`sos:${sosRequestId}:rejected_rescuers`, rescuerId);
                    pipeline.srem(`sos:${sosRequestId}:offered_rescuers`, rescuerId);
                }
                pipeline.expire(`sos:${sosRequestId}:rejected_rescuers`, 3600);
                await pipeline.exec();

                // Ghi nhật ký hoạt động: TIMEOUT cho từng rescuer
                await transaction(async (client) => {
                    for (const rescuerId of offeredRescuers) {
                        await rescuerHistoryRepository.createHistory(client, {
                            historyId: uuidUtil.generateUUID(),
                            rescuerId,
                            sosRequestId,
                            action: 'TIMEOUT'
                        });
                    }
                }).catch(err => console.error("Lỗi ghi log TIMEOUT vào DB:", err));
            }

            // 4. Kích hoạt đợt quét tiếp theo
            if (attempt < radiusList.length) {
                console.log(`[TIMEOUT] Hết giờ xem xét offer đợt ${attempt}. Quét tiếp SOS ${sosRequestId} đợt ${attempt + 1}`);
                await sosQueue.add(
                    "process-sos",
                    {
                        sosId: sosRequestId,
                        attempt: attempt + 1,
                    },
                    {
                        jobId: `process-sos-${sosRequestId} attempt-${attempt + 1}`,
                        removeOnComplete: true,
                        removeOnFail: true,
                    }
                );
            } else {
                console.log(`[TIMEOUT] Hết giờ xem xét offer đợt cuối ${attempt}. SOS ${sosRequestId} không tìm được ai.`);

                // Cập nhật trạng thái SOS thành CANCELLED trong database trước tiên để kiểm tra race condition
                const updatedSos = await this.cancelSOS({
                    sosRequestId,
                    cancelReason: "Hết thời gian xem xét offer cứu hộ"
                });

                if (updatedSos) {
                    // Thông báo về nạn nhân rằng không tìm được rescuer qua pubsub
                    const payload = JSON.stringify({
                        sosId: sosRequestId,
                        victimId: updatedSos.user_id,
                    });
                    await redis.publish("sos:not_found", payload);

                    // Đồng thời gửi Push Notification báo thất bại cho nạn nhân
                    await notificationService.sendPushNotification(updatedSos.user_id, {
                        title: "Không tìm thấy người cứu hộ",
                        body: "Chưa tìm thấy người cứu hộ phù hợp cho yêu cầu trợ giúp của bạn. Vui lòng thử lại sau.",
                        data: {
                            type: "SOS_NOT_FOUND",
                            sosRequestId
                        }
                    }).catch(err => console.error("Lỗi gửi push notification cho victim:", err));

                    // Dọn dẹp Redis
                    await this.cleanupSosKeys(sosRequestId);
                } else {
                    console.log(`[TIMEOUT] Bỏ qua xử lý timeout đợt cuối do SOS ${sosRequestId} đã được nhận hoặc hủy trước đó`);
                }
            }
        } catch (error) {
            console.error("[SERVICE] Lỗi trong handleOfferTimeout:", error);
        }
    };

    handleInactivityTimeout = async ({ sosRequestId }) => {
        try {
            console.log(`🔍 [AUTO-CANCEL CHECK] Kiểm tra điều kiện tự động hủy ca SOS hết hạn: ${sosRequestId}`);
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos || (sos.status !== "PENDING" && sos.status !== "SEARCHING")) {
                console.log(`ℹ️ [AUTO-CANCEL SKIPPED] Bỏ qua tự động hủy ca SOS ${sosRequestId} do trạng thái hiện tại là: '${sos?.status}'`);
                return;
            }

            console.log(`🚨 [AUTO-CANCEL EXECUTION] Thực hiện tự động hủy ca SOS ${sosRequestId} do hết 30 phút không tương tác.`);

            const cancelReason = "Tự động hủy yêu cầu cứu hộ khẩn cấp do hết thời gian chờ 30 phút không có tương tác";
            const updatedSos = await this.cancelSOS({
                sosRequestId,
                cancelReason
            });

            if (updatedSos) {
                // Publish sự kiện socket tự động hủy
                const payload = JSON.stringify({
                    sosId: sosRequestId,
                    sosRequestId,
                    victimId: updatedSos.user_id,
                    reason: cancelReason,
                    message: "Yêu cầu cứu hộ khẩn cấp của bạn đã tự động hủy do 30 phút không có tương tác."
                });
                await redis.publish("sos:cancelled", payload);

                // Gửi Push Notification báo cho nạn nhân biết lý do hủy
                await notificationService.sendPushNotification(updatedSos.user_id, {
                    title: "Tự động hủy yêu cầu cứu hộ",
                    body: "Hệ thống đã tự động hủy yêu cầu cứu hộ do không có tương tác sau 30 phút để tránh lãng phí nguồn lực cứu hộ. Vui lòng tạo yêu cầu mới nếu bạn vẫn cần trợ giúp.",
                    data: {
                        type: "SOS_AUTO_CANCELLED",
                        sosRequestId,
                        cancelReason
                    }
                }).catch(err => console.error("Lỗi gửi push notification tự động hủy SOS cho victim:", err));

                // Dọn dẹp Redis
                await this.cleanupSosKeys(sosRequestId);
                console.log(`✅ [AUTO-CANCEL COMPLETED] Hoàn tất tự động hủy & phát thông báo cho ca SOS: ${sosRequestId}`);
            }
        } catch (error) {
            console.error("[SERVICE] Lỗi trong handleInactivityTimeout:", error);
        }
    };

    cancelSOS = async ({ sosRequestId, userId, cancelReason }) => {
        try {
            let targetSosId = sosRequestId;

            // Nếu không truyền sosRequestId, tự tìm ca SOS active gần nhất của nạn nhân
            if (!targetSosId && userId) {
                const activeSos = await this.sos_requestRepository.findActiveSOSByUser({ userId, role: 'VICTIM' });
                if (activeSos) {
                    targetSosId = activeSos.sos_request_id;
                } else {
                    const pool = require("@config/database.config").pool;
                    const pendingQuery = `
                        SELECT sos_request_id, rescuer_id, user_id 
                        FROM sos_requests 
                        WHERE user_id = $1 
                          AND status IN ('PENDING', 'SEARCHING', 'ASSIGNED', 'IN_PROGRESS') 
                        ORDER BY created_at DESC LIMIT 1
                    `;
                    const result = await pool.query(pendingQuery, [userId]);
                    if (result.rows.length > 0) {
                        targetSosId = result.rows[0].sos_request_id;
                    }
                }
            }

            if (!targetSosId) {
                console.warn(`[SERVICE] cancelSOS không tìm thấy sosRequestId cho user: ${userId}`);
                return null;
            }

            // Lấy thông tin SOS trước khi hủy để biết rescuer_id (nếu có)
            const sos = await this.sos_requestRepository.findSOSById(targetSosId);

            const updated = await this.sos_requestRepository.updateStatusOnly({
                sosRequestId: targetSosId,
                status: 'CANCELLED',
                cancelReason
            });

            if (updated) {
                // Ngắt luồng tìm kiếm BullMQ cho ca SOS này
                dispatchService.stopSOS(targetSosId);

                // Dọn dẹp Redis tracking keys
                await this.cleanupSosKeys(targetSosId);

                // Giải phóng lập tức cờ bận cứu hộ trên Redis cho Rescuer (nếu ca đã được nhận)
                const rescuerIdToRelease = updated.rescuer_id || sos?.rescuer_id;
                if (rescuerIdToRelease) {
                    await redis.hdel("active_rescues", rescuerIdToRelease);
                    await redis.del(`sos:offer:rescuer:${rescuerIdToRelease}`);
                    console.log(`[SERVICE] Đã giải phóng hoàn toàn active_rescues cho Rescuer khi Nạn nhân hủy SOS: ${rescuerIdToRelease}`);
                }

                // Publish sự kiện hủy qua Redis pubsub để Socket Server emit tới các Rescuer
                const payload = JSON.stringify({
                    sosId: targetSosId,
                    sosRequestId: targetSosId,
                    rescuerId: rescuerIdToRelease || null,
                    victimId: updated.user_id || sos?.user_id || userId,
                    message: "Người gặp nạn đã dừng yêu cầu cứu hộ."
                });
                await redis.publish("sos:cancelled", payload);

                // Gửi Push Notification tới Rescuer khi Nạn nhân hủy ca cứu hộ đang thực hiện
                if (rescuerIdToRelease) {
                    notificationService.sendPushNotification(rescuerIdToRelease, {
                        title: "Nạn nhân đã hủy ca cứu hộ",
                        body: "Người gặp nạn đã dừng yêu cầu cứu hộ. Bạn có thể tiếp nhận ca cứu hộ mới.",
                        data: {
                            type: "RESCUE_CANCELLED",
                            sosRequestId: targetSosId
                        }
                    }).catch(err => console.error("[SERVICE] Lỗi gửi push notification cho rescuer khi victim hủy SOS:", err));
                }

                // Lên lịch tự động khóa kênh nhắn tin giữa Nạn nhân và Cứu hộ viên sau 15 phút gia hạn
                const chatGraceMs2 = (await settingsUtil.getSettingNumber("chat_close_grace_minutes", 15)) * 60 * 1000;
                setTimeout(async () => {
                    try {
                        const closedConv = await chatService.closeConversationBySosRequestId(targetSosId);
                        if (closedConv) {
                            const payloadConv = JSON.stringify({
                                conversationId: closedConv.conversation_id,
                                sosRequestId: targetSosId,
                                victimId: closedConv.user1_id,
                                rescuerId: closedConv.user2_id,
                                message: `Hết thời gian ${chatGraceMs2 / 60000} phút gia hạn. Cuộc trò chuyện này đã tự động đóng.`
                            });
                            await redis.publish("chat:conversation_closed", payloadConv);
                        }
                    } catch (convErr) {
                        console.error("[SERVICE] Lỗi khóa kênh chat sau 15 phút gia hạn khi hủy SOS:", convErr);
                    }
                }, chatGraceMs2);

                if (sos && sos.rescuer_id) {
                    // Ghi nhật ký hoạt động: FAILED cho rescuer nhận ca
                    await transaction(async (client) => {
                        await rescuerHistoryRepository.createHistory(client, {
                            historyId: uuidUtil.generateUUID(),
                            rescuerId: sos.rescuer_id,
                            sosRequestId: targetSosId,
                            action: 'FAILED'
                        });
                    }).catch(err => console.error("Lỗi ghi log FAILED vào DB:", err));
                }
            }

            return updated;
        } catch (error) {
            console.error("[SERVICE] Lỗi trong cancelSOS:", error);
        }
    };

    cancelSOSByRescuer = async ({ sosRequestId, rescuerId, cancelReason }) => {
        try {
            if (!sosRequestId) {
                throw new Error("Mã yêu cầu cứu hộ là bắt buộc!");
            }

            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos) {
                throw new Error("Không tìm thấy yêu cầu cứu hộ!");
            }
            if (sos.status !== "IN_PROGRESS") {
                throw new Error("Ca cứu hộ không ở trạng thái đang thực hiện!");
            }
            if (sos.rescuer_id !== rescuerId) {
                throw new Error("Bạn không phải cứu hộ viên đang thực hiện ca này!");
            }

            const reason = cancelReason || "Cứu hộ viên hủy ca cứu hộ";

            const updated = await this.sos_requestRepository.updateStatusOnly({
                sosRequestId,
                status: 'CANCELLED',
                cancelReason: reason
            });

            if (updated) {
                // Ngắt luồng tìm kiếm BullMQ (nếu có)
                dispatchService.stopSOS(sosRequestId);

                // Dọn dẹp Redis tracking keys
                await this.cleanupSosKeys(sosRequestId);

                // Giải phóng lập tức cờ bận cứu hộ trên Redis cho Rescuer
                await redis.hdel("active_rescues", rescuerId);
                await redis.del(`sos:offer:rescuer:${rescuerId}`);
                console.log(`[SERVICE] Đã giải phóng active_rescues cho Rescuer khi Rescuer tự hủy SOS: ${rescuerId}`);

                // Ghi nhật ký hoạt động: CANCELLED
                await transaction(async (client) => {
                    await rescuerHistoryRepository.createHistory(client, {
                        historyId: uuidUtil.generateUUID(),
                        rescuerId,
                        sosRequestId,
                        action: 'CANCELLED'
                    });
                }).catch(err => console.error("Lỗi ghi log CANCELLED vào DB:", err));

                // Publish sự kiện hủy qua Redis pubsub để Socket Server đồng bộ Victim & Rescuer
                const payload = JSON.stringify({
                    sosId: sosRequestId,
                    sosRequestId,
                    victimId: updated.user_id,
                    rescuerId,
                    reason,
                    message: `Cứu hộ viên đã hủy ca cứu hộ. Lý do: ${reason}`
                });
                await redis.publish("rescue:cancelled", payload);

                // Gửi Push Notification Firebase tới Nạn nhân
                notificationService.sendPushNotification(updated.user_id, {
                    title: "Cứu hộ viên đã hủy ca cứu hộ",
                    body: `Lý do: ${reason}. Vui lòng tạo yêu cầu mới nếu bạn vẫn cần trợ giúp.`,
                    data: {
                        type: "RESCUE_CANCELLED",
                        sosRequestId,
                        cancelReason: reason
                    }
                }).catch(err => console.error("[SERVICE] Lỗi gửi push notification cho victim khi rescuer hủy SOS:", err));

                // Lên lịch tự động khóa kênh nhắn tin sau 15 phút gia hạn
                const chatGraceMs2 = (await settingsUtil.getSettingNumber("chat_close_grace_minutes", 15)) * 60 * 1000;
                setTimeout(async () => {
                    try {
                        const closedConv = await chatService.closeConversationBySosRequestId(sosRequestId);
                        if (closedConv) {
                            const payloadConv = JSON.stringify({
                                conversationId: closedConv.conversation_id,
                                sosRequestId,
                                victimId: closedConv.user1_id,
                                rescuerId: closedConv.user2_id,
                                message: `Hết thời gian ${chatGraceMs2 / 60000} phút gia hạn. Cuộc trò chuyện này đã tự động đóng.`
                            });
                            await redis.publish("chat:conversation_closed", payloadConv);
                        }
                    } catch (convErr) {
                        console.error("[SERVICE] Lỗi khóa kênh chat sau gia hạn khi rescuer hủy SOS:", convErr);
                    }
                }, chatGraceMs2);

                // Phạt: đếm số lần hủy ca liên tiếp của Rescuer
                await this._trackRescuerCancelPenalty({ rescuerId });

                try {
                    const { emitAdminDashboardEvent } = require("@/socket");
                    emitAdminDashboardEvent("SOS_CANCELLED", {
                        sosId: sosRequestId,
                        rescuerId
                    });
                } catch (e) {
                    console.error("[SERVICE] Lỗi phát event socket admin dashboard:", e);
                }
            }

            return updated;
        } catch (error) {
            console.error("[SERVICE] Lỗi trong cancelSOSByRescuer:", error);
            throw error;
        }
    };

    _trackRescuerCancelPenalty = async ({ rescuerId }) => {
        try {
            const STREAK_KEY = `rescuer:cancel_streak:${rescuerId}`;
            const streak = await redis.incr(STREAK_KEY);
            // Giữ bộ đếm tối đa 30 ngày để tránh key tồn tại vĩnh viễn (reset khi hoàn thành COMPLETED)
            await redis.expire(STREAK_KEY, 30 * 24 * 60 * 60);

            console.log(`[PENALTY] Rescuer ${rescuerId} đã hủy lần thứ ${streak} liên tiếp`);

            if (streak >= 2) {
                await redis.del(STREAK_KEY);
                await redis.set(`rescuer:suspended:${rescuerId}`, "1", "EX", 2 * 60 * 60);

                // Đưa Rescuer về offline để không nhận ca mới trong thời gian bị khóa
                const rescuerService = require("@modules/rescuer/service/rescuer.service");
                await rescuerService.suspendRescuer({ userId: rescuerId });

                // Thông báo tức thì tới app của Rescuer qua Redis PubSub
                const suspendedUntil = Date.now() + 2 * 60 * 60 * 1000;
                await redis.publish("rescuer:suspended", JSON.stringify({
                    rescuerId,
                    reason: "Bạn đã hủy ca cứu hộ 2 lần liên tiếp. Tài khoản bị tạm khóa nhận ca cứu hộ mới trong 2 giờ.",
                    suspendedUntil
                }));

                console.log(`[PENALTY] Rescuer ${rescuerId} đã bị tạm khóa 2 giờ do hủy ${streak} lần liên tiếp`);
            }
        } catch (err) {
            console.error("[PENALTY] Lỗi xử lý phạt rescuer hủy ca:", err);
        }
    };

    getSOSHistory = async ({ userId, role }) => {
        try {
            if (role === 'RESCUER') {
                return await rescuerHistoryRepository.findHistoryByRescuerId({ rescuerId: userId });
            } else {
                return await this.sos_requestRepository.findSOSHistoryByVictimId({ victimId: userId });
            }
        } catch (error) {
            console.error("[SERVICE] Lỗi trong getSOSHistory:", error);
            throw error;
        }
    };

    acceptSOSByQR = async ({ sosRequestId, rescuerId }) => {
        console.log(`[QR] acceptSOSByQR nhận được sosRequestId='${sosRequestId}' rescuerId='${rescuerId}'`);
        // 1. Tìm ca SOS - chấp nhận cả PENDING, SEARCHING, và CANCELLED (do hết lượt tìm rescuer online)
        const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
        if (!sos) {
            console.warn(`[QR] Không tìm thấy SOS với id='${sosRequestId}'`);
            const err = new Error("Không tìm thấy yêu cầu cứu hộ!");
            err.statusCode = 404;
            throw err;
        }

        const allowedStatuses = ['PENDING', 'SEARCHING', 'CANCELLED'];
        if (!allowedStatuses.includes(sos.status)) {
            const err = new Error("Yêu cầu cứu hộ đã có người nhận hoặc đã hoàn thành, không thể tiếp nhận qua QR!");
            err.statusCode = 400;
            throw err;
        }

        const acceptedAt = new Date().toISOString();

        // 2. Cập nhật DB
        const updated = await transaction(async (client) => {
            const result = await client.query(
                `UPDATE sos_requests
                 SET rescuer_id = $1, status = 'IN_PROGRESS', accepted_at = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE sos_request_id = $3
                 RETURNING *`,
                [rescuerId, acceptedAt, sosRequestId]
            );

            const updatedSOS = result.rows[0];

            // Ghi nhật ký hoạt động: ACCEPTED_VIA_QR
            await rescuerHistoryRepository.createHistory(client, {
                historyId: uuidUtil.generateUUID(),
                rescuerId,
                sosRequestId,
                action: 'ACCEPTED_VIA_QR',
            });

            return updatedSOS;
        });

        if (!updated) {
            const err = new Error("Không thể cập nhật trạng thái ca cứu hộ. Vui lòng thử lại!");
            err.statusCode = 500;
            throw err;
        }

        // 3. Xóa SOS location khỏi Redis Geo, dừng BullMQ, dọn dẹp Redis keys
        await redis.zrem("sos_locations", sosRequestId);
        dispatchService.stopSOS(sosRequestId);
        await this.cleanupSosKeys(sosRequestId);

        // 4. Lưu mối liên kết vào Redis Hash "active_rescues" (để stream vị trí real-time của rescuer cho victim)
        await redis.hset("active_rescues", rescuerId, JSON.stringify({
            sosRequestId,
            victimId: sos.user_id
        }));

        // 5. Lấy thông tin rescuer và victim để đẩy về client
        const rescuerInfo = await userService.getUserInfoById({ userId: rescuerId }).catch(() => null);
        const victimInfo = await userService.getUserInfoById({ userId: sos.user_id }).catch(() => null);

        let rescuerLat = null;
        let rescuerLng = null;
        try {
            const pos = await redis.geopos("rescuer_locations", rescuerId);
            if (pos && pos[0]) {
                rescuerLng = parseFloat(pos[0][0]);
                rescuerLat = parseFloat(pos[0][1]);
            }
        } catch (err) {
            console.error("[SERVICE] Lỗi lấy tọa độ Rescuer từ Redis Geo:", err);
        }

        // 6. Phát sự kiện Redis PubSub để Socket Server đồng bộ màn hình cứu hộ cho cả Victim và Rescuer
        const pubsubPayload = JSON.stringify({
            sosRequestId,
            sosId: sosRequestId,
            victimId: sos.user_id,
            rescuerId,
            status: 'IN_PROGRESS',
            rescuer: {
                userId: rescuerId,
                fullName: rescuerInfo?.full_name || 'Người cứu hộ',
                phone: rescuerInfo?.phone || '',
                avatarUrl: rescuerInfo?.avatar_url || null,
                lat: rescuerLat,
                lng: rescuerLng
            },
            victim: {
                userId: sos.user_id,
                fullName: victimInfo?.full_name || 'Người gặp nạn',
                phone: victimInfo?.phone || '',
                avatarUrl: victimInfo?.avatar_url || null,
                imageUrl: sos.image_url || null,
                lat: sos.victim_lat,
                lng: sos.victim_lng,
                description: sos.description,
                incidentTypeName: sos.incident_type_name
            },

            via: 'QR_CODE',
        });
        await redis.publish("sos:accepted", pubsubPayload);

        // 7. Gửi Push Notification qua Firebase tới Victim
        notificationService.sendPushNotification(sos.user_id, {
            title: "Yêu cầu cứu hộ đã được chấp nhận",
            body: `${rescuerInfo?.full_name || 'Người cứu hộ'} đã quét mã QR và đang trực tiếp hỗ trợ bạn.`,
            data: {
                type: "RESCUE_ACCEPTED",
                sosRequestId,
                rescuerId
            }
        }).catch(err => console.error("Lỗi gửi push notification cho victim qua QR:", err));

        console.log(`✅ [SERVICE] Cứu hộ viên ${rescuerId} tiếp nhận ca ${sosRequestId} thành công qua QR Code!`);

        return {
            ...updated,
            victim: {
                userId: sos.user_id,
                fullName: victimInfo?.full_name,
                phone: victimInfo?.phone,
                lat: sos.victim_lat,
                lng: sos.victim_lng,
                description: sos.description,
                incidentTypeName: sos.incident_type_name
            }
        };
    };

    submitPostRescueCheckin = async ({ sosRequestId, userId, healthStatus, checkinNotes, rating, responseSpeed, attitude, supportLevel, comment }) => {
        const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
        if (!sos) {
            throw new Error("Không tìm thấy ca SOS yêu cầu.");
        }

        const userNotes = (checkinNotes && checkinNotes.trim()) || (comment && comment.trim());

        // KIỂM TRA TỪ VI PHẠM TỪ ĐẦU: Nếu có ghi chú/nhận xét, kiểm tra ngay với AI Moderation / Blacklist
        if (userNotes) {
            const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
            const spamCheck = await aiModerationService.checkKnownSpamText(userNotes);
            if (spamCheck.isBlocked) {
                throw new Error(`Đánh giá bị từ chối: ${spamCheck.reason || "Nội dung nhận xét chứa từ ngữ vi phạm tiêu chuẩn cộng đồng."}`);
            }
        }

        const healthStatusTextMap = {
            SAFE: "Đã an toàn",
            NEEDS_MEDICAL_CHECK: "Cần kiểm tra y tế",
            RECOVERING: "Đang hồi phục",
            OTHER: "Khác / Ý kiến riêng"
        };
        const healthLabel = healthStatusTextMap[healthStatus] || healthStatus || "Đã an toàn";

        // Tự động ghép tình trạng sức khỏe vào comment/notes để lưu đầy đủ thông tin vào CSDL
        let formattedComment = `[Tình trạng sức khỏe: ${healthLabel}]`;
        if (userNotes) {
            formattedComment += ` - ${userNotes}`;
        }

        const updated = await this.sos_requestRepository.updatePostRescueCheckin({
            sosRequestId,
            healthStatus,
            checkinNotes: formattedComment
        });

        let ratingResult = null;
        if (rating && rating > 0) {
            const ratingService = require("@modules/rating/service/rating.service");
            // Không nuốt lỗi để ném lỗi vi phạm tiêu chuẩn cộng đồng trực tiếp về Mobile App
            ratingResult = await ratingService.submitRating({
                sosRequestId,
                victimId: userId,
                rating,
                responseSpeed,
                attitude,
                supportLevel,
                comment: formattedComment
            });
        }

        return {
            sos: updated,
            rating: ratingResult,
            healthStatus: healthStatus || 'SAFE',
            formattedComment,
            message: "Đã xác nhận trạng thái an toàn và phản hồi sau cứu hộ thành công!"
        };
    };
}

module.exports = new SosRequestService();
