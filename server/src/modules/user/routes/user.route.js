const express = require("express");
const route = express.Router();
const userController = require("../controller/user.controller");
const { verifyToken } = require("@/middlewares/auth.middleware");

route.get("", verifyToken, userController.getUserInfoById)

module.exports = route