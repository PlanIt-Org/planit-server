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
  updateProfilePicture,
  updateUsername
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");


// --- Public Routes (No authentication required) ---
router.post("/create", createUser);
router.post("/logout", logout);

// --- Authentication Middleware ---
// Any route defined BELOW this line will be protected and require a token.
router.use(protect);
// --- Protected Routes ---
// Routes for logged-in users.
router.post("/ensure-profile", ensureUserProfile);
router.post("/reset-password", resetPassword);
router.route("/me").get(getCurrentUser).put(updateCurrentUser);
router.put("/username", updateUsername);


router
  .route("/preferences")
  .get(getUserPreferences)
  .put(updateUserPreferences)
  .delete(deleteUserPreferences);

router.get("/past-trips", getUserPastTrips);
router.get("/", getAllUsers);

router.put("/profile-picture", updateProfilePicture);

//Used by TripFilter
router.get("/search", searchUsers);

router.get("/:id", getUserById);

router.put("/profile-picture", updateProfilePicture);

module.exports = router;
