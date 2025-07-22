const prisma = require("../db/db");

const commentController = {
  // Example: Get all comments
  getAllComments: async (req, res) => {},

  // Example: Get comment by ID
  getCommentById: async (req, res) => {
    // Controller logic here
  },

  // Example: Get comment by ID
  getCommentsForTrip: async (req, res) => {
    try {
      const { tripId } = req.params;
      const comments = await prisma.comment.findMany({
        where: {
          tripId: tripId,
        },
      });

      res.status(200).json(comments);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Could not fetch comments for this trip." });
    }
  },

  // Example: Create a new comment
  createComment: async (req, res) => {
    try {
      const { text, authorId, tripId } = req.body;

      const newComment = await prisma.comment.create({
        data: {
          text: text,
          authorId: authorId,
          tripId: tripId,
        },
      });

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Unable to create comment." });
    }
  },

  // Example: Update a comment
  updateComment: async (req, res) => {
    // Controller logic here
  },

  // Example: Delete a comment
  deleteComment: async (req, res) => {
    // Controller logic here
  },
};

module.exports = commentController;
