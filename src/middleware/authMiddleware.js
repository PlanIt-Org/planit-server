// src/middleware/authMiddleware.js
const { supabase } = require("../supabaseAdmin.js");

const protect = async (req, res, next) => {
  console.log("\n--- Running Protect Middleware ---");
  console.log("=== PROTECT MIDDLEWARE DEBUG ===");
  console.log("All headers:", req.headers);
  console.log("Authorization header:", req.headers.authorization);
  console.log(
    "Bearer token present:",
    req.headers.authorization?.startsWith("Bearer ")
  );

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Middleware Error: No Authorization header found.");
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Middleware: Token found, attempting validation...");

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error(
      "Middleware Error: Supabase returned an error during token validation."
    );
    console.error("Error Details:", error.message);
    return res.status(401).json({ message: `Unauthorized: ${error.message}` });
  }

  if (!data || !data.user) {
    console.error(
      "Middleware Error: Token is valid, but no user data was returned."
    );
    return res.status(401).json({ message: "Unauthorized: Invalid token." });
  }

  console.log(
    `Middleware Success: Token validated for user ID: ${data.user.id}`
  );
  req.user = data.user;
  next();
};

module.exports = { protect };
