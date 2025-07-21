const prisma = require("../db/db");

const tripController = {
  getAllTrips: async (req, res) => {
    // Controller logic here
  },

  // Example: Get trip by ID
  getTripById: async (req, res) => {
    // Controller logic here
  },

  // Example: Create a new trip
  createTrip: async (req, res) => {
    // Controller logic here
  },

  // Example: Update a trip
  updateTrip: async (req, res) => {
    // Controller logic here
  },

  addLocationToTrip: async (req, res) => {
    try {
      const { tripId, locationId } = req.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });
      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }

      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          locations: {
            connect: { id: locationId }, // Connect the existing location to the trip
          },
        },
        include: {
          locations: true,
        },
      });

      res.status(200).json(updatedTrip);

    } catch (error) {
      console.error("Error adding location to trip:", error);
      res.status(500).json({ message: "Failed to add location to trip." });
    }
  },

  // Example: Delete a trip
  deleteTrip: async (req, res) => {
    // Controller logic here
  },

  // Example: Generate a shareable link for a trip
  generateShareableLink: async (req, res) => {
    // Controller logic here
    // Check if the trip exists
    // Generate a new unique invite link
    // Update the trip with the new invite link
    // Construct the full shareable URL
  },

  getTripByInviteLink: async (req, res) => {
    // Controller logic here
  },

  addCoHost: async (req, res) => {
    // Controller logic here
  },

  removeCoHost: async (req, res) => {
    // Controller logic here
  },

  createPoll: async (req, res) => {
    // Controller logic here
  },

  getTripSchedule: async (req, res) => {
    // Controller logic here
    // get time information
  },
  addProposedGuest: async (req, res) => {
    // TODO: Implement addProposedGuest logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  removeProposedGuest: async (req, res) => {
    // TODO: Implement removeProposedGuest logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getProposedGuests: async (req, res) => {
    // TODO: Implement getProposedGuests logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getTripPolls: async (req, res) => {
    // TODO: Implement getTripPolls logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  voteOnPoll: async (req, res) => {
    // TODO: Implement voteOnPoll logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getTripTemplates: async (req, res) => {
    // TODO: Implement getTripTemplates logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  cloneTripAsTemplate: async (req, res) => {
    // TODO: Implement cloneTripAsTemplate logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  updateTripSchedule: async (req, res) => {
    // TODO: Implement updateTripSchedule logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  // get preferences, etc.
};

module.exports = tripController;
