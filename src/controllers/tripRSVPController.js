const prisma = require("../db/db");

const tripRSVPController = {
  // Example: Get all RSVPs
  getAllTripRSVPs: async (req, res) => {
    // Controller logic here
  },

  // Example: Get RSVP by ID
  getTripRSVPById: async (req, res) => {
    // Controller logic here
  },

  // Example: Create a new RSVP
  createTripRSVP: async (req, res) => {
    // Controller logic here
  },

  // Example: Update an RSVP
  updateTripRSVP: async (req, res) => {
    // Controller logic here
    // change enum here
  },

  // Example: Delete an RSVP
  deleteTripRSVP: async (req, res) => {
    // Controller logic here
  },
  getTripRSVPs: async (req, res) => {
    // TODO: Implement getTripRSVPs logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getTripAttendees: async (req, res) => {
    // TODO: Implement getTripAttendees logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  createOrUpdateRSVP: async (req, res) => {
    // TODO: Implement createOrUpdateRSVP logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getUserRSVPs: async (req, res) => {
    // TODO: Implement getUserRSVPs logic
    res.status(501).json({ message: "Not implemented yet" });
  },
};

module.exports = tripRSVPController;
