const express = require("express");
const ratingController = require("../controller/rating.controller");
const ratingValidator = require("../validator/rating.validator");
const { verifyToken, isAdmin } = require("@/middlewares/auth.middleware");

const route = express.Router();

// User submit rating for a completed SOS
route.post("/", verifyToken, ratingValidator.validatorSubmitRating, ratingController.submitRating);

// Get rating for a specific SOS request
route.get("/sos/:sosRequestId", ratingController.getRatingBySosId);

// Get rescuer rating stats (avg rating & total)
route.get("/rescuer/:rescuerId/overview", ratingController.getRescuerRatingOverview);

// Get list of ratings for a rescuer
route.get("/rescuer/:rescuerId", ratingController.getRatingsByRescuerId);

// Admin: Get all ratings
route.get("/admin", verifyToken, isAdmin, ratingValidator.validatorGetAdminRatings, ratingController.getAllRatingsAdmin);

// Admin: Get quality trend report
route.get("/admin/trends", verifyToken, isAdmin, ratingValidator.validatorGetRatingTrends, ratingController.getRatingTrends);

module.exports = route;
