// src/controllers/tripRSVPController.js
const db = require("../db/db");

/**
 * Controller for handling Trip RSVP related operations.
 */
const tripRSVPController = {
  /**
   * Create a new Trip RSVP or update an existing one for the user and trip.
   */
  createOrUpdateRSVP: async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User not logged in." });
    }

    try {
      const { tripId } = req.params;
      const { status } = req.body;

      // 1. Check if trip exists before the upsert
      const trip = await db.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        return res.status(404).json({ error: "Trip not found." });
      }

      // 2. Validate the status
      if (!status || !["yes", "no", "maybe"].includes(status)) {
        return res
          .status(400)
          .json({
            error: "Invalid status provided. Must be 'yes', 'no', or 'maybe'.",
          });
      }

      // 3. Prisma requires the enum value to be uppercase
      const rsvpStatus = status.toUpperCase(); // e.g., "YES", "NO", "MAYBE"

      const rsvp = await db.tripRSVP.upsert({
        where: {
          userId_tripId: { userId, tripId },
        },
        update: { status: rsvpStatus },
        create: { userId, tripId, status: rsvpStatus },
      });

      res.status(200).json(rsvp);
    } catch (error) {
      console.error("RSVP Error:", error);
      res.status(500).json({ error: "Failed to create or update RSVP" });
    }
  },

  /**
   * Get all RSVPs for a specific trip, including the user data for each RSVP.
   * This is useful for building a detailed guest list that shows everyone's status.
   */
  getTripRSVPs: async (req, res) => {
    try {
      const { tripId } = req.params;
      const rsvps = await db.tripRSVP.findMany({
        where: { tripId },
        include: {
          // Include the related user for each RSVP
          user: {
            // Select only the fields you need for the frontend
            select: {
              id: true,
              name: true,
              avatarUrl: true, // Assuming your User model has this field
            },
          },
        },
      });

      res.status(200).json(rsvps);
    } catch (error) {
      console.error("Error fetching trip RSVPs:", error);
      res.status(500).json({ error: "Failed to retrieve trip RSVPs." });
    }
  },

  /**
   * Get attendees (users who RSVP'd 'YES') for a specific trip.
   * This is perfect for populating a simple list of confirmed guests.
   */
  getTripAttendees: async (req, res) => {
    try {
      const { tripId } = req.params;
      const attendees = await db.tripRSVP.findMany({
        where: {
          tripId: tripId,
          status: "YES", // Filter for only 'YES' status
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // The result is an array of TripRSVP objects. We can map this
      // to return a cleaner array of just the user objects.
      const userList = attendees.map((rsvp) => rsvp.user);

      res.status(200).json(userList);
    } catch (error) {
      console.error("Error fetching trip attendees:", error);
      res.status(500).json({ error: "Failed to retrieve trip attendees." });
    }
  },

  /**
   * Get all RSVPs for a specific user.
   */
  getUserRSVPs: async (req, res) => {
    try {
      const { userId } = req.params;
      const userRsvps = await db.tripRSVP.findMany({
        where: { userId },
        include: {
          // Also include trip details for context
          trip: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
        },
      });
      res.status(200).json(userRsvps);
    } catch (error) {
      console.error("Error fetching user RSVPs:", error);
      res.status(500).json({ error: "Failed to retrieve user RSVPs." });
    }
  },

  // --- Other placeholder functions from your original file ---
  getAllTripRSVPs: async (req, res) => {
    res
      .status(501)
      .json({ message: "Not implemented. Use getTripRSVPs with a tripId." });
  },
  getTripRSVPById: async (req, res) => {
    res.status(501).json({ message: "Not implemented yet." });
  },
  updateTripRSVP: async (req, res) => {
    res
      .status(501)
      .json({ message: "Not implemented. Use createOrUpdateRSVP." });
  },
  deleteTripRSVP: async (req, res) => {
    res.status(501).json({ message: "Not implemented yet." });
  },
};

module.exports = tripRSVPController;
