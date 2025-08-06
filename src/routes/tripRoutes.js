const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware.js");

// --- Authentication Middleware ---
// Any route defined BELOW this line will be protected and require a token.
router.use(protect);

router.get("/", tripController.getAllTrips);

router.get("/saved", tripController.getSavedTrips);

router.get("/discover", tripController.discoverTrips);

router.get("/:id", tripController.getTripById);

router.post("/", tripController.createTrip);

router.delete("/:id", tripController.deleteTrip);

router.get("/:id/locations", tripController.getLocationsByTripId);

router.get("/:id/status", tripController.getTripStatusById);

router.delete("/:id/locations/:locationId", tripController.removeLocation);

router.put("/:id/locations/order", tripController.updateLocationOrder);

router.post("/:tripId/toggle-save", tripController.toggleSaveTrip);

router.get("/user/:userId", tripController.getTripsByUserId);

router.post("/:id/guests", tripController.addProposedGuest);

router.put("/:id", tripController.updateTripDetails);

router.put("/:id/privacy", tripController.updateTripPrivacy);

router.post("/:tripId/add-invited", tripController.addUserToInvitedList);

router.delete("/:id/guests/:guestId", tripController.removeProposedGuest);

router.get("/:tripId/proposed-guests", tripController.getProposedGuests);

router.get("/:id/host", tripController.getTripHostById);

router.put("/:id/status", tripController.updateTripStatus);

router.post("/:id/estimated-time", tripController.updateEstimatedTime);

router.get("/:id/estimated-time", tripController.getTripTimesById);

router.post("/:tripId/locations", tripController.addLocationToTrip);

router.post("/suggestions/:userId", tripController.generateTripSuggestions);

router.post(
  "/:id/TripPreference",
  tripController.createOrReplaceTripPreference
);

router.get("/:id/TripPreference", tripController.getTripPreference);

module.exports = router;
