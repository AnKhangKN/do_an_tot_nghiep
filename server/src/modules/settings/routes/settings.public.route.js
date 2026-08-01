const express = require("express");
const route = express.Router();
const settingsController = require("../controller/settings.controller");

route.get("/thesis-info", settingsController.getPublicThesis);

module.exports = route;
