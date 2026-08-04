const route = require("express").Router();
const { verifyToken, isAdmin } = require("@middlewares/auth.middleware");
const appFeedbackController = require("../controller/app_feedback.controller");
const adminAppFeedbackController = require("../controller/admin_app_feedback.controller");
const { validateCreate, validateUpdateStatus } = require("../validator/app_feedback.validator");

// User gửi báo cáo ứng dụng
route.post("/", verifyToken, validateCreate, appFeedbackController.create);

// Lịch sử báo cáo của user
route.get("/my", verifyToken, appFeedbackController.getMy);

// Admin xem danh sách + thống kê + xử lý báo cáo
route.get("/admin", verifyToken, isAdmin, adminAppFeedbackController.getAll);
route.get("/admin/stats", verifyToken, isAdmin, adminAppFeedbackController.getStats);
route.put("/admin/:id/status", verifyToken, isAdmin, validateUpdateStatus, adminAppFeedbackController.updateStatus);

module.exports = route;
