// prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Clean up existing data ---
  // Order matters due to foreign key constraints
  await prisma.pollResponse.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tripRSVP.deleteMany();
  await prisma.tripCoHost.deleteMany(); // Ensure this is deleted before Trip
  await prisma.proposedGuest.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.location.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned up previous data.');

  // --- Create Users ---
  // Note: 'id' is now explicitly provided as it's not @default(uuid())
  // 'password' field removed as it's commented out in schema
  const alice = await prisma.user.create({
    data: {
      id: 'user_alice_id', // Using clerkId as the primary ID for seeding
      email: 'alice@planit.com',
      name: 'Alice',
      phoneNumber: '+11234567890',
      activityPreferences: ['hiking', 'photography'],
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: 'user_bob_id',
      email: 'bob@planit.com',
      name: 'Bob',
      activityPreferences: ['reading', 'wine tasting'],
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: 'user_charlie_id',
      email: 'charlie@planit.com',
      name: 'Charlie',
      activityPreferences: ['museums', 'city tours'],
    },
  });

  const david = await prisma.user.create({
    data: {
      id: 'user_david_id',
      email: 'david@planit.com',
      name: 'David',
      activityPreferences: ['skiing', 'snowboarding'],
    },
  });

  const eve = await prisma.user.create({
    data: {
      id: 'user_eve_id',
      email: 'eve@planit.com',
      name: 'Eve',
      activityPreferences: ['foodie tours', 'live music'],
    },
  });

  console.log('Created users:', { alice, bob, charlie, david, eve });

  // --- Create User Preferences ---
  await prisma.userPreferences.create({
    data: {
      userId: alice.id,
      activityPreferences: ['hiking', 'camping', 'kayaking'],
      budget: '3', // Assuming budget is a string like "1", "2", "3", "4"
      travelStyle: ['adventure', 'nature'],
      dietaryRestrictions: ['vegetarian'],
      age: 30,
      location: 'San Francisco',
      typicalTripLength: 'long',
      planningRole: 'leader',
      typicalAudience: ['friends', 'family'],
      lifestyleChoices: ['eco-friendly'],
      accessibilityNeeds: [],
      preferredTransportation: ['car'],
    },
  });

  await prisma.userPreferences.create({
    data: {
      userId: bob.id,
      budget: '4',
      travelStyle: ['relaxation', 'luxury'],
      preferredTransportation: ['rental car', 'ride share'],
      activityPreferences: ['spa', 'fine dining'],
      dietaryRestrictions: [],
      age: 45,
      location: 'Napa',
      typicalTripLength: 'short',
      planningRole: 'participant',
      typicalAudience: ['partner'],
      lifestyleChoices: [],
      accessibilityNeeds: [],
    },
  });
  console.log('Created user preferences.');

  // --- Create Locations ---
  // Added latitude, longitude, and types as per schema
  const yosemite = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJLeS4Wj_olIARa22aFugrlsM',
      name: 'Yosemite National Park',
      address: 'Yosemite National Park, California',
      latitude: 37.8651,
      longitude: -119.5383,
      image: 'https://www.nps.gov/yose/planyourvisit/images/20170618_155334.jpg',
      types: ['national_park', 'natural_feature'],
    },
  });

  const napa = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJd_33y21-hYARg91i02m3_SA',
      name: 'Napa Valley',
      address: 'Napa, CA',
      latitude: 38.2975,
      longitude: -122.2869,
      image: 'https://www.napavalley.com/images/fall-mustard-vines-v-sattui-winery-1.jpg',
      types: ['locality', 'wine_region'],
    },
  });

  const sanFrancisco = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
      name: 'San Francisco',
      address: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
      types: ['locality', 'city'],
    },
  });

  const newYork = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJOwg_06VPwokRY5NLKz3VlVg',
      name: 'New York City',
      address: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      image: 'https://images.unsplash.com/photo-1496449903678-afcd7922a57b',
      types: ['locality', 'city'],
    },
  });

  const grandCanyon = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJx_bY_1z1K4cR9Jg7-3Y_b_A',
      name: 'Grand Canyon National Park',
      address: 'Grand Canyon, AZ',
      latitude: 36.1069,
      longitude: -112.1129,
      image: 'https://images.unsplash.com/photo-1547820760-b8f9a9c2b9a7',
      types: ['national_park', 'natural_feature'],
    },
  });

  console.log('Created locations:', { yosemite, napa, sanFrancisco, newYork, grandCanyon });

  // --- Create Public Trips ---
  const roadTrip = await prisma.trip.create({
    data: {
      title: 'California Adventure Road Trip',
      description: 'An epic road trip through some of California\'s most iconic spots.',
      tripImage: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934',
      private: false, // Public trip
      status: 'PLANNING',
      hostId: alice.id,
      startTime: new Date('2025-09-01T09:00:00Z'),
      endTime: new Date('2025-09-05T17:00:00Z'),
      city: 'San Francisco', // Required city
      maxGuests: 8,
      locations: {
        connect: [{ id: yosemite.id }, { id: napa.id }, { id: sanFrancisco.id }],
      },
    },
  });
  console.log('Created trip:', roadTrip);

  const nycExploration = await prisma.trip.create({
    data: {
      title: 'NYC Cultural Immersion',
      description: 'Explore the vibrant culture and landmarks of New York City.',
      tripImage: 'https://images.unsplash.com/photo-1534430480872-349838824523',
      private: false, // Public trip
      status: 'ACTIVE',
      hostId: bob.id,
      startTime: new Date('2025-10-10T10:00:00Z'),
      endTime: new Date('2025-10-15T18:00:00Z'),
      city: 'New York',
      maxGuests: 12,
      locations: {
        connect: [{ id: newYork.id }],
      },
    },
  });
  console.log('Created trip:', nycExploration);

  const grandCanyonAdventure = await prisma.trip.create({
    data: {
      title: 'Grand Canyon Hiking Expedition',
      description: 'A challenging and rewarding hiking trip through the Grand Canyon.',
      tripImage: 'https://images.unsplash.com/photo-1506197603052-3b6031266e88',
      private: false, // Public trip
      status: 'PLANNING',
      hostId: david.id,
      startTime: new Date('2026-04-20T08:00:00Z'),
      endTime: new Date('2026-04-25T16:00:00Z'),
      city: 'Grand Canyon Village',
      maxGuests: 6,
      locations: {
        connect: [{ id: grandCanyon.id }],
      },
    },
  });
  console.log('Created trip:', grandCanyonAdventure);


  // --- Add a Co-Host ---
  await prisma.tripCoHost.create({
    data: {
      tripId: roadTrip.id,
      userId: bob.id,
    },
  });
  console.log('Added Bob as a co-host.');

  // --- Create RSVPs ---
  await prisma.tripRSVP.create({
    data: {
      tripId: roadTrip.id,
      userId: alice.id,
      status: 'YES',
    },
  });
  await prisma.tripRSVP.create({
    data: {
      tripId: roadTrip.id,
      userId: bob.id,
      status: 'YES',
    },
  });
  await prisma.tripRSVP.create({
    data: {
      tripId: roadTrip.id,
      userId: charlie.id,
      status: 'MAYBE',
    },
  });
  console.log('Created RSVPs.');

  // --- Add Comments ---
  await prisma.comment.create({
    data: {
      text: "I'm so excited for this trip! Can't wait for the hikes.",
      authorId: alice.id,
      tripId: roadTrip.id,
      locationId: yosemite.id,
    },
  });
  await prisma.comment.create({
    data: {
      text: 'Has anyone booked their wine tasting tour in Napa yet?',
      authorId: bob.id,
      tripId: roadTrip.id,
      locationId: napa.id,
    },
  });
  console.log('Added comments.');

  // --- Create a Poll ---
  const dinnerPoll = await prisma.poll.create({
    data: {
      tripId: roadTrip.id,
      question: 'What should we do for dinner on the first night?',
      options: ['Cook at the campsite', 'Find a local restaurant', 'Pizza delivery'],
    },
  });
  console.log('Created a poll.');

  // --- Add Poll Responses ---
  await prisma.pollResponse.create({
    data: {
      pollId: dinnerPoll.id,
      userId: alice.id,
      option: 'Cook at the campsite',
    },
  });
  await prisma.pollResponse.create({
    data: {
      pollId: dinnerPoll.id,
      userId: bob.id,
      option: 'Find a local restaurant',
    },

  });
  console.log('Added poll responses.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
