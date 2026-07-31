const express = require("express");
const route = express.Router();
const settingsController = require("../controller/settings.controller");
const { validateUpdateSettings } = require("../validator/settings.validator");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

route.get("/", verifyToken, isAdmin, settingsController.getSettings);
route.put("/", verifyToken, isAdmin, validateUpdateSettings, settingsController.updateSettings);

module.exports = route;
