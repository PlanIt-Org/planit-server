const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/", commentController.getAllComments);

// Get comment by ID
router.get("/:id", commentController.getCommentById);

router.get("/trips/:tripId", commentController.getCommentsForTrip);

// Create a new comment
router.post("/", commentController.createComment);

// Update a comment (uncomment and implement when ready)
// router.put("/:id", commentController.updateComment);

// Delete a comment
router.delete("/:id", commentController.deleteComment);

module.exports = router;
