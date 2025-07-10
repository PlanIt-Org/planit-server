const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Create a new user
router.post("/", userController.createUser);

// Update a user (uncomment and implement when ready)
// router.put("/:id", userController.updateUser);

// Delete a user
router.delete("/:id", userController.deleteUser);

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
