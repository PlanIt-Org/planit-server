const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Get all locations
router.get("/", locationController.getAllLocations);

// Get location by ID
router.get("/:id", locationController.getLocationById);

// Get by plce id
router.get("/by-place-id/:placeId", locationController.getLocationByPlaceId);


// Create a new location
router.post("/", locationController.createLocation);

// Update a location (uncomment and implement when ready)
// router.put("/:id", locationController.updateLocation);

// Delete a location
router.delete("/:id", locationController.deleteLocation);

// Add these routes to locationRoutes.js
router.get("/search", locationController.searchLocations);

// Get recommended locations
router.get("/recommendations", locationController.getRecommendedLocations);

// Filter locations
router.get("/filter", locationController.filterLocations);

// Get location details
router.get("/:id/details", locationController.getLocationDetails);

// Get location weather
router.get("/:id/weather", locationController.getLocationWeather);

// Get location hours
router.get("/:id/hours", locationController.getLocationHours);

// Get route to location
router.get("/:id/route", locationController.getRouteToLocation);

module.exports = router;
