const express = require('express');
const { validatorIncidentType } = require('../validator/incident_type.validator');
const admin_incident_typeController = require('../controller/admin_incident_type.controller')
const incident_typeController = require("../controller/incident_type.controller")
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');
const route = express.Router()

// Chỉ admin mới được tạo
route.post('/admin', verifyToken, isAdmin, validatorIncidentType, admin_incident_typeController.createIncidentType)

route.get('/admin', verifyToken, isAdmin, admin_incident_typeController.getIncidentTypeAdmin)

route.get('', incident_typeController.getIncidentType)

module.exports = route