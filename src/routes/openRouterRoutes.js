// src/routes/openRouterRoutes.js

/**
 * @file Defines the API routes for OpenRouter functionalities.
 * This file maps specific endpoints to their corresponding controller functions.
 */

const express = require("express");
const router = express.Router();
const openRouterController = require("../controllers/openRouterController");

/**
 * @route   POST /api/openrouter/chat
 * @desc    A generic endpoint for chat completions. Handles both text and multimodal.
 * @access  Public (or Private, depending on your app's auth middleware)
 * @body    { "model": "model-identifier", "messages": [...] }
 */
router.post("/chat", openRouterController.createChatCompletion);

/**
 * @route   POST /api/openrouter/generate-text
 * @desc    A simplified endpoint for generating text from a single prompt.
 * @access  Public
 * @body    { "prompt": "Your text prompt here", "model": "optional-model-id" }
 */
router.post("/generate-text", openRouterController.generateText);

module.exports = router;
