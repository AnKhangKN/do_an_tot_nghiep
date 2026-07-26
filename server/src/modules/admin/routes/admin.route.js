const express = require("express");
const route = express.Router();
const adminController = require("../controller/admin.controller");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

route.get("/dashboard/overview", verifyToken, isAdmin, adminController.getDashboardOverview);
route.get("/sos-heatmap", verifyToken, isAdmin, adminController.getSosHeatmap);

module.exports = route;
