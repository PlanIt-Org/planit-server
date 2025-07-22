const { supabase } = require("../supabaseAdmin.js");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid format." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error("Token validation error:", error.message);
      return res
        .status(401)
        .json({ message: `Unauthorized: ${error.message}` });
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Server error during token validation:", err);
    res.status(500).json({ message: "Server error during token validation." });
  }
};

module.exports = { protect };
