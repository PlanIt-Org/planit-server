const { getAuth } = require("@clerk/express");
const { createClerkClient } = require("@clerk/backend");
const prisma = require("../db/db");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const syncUserWithDatabase = async (req, res, next) => {
  try {
    console.log("=== UserSync Debug ===");

    const auth = getAuth(req);
    console.log("Auth object:", auth);

    // TEMPORARY: For testing, create a mock user if no auth
    if (!auth.userId) {
      console.log("No userId found, creating mock user for testing");

      // MOCK USER
      req.user = {
        id: 1,
        clerkId: "mock_user_id",
        email: "test@example.com",
        name: "Test User",
        password: null,
      };

      return next();
    }

    const clerkUser = await clerkClient.users.getUser(auth.userId);

    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user) {
      // Create new user in our database
      try {
        user = await prisma.user.create({
          data: {
            clerkId: auth.userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: `${clerkUser.firstName || ""} ${
              clerkUser.lastName || ""
            }`.trim(),
            password: null,
          },
        });
      } catch (dbError) {
        console.error("Database error creating user:", dbError);
        return res.status(500).json({ error: "Failed to create user profile" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = syncUserWithDatabase;
