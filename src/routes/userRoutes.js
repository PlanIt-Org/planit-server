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
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/me").get(getCurrentUser).put(updateCurrentUser);

router
  .route("/preferences")
  .get(getUserPreferences)
  .put(updateUserPreferences)
  .delete(deleteUserPreferences);

router.get("/past-trips", getUserPastTrips);

router.route("/").get(getAllUsers).post(createUser);

router.get("/:id", getUserById);

module.exports = router;
