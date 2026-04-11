const express = require("express")
const { validatorRegister } = require("./auth.validator")
const authController = require("./auth.controller")
const route = express.Router()

route.post("/register", validatorRegister, authController.register);

route.post("/refresh-token", authController.handleRefreshToken)

route.post("/login", authController.loginNormal)

route.post("/google", authController.loginWithGoogle)

module.exports = route
