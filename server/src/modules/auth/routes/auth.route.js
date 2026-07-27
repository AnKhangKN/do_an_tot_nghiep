const express = require("express")
const { validatorRegister, validatorGuestLogin, validatorVerifyOtp, validatorResendOtp, validatorGoogleLogin } = require("../validator/auth.validator")
const authController = require("../controller/auth.controller");
const { verifyToken } = require("@/middlewares/auth.middleware");
const route = express.Router()

route.post("/register", validatorRegister, authController.register);

route.post("/verify-otp", validatorVerifyOtp, authController.handleVerifyOtp);

route.post("/resend-otp", validatorResendOtp, authController.handleResendOtp);

route.post("/guest-login", validatorGuestLogin, authController.guestLogin);

route.post("/refresh-token", authController.handleRefreshToken)

route.post("/login", authController.loginNormal);

route.post("/google", validatorGoogleLogin, authController.loginWithGoogle);

route.delete("/logout", authController.logout);

route.get("/me", verifyToken, authController.getMe);

module.exports = route
