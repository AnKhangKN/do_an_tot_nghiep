const express = require('express');
const { validatorIncidentType } = require('../validator/incident_type.validator');
const admin_incident_typeController = require('../controller/admin_incident_type.controller')
const incident_typeController = require("../controller/incident_type.controller")
const { verifyToken } = require('@/middlewares/auth.middleware');
const route = express.Router()

// Chỉ admin mới được tạo (xử lý sau)
route.post('/admin', validatorIncidentType, admin_incident_typeController.createIncidentType)

route.get('/admin', verifyToken, admin_incident_typeController.getIncidentTypeAdmin)

route.get('', incident_typeController.getIncidentType)

module.exports = route