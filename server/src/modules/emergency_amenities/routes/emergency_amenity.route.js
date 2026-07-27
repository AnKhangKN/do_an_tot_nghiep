const express = require('express');
const { validatorCreateAmenity, validatorCategory } = require('../validator/emergency_amenity.validator');
const emergencyAmenityController = require('../controller/emergency_amenity.controller');
const adminEmergencyAmenityController = require('../controller/admin_emergency_amenity.controller');
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');
const route = express.Router();

// Public routes for Victim & Rescuer mobile/web
route.get('/categories', emergencyAmenityController.getCategories);
route.get('/approved', emergencyAmenityController.getApprovedAmenities);
route.post('/', verifyToken, validatorCreateAmenity, emergencyAmenityController.createAmenity);

// Admin routes
route.get('/admin/categories', verifyToken, isAdmin, adminEmergencyAmenityController.getCategoriesAdmin);
route.post('/admin/categories', verifyToken, isAdmin, validatorCategory, adminEmergencyAmenityController.createCategoryAdmin);
route.put('/admin/categories/:id', verifyToken, isAdmin, validatorCategory, adminEmergencyAmenityController.updateCategoryAdmin);

route.get('/admin/points', verifyToken, isAdmin, adminEmergencyAmenityController.getAmenitiesAdmin);
route.put('/admin/points/:id/status', verifyToken, isAdmin, adminEmergencyAmenityController.updateAmenityStatusAdmin);
route.delete('/admin/points/:id', verifyToken, isAdmin, adminEmergencyAmenityController.deleteAmenityAdmin);

module.exports = route;
