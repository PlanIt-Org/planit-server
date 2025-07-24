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
  searchUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// --- Public Routes ---
router.post("/create", createUser);

// --- Authentication Middleware ---
// Any route defined BELOW this line will be protected and require a token.
router.use(protect);

// --- Protected Routes ---
// Routes for logged-in users.
router.route("/me").get(getCurrentUser).put(updateCurrentUser);


router
  .route("/preferences")
  .get(getUserPreferences)
  .put(updateUserPreferences)
  .delete(deleteUserPreferences);

router.get("/past-trips", getUserPastTrips);

router.get("/", getAllUsers);

router.get("/search", searchUsers)

router.get("/:id", getUserById);



module.exports = router;
