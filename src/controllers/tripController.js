// src/controllers/tripController.js
const prisma = require("../db/db");
const { getAiCompletion } = require("../services/openRouterService");

const formatDataForPrompt = (preferences, trips) => {
  let prompt = "Here is the user's data:\n";
  prompt += "--- User Preferences ---\n";
  prompt += JSON.stringify(preferences, null, 2);
  prompt += "\n\n--- User's Past Trips ---\n";
  if (trips.length > 0) {
    const tripSummaries = trips.map((t) => ({
      title: t.title,
      city: t.city,
      description: t.description,
    }));
    prompt += JSON.stringify(tripSummaries, null, 2);
  } else {
    prompt += "No past trips recorded.\n";
  }
  return prompt;
};

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
        return res
          .status(400)
          .json({ message: "Missing userId in request params." });
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

  createTrip: async (req, res) => {
    try {
      const {
        startTime,
        endTime,
        hostId,
        title,
        description,
        tripImage,
        maxGuests,
        city,
      } = req.body;
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
          maxGuests: maxGuests,
          city: city,
        },
      });

      return res.status(201).json({
        message: "Trip created successfully!",
        trip: newTrip,
      });
    } catch (error) {
      console.error("Error creating trip:", error);
      if (error.code === "P2002") {
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

      if (!locationId && !googlePlaceId) {
        return res
          .status(400)
          .json({ message: "Missing locationId or googlePlaceId." });
      }

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { locations: true },
      });

      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }

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
      const alreadyAdded = trip.locations.some((loc) => loc.id === location.id);
      if (alreadyAdded) {
        return res.status(200).json({
          message: "Location already added to this trip.",
          trip,
        });
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
      return res
        .status(500)
        .json({ message: "Failed to add location to trip." });
    }
  },

  // Example: Delete a trip
  deleteTrip: async (req, res) => {
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
    try {
      const { tripId } = req.params;
      const guestsArray = req.body;

      const guestsWithTripId = guestsArray.map((guest) => ({
        name: guest.name,
        email: guest.email,
        tripId: tripId,
      }));

      const result = await prisma.proposedGuest.createMany({
        data: guestsWithTripId,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Failed to add proposezz guests:", error);
      res.status(500).json({ error: "Could not add guests." });
    }
  },

  generateTripSuggestions: async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    try {
      const userPreferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      const pastTrips = await prisma.trip.findMany({
        where: { hostId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (!userPreferences) {
        return res.status(404).json({
          message: "User preferences not found. Cannot generate suggestions.",
        });
      }

      const userDataPrompt = formatDataForPrompt(userPreferences, pastTrips);
      const systemPrompt = `You are an expert travel planner. Your task is to generate 5 unique and personalized trip suggestions based on the user's data. For each suggestion, provide a creative title, a brief compelling description (2-3 sentences), the destination city, an estimated duration in days, and a list of 2-3 specific activities with short descriptions. Return the output as a single, valid JSON object with a key named "suggestions" which holds an array of these 5 trip objects. Do not include any other text, explanations, or markdown formatting in your response.

      The JSON structure for each suggestion in the array must be:
      {
        "title": "Trip Title",
        "description": "A brief, compelling description of the trip.",
        "city": "City, Country",
        "duration_days": 3,
        "suggested_activities": [
          { "name": "Activity Name", "description": "Short description of the activity." },
          { "name": "Another Activity", "description": "Short description." }
        ]
      }`;
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userDataPrompt },
      ];

      const model = "mistralai/mistral-7b-instruct:free";
      const aiResponse = await getAiCompletion(messages, model, true);

      const content = aiResponse.choices[0].message.content;
      const suggestions = JSON.parse(content);
      res.status(200).json(suggestions);
    } catch (error) {
      console.error("Error generating trip suggestions:", error);
      if (error instanceof SyntaxError) {
        return res.status(500).json({
          message: "Failed to parse AI response. The format was invalid.",
        });
      }
      res.status(500).json({
        message: "Failed to generate trip suggestions.",
        error: error.message,
      });
    }
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
