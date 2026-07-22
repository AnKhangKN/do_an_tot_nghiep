const express = require("express");
const route = express.Router();
const adminController = require("../controller/admin.controller");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

route.get("/dashboard/overview", verifyToken, isAdmin, adminController.getDashboardOverview);

module.exports = route;
