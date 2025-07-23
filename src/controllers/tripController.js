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
      // data passed in body
      const { startTime, endTime, hostId, title, description, tripImage, maxGuests, city } = req.body;
      if (!startTime || !endTime || !hostId) {
        return res.status(400).json({
          message: "Missing required fields: startTime, endTime, and hostId.",
        });
      }

      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);

      const newTrip = await prisma.trip.create({
        data: {
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          hostId: hostId,
          title: title || "New Trip",
          description: description || (city ? `trip to ${city}` : null),
          tripImage: tripImage,
          maxGuests: maxGuests, // optional
          city: city, 

         // default values for other values
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
      const { locationId, googlePlaceId } = req.body;
  
      // check if at least has location id or google place
      if (!locationId && !googlePlaceId) {
        return res.status(400).json({ message: "Missing locationId or googlePlaceId." });
      }
  
      // check if trip exists
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { locations: true },
      });
  
      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }
  
      // try to see if location already exists
      let location;
      if (locationId) {
        location = await prisma.location.findUnique({
          where: { id: locationId },
        });
      } else if (googlePlaceId) {
        location = await prisma.location.findUnique({
          where: { googlePlaceId },
        });
      }
  
      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }
  
      // if location already added no need to add again
      const alreadyAdded = trip.locations.some(loc => loc.id === location.id);
      if (alreadyAdded) {
        return res.status(409).json({ message: "Location already added to this trip." });
      }
  
      // add location to trip
      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          locations: {
            connect: { id: location.id },
          },
        },
        include: { locations: true },
      });
  
      return res.status(200).json(updatedTrip);
  
    } catch (error) {
      console.error("Error adding location to trip:", error);
      return res.status(500).json({ message: "Failed to add location to trip." });
    }
  },
  

  // Example: Delete a trip
  deleteTrip: async (req, res) => {
    // Controller logic here
  },

  // Example: Generate a shareable link for a trip
  generateShareableLink: async (req, res) => {
    // Controller logic here
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
