const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

// Import authentication middleware
const { protect } = require("./middleware/authMiddleware");

const corsOption = {
  origin: CORS_ORIGIN,
  credentials: true,
};

// Import route files
const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const locationRoutes = require("./routes/locationRoutes");
const commentRoutes = require("./routes/commentRoutes");
const tripRSVPRoutes = require("./routes/tripRSVPRoutes");
const openRouterRoutes = require("./routes/openRouterRoutes");

// HTTP access log
app.use(morgan("dev"));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Middleware to parse JSON request bodies
app.use(cors(corsOption));
app.use(express.json());

// Root route check
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api", tripRSVPRoutes);
app.use("/api/openrouter", openRouterRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  try {
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
});

// Sigint handler for graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nServer shutting down...");
  process.exit(0);
});
