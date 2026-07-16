const express = require("express");
const route = express.Router();
const userController = require("../controller/user.controller");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

route.get("", verifyToken, userController.getUserInfoById)
route.get("/admin", verifyToken, isAdmin, userController.getUsersAdmin)

module.exports = route