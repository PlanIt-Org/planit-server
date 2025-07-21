// src/controllers/userController.js
const db = require("../db/db");

/**
 * @desc    Get a paginated list of all users.
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0, orderBy = "-created_at" } = req.query;

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
};

/**
 * @desc    Get the profile of the currently authenticated user.
 * @route   GET /api/users/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to retrieve user profile." });
  }
};

/**
 * @desc    Get a specific user by their User ID.
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user by ID ${req.params.id}:`, error);
    if (error.status === 404) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(500).json({ message: "Failed to retrieve user." });
  }
};

/**
 * @desc    Create a new user.
 * @route   POST /api/users/create
 * @access  Private
 */
const createUser = async (req, res) => {
  try {
    const userParams = req.body;
    if (!userParams.emailAddress && !userParams.phoneNumber) {
      return res
        .status(400)
        .json({ message: "Email address or phone number is required." });
    }
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    const errors = error.errors || [{ message: "Failed to create user." }];
    res.status(400).json({ errors });
  }
};

/**
 * @desc    Update the profile of the currently authenticated user.
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateCurrentUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const updateData = req.body;
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating current user:", error);
    const errors = error.errors || [{ message: "Failed to update user." }];
    res.status(400).json({ errors });
  }
};

/**
 * @desc    Get user preferences, stored in public metadata.
 * @route   GET /api/users/preferences
 * @access  Private
 */
const getUserPreferences = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    // if (!userId) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized. User not logged in." });
    // }

    const userPreferences = await db.userPreferences.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!userPreferences) {
      return res
        .status(404)
        .json({ message: "Preferences not found for this user." });
    }

    res.status(200).json(userPreferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({
      message: "Failed to retrieve preferences due to a server error.",
    });
  }
};

/**
 * @desc    Create new preferences for a user. Fails if preferences already exist.
 * @route   POST /api/users/preferences
 * @access  Private (Authenticated users only)
 */
const createUserPreferences = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User not logged in." });
    }

    const {
      age,
      dietary,
      location,
      activityType,
      budget,
      tripLength,
      planningRole,
      eventAudience,
      lifestyle,
    } = req.body;
    const preferencesData = {
      age: age ? parseInt(age, 10) : null,
      dietaryRestrictions: dietary || [],
      location: location || null,
      activityPreferences: activityType || [],
      budget: budget || null,
      typicalTripLength: tripLength || null,
      planningRole: planningRole || null,
      typicalAudience: eventAudience || [],
      lifestyleChoices: lifestyle || [],
    };

    const newPreferences = await db.userPreferences.create({
      data: {
        userId: userId,
        ...preferencesData,
      },
    });

    res.status(201).json({
      message: "Preferences created successfully.",
      preferences: newPreferences,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Preferences for this user already exist. Use PUT to update.",
      });
    }
    console.error("Error creating user preferences:", error);
    res
      .status(500)
      .json({ message: "Failed to create preferences due to a server error." });
  }
};

// TODO: implement updateUserPreferences
/**
 * @desc    Update user preferences in public metadata.
 * @route   PUT /api/users/preferences
 * @access  Private
 */
const updateUserPreferences = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const {
      age,
      dietary,
      location,
      activityType,
      budget,
      tripLength,
      planningRole,
      eventAudience,
      lifestyle,
    } = req.body;
    const preferencesData = {
      age: age ? parseInt(age, 10) : null,
      dietaryRestrictions: dietary || [],
      location: location || null,
      activityPreferences: activityType || [],
      budget: budget || null,
      typicalTripLength: tripLength || null,
      planningRole: planningRole || null,
      typicalAudience: eventAudience || [],
      lifestyleChoices: lifestyle || [],
    };
    const updatedPreferences = await db.userPreferences.upsert({
      where: { userId: userId },
      update: preferencesData,
      create: {
        userId: userId,
        ...preferencesData,
      },
    });
    res.status(200).json({
      message: "Preferences updated successfully.",
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    const errors = error.errors || [
      { message: "Failed to update preferences." },
    ];
    res.status(400).json({ errors });
  }
};

/**
 * @desc    Delete a user's preferences.
 * @route   DELETE /api/users/preferences
 * @access  Private (Authenticated users only)
 */
const deleteUserPreferences = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    // if (!userId) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized. User not logged in." });
    // }

    await db.userPreferences.delete({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({ message: "Preferences deleted successfully." });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Preferences not found for this user." });
    }
    console.error("Error deleting user preferences:", error);
    res
      .status(500)
      .json({ message: "Failed to delete preferences due to a server error." });
  }
};

/**
 * @desc    Get user's past trips
 * @route   GET /api/users/past-trips
 * @access  Private
 */
const getUserPastTrips = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    // TODO: connect to database and get past trips
    console.log(
      `Fetching past trips for userId: ${userId} from the database...`
    );
    // Example: const pastTrips = await TripModel.find({ userId: userId, status: 'completed' });
    const pastTrips = [
      { id: "trip_1", destination: "Paris", date: "2024-05-10" },
      { id: "trip_2", destination: "Tokyo", date: "2023-11-22" },
    ];

    res.status(200).json(pastTrips);
  } catch (error) {
    console.error("Error fetching past trips:", error);
    res.status(500).json({ message: "Failed to retrieve past trips." });
  }
};

module.exports = {
  getAllUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateCurrentUser,
  getUserPreferences,
  deleteUserPreferences,
  createUserPreferences,
  updateUserPreferences,
  getUserPastTrips,
};
