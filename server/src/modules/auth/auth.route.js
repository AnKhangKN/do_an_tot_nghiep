const express = require("express")
const { validatorRegister } = require("./auth.validator")
const authController = require("./auth.controller")
const route = express.Router()

route.post("/register", validatorRegister, authController.register)

module.exports = route
