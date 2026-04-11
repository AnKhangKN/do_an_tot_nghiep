const express = require("express");
const route = express.Router();
const userController = require("./user.controller");
const { verifyToken } = require("@/middlewares/auth.middleware");

route.get("", verifyToken, userController.getUserInfo)

module.exports = route