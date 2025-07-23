const prisma = require("../db/db");

const locationController = {
  // Example: Get all locations
  getAllLocations: async (req, res) => {
    // Controller logic here
  },

  // Example: Get location by ID
  getLocationById: async (req, res) => {
    try {
      const { id } = req.params;

      // find location by id
      const location = await prisma.location.findUnique({
        where: {
          id: id, 
        },
      });

      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }

      res.status(200).json(location);

    } catch (error) {
      console.error("Error getting location by ID:", error);
      res.status(500).json({ message: "Failed to retrieve location." });
    }
  },


  getLocationByPlaceId: async (req, res) => {
    try {
      const { placeId } = req.params;

  // find location by google maps id
      const location = await prisma.location.findUnique({
        where: {
          googlePlaceId: placeId,
        },
      });
  
      if (!location) {
        return res.status(404).json({ message: "Location not found." });
      }
  
      res.status(200).json(location);
    } catch (error) {
      console.error("Error fetching location by Google Place ID:", error);
      res.status(500).json({ message: "Failed to fetch location." });
    }
  },


  // Example: Create a new location
  createLocation: async (req, res) => {
    try {
      const {
        place_id,
        name,
        formatted_address,
        geometry,
        types,
        photos,
      } = req.body;
  
      const latitude = geometry.location.lat;
      const longitude = geometry.location.lng;
  
      // check if location already exists
      const existingLocation = await prisma.location.findUnique({
        where: { googlePlaceId: place_id },
      });
  
      if (existingLocation) {
        return res.status(200).json(existingLocation);
      }
  
      // get the photo for the location
      let imageUrl = null;
      if (photos && photos.length > 0) {
        const photoRef = photos[0].photo_reference;
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${process.env.Maps_API_KEY}`;
      }
  
      // create the location
      const newLocation = await prisma.location.create({
        data: {
          googlePlaceId: place_id,
          name,
          address: formatted_address,
          latitude,
          longitude,
          image: imageUrl,
          types,
        },
      });
  
      res.status(201).json(newLocation);
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(500).json({ message: "Failed to create location." });
    }
  },

  // Example: Update a location
  updateLocation: async (req, res) => {
    // Controller logic here
  },

  // Example: Delete a location
  deleteLocation: async (req, res) => {
    // Controller logic here
  },
  searchLocations: async (req, res) => {
    // TODO: Implement searchLocations logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getRecommendedLocations: async (req, res) => {
    // TODO: Implement getRecommendedLocations logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  filterLocations: async (req, res) => {
    // TODO: Implement filterLocations logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getLocationDetails: async (req, res) => {
    // TODO: Implement getLocationDetails logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getLocationWeather: async (req, res) => {
    // TODO: Implement getLocationWeather logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getLocationHours: async (req, res) => {
    // TODO: Implement getLocationHours logic
    res.status(501).json({ message: "Not implemented yet" });
  },
  getRouteToLocation: async (req, res) => {
    // TODO: Implement getRouteToLocation logic
    res.status(501).json({ message: "Not implemented yet" });
  },
};

module.exports = locationController;
