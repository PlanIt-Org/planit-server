const prisma = require("../db/db");

const userController = {
  // Example: Get all users
  getAllUsers: async (req, res) => {
    // Controller logic here
  },

  // Example: Get user by ID
  getUserById: async (req, res) => {
    // Controller logic here
  },

  // Example: Create a new user
  createUser: async (req, res) => {
    // Controller logic here
  },

  // Example: Update a user
  updateUser: async (req, res) => {
    // Controller logic here
  },

  // Example: Delete a user
  deleteUser: async (req, res) => {
    // Controller logic here
  },

  getUserProfile: async (req, res) => {
    // Controller logic here
  },

  updateUserProfile: async (req, res) => {
    // Controller logic here
  },

  getUserPreferences: async (req, res) => {
    // Controller logic here
    // run suggestions through here
  },

  updateUserPreferences: async (req, res) => {
    // Controller logic here
  },

  getUserPastTrips: async (req, res) => {
    // Controller logic here
    res.status(501).json({ message: "Not implemented yet" });
  },
};

module.exports = userController;
