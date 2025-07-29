// src/controllers/tripRSVPController.js
const prisma = require("../db/db");
/**
 * Controller for handling Trip RSVP related operations.
 */
const tripRSVPController = {
  /**
   * Create a new Trip RSVP or update an existing one for the user and trip.
   */
  createOrUpdateRSVP: async (req, res) => {
    const { tripId } = req.params;
    const { status } = req.body; // e.g., "yes" or "no"
    const userId = req.user.id;

    // 1. Convert incoming string to uppercase to match the Enum
    const rsvpEnumStatus = status.toUpperCase();

    // 2. Validate the converted status against the Enum values
    if (!["YES", "NO", "MAYBE"].includes(rsvpEnumStatus)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    try {
      const rsvp = await prisma.tripRSVP.upsert({
        where: {
          userId_tripId: {
            userId: userId,
            tripId: tripId,
          },
        },
        update: {
          status: rsvpEnumStatus,
        },
        create: {
          userId: userId,
          tripId: tripId,
          status: rsvpEnumStatus,
        },
      });

      return res.status(200).json({
        message: "RSVP processed successfully!",
        data: rsvp,
      });
    } catch (error) {
      console.error("Error processing RSVP:", error);
      return res.status(500).json({
        message: "Failed to process RSVP.",
        error: error.message,
      });
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
