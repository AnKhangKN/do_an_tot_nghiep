const express = require('express');
const { validatorIncidentType } = require('../validator/incident_type.validator');
const incident_typeController = require('../controller/incident_type.controller');
const { verifyToken } = require('@/middlewares/auth.middleware');
const route = express.Router()

// Chỉ admin mới được tạo (xử lý sau)
route.post('', validatorIncidentType, incident_typeController.createIncidentType)

route.get('', verifyToken, incident_typeController.getIncidentTypes)

module.exports = route