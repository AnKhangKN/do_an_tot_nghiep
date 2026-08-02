const express = require("express");
const deviceTokenController = require("../controller/device_token.controller");
const route = express.Router();
const { verifyToken } = require("@/middlewares/auth.middleware");

route.post("/", verifyToken, deviceTokenController.registerToken);
route.delete("/", verifyToken, deviceTokenController.unregisterToken);

module.exports = route;
