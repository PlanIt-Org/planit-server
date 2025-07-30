// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateCurrentUser,
  getUserPreferences,
  updateUserPreferences,
  deleteUserPreferences,
  getUserPastTrips,
  resetPassword,
  logout,
  searchUsers,
  ensureUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// --- Public Routes (No authentication required) ---
router.post("/create", createUser);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

// --- Authentication Middleware ---
// Any route defined BELOW this line will be protected and require a token.
router.use(protect);

// --- Protected Routes ---
// Routes for logged-in users.
router.post("/ensure-profile", ensureUserProfile);

router.route("/me").get(getCurrentUser).put(updateCurrentUser);

router
  .route("/preferences")
  .get(getUserPreferences)
  .put(updateUserPreferences)
  .delete(deleteUserPreferences);

router.get("/past-trips", getUserPastTrips);

router.get("/", getAllUsers);

//Used by TripFilter
router.get("/search", searchUsers);

router.get("/:id", getUserById);

module.exports = router;
