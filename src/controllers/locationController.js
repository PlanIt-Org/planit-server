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

      // Attempt to find the location by its Google Place ID first
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


  // Example: Create a new location
  createLocation: async (req, res) => {
    try {
      const {
        place_id,
        name,
        formatted_address,
        geometry, 
        types,
      } = req.body;

      const latitude = geometry.location.lat;
      const longitude = geometry.location.lng; 

      let imageUrl = null;
      if (photos && photos.length > 0) {
        const firstPhotoRef = photos[0].photo_reference; 
        const googleMapsApiKey = process.env.Maps_API_KEY; 
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${firstPhotoRef}&key=${googleMapsApiKey}`;
      }

      const newLocation = await prisma.location.create({
        data: {
          googlePlaceId: place_id,
          name: name,
          address: formatted_address, 
          latitude: latitude,
          longitude: longitude,
          image: imageUrl,
          types: types, 
        },
      });

      res.status(201).json(newLocation);

    } catch (error) {
      console.error("Error creating location:", error);

      if (error.code === 'P2002' && error.meta?.target?.includes('googlePlaceId')) {
        return res.status(409).json({ message: "Location with this Google Place ID already exists." });
      }

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
