const express = require('express');
const { validatorCreateAmenity, validatorCategory } = require('../validator/emergency_amenity.validator');
const emergencyAmenityController = require('../controller/emergency_amenity.controller');
const adminEmergencyAmenityController = require('../controller/admin_emergency_amenity.controller');
const { verifyToken, isAdmin } = require('@/middlewares/auth.middleware');
const { uploadAmenityImage } = require('@middlewares/uploads');
const route = express.Router();

// Public/User routes for Victim & Rescuer mobile/web
route.get('/categories', emergencyAmenityController.getCategories);
route.get('/approved', emergencyAmenityController.getApprovedAmenities);
route.get('/my', verifyToken, emergencyAmenityController.getMyAmenities);
route.post('/', verifyToken, uploadAmenityImage, validatorCreateAmenity, emergencyAmenityController.createAmenity);
route.post('/:id/feedback', verifyToken, emergencyAmenityController.createFeedback);

// Admin routes
route.get('/admin/categories', verifyToken, isAdmin, adminEmergencyAmenityController.getCategoriesAdmin);
route.post('/admin/categories', verifyToken, isAdmin, validatorCategory, adminEmergencyAmenityController.createCategoryAdmin);
route.put('/admin/categories/:id', verifyToken, isAdmin, validatorCategory, adminEmergencyAmenityController.updateCategoryAdmin);

route.get('/admin/points', verifyToken, isAdmin, adminEmergencyAmenityController.getAmenitiesAdmin);
route.post('/admin/points', verifyToken, isAdmin, uploadAmenityImage, validatorCreateAmenity, adminEmergencyAmenityController.createAmenityAdmin);
route.put('/admin/points/:id/status', verifyToken, isAdmin, adminEmergencyAmenityController.updateAmenityStatusAdmin);
route.delete('/admin/points/:id', verifyToken, isAdmin, adminEmergencyAmenityController.deleteAmenityAdmin);

route.get('/admin/feedbacks', verifyToken, isAdmin, emergencyAmenityController.getFeedbacksAdmin);
route.put('/admin/feedbacks/:id/status', verifyToken, isAdmin, emergencyAmenityController.updateFeedbackStatusAdmin);

route.get('/admin/duplicates', verifyToken, isAdmin, adminEmergencyAmenityController.getDuplicateAmenitiesAdmin);
route.post('/admin/merge', verifyToken, isAdmin, adminEmergencyAmenityController.mergeAmenitiesAdmin);

module.exports = route;
