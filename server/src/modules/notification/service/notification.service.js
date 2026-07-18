const admin = require("@/firebase/firebase");
const { getMessaging } = require("firebase-admin/messaging");
const deviceTokenService = require("@modules/device_token/service/device_token.service");
const notificationRepository = require("../repository/notification.repository");
const uuidUtil = require("@/utils/uuid.util");
const { transaction } = require("@/config/database.config");

class NotificationService {
    sendPushNotification = async (userId, { title, body, data }) => {
        try {
            // 1. Lưu thông báo vào PostgreSQL để người dùng xem lại trên app
            await transaction(async (client) => {
                const notificationId = uuidUtil.generateUUID();
                await notificationRepository.createNotification(client, {
                    notificationId,
                    userId,
                    title,
                    content: body,
                    type: data?.type || 'SYSTEM'
                });
            });

            // 2. Lấy toàn bộ Device Tokens của user
            const tokens = await deviceTokenService.getTokensByUser({ userId });
            if (!tokens || tokens.length === 0) {
                console.log(`[FCM] Không tìm thấy device token cho user ${userId}`);
                return;
            }

            // 3. Chuẩn bị message gửi multicast đến các thiết bị
            const message = {
                notification: { title, body },
                data: data || {},
                tokens: tokens,
            };

            // 4. Gửi qua Firebase Messaging SDK
            const response = await getMessaging().sendEachForMulticast(message);
            console.log(`[FCM] Đã gửi ${response.successCount} thông báo thành công cho user ${userId}`);

            // 5. Kiểm tra nếu có token lỗi thì unregister (dọn dẹp token không hợp lệ)
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errCode = resp.error?.code;
                        if (errCode === 'messaging/invalid-registration-token' ||
                            errCode === 'messaging/registration-token-not-registered') {
                            console.log(`[FCM] Dọn dẹp token không hợp lệ: ${tokens[idx]}`);
                            deviceTokenService.unregisterToken({ token: tokens[idx] })
                                .catch(err => console.error(`[FCM] Lỗi khi unregister token hỏng:`, err));
                        }
                    }
                });
            }
        } catch (error) {
            console.error(`[FCM] Lỗi gửi thông báo cho user ${userId}:`, error);
        }
    }
}

module.exports = new NotificationService();
