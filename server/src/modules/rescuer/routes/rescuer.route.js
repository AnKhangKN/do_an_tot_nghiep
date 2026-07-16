const express = require('express');
const route  = express.Router();
const rescuerController = require('../controller/rescuer.controller');
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');

route.post('/register', verifyToken, rescuerController.rescuerRegister); //  verifyToken,

route.get('/rescuer', verifyToken, isAdmin, rescuerController.getRescuer);
route.patch('/rescuer/verify', verifyToken, isAdmin, rescuerController.verifyRescuer);

module.exports = route