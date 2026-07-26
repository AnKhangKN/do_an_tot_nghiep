const express = require('express');
const { validatorCreateDangerousPoint } = require('../validator/dangerous_point.validator');
const adminDangerousPointController = require('../controller/admin_dangerous_point.controller');
const dangerousPointController = require('../controller/dangerous_point.controller');
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');
const route = express.Router();

// Routes for regular users
route.post('/', verifyToken, validatorCreateDangerousPoint, dangerousPointController.createDangerousPoint);
route.get('/approved', dangerousPointController.getApprovedDangerousPoints);

// Routes for admin
route.get('/admin', verifyToken, isAdmin, adminDangerousPointController.getDangerousPointsAdmin);
route.post('/admin/auto-detect', verifyToken, isAdmin, adminDangerousPointController.autoDetectDangerousPoints);
route.put('/admin/:dangerousPointId/approve', verifyToken, isAdmin, adminDangerousPointController.approveDangerousPoint);
route.put('/admin/:dangerousPointId/reject', verifyToken, isAdmin, adminDangerousPointController.rejectDangerousPoint);

module.exports = route;
