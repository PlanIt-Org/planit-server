// src/controllers/tripController.js
const prisma = require("../db/db");
const { getAiCompletion } = require("../services/openRouterService");

const getAuth = (req) => {
  return {
    userId: req.user?.id || null,
  };
};

const extractAndParseJson = (text) => {
  // Use a regex to find a JSON block, which might be wrapped in ```json ... ```
  const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
  const match = text.match(jsonRegex);

  if (!match) {
    console.error(
      "[extractAndParseJson] No JSON object or code block found in the string."
    );
    throw new SyntaxError("No valid JSON found in the AI response.");
  }

  // The actual JSON content will be in one of the capturing groups
  const jsonString = match[1] || match[2];

  if (!jsonString) {
    throw new SyntaxError("Extracted JSON string is empty.");
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(
      "[extractAndParseJson] Failed to parse the extracted JSON string:",
      jsonString
    );
    // Re-throw the original parsing error for the calling function to handle
    throw error;
  }
};

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

  getTripHostById: async (req, res) => {
    const { id } = req.params;

    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
        select: { hostId: true },
      });

      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }

      return res.status(200).json({ hostId: trip.hostId });
    } catch (error) {
      console.error("Error fetching trip host by ID:", error);
      return res.status(500).json({
        message: "Failed to fetch trip host.",
        error: error.message,
      });
    }
  },

  getTripStatusById: async (req, res) => {
    const { id } = req.params;
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }

      return res.status(200).json({ data: { status: trip.status } });
    } catch (error) {
      console.error("Error fetching trip status:", error);
      return res.status(500).json({ message: "Failed to fetch trip status." });
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

  getTripTimesById: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Trip ID is required." });
    }

    try {
      const tripTimes = await prisma.trip.findUnique({
        where: {
          id: id,
        },
        select: {
          startTime: true,
          endTime: true,
          estimatedTime: true,
        },
      });

      if (!tripTimes) {
        return res.status(404).json({ message: "Trip not found." });
      }

      return res.status(200).json({
        message: "Trip times fetched successfully!",
        data: tripTimes,
      });
    } catch (error) {
      console.error("Error fetching trip times by ID:", error);
      return res.status(500).json({
        message: "Failed to fetch trip times.",
        error: error.message,
      });
    }
  },

  getLocationsByTripId: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "Missing tripId parameter.",
        });
      }

      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          locations: true, // Assuming the relation is named `locations` in your `Trip` model
        },
      });

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found.",
        });
      }

      return res.status(200).json({
        message: "Locations fetched successfully.",
        locations: trip.locations,
      });
    } catch (error) {
      console.error("Error fetching locations by tripId:", error);
      return res.status(500).json({
        message: "Failed to fetch locations.",
        error: error.message,
      });
    }
  },

  /**
   * Creates a new trip for the authenticated user.
   *
   * @async
   * @function createTrip
   * @param {import('express').Request} req - Express request object, expects authenticated user and trip details in body.
   * @param {import('express').Response} res - Express response object.
   * @returns {Promise<void>} Responds with the created trip or an error message.
   *
   * Request body fields:
   *   - startTime {string|Date} (required)
   *   - endTime {string|Date} (required)
   *   - estimatedTime {string|Date} (optional)
   *   - title {string} (optional)
   *   - description {string} (optional)
   *   - tripImage {string} (optional)
   *   - maxGuests {number} (optional)
   *   - city {string} (optional)
   *
   */
  createTrip: async (req, res) => {
    try {
      console.log("createTrip: Starting trip creation...");

      // Get user ID from the authenticated request
      const userId = req.user?.id;

      if (!userId) {
        console.error("createTrip: No user ID found in request");
        return res.status(401).json({
          message: "Authentication error: User ID not found.",
        });
      }

      console.log(`createTrip: Creating trip for user ${userId}`);

      const {
        startTime,
        endTime,
        estimatedTime,
        // hostId, // Ignore hostId from frontend, always use authenticated user
        title,
        description,
        tripImage,
        maxGuests,
        city,
      } = req.body;

      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Missing required fields: startTime and endTime.",
        });
      }

      // Count how many PLANNING trips already exist for this host
      const planningTripsCount = await prisma.trip.count({
        where: {
          hostId: userId,
          status: "PLANNING",
        },
      });

      if (planningTripsCount >= 5) {
        return res.status(400).json({
          message: "You can only have up to 5 planning trips.",
        });
      }

      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);

      const newTrip = await prisma.trip.create({
        data: {
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          estimatedTime: estimatedTime || null,
          hostId: userId, // Use authenticated user ID
          title: title || "New Trip",
          description: description || (city ? `Trip to ${city}` : "New trip"),
          tripImage: tripImage || null,
          maxGuests: maxGuests || null,
          city: city || null,
          status: "PLANNING",
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
          message: "A trip with this data already exists.",
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

  updateTripStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication error: User ID not found.",
      });
    }

    try {
      const updatedTrip = await prisma.trip.update({
        where: { id },
        data: { status },
      });
      res.json({ trip: updatedTrip });
    } catch (error) {
      console.error("Error updating trip status:", error);
      res.status(500).json({ message: "Failed to update trip status" });
    }
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

  updateEstimatedTime: async (req, res) => {
    const { id } = req.params;
    const { estimatedTime } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Trip ID is required." });
    }
    if (!estimatedTime) {
      return res.status(400).json({ message: "Estimated time is required." });
    }

    try {
      // Use the helper function to convert the string to a decimal
      if (estimatedTime === null) {
        return res.status(400).json({
          message:
            "Invalid estimated time format. Expected format like '2 hr 30 min'.",
        });
      }

      // Update the trip in the database
      const updatedTrip = await prisma.trip.update({
        where: { id: id },
        data: {
          estimatedTime: estimatedTime,
        },
      });

      return res.status(200).json({
        message: "Trip estimated time updated successfully!",
        trip: updatedTrip,
      });
    } catch (error) {
      // This Prisma error code means "record to update not found"
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Trip not found." });
      }
      console.error("Error updating estimated time:", error);
      return res.status(500).json({
        message: "Failed to update estimated time.",
        error: error.message,
      });
    }
  },

  // In your backend trips controller file

  removeLocation: async (req, res) => {
    const { id, locationId } = req.params; // id = tripId, locationId = Google Place ID

    try {
      // First, find the trip and include its locations (you already do this)
      const trip = await prisma.trip.findUnique({
        where: { id },
        include: { locations: true },
      });

      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }

      // --- START: MODIFIED LOGIC ---

      // Instead of a new DB query, find the location within the trip's existing locations
      const locationToDisconnect = trip.locations.find(
        (loc) => loc.googlePlaceId === locationId
      );

      // If the location isn't part of this trip, we can't disconnect it.
      if (!locationToDisconnect) {
        return res.status(404).json({
          message: "Location with the specified ID not found in this trip.",
        });
      }

      // Proceed to disconnect using the location's internal database ID
      await prisma.trip.update({
        where: { id },
        data: {
          locations: {
            disconnect: { id: locationToDisconnect.id }, // Use the internal DB ID
          },
        },
      });

      // --- END: MODIFIED LOGIC ---

      return res.status(200).json({ message: "Location removed from trip." });
    } catch (error) {
      console.error("Error removing location from trip:", error);
      return res
        .status(500)
        .json({ message: "Failed to remove location from trip." });
    }
  },

  // Example: Delete a trip
  deleteTrip: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication error: User ID not found.",
        });
      }

      console.log(`deleteTrip: User ${userId} attempting to delete trip ${id}`);

      const trip = await prisma.trip.findUnique({ where: { id } });

      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      if (trip.hostId !== userId) {
        return res.status(403).json({
          message: "You can only delete trips you created.",
        });
      }

      if (trip.status === "COMPLETED") {
        return res
          .status(403)
          .json({ message: "Completed trips cannot be deleted." });
      }

      await prisma.trip.delete({ where: { id } });

      console.log(`deleteTrip: Successfully deleted trip ${id}`);

      return res.status(200).json({ message: "Trip deleted successfully" });
    } catch (error) {
      console.error("Error deleting trip:", error);
      return res.status(500).json({ message: "Server error deleting trip" });
    }
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
    const destination = "San Francisco";
    const { startDate, endDate, ...otherTripInfo } = req.body || {};
    console.debug(
      "[generateLocationSuggestions] Called with userId:",
      userId,
      "and destination:",
      destination
    );

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    try {
      const [userPreferences, pastTrips] = await Promise.all([
        prisma.userPreferences.findUnique({ where: { userId } }),
        prisma.trip.findMany({
          where: { hostId: userId },
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      if (!userPreferences) {
        console.warn(
          "[generateLocationSuggestions] No user preferences found for:",
          userId
        );
        return res.status(404).json({ message: "User preferences not found." });
      }

      // Build a prompt that includes the user's trip creation info if provided
      let userDataPrompt = formatDataForPrompt(userPreferences, pastTrips);

      // If destination or other trip info is provided, append it to the prompt for context
      if (
        destination ||
        startDate ||
        endDate ||
        Object.keys(otherTripInfo).length > 0
      ) {
        let tripContext = "\n\nThe user is currently planning a new trip";
        if (destination) tripContext += ` to "${destination}"`;
        if (startDate || endDate) {
          tripContext += " for the dates";
          if (startDate) tripContext += ` starting ${startDate}`;
          if (endDate) tripContext += ` and ending ${endDate}`;
        }
        if (Object.keys(otherTripInfo).length > 0) {
          tripContext += `. Additional trip details: ${JSON.stringify(
            otherTripInfo
          )}`;
        }
        tripContext +=
          ". Please tailor your suggestions to be especially relevant to this trip, but still offer a variety of options.";
        userDataPrompt += tripContext;
      }

      const systemPrompt = `You are an expert travel recommendation engine. Your task is to suggest 5 unique travel LOCATIONS (NOT CITIES) that perfectly match the user's preferences and travel style, inferred from their past trips and the details of the trip they are currently planning (if provided).

Your response MUST be a single, valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The root of the JSON object must be a key named "locations", which holds an array of 5 location objects.

For each location, provide:
- "city": The location in "City, Country" format.
- "description": A compelling 2-sentence summary explaining WHY this place is a great match for the user based on their specific data and, if relevant, the trip they are planning.
- "best_for": An array of 2-3 keywords describing the vibe (e.g., "Adventure", "Relaxation", "Culture", "Foodie", "Nightlife").

Example of the required JSON structure:
{
  "locations": [
    {
      "city": "Muir Woods National Monument, Mill Valley, CA",
      "description": "Given your interest in hiking, Muir Woods is a serene, scenic escape. Its Redwoods and history align with your wishes for peaceful and beautiful environments.",
      "best_for": ["Culture", "History", "Relaxation"]
    }
  ]
}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userDataPrompt },
      ];

      let aiResponse;
      try {
        const model = "mistralai/mistral-7b-instruct:free";
        console.debug(
          "[generateLocationSuggestions] Sending request to AI model:",
          model
        );
        aiResponse = await getAiCompletion(messages, model, true);
      } catch (apiError) {
        console.error(
          "[generateLocationSuggestions] AI API call failed:",
          apiError
        );
        return res
          .status(502)
          .json({ message: "Failed to get a response from the AI service." });
      }

      if (!aiResponse?.choices?.[0]?.message?.content) {
        console.error(
          "[generateLocationSuggestions] AI response was empty or malformed."
        );
        return res
          .status(500)
          .json({ message: "AI returned an invalid or empty response." });
      }

      const rawContent = aiResponse.choices[0].message.content;
      console.debug(
        "[generateLocationSuggestions] Raw AI content received:",
        rawContent
      );

      let suggestions;
      try {
        suggestions = extractAndParseJson(rawContent);
      } catch (parseError) {
        console.error(
          "[generateLocationSuggestions] Failed to parse AI response as JSON.",
          parseError
        );
        console.error("Problematic AI content:", rawContent);
        return res
          .status(500)
          .json({ message: "AI returned data in an unexpected format." });
      }

      console.info(
        "[generateLocationSuggestions] Successfully generated suggestions for:",
        userId
      );
      res.status(200).json(suggestions);
    } catch (error) {
      console.error(
        "[generateLocationSuggestions] An unexpected error occurred:",
        error
      );
      res.status(500).json({ message: "An internal server error occurred." });
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
