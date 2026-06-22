const express = require('express');
const route  = express.Router();
const rescuerController = require('../controller/rescuer.controller');
const { verifyToken } = require('@/middlewares/auth.middleware');

route.post('/register', verifyToken, rescuerController.rescuerRegister);

route.get('/rescuer', rescuerController.getRescuer);

module.exports = route