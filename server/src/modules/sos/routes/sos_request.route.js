const express = require("express");
const sos_requestController = require("../controller/sos_request.controller");
const route = express.Router();
const { verifyToken } = require("@/middlewares/auth.middleware");

route.post("/sos_requests", verifyToken, sos_requestController.createSOS)
route.get("/sos_requests/active", verifyToken, sos_requestController.getActiveSOS)

module.exports = route