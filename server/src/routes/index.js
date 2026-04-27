const express = require("express");
const route = express.Router();
const authRoutes = require("@/modules/auth/route/auth.route")
const notificationRoutes = require("@/modules/notification/route/notification.route");
const incident_typeRoutes = require("@/modules/incident_type/route/incident_type.route")
const userRoutes = require("@/modules/user/route/user.route")

route.use("/auth", authRoutes)

route.use("/users", userRoutes)

route.use("/incident_types", incident_typeRoutes)

route.use("/notifications", notificationRoutes);



module.exports = route;
