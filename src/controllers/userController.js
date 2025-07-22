// src/controllers/userController.js
const db = require("../db/db");
const { supabase } = require("../supabaseAdmin.js");

/**
 * @desc    Get a paginated list of all users.
 * @route   GET /api/users
 * @access  Private (Admin Only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, perPage = 20 } = req.query;

    const { data, error } = await supabase.auth.admin.listUsers({
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
    });

    if (error) throw error;

    res.status(200).json(data.users);
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
  // The user object is attached to the request by the 'protect' middleware.
  // It contains the authenticated user's data from the JWT.
  res.status(200).json(req.user);
};

/**
 * @desc    Get a specific user by their User ID.
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(id);

    if (error) {
      if (error.status === 404) {
        return res.status(404).json({ message: "User not found." });
      }
      throw error;
    }

    res.status(200).json(data.user);
  } catch (error) {
    console.error(`Error fetching user by ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to retrieve user." });
  }
};

/**
 * @desc    Create a new user in Supabase and the application database.
 * @route   POST /api/users/create
 * @access  Public // Registration routes should be public
 */
const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      // If Supabase returns an error (e.g., user already exists), forward it.
      return res
        .status(authError.status || 400)
        .json({ message: authError.message });
    }

    if (!authData.user) {
      return res
        .status(500)
        .json({ message: "Supabase did not return a user object." });
    }

    const { id: newUserId, email: newUserEmail } = authData.user;

    const newUserProfile = await db.user.create({
      data: {
        id: newUserId,
        email: newUserEmail,
      },
    });

    // The frontend will receive this and show the alert message.
    res.status(201).json(newUserProfile);
  } catch (error) {
    console.error("Error creating user:", error);

    // This catches errors from Prisma (e.g., a unique constraint violation)
    // or any other unexpected issues.
    if (error.code === "P2002") {
      return res.status(409).json({
        message:
          "A user with this email or ID already exists in the profile table.",
      });
    }

    res
      .status(500)
      .json({ message: "Failed to create user due to a server error." });
  }
};

/**
 * @desc    Update the profile of the currently authenticated user.
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateCurrentUser = async (req, res) => {
  try {
    // The user's ID is retrieved from the JWT via the middleware
    const { id: userId } = req.user;
    const { password, email, data: user_metadata } = req.body;

    const updatePayload = {};
    if (password) updatePayload.password = password;
    if (email) updatePayload.email = email;
    if (user_metadata) updatePayload.data = user_metadata;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      updatePayload
    );

    if (error) throw error;

    res.status(200).json(data.user);
  } catch (error) {
    console.error("Error updating current user:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to update user." });
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

/**
 * @desc    Update user preferences in public metadata.
 * @route   PUT /api/users/preferences
 * @access  Private
 */
const updateUserPreferences = async (req, res) => {
  try {
    // Supabase auth middleware attaches user info to req.user
    const userId = req.user && req.user.id;
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

    // Upsert user preferences in your database
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
    res
      .status(400)
      .json({ message: error.message || "Failed to update preferences." });
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
