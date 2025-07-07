const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// Get all trips
router.get("/", tripController.getAllTrips);

// Get trip by ID
router.get("/:id", tripController.getTripById);

// Create a new trip
router.post("/", tripController.createTrip);

// Update a trip (uncomment and implement when ready)
// router.put("/:id", tripController.updateTrip);

// Delete a trip
router.delete("/:id", tripController.deleteTrip);

module.exports = router;
