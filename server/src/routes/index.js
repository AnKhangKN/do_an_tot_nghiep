const express = require("express");
const route = express.Router();
const authRoutes = require("@modules/auth/auth.route")
const notificationRoutes = require("@/modules/notification/notification.route");

route.use("/auth", authRoutes)

route.use("/notifications", notificationRoutes);



module.exports = route;
