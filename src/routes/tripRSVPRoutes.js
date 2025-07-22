const express = require("express");
const router = express.Router();
const tripRSVPController = require("../controllers/tripRSVPController");

// Get all trip RSVPs
router.get("/", tripRSVPController.getAllTripRSVPs);

// Get trip RSVP by ID
router.get("/:id", tripRSVPController.getTripRSVPById);

// Create a new trip RSVP
router.post("/", tripRSVPController.createTripRSVP);

// Update a trip RSVP (uncomment and implement when ready)
// router.put("/:id", tripRSVPController.updateTripRSVP);

// Delete a trip RSVP
router.delete("/:id", tripRSVPController.deleteTripRSVP);

// Get trip RSVPs
router.get("/trip/:tripId", tripRSVPController.getTripRSVPs);

// Get trip attendees
router.get("/trip/:tripId/attendees", tripRSVPController.getTripAttendees);

// Create or update an RSVP
router.post("/trip/:tripId/rsvp", tripRSVPController.createOrUpdateRSVP);

// Get user RSVPs
router.get("/user/:userId", tripRSVPController.getUserRSVPs);

module.exports = router;
