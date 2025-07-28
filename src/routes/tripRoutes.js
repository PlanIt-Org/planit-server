const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// Get all trips
router.get("/", tripController.getAllTrips);

// Get trip by ID
router.get("/:id", tripController.getTripById);

// Create a new trip
router.post("/", tripController.createTrip);

// Update a trip (uncomment and implement when ready)
// router.put("/:id", tripController.updateTrip);

// Delete a trip
router.delete("/:id", tripController.deleteTrip);

router.get('/:id/locations', tripController.getLocationsByTripId);

router.get("/:id/status", tripController.getTripStatusById),

// Add co-hosts to a trip
router.post("/:id/co-hosts", tripController.addCoHost);

router.delete("/:id/locations/:locationId", tripController.removeLocation);

// Remove co-hosts from a trip
router.delete("/:id/co-hosts/:userId", tripController.removeCoHost);

// Add a guest to the proposed list
router.post("/:tripId/proposed-guests", tripController.addProposedGuest);

// get all trips by user
router.get("/user/:userId", tripController.getTripsByUserId);

// Add proposed guests to a trip
router.post("/:id/guests", tripController.addProposedGuest);

// Remove proposed guests from a trip
router.delete("/:id/guests/:guestId", tripController.removeProposedGuest);

// Get proposed guests for a trip
router.get("/:id/guests", tripController.getProposedGuests);

// Create a poll for a trip
router.post("/:id/polls", tripController.createPoll);

router.get("/:id/host", tripController.getTripHostById);

router.put("/:id/status", tripController.updateTripStatus);

// update estimated time
router.post("/:id/estimated-time", tripController.updateEstimatedTime);

router.get("/:id/estimated-time", tripController.getTripTimesById);
// Get polls for a trip
router.get("/:id/polls", tripController.getTripPolls);

// Add location to trips
router.post("/:tripId/locations", tripController.addLocationToTrip);

// Vote on a poll
router.post("/:id/polls/:pollId/vote", tripController.voteOnPoll);

// Get trip templates
router.get("/templates", tripController.getTripTemplates);

// Clone a trip as a template
router.post("/:id/clone", tripController.cloneTripAsTemplate);

// Get trip schedule
router.get("/:id/schedule", tripController.getTripSchedule);

// Update trip schedule
router.put("/:id/schedule", tripController.updateTripSchedule);

router.post("/suggestions/:userId", tripController.generateTripSuggestions);

module.exports = router;
