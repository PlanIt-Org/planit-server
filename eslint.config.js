import js from "@eslint/js";
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: ["dist/"],
  },

  // Main configuration for your source files
  {
    files: ["src/**/*.js"],

    // Start with the recommended configuration and add your customizations
    ...js.configs.recommended,

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node, // Defines all Node.js global variables
      },
    },

    rules: {
      "no-unused-vars": "warn",
    },
  },
];
