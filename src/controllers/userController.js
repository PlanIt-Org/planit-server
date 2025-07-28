// src/controllers/userController.js
const db = require("../db/db");
const { supabase } = require("../supabaseAdmin.js");
const { protect } = require("../middleware/authMiddleware.js");

/**
 * @desc    Create a new user in Supabase and the application database.
 * @route   POST /api/users/create
 * @access  Public // Registration routes should be public
 */
const createUser = async (req, res) => {
  const { email, password, name } = req.body;
  let newAuthUser = null;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message, {
        cause: { status: authError.status || 400 },
      });
    }

    if (!authData.user) {
      throw new Error("Supabase did not return a user object on signup.");
    }

    newAuthUser = authData.user;

    // This is the step that might fail, leaving an orphaned auth user.
    const newUserProfile = await db.user.create({
      data: {
        id: newAuthUser.id,
        email: newAuthUser.email,
        name: name || null,
      },
    });

    res.status(201).json(newUserProfile);
  } catch (error) {
    console.error("Error during user creation process:", error);

    if (newAuthUser && newAuthUser.id) {
      console.log(`Attempting to roll back Supabase user: ${newAuthUser.id}`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        newAuthUser.id
      );
      if (deleteError) {
        console.error(
          "CRITICAL: FAILED TO ROLL BACK SUPABASE USER!",
          deleteError
        );
        return res.status(500).json({
          message:
            "Failed to create user profile and could not clean up the auth user. Please contact support.",
        });
      }
    }

    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "A user with this email or ID already exists." });
    }

    if (error.message.includes("User already registered")) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    res.status(error.cause?.status || 500).json({
      message: error.message || "Failed to create user due to a server error.",
    });
  }
};

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
 * @desc    Get the profile of the currently authenticated user from Supabase.
 * @route   GET /api/users/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing or invalid." });
    }
    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
    if (error) {
      if (error.status === 404) {
        return res.status(404).json({ message: "User not found." });
      }
      throw error;
    }

    res.status(200).json(data.user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to retrieve current user." });
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
 * @desc    Ensures a user profile exists in the database. Creates it if it doesn't.
 * @route   POST /api/users/ensure-profile
 * @access  Private (Requires a valid Supabase JWT)
 */
const ensureUserProfile = async (req, res) => {
  const authUser = req.user;

  if (!authUser || !authUser.id || !authUser.email) {
    return res.status(401).json({ message: "Invalid authentication data." });
  }

  try {
    const userProfile = await db.user.upsert({
      where: { id: authUser.id },
      update: {},
      create: {
        id: authUser.id,
        email: authUser.email,
        // TODO: need to adjust this based on what Supabase provides.
        name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          null,
      },
    });

    res
      .status(200)
      .json({ message: "User profile ensured.", profile: userProfile });
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    res.status(500).json({ message: "Failed to ensure user profile." });
  }
};

/**
 * @desc    Update the profile of the currently authenticated user.
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Authentication error: User ID not found." });
    }

    const { displayName } = req.body;
    if (
      !displayName ||
      typeof displayName !== "string" ||
      displayName.trim().length < 3
    ) {
      return res
        .status(400)
        .json({ message: "Invalid display name provided." });
    }

    // Update display name in Supabase
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { display_name: displayName.trim() },
      }
    );

    if (updateError) {
      throw updateError;
    }

    // Also update the "name" field in the local Prisma User table
    await db.user.update({
      where: { id: userId },
      data: { name: displayName.trim() },
    });

    res.status(200).json({ message: "Display name updated successfully." });
  } catch (error) {
    console.error("Error updating display name:", error);
    res.status(500).json({
      message: "Failed to update display name.",
      error: error.message,
    });
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

const searchUsers = async (req, res) => {
  const { by, query } = req.query;

  if (!by || !query) {
    return res
      .status(400)
      .json({ error: "Search type (by) and query are required." });
  }

  let users = [];

  try {
    if (by === "name") {
      users = await db.user.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });
    } else if (by === "email") {
      const userByEmail = await db.user.findUnique({
        where: {
          email: query,
        },
      });

      if (userByEmail) {
        users = [userByEmail];
      }
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid search type. Use "name" or "email".' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(`Error searching for users by ${by}:`, error);
    res.status(500).json({ error: "Failed to search for users." });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ error: "Authorization header is missing." });
  }
  if (!password) {
    return res.status(400).json({ error: "New password is required." });
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError) {
    return res.status(401).json({
      error: "Invalid or expired access token.",
      details: userError.message,
    });
  }
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: password }
  );
  if (updateError) {
    return res.status(500).json({
      error: "Could not update password.",
      details: updateError.message,
    });
  }

  return res.status(200).json({ message: "Password updated successfully." });
};

const logout = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(200).json({ message: "User is already logged out." });
  }
  const { error } = await supabase.auth.signOut(accessToken);
  if (error) {
    console.error("Supabase sign out error:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to log out.", details: error.message });
  }

  return res.status(200).json({ message: "Logged out successfully." });
};

module.exports = {
  logout,
  resetPassword,
  getAllUsers,
  getCurrentUser,
  getUserById,
  createUser,
  ensureUserProfile,
  updateCurrentUser,
  getUserPreferences,
  deleteUserPreferences,
  createUserPreferences,
  updateUserPreferences,
  getUserPastTrips,
  searchUsers,
};
