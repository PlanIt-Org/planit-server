require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

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

// Protected health check route
app.get("/health", requireAuth(), (req, res) => {
  const { userId } = getAuth(req);
  res.json({
    status: "healthy",
    authenticated: true,
    userId,
  });
});

// Mount the routers with authentication
app.use("/api/users", userRoutes);
app.use("/api/trips", requireAuth(), tripRoutes);
app.use("/api/locations", requireAuth(), locationRoutes);
app.use("/api/comments", requireAuth(), commentRoutes);
app.use("/api/rsvps", requireAuth(), tripRSVPRoutes);
app.use("/api/openrouter", requireAuth(), openRouterRoutes);

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
