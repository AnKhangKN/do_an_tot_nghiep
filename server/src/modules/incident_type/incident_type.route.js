const express = require('express');
const { validatorIncidentType } = require('./incident_type.validator');
const incident_typeController = require('./incident_type.controller');
const route = express.Router()

// Chỉ admin mới được tạo (xử lý sau)
route.post('', validatorIncidentType, incident_typeController.createIncidentType)

route.get('', incident_typeController.getIncidentTypes)

module.exports = route