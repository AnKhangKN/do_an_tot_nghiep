const express = require("express");
const sos_requestController = require("../controller/sos_request.controller");
const route = express.Router();
const { verifyToken } = require("@/middlewares/auth.middleware");
const { uploadSosImage } = require("@middlewares/uploads");

route.post("/sos_requests", verifyToken, uploadSosImage, sos_requestController.createSOS);
route.get("/sos_requests/active", verifyToken, sos_requestController.getActiveSOS);

route.get("/sos_requests/history", verifyToken, sos_requestController.getSOSHistory)
route.post("/sos_requests/cancel", verifyToken, sos_requestController.cancelSOS)
route.post("/sos_requests/accept-qr", verifyToken, sos_requestController.acceptSOSByQR)
route.post("/sos_requests/post-rescue-checkin", verifyToken, sos_requestController.postRescueCheckin)

module.exports = route