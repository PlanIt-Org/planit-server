// src/services/openRouterService.js

const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Calls the OpenRouter Chat Completions API.
 * @param {Array<object>} messages - The array of message objects for the AI.
 * @param {string} model - The identifier of the model to use.
 * @param {boolean} jsonResponse - Whether to request a JSON object response.
 * @returns {Promise<object>} - The response data from the OpenRouter API.
 * @throws {Error} - Throws an error if the API call fails or the API key is missing.
 */
const getAiCompletion = async (messages, model, jsonResponse = false) => {
  if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set in environment variables.");
    throw new Error("API key is not configured on the server.");
  }

  const payload = {
    model: model,
    messages: messages,
  };

  if (jsonResponse) {
    payload.response_format = { type: "json_object" };
  }

  try {
    const response = await axios.post(OPENROUTER_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error calling OpenRouter service:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to get response from OpenRouter API.");
  }
};

module.exports = {
  getAiCompletion,
};
