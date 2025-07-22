// src/controllers/openRouterController.js
// TODO: FILL IN BOILERPLATE

/**
 * @file Manages the logic for interacting with the OpenRouter AI API.
 * This controller handles the construction of requests to OpenRouter
 * and processes the responses before sending them back to the client.
 */
const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * A generic handler to interact with the OpenRouter Chat Completions API.
 * This can be used for both simple text prompts and complex multimodal prompts.
 * * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.createChatCompletion = async (req, res) => {
  // The 'model' and 'messages' are expected from the client's request body.
  // The 'messages' should be an array of message objects
  const { model, messages } = req.body;

  if (!model || !messages) {
    return res
      .status(400)
      .json({ error: "Missing required fields: model and messages." });
  }

  if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set in environment variables.");
    return res
      .status(500)
      .json({ error: "API key is not configured on the server." });
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: model,
        messages: messages,
        // TODO: You can add other parameters here
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // Optional headers
          // 'HTTP-Referer': YOUR_SITE_URL,
          // 'X-Title': YOUR_SITE_NAME,
        },
      }
    );

    // Send the response from OpenRouter back to the client.
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error calling OpenRouter API:",
      error.response ? error.response.data : error.message
    );

    // Forward a structured error to the client.
    res.status(error.response?.status || 500).json({
      error: "Failed to get response from OpenRouter API.",
      details:
        error.response?.data?.error || "An internal server error occurred.",
    });
  }
};

/**
 * A placeholder for a more specific text generation function.
 * This could be used for tasks like summarizing text or writing an article.
 * * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.generateText = async (req, res) => {
  // This is a specialized version of createChatCompletion.
  // You would construct the 'messages' array here based on a simpler input.
  const { prompt, model = "deepseek/deepseek-chat:free" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing required field: prompt." });
  }

  req.body.messages = [{ role: "user", content: prompt }];
  req.body.model = model;

  return exports.createChatCompletion(req, res);
};
