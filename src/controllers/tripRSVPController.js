const db = require("../db/db");
const { supabase } = require("../supabaseAdmin.js");

/**
 * Controller for handling Trip RSVP related operations.
 */
const tripRSVPController = {
  /**
   * Get all Trip RSVPs.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  getAllTripRSVPs: async (req, res) => {
    // Controller logic here
  },

  /**
   * Get a Trip RSVP by its ID.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  getTripRSVPById: async (req, res) => {
    // Controller logic here
  },

  /**
   * Create a new Trip RSVP or update an existing one for the user and trip.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  createOrUpdateRSVP: async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User not logged in." });
    }

    try {
      const { tripId } = req.params;
      const { status } = req.body;

      if (!status || !["yes", "no", "maybe"].includes(status)) {
        return res.status(400).json({ error: "Invalid status provided." });
      }

      const rsvp = await db.tripRSVP.upsert({
        where: {
          userId_tripId: { userId, tripId },
        },
        update: { status },
        create: { userId, tripId: parseInt(tripId, 10), status },
      });

      res.status(200).json(rsvp);
    } catch (error) {
      console.error("RSVP Error:", error);
      res.status(500).json({ error: "Failed to create or update RSVP" });
    }
  },

  /**
   * Update an existing Trip RSVP.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  updateTripRSVP: async (req, res) => {
    // Controller logic here
    // change enum here
  },

  /**
   * Delete a Trip RSVP.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  deleteTripRSVP: async (req, res) => {
    // Controller logic here
  },

  /**
   * Get RSVPs for a specific trip.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  getTripRSVPs: async (req, res) => {
    // TODO: Implement getTripRSVPs logic
    res.status(501).json({ message: "Not implemented yet" });
  },

  /**
   * Get attendees for a specific trip.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  getTripAttendees: async (req, res) => {
    // TODO: Implement getTripAttendees logic
    res.status(501).json({ message: "Not implemented yet" });
  },

  /**
   * Get all RSVPs for a specific user.
   * @async
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  getUserRSVPs: async (req, res) => {
    // TODO: Implement getUserRSVPs logic
    res.status(501).json({ message: "Not implemented yet" });
  },
};

module.exports = tripRSVPController;
