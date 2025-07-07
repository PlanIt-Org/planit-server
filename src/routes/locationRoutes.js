const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Get all locations
router.get("/", locationController.getAllLocations);

// Get location by ID
router.get("/:id", locationController.getLocationById);

// Create a new location
router.post("/", locationController.createLocation);

// Update a location (uncomment and implement when ready)
// router.put("/:id", locationController.updateLocation);

// Delete a location
router.delete("/:id", locationController.deleteLocation);

module.exports = router;
