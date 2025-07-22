const prisma = require("../db/db");

const tripController = {
  getAllTrips: async (req, res) => {
    try {
      const trips = await prisma.trip.findMany({
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          locations: {
            select: {
              id: true,
              name: true,
              address: true,
              image: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: "Trips fetched successfully!",
        trips: trips,
      });

    } catch (error) {
      console.error("Error fetching all trips:", error);
      return res.status(500).json({
        message: "Failed to fetch trips.",
        error: error.message,
      });
    }
  },

  getTripsByUserId: async (req, res) => {
    const { userId } = req.params;
  
    try {
      if (!userId) {
        return res.status(400).json({ message: "Missing userId in request params." });
      }
  
      const trips = await prisma.trip.findMany({
        where: {
          hostId: userId,
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          locations: {
            select: {
              id: true,
              name: true,
              address: true,
              image: true,
            },
          },
        },
      });
  
      return res.status(200).json({
        message: "Trips for user fetched successfully!",
        trips,
      });
  
    } catch (error) {
      console.error("Error fetching trips by user ID:", error);
      return res.status(500).json({
        message: "Failed to fetch user's trips.",
        error: error.message,
      });
    }
  },

  // Example: Get trip by ID
  getTripById: async (req, res) => {
    // Controller logic here
  },

  // Example: Create a new trip
  createTrip: async (req, res) => {
    try {
      // Extract necessary data from the request body
      // Ensure these fields are sent from the frontend
      const { startTime, endTime, hostId, title, description, tripImage, maxGuests, city } = req.body;
      if (!startTime || !endTime || !hostId) {
        return res.status(400).json({
          message: "Missing required fields: startTime, endTime, and hostId.",
        });
      }

      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);

      // Create the trip in the database
      const newTrip = await prisma.trip.create({
        data: {
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          hostId: hostId,
          title: title || "New Trip",
          description: description || (city ? `trip to ${city}` : null),
          tripImage: tripImage,
          maxGuests: maxGuests, // maxGuests is optional as per your schema (Int?)
          city: city, // Add the new city field

          // Other fields will take their @default values from the Prisma schema:
          // id: uuid() - handled by Prisma
          // inviteLink: cuid() - handled by Prisma
          // private: true - handled by Prisma
          // status: PLANNING - handled by Prisma
          // savedImages: [] - handled by Prisma
        },
      });

      // Send a success response
      return res.status(201).json({
        message: "Trip created successfully!",
        trip: newTrip,
      });

    } catch (error) {
      console.error("Error creating trip:", error);
      if (error.code === 'P2002') {
        return res.status(409).json({
          message: "A trip with this invite link already exists.",
          error: error.message,
        });
      }
      return res.status(500).json({
        message: "Failed to create trip.",
        error: error.message,
      });
    }
  },

  // Example: Update a trip
  updateTrip: async (req, res) => {
    // Controller logic here
  },

  addLocationToTrip: async (req, res) => {
    try {
      const { tripId } = req.params; 
      const { locationId } = req.body;
  
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }
  
      const location = await prisma.location.findUnique({ where: { id: locationId } });
      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }
  
      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          locations: {
            connect: { id: locationId },
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
