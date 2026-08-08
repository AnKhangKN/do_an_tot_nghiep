const admin = require("@/firebase/firebase");
const { getMessaging } = require("firebase-admin/messaging");
const deviceTokenService = require("@modules/device_token/service/device_token.service");
const notificationRepository = require("../repository/notification.repository");
const uuidUtil = require("@/utils/uuid.util");
const { transaction } = require("@/config/database.config");
const { getIO } = require("@/socket");

class NotificationService {
    async saveNotification({ userId, title, content, type }) {
        let createdNotif = null;
        await transaction(async (client) => {
            const notificationId = uuidUtil.generateUUID();
            createdNotif = await notificationRepository.createNotification(client, {
                notificationId,
                userId,
                title,
                content,
                type
            });
        });

        try {
            const io = getIO();
            if (io && createdNotif) {
                io.to(`user:${userId}`).emit("notification:new", createdNotif);
            }
        } catch (_) {}

        return createdNotif;
    }

    sendPushNotification = async (userId, { title, body, data }) => {
        try {
            // 1. Tự động lưu vết thông báo vào CSDL PostgreSQL để người dùng xem lại trong tab Thông báo
            await this.saveNotification({
                userId,
                title,
                content: body || title,
                type: data?.type || 'SOS_ALERT'
            }).catch(err => console.error(`[NOTIFICATION DB Error] Lỗi lưu DB cho user ${userId}:`, err.message));

            const tokens = await deviceTokenService.getTokensByUser({ userId });
            if (!tokens || tokens.length === 0) {
                console.log(`[FCM] Không tìm thấy device token cho user ${userId} (đã lưu lịch sử vào CSDL)`);
                return;
            }

            const message = {
                notification: { title, body },
                data: data || {},
                tokens: tokens,
            };

            const response = await getMessaging().sendEachForMulticast(message);
            console.log(`[FCM] Đã gửi ${response.successCount} thông báo thành công cho user ${userId}`);

            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errCode = resp.error?.code;
                        if (errCode === 'messaging/invalid-registration-token' ||
                            errCode === 'messaging/registration-token-not-registered') {
                            deviceTokenService.unregisterToken({ token: tokens[idx] })
                                .catch(err => console.error(`[FCM] Lỗi unregister token:`, err));
                        }
                    }
                });
            }
        } catch (error) {
            console.error(`[FCM] Lỗi gửi thông báo cho user ${userId}:`, error);
        }
    };

    broadcastNotification = async ({ title, content, targetGroup = 'ALL', type = 'SYSTEM' }) => {
        const userIds = await notificationRepository.findTargetUserIds({ targetGroup });
        console.log(`[BROADCAST] Đang phát thông báo tới ${userIds.length} người dùng (target: ${targetGroup})`);

        // Lưu DB + gửi FCM Push tới từng user (sendPushNotification tự lưu record trước khi gửi, tránh trùng lặp)
        for (const uid of userIds) {
            this.sendPushNotification(uid, {
                title,
                body: content,
                data: { type, targetGroup }
            }).catch(err => console.error(`[BROADCAST] Lỗi gửi FCM tới user ${uid}:`, err));
        }

        return {
            targetGroup,
            recipientCount: userIds.length,
            createdCount: userIds.length
        };
    };

    getNotificationsForUser = async ({ userId }) => {
        return await notificationRepository.findNotificationsByUserId({ userId });
    };

    markNotificationsRead = async ({ userId }) => {
        return await notificationRepository.markAllAsRead({ userId });
    };
}

module.exports = new NotificationService();
