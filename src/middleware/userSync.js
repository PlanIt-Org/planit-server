const { clerkClient, getAuth } = require("@clerk/express");
const prisma = require("../db/db");

const syncUserWithDatabase = async (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
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
