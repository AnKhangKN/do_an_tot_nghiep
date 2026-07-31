const express = require("express");
const route = express.Router();
const authRoutes = require("@/modules/auth/routes/auth.route")
const notificationRoutes = require("@/modules/notification/routes/notification.route")
const incident_typeRoutes = require("@/modules/incident_type/routes/incident_type.route")
const userRoutes = require("@/modules/user/routes/user.route")
const rescuerRoutes = require("@/modules/rescuer/routes/rescuer.route") 
const sosRoutes = require("@modules/sos/routes/sos_request.route")
const deviceTokenRoutes = require("@/modules/device_token/routes/device_token.route")
const chatRoutes = require("@/modules/chat/routes/chat.route")
const dangerousPointRoutes = require("@/modules/dangerous_points/routes/dangerous_point.route")
const ratingRoutes = require("@/modules/rating/routes/rating.route")
const emergencyAmenityRoutes = require("@/modules/emergency_amenities/routes/emergency_amenity.route")
const aiModerationRoutes = require("@/modules/ai_moderation/routes/ai_moderation.routes")
const appealRoutes = require("@/modules/appeal/routes/appeal.route")

const adminRoutes = require("@/modules/admin/routes/admin.route")
const settingsRoutes = require("@/modules/settings/routes/settings.route")

route.use("/auth", authRoutes)

route.use("/admin", adminRoutes)

route.use("/admin/settings", settingsRoutes)

route.use("/users", userRoutes)

route.use("/incident_types", incident_typeRoutes)

route.use("/notifications", notificationRoutes)

route.use("/rescuer", rescuerRoutes)

route.use("/sos", sosRoutes)

route.use("/device_tokens", deviceTokenRoutes)

route.use("/chat", chatRoutes)

route.use("/dangerous_points", dangerousPointRoutes)

route.use("/ratings", ratingRoutes)

route.use("/emergency-amenities", emergencyAmenityRoutes)

route.use("/ai-moderation", aiModerationRoutes)
route.use(appealRoutes)

module.exports = route;
