const express = require("express");
const route = express.Router();
const authRoutes = require("@/modules/auth/routes/auth.route")
const notificationRoutes = require("@/modules/notification/routes/notification.route")
const incident_typeRoutes = require("@/modules/incident_type/routes/incident_type.route")
const userRoutes = require("@/modules/user/routes/user.route")
const rescueRoutes = require("@/modules/rescue/routes/rescue.route") 

route.use("/auth", authRoutes)

route.use("/users", userRoutes)

route.use("/incident_types", incident_typeRoutes)

route.use("/notifications", notificationRoutes)

route.use("/rescue", rescueRoutes)

module.exports = route;
