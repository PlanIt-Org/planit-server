// server.js
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const { protect } = require("./middleware/authMiddleware");

const corsOption = {
  origin: CORS_ORIGIN,
  credentials: true,
};

const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const locationRoutes = require("./routes/locationRoutes");
const commentRoutes = require("./routes/commentRoutes");
const tripRSVPRoutes = require("./routes/tripRSVPRoutes");
const openRouterRoutes = require("./routes/openRouterRoutes");

app.use(morgan("dev"));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use(cors(corsOption));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

app.use("/api", limiter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/trip", tripRSVPRoutes);
app.use("/api/openrouter", openRouterRoutes);

app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err.stack);

  if (res.headersSent) {
    console.error(
      "Headers already sent, delegating to default Express handler"
    );
    return next(err);
  }

  res.status(500).json({
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

app.use((req, res) => {
  if (!res.headersSent) {
    res.status(404).json({ error: "Route not found" });
  }
});

app.listen(PORT, () => {
  try {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS enabled for: ${CORS_ORIGIN}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("\nServer shutting down...");
  process.exit(0);
});
