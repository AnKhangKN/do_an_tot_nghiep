const express = require('express');
const route  = express.Router();
const rescueController = require('../controller/rescue.controller')

route.post('/register', rescueController.rescueRegister);

module.exports = route