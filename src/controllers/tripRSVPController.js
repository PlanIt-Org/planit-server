const prisma = require("../db/db");

/**
 * Controller for handling Trip RSVP related operations.
 */
const tripRSVPController = {
  /**
   * Create a new Trip RSVP or update an existing one for the user and trip.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  createOrUpdateRSVP: async (req, res) => {
    console.log("[createOrUpdateRSVP] called");
    const { tripId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    console.log(
      "[createOrUpdateRSVP] tripId:",
      tripId,
      "userId:",
      userId,
      "status:",
      status
    );
    const rsvpEnumStatus = status.toUpperCase();
    if (!["YES", "NO", "MAYBE"].includes(rsvpEnumStatus)) {
      console.warn("[createOrUpdateRSVP] Invalid status provided:", status);
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
      console.log("[createOrUpdateRSVP] RSVP upserted:", rsvp);
      return res.status(200).json({
        message: "RSVP processed successfully!",
        data: rsvp,
      });
    } catch (error) {
      console.error("[createOrUpdateRSVP] Error processing RSVP:", error);
      return res.status(500).json({
        message: "Failed to process RSVP.",
        error: error.message,
      });
    }
  },

  /**
   * Get all RSVPs for a specific trip, including the user data for each RSVP.
   * Useful for building a detailed guest list that shows everyone's status.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  getTripRSVPs: async (req, res) => {
    console.log("[getTripRSVPs] called");
    try {
      const { tripId } = req.params;
      console.log("[getTripRSVPs] tripId:", tripId);
      const rsvps = await prisma.tripRSVP.findMany({
        where: { tripId },
        include: {
          user: {
            select: {
              select: {
                id: true,
                name: true,
                profilePictureUrl: true,
                email: true,
              },
            },
          },
        },
      });
      console.log("[getTripRSVPs] RSVPs found:", rsvps.length);
      res.status(200).json(rsvps);
    } catch (error) {
      console.error("[getTripRSVPs] Error fetching trip RSVPs:", error);
      res.status(500).json({ error: "Failed to retrieve trip RSVPs." });
    }
  },

  /**
   * Get attendees (users who RSVP'd 'YES') for a specific trip.
   * Returns a list of confirmed guests.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  getTripAttendees: async (req, res) => {
    console.log("[getTripAttendees] called");
    try {
      const { tripId } = req.params;
      console.log("[getTripAttendees] tripId:", tripId);
      const attendees = await prisma.tripRSVP.findMany({
        where: {
          tripId: tripId,
          status: "YES",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
              email: true,
            },
          },
        },
      });
      const userList = attendees.map((rsvp) => rsvp.user);
      console.log("[getTripAttendees] Attendees found:", userList.length);
      res.status(200).json(userList);
    } catch (error) {
      console.error("[getTripAttendees] Error fetching trip attendees:", error);
      res.status(500).json({ error: "Failed to retrieve trip attendees." });
    }
  },

  /**
   * Get all RSVPs for a specific user, including trip details.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  getUserRSVPs: async (req, res) => {
    console.log("[getUserRSVPs] called");
    try {
      const { userId } = req.params;
      console.log("[getUserRSVPs] userId:", userId);
      const userRsvps = await prisma.tripRSVP.findMany({
        where: { userId },
        include: {
          trip: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
        },
      });
      console.log("[getUserRSVPs] RSVPs found:", userRsvps.length);
      res.status(200).json(userRsvps);
    } catch (error) {
      console.error("[getUserRSVPs] Error fetching user RSVPs:", error);
      res.status(500).json({ error: "Failed to retrieve user RSVPs." });
    }
  },

  /**
   * Get a specific RSVP for the current user and trip.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  getSpecificRSVP: async (req, res) => {
    console.log("[getSpecificRSVP] called");
    const { tripId } = req.params;
    const userId = req.user.id;
    console.log("[getSpecificRSVP] tripId:", tripId, "userId:", userId);
    try {
      const rsvp = await prisma.tripRSVP.findUnique({
        where: {
          userId_tripId: {
            userId: userId,
            tripId: tripId,
          },
        },
        select: {
          status: true,
        },
      });
      if (!rsvp) {
        console.warn("[getSpecificRSVP] RSVP not found for user and trip");
        return res
          .status(404)
          .json({ message: "RSVP not found for this user and trip." });
      }
      console.log("[getSpecificRSVP] RSVP found:", rsvp);
      return res.status(200).json(rsvp);
    } catch (error) {
      console.error("[getSpecificRSVP] Error fetching specific RSVP:", error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve RSVP status." });
    }
  },

  /**
   * Not implemented. Use getTripRSVPs with a tripId.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  getAllTripRSVPs: async (req, res) => {
    console.log("[getAllTripRSVPs] called");
    res
      .status(501)
      .json({ message: "Not implemented. Use getTripRSVPs with a tripId." });
  },

  /**
   * Not implemented yet.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  getTripRSVPById: async (req, res) => {
    console.log("[getTripRSVPById] called");
    res.status(501).json({ message: "Not implemented yet." });
  },

  /**
   * Not implemented. Use createOrUpdateRSVP.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  updateTripRSVP: async (req, res) => {
    console.log("[updateTripRSVP] called");
    res
      .status(501)
      .json({ message: "Not implemented. Use createOrUpdateRSVP." });
  },

  /**
   * Not implemented yet.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  deleteTripRSVP: async (req, res) => {
    console.log("[deleteTripRSVP] called");
    res.status(501).json({ message: "Not implemented yet." });
  },
};

module.exports = tripRSVPController;
