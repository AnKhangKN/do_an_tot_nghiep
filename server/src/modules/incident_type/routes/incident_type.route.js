const express = require('express');
const {
    validatorCreateIncidentType,
    validatorUpdateIncidentType,
    validatorToggleStatusIncidentType,
    validatorGetIncidentTypeAdmin
} = require('../validator/incident_type.validator');
const admin_incident_typeController = require('../controller/admin_incident_type.controller');
const incident_typeController = require("../controller/incident_type.controller");
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');

const route = express.Router();

// Routes dành riêng cho Admin (Kiểm tra Token + Quyền Admin + Validator chặt chẽ)
route.post(
    '/admin',
    verifyToken,
    isAdmin,
    validatorCreateIncidentType,
    admin_incident_typeController.createIncidentType
);

route.put(
    '/admin/:incidentTypeId',
    verifyToken,
    isAdmin,
    validatorUpdateIncidentType,
    admin_incident_typeController.updateIncidentType
);

route.patch(
    '/admin/:incidentTypeId/status',
    verifyToken,
    isAdmin,
    validatorToggleStatusIncidentType,
    admin_incident_typeController.toggleStatus
);

route.get(
    '/admin',
    verifyToken,
    isAdmin,
    validatorGetIncidentTypeAdmin,
    admin_incident_typeController.getIncidentTypeAdmin
);

// Route công khai (Lấy danh sách sự cố ACTIVE cho Victim/Rescuer)
route.get('', incident_typeController.getIncidentType);

module.exports = route;