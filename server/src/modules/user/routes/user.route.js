const express = require("express");
const route = express.Router();
const userController = require("../controller/user.controller");
const { verifyToken, isAdmin, isNotBanned } = require("@/middlewares/auth.middleware");
const { uploadAvatar } = require("@middlewares/uploads");

route.get("", verifyToken, userController.getUserInfoById);
route.put("", verifyToken, userController.updateUserInfo);
route.get("/admin", verifyToken, isNotBanned, isAdmin, userController.getUsersAdmin);
route.patch("/avatar", verifyToken, uploadAvatar, userController.updateAvatar);

module.exports = route;