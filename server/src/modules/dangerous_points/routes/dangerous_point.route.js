const express = require('express');
const { validatorCreateDangerousPoint } = require('../validator/dangerous_point.validator');
const adminDangerousPointController = require('../controller/admin_dangerous_point.controller');
const dangerousPointController = require('../controller/dangerous_point.controller');
const { uploadDangerousPointSingle } = require('@/middlewares/uploads/dangerous_point.middleware');
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');
const route = express.Router();

// Routes for admin (must come before /:id routes)
route.get('/admin', verifyToken, isAdmin, adminDangerousPointController.getDangerousPointsAdmin);
route.get('/admin/feedbacks', verifyToken, isAdmin, dangerousPointController.getFeedbacksAdmin);
route.put('/admin/feedbacks/:id/status', verifyToken, isAdmin, dangerousPointController.updateFeedbackStatusAdmin);
route.get('/admin/duplicates', verifyToken, isAdmin, adminDangerousPointController.getDuplicateDangerousPoints);
route.post('/admin/merge', verifyToken, isAdmin, adminDangerousPointController.mergeDangerousPoints);
route.post('/admin/auto-detect', verifyToken, isAdmin, adminDangerousPointController.autoDetectDangerousPoints);
route.put('/admin/:dangerousPointId/approve', verifyToken, isAdmin, adminDangerousPointController.approveDangerousPoint);
route.put('/admin/:dangerousPointId/reject', verifyToken, isAdmin, adminDangerousPointController.rejectDangerousPoint);

// Routes for regular users & rescuers
route.post('/', verifyToken, uploadDangerousPointSingle, validatorCreateDangerousPoint, dangerousPointController.createDangerousPoint);
route.get('/approved', dangerousPointController.getApprovedDangerousPoints);
route.get('/my', verifyToken, dangerousPointController.getMyDangerousPoints);
route.post('/:id/feedbacks', verifyToken, dangerousPointController.createFeedback);
route.get('/:id/feedbacks', dangerousPointController.getFeedbacksByPointId);

module.exports = route;
