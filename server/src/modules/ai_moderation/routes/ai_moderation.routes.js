const express = require("express");
const router = express.Router();
const aiModerationController = require("../controller/ai_moderation.controller");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

// Tất cả các route kiểm duyệt AI yêu cầu xác thực Admin
router.use(verifyToken, isAdmin);

// GET /api/v1/ai-moderation/logs - Lấy danh sách log kiểm duyệt AI
router.get("/logs", aiModerationController.getLogs);

// PATCH /api/v1/ai-moderation/logs/:logId/review - Admin duyệt hoặc bác bỏ kết quả AI
router.patch("/logs/:logId/review", aiModerationController.reviewLog);

module.exports = router;
