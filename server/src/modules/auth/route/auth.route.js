const express = require("express")
const { validatorRegister } = require("../validator/auth.validator")
const authController = require("../controller/auth.controller")
const route = express.Router()

route.post("/register", validatorRegister, authController.register);

route.post("/refresh-token", authController.handleRefreshToken)

route.post("/login", authController.login)

route.post("/google", authController.loginWithGoogle)

module.exports = route
