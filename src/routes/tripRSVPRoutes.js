// src/routes/tripRSVPRoutes.js
const express = require("express");
const router = express.Router();
const tripRSVPController = require("../controllers/tripRSVPController");
const { protect } = require("../middleware/authMiddleware");

// --- Authentication Middleware ---
// Any route defined BELOW this line will be protected and require a token.
router.use(protect);

// --- Routes for a specific Trip ---
// These are the most common and useful routes.

// Get all RSVPs for a specific trip
router.get("/:tripId", tripRSVPController.getTripRSVPs);

// Get all attendees (e.g., users who said 'yes') for a trip
router.get("/:tripId/attendees", tripRSVPController.getTripAttendees);

// Create or update the logged-in user's RSVP for a specific trip
router.post("/:tripId/rsvp", tripRSVPController.createOrUpdateRSVP);

// --- Routes for a specific User ---

// Get all RSVPs made by a specific user
router.get("/user/:userId", tripRSVPController.getUserRSVPs);

module.exports = router;
