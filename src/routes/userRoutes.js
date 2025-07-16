const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const syncUserWithDatabase = require("../middleware/userSync");

// Apply user sync middleware to all user routes
router.use(syncUserWithDatabase);

// Get current user's profile
router.get("/me", userController.getCurrentUser);

// Update current user's profile
router.put("/me", userController.updateCurrentUser);

// Get user preferences
router.get("/preferences", userController.getUserPreferences);

// Update user preferences
router.put("/preferences", userController.updateUserPreferences);

// Get user past trips
router.get("/past-trips", userController.getUserPastTrips);

module.exports = router;
