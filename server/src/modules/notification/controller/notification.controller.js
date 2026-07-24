const notificationService = require("../service/notification.service");

class NotificationController {
    broadcast = async (req, res, next) => {
        try {
            const { title, content, targetGroup, type } = req.body;

            if (!title || !content) {
                return res.status(400).json({
                    status: 400,
                    message: "Tiêu đề và nội dung thông báo là bắt buộc!"
                });
            }

            const result = await notificationService.broadcastNotification({
                title,
                content,
                targetGroup: targetGroup || 'ALL',
                type: type || 'SYSTEM'
            });

            return res.status(200).json({
                status: 200,
                message: "Đã phát thông báo thành công!",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getMyNotifications = async (req, res, next) => {
        try {
            const userId = req.userId || req.user?.user_id;

            if (!userId) {
                return res.status(401).json({
                    status: 401,
                    message: "Không tìm thấy thông tin người dùng"
                });
            }

            const notifications = await notificationService.getNotificationsForUser({ userId });

            return res.status(200).json({
                status: 200,
                message: "Lấy danh sách thông báo thành công",
                data: notifications
            });
        } catch (error) {
            next(error);
        }
    };

    markAsRead = async (req, res, next) => {
        try {
            const userId = req.userId || req.user?.user_id;

            if (!userId) {
                return res.status(401).json({
                    status: 401,
                    message: "Không tìm thấy thông tin người dùng"
                });
            }

            await notificationService.markNotificationsRead({ userId });

            return res.status(200).json({
                status: 200,
                message: "Đã đánh dấu tất cả thông báo là đã đọc"
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new NotificationController();
