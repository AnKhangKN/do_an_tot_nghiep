const route = require("express").Router();
const { verifyToken } = require("@middlewares/auth.middleware");
const { isAdmin } = require("@middlewares/auth.middleware");
const appealController = require("../controller/appeal.controller");
const { validateSubmitAppeal, validateResolveAppeal } = require("../validator/appeal.validator");

// User gửi đơn kháng cáo
route.post("/appeals", verifyToken, validateSubmitAppeal, appealController.submit);

// Admin xem danh sách đơn
route.get("/admin/appeals", verifyToken, isAdmin, appealController.getAll);

// Admin duyệt/từ chối
route.post("/admin/appeals/:id/approve", verifyToken, isAdmin, validateResolveAppeal, appealController.approve);
route.post("/admin/appeals/:id/reject", verifyToken, isAdmin, validateResolveAppeal, appealController.reject);

module.exports = route;
