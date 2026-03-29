const express = require("express");
const route = express.Router();
const authRoutes = require("@modules/auth/auth.route")
const notificationRoutes = require("@/modules/notification/notification.route");
const incident_typeRoutes = require("@modules/incident_type/incident_type.route")

route.use("/auth", authRoutes)

route.use("/incident_types", incident_typeRoutes)

route.use("/notifications", notificationRoutes);



module.exports = route;
