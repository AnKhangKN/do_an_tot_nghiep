const express = require("express");
const sos_requestController = require("../controller/sos_request.controller");
const route = express.Router();

route.post("/sos_requests", sos_requestController.createSOS)

module.exports = route