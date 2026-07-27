const express = require("express");
const route = express.Router();
const userController = require("../controller/user.controller");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");
const { uploadAvatar } = require("@middlewares/uploads");

route.get("", verifyToken, userController.getUserInfoById);
route.get("/admin", verifyToken, isAdmin, userController.getUsersAdmin);
route.patch("/avatar", verifyToken, uploadAvatar, userController.updateAvatar);

module.exports = route;