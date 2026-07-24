const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

// Admin phát thông báo (gửi DB + Push FCM)
router.post("/broadcast", verifyToken, isAdmin, notificationController.broadcast);
router.post("/admin/send", verifyToken, isAdmin, notificationController.broadcast);

// User (Mobile) xem thông báo cá nhân
router.get("/", verifyToken, notificationController.getMyNotifications);

// User đánh dấu tất cả là đã đọc
router.put("/read-all", verifyToken, notificationController.markAsRead);

module.exports = router;
