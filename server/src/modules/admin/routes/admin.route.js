const express = require("express");
const route = express.Router();
const adminController = require("../controller/admin.controller");
const { validateBanUser, validateUnbanUser, validateGetBannedUsers } = require("../validator/admin.validator");
const { verifyToken, isAdmin, isNotBanned } = require("@/middlewares/auth.middleware");

route.get("/dashboard/overview", verifyToken, isNotBanned, isAdmin, adminController.getDashboardOverview);
route.get("/dashboard/ai-summary", verifyToken, isNotBanned, isAdmin, adminController.getAiSummary);
route.get("/dashboard/export-report", verifyToken, isNotBanned, isAdmin, adminController.exportReport);
route.get("/sos-heatmap", verifyToken, isNotBanned, isAdmin, adminController.getSosHeatmap);

route.get("/users/banned", verifyToken, isAdmin, validateGetBannedUsers, adminController.getBannedUsers);
route.post("/users/:userId/ban", verifyToken, isAdmin, validateBanUser, adminController.banUser);
route.post("/users/:userId/unban", verifyToken, isAdmin, validateUnbanUser, adminController.unbanUser);

route.get("/appeals", verifyToken, isAdmin, adminController.getAppeals);
route.post("/appeals/:appealId/approve", verifyToken, isAdmin, adminController.approveAppeal);
route.post("/appeals/:appealId/reject", verifyToken, isAdmin, adminController.rejectAppeal);

module.exports = route;
