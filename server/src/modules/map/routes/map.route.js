const express = require("express");
const router = express.Router();
const mapController = require("../controller/map.controller");
const { validateSearchQuery } = require("../validator/map.validator");
const { verifyToken } = require("@/middlewares/auth.middleware");

// GET /api/map/search?q=...&limit=...
// Tìm kiếm địa điểm (proxy qua server để kiểm tra từ khóa & giới hạn tần suất)
router.get("/search", verifyToken, validateSearchQuery, mapController.searchLocations);

module.exports = router;
