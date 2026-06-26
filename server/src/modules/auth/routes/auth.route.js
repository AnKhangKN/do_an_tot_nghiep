const express = require("express")
const { validatorRegister } = require("../validator/auth.validator")
const authController = require("../controller/auth.controller");
const { verifyToken } = require("@/middlewares/auth.middleware");
const route = express.Router()

route.post("/register", validatorRegister, authController.register);

route.post("/refresh-token", authController.handleRefreshToken)

route.post("/login", authController.loginNormal);

route.post("/google", authController.loginWithGoogle);

route.delete("/logout", authController.logout);

route.get("/me", verifyToken, authController.getMe);

module.exports = route
