const { getAuth } = require("@clerk/express");
const { createClerkClient } = require("@clerk/backend");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * @desc    Get a paginated list of all users.
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0, orderBy = "-created_at" } = req.query;
    const users = await clerkClient.users.getUserList({
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy,
    });
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
    const user = await clerkClient.users.getUser(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to retrieve user profile." });
  }
};

/**
 * @desc    Get a specific user by their Clerk User ID.
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await clerkClient.users.getUser(id);
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
    const newUser = await clerkClient.users.createUser(userParams);
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
    const updatedUser = await clerkClient.users.updateUser(userId, updateData);
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
    //  const user = await clerkClient.users.getUser(userId);
    console.log("userId", userId);
    const preferences = {
      preferences: {
        test: "test",
      },
    };
    res.status(200).json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ message: "Failed to retrieve preferences." });
  }
};

/**
 * @desc    Update user preferences in public metadata.
 * @route   PUT /api/users/preferences
 * @access  Private
 */
const updateUserPreferences = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    console.log("userId", userId);
    // const newPreferences = req.body;
    // TODO: Implement preferences update
    // const user = await clerkClient.users.getUser(userId);

    res.status(200).json({ message: "Testing update preferences." });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    const errors = error.errors || [
      { message: "Failed to update preferences." },
    ];
    res.status(400).json({ errors });
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
  updateUserPreferences,
  getUserPastTrips,
};
