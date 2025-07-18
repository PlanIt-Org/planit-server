const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const syncUserWithDatabase = require("../middleware/userSync");

// Apply user sync middleware to all user routes
router.use(syncUserWithDatabase);

// Get all users - this should be the root route
router.get("/", userController.getAllUsers);

// Get current user's profile
router.get("/me", userController.getCurrentUser);

// Get user preferences
router.get("/preferences", userController.getUserPreferences);

// Get user past trips
router.get("/past-trips", userController.getUserPastTrips);

// Get user by ID - this should come AFTER more specific routes
router.get("/:id", userController.getUserById);

// Create a new user
router.post("/create", userController.createUser);

// Update current user's profile
router.put("/me", userController.updateCurrentUser);

// Update user preferences
router.put("/preferences", userController.updateUserPreferences);

// Get user profile
router.get("/profile", userController.getUserProfile);

// Update user profile
router.put("/profile", userController.updateUserProfile);

// Get user preferences
router.get("/preferences", userController.getUserPreferences);

// Update user preferences
router.put("/preferences", userController.updateUserPreferences);

// Get user past trips
router.get("/past-trips", userController.getUserPastTrips);

module.exports = router;
