const express = require('express');
const route  = express.Router();
const rescuerController = require('../controller/rescuer.controller');
const { verifyToken, isAdmin, isRescuer } = require('@/middlewares/auth.middleware');
const { uploadAvatar } = require('@middlewares/uploads');

route.post('/register', verifyToken, rescuerController.rescuerRegister); //  verifyToken,
route.patch('/avatar', verifyToken, isRescuer, uploadAvatar, rescuerController.updateAvatar);

route.get('/rescuer', verifyToken, isAdmin, rescuerController.getRescuer);
route.patch('/rescuer/verify', verifyToken, isAdmin, rescuerController.verifyRescuer);
route.get('/admin/analytics', verifyToken, isAdmin, rescuerController.getRescuerPerformanceAnalytics);

module.exports = route;