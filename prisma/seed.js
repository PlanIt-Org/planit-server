import { PrismaClient, RSVPStatus, TripStatus } from "@prisma/client";

// Initialize the Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // -----------------
  // --- CLEANUP ---
  // -----------------
  console.log("🧹 Clearing existing data...");
  // Delete records in an order that respects foreign key constraints
  await prisma.pollResponse.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.tripCoHost.deleteMany();
  await prisma.tripRSVP.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.proposedGuest.deleteMany();
  await prisma.tripPreference.deleteMany();
  await prisma.userPreferences.deleteMany();

  // Disconnect Many-to-Many relations before deleting parent records
  const trips = await prisma.trip.findMany({ select: { id: true } });
  for (const trip of trips) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        savedByUsers: { set: [] },
        invitedUsers: { set: [] },
        locations: { set: [] },
      },
    });
  }

  await prisma.trip.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️ Database cleared.");

  // -------------------------------------
  // --- CREATE USERS & PREFERENCES ---
  // -------------------------------------
  console.log("🙋 Creating users and their preferences...");

  // User 1: Alice - The cultural organizer
  const alice = await prisma.user.create({
    data: {
      id: "user_alice_123",
      email: "alice@example.com",
      name: "Alice Johnson",
      profilePictureUrl: "https://i.pravatar.cc/150?u=alice",
      userPreferences: {
        create: {
          age: 30,
          location: "San Francisco, CA",
          dietaryRestrictions: ["Vegetarian", "Dairy-Free"],
          activityPreferences: [
            "Museums & Art Galleries",
            "Restaurants & Dining",
            "Live Music & Concerts",
          ],
          budget: "3",
          typicalTripLength: "Weekend",
          planningRole: "The Organizer",
          typicalAudience: ["Friends", "Partner"],
          lifestyleChoices: ["Early Bird", "Cultural"],
          travelStyle: ["Relaxed", "Day Trips"],
          accessibilityNeeds: ["Wheelchair Accessible"],
          preferredTransportation: ["Public Transit", "Ride-sharing"],
        },
      },
    },
  });

  // User 2: Bob - The adventurous foodie
  const bob = await prisma.user.create({
    data: {
      id: "user_bob_456",
      email: "bob@example.com",
      name: "Bob Williams",
      profilePictureUrl: "https://i.pravatar.cc/150?u=bob",
      userPreferences: {
        create: {
          age: 32,
          location: "Oakland, CA",
          dietaryRestrictions: ["Pescatarian"],
          activityPreferences: [
            "Outdoor Activities & Parks",
            "Restaurants & Dining",
            "Sports & Recreation",
          ],
          budget: "4",
          planningRole: "The Adventurous One",
          typicalAudience: ["Friends"],
          lifestyleChoices: ["Active", "Adventurous"],
          travelStyle: ["Quick Hangouts"],
        },
      },
    },
  });

  // User 3: Charlie - The social night owl
  const charlie = await prisma.user.create({
    data: {
      id: "user_charlie_789",
      email: "charlie@example.com",
      name: "Charlie Brown",
      profilePictureUrl: "https://i.pravatar.cc/150?u=charlie",
      userPreferences: {
        create: {
          age: 28,
          dietaryRestrictions: ["Vegan"],
          activityPreferences: [
            "Bars & Nightlife",
            "Unique & Trendy Spots",
            "Shopping",
          ],
          budget: "2",
          planningRole: "The Follower",
          typicalAudience: ["Anyone"],
          lifestyleChoices: ["Social", "Night Owl"],
          travelStyle: ["Relaxed"],
        },
      },
    },
  });

  console.log(`Created ${await prisma.user.count()} users.`);

  // --------------------------
  // --- CREATE LOCATIONS ---
  // --------------------------
  console.log("📍 Creating locations...");

  const ferryBuilding = await prisma.location.create({
    data: {
      googlePlaceId: "ChIJV4xx23B-j4ARLg3yYW6dGvA",
      name: "Ferry Building Marketplace",
      address: "1 Ferry Building, San Francisco, CA 94111, USA",
      latitude: 37.7955,
      longitude: -122.3937,
      types: ["meal_takeaway", "restaurant", "food", "point_of_interest"],
    },
  });

  const goldenGatePark = await prisma.location.create({
    data: {
      googlePlaceId: "ChIJvX_3d1p_j4ARlY2B6nL4w6s",
      name: "Golden Gate Park",
      address: "San Francisco, CA, USA",
      latitude: 37.7694,
      longitude: -122.4862,
      types: ["park", "tourist_attraction"],
    },
  });

  console.log(`Created ${await prisma.location.count()} locations.`);

  // ----------------------------------------------------
  // --- CREATE TRIP & AGGREGATE PREFERENCES ---
  // ----------------------------------------------------
  console.log("✈️ Creating trip and its aggregated preference summary...");

  // Create a trip and invite all users
  const trip1 = await prisma.trip.create({
    data: {
      title: "SF Weekend Exploration",
      description: "A weekend trip to see the best of San Francisco!",
      city: "San Francisco",
      status: TripStatus.PLANNING,
      private: false,
      host: { connect: { id: alice.id } },
      invitedUsers: {
        connect: [{ id: alice.id }, { id: bob.id }, { id: charlie.id }],
      },
      locations: {
        connect: [{ id: ferryBuilding.id }, { id: goldenGatePark.id }],
      },
    },
    // We must include relations to perform the aggregation below
    include: {
      invitedUsers: { include: { userPreferences: true } },
    },
  });

  // --- Aggregate Preferences Logic ---
  const preferenceData = {
    activityPreferences: {},
    dietaryRestrictions: {},
    lifestyleChoices: {},
    travelStyle: {},
    budgetDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
  };

  for (const guest of trip1.invitedUsers) {
    const prefs = guest.userPreferences;
    if (!prefs) continue;

    prefs.activityPreferences.forEach((p) => {
      preferenceData.activityPreferences[p] =
        (preferenceData.activityPreferences[p] || 0) + 1;
    });
    prefs.dietaryRestrictions.forEach((p) => {
      preferenceData.dietaryRestrictions[p] =
        (preferenceData.dietaryRestrictions[p] || 0) + 1;
    });
    prefs.lifestyleChoices.forEach((p) => {
      preferenceData.lifestyleChoices[p] =
        (preferenceData.lifestyleChoices[p] || 0) + 1;
    });
    prefs.travelStyle.forEach((p) => {
      preferenceData.travelStyle[p] = (preferenceData.travelStyle[p] || 0) + 1;
    });
    if (
      prefs.budget &&
      preferenceData.budgetDistribution[prefs.budget] !== undefined
    ) {
      preferenceData.budgetDistribution[prefs.budget]++;
    }
  }

  // Create the TripPreference record with the aggregated data
  await prisma.tripPreference.create({
    data: {
      tripId: trip1.id,
      activityPreferences: preferenceData.activityPreferences,
      dietaryRestrictions: preferenceData.dietaryRestrictions,
      lifestyleChoices: preferenceData.lifestyleChoices,
      travelStyle: preferenceData.travelStyle,
      budgetDistribution: preferenceData.budgetDistribution,
    },
  });

  console.log("📊 Trip preference summary created.");

  // ---------------------------------
  // --- CREATE SUPPORTING DATA ---
  // ---------------------------------
  console.log("📝 Creating RSVPs and comments...");

  await prisma.tripRSVP.create({
    data: { tripId: trip1.id, userId: alice.id, status: RSVPStatus.YES },
  });
  await prisma.tripRSVP.create({
    data: { tripId: trip1.id, userId: bob.id, status: RSVPStatus.YES },
  });
  await prisma.tripRSVP.create({
    data: { tripId: trip1.id, userId: charlie.id, status: RSVPStatus.MAYBE },
  });

  await prisma.comment.create({
    data: {
      text: "So excited for this! Can't wait for the Ferry Building.",
      authorId: alice.id,
      tripId: trip1.id,
      locationId: ferryBuilding.id,
    },
  });

  console.log("✅ Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred while seeding the database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
