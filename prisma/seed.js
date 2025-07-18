// prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Clean up existing data ---
  await prisma.tripCoHost.deleteMany();
  await prisma.pollResponse.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tripRSVP.deleteMany();
  await prisma.proposedGuest.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.location.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned up previous data.');

  // --- Create Users with Plain Text Passwords ---
  const alice = await prisma.user.create({
    data: {
      clerkId: 'user_alice_clerk_id',
      email: 'alice@planit.com',
      name: 'Alice',
      password: 'password123',
      activityPreferences: ['hiking', 'photography'],
    },
  });

  const bob = await prisma.user.create({
    data: {
      clerkId: 'user_bob_clerk_id',
      email: 'bob@planit.com',
      name: 'Bob',
      password: 'password456',
      activityPreferences: ['reading', 'wine tasting'],
    },
  });

  const charlie = await prisma.user.create({
    data: {
      clerkId: 'user_charlie_clerk_id',
      email: 'charlie@planit.com',
      name: 'Charlie',
      password: 'password789',
      activityPreferences: ['museums', 'city tours'],
    },
  });

  const david = await prisma.user.create({
    data: {
      clerkId: 'user_david_clerk_id',
      email: 'david@planit.com',
      name: 'David',
      password: 'password101',
      activityPreferences: ['skiing', 'snowboarding'],
    },
  });

  const eve = await prisma.user.create({
    data: {
      clerkId: 'user_eve_clerk_id',
      email: 'eve@planit.com',
      name: 'Eve',
      password: 'password112',
      activityPreferences: ['foodie tours', 'live music'],
    },
  });

  console.log('Created users:', { alice, bob, charlie, david, eve });

  // --- Create User Preferences ---
  await prisma.userPreferences.create({
    data: {
      userId: alice.id,
      activityPreferences: ['hiking', 'camping', 'kayaking'],
      budgetRange: 'medium',
      travelStyle: ['adventure', 'nature'],
      dietaryRestrictions: ['vegetarian'],
    },
  });

  await prisma.userPreferences.create({
    data: {
      userId: bob.id,
      budgetRange: 'high',
      travelStyle: ['relaxation', 'luxury'],
      preferredTransportation: ['rental car', 'ride share'],
    },
  });
  console.log('Created user preferences.');

  // --- Create Locations ---
  const yosemite = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJLeS4Wj_olIARa22aFugrlsM',
      name: 'Yosemite National Park',
      address: 'Yosemite National Park, California',
      image: 'https://www.nps.gov/yose/planyourvisit/images/20170618_155334.jpg',
    },
  });

  const napa = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJd_33y21-hYARg91i02m3_SA',
      name: 'Napa Valley',
      address: 'Napa, CA',
      image: 'https://www.napavalley.com/images/fall-mustard-vines-v-sattui-winery-1.jpg',
    },
  });

  const sanFrancisco = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
      name: 'San Francisco',
      address: 'San Francisco, CA',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    },
  });

  console.log('Created locations:', { yosemite, napa, sanFrancisco });

  // --- Create a Trip ---
  const roadTrip = await prisma.trip.create({
    data: {
      title: 'California Adventure Road Trip',
      description: 'An epic road trip through some of California\'s most iconic spots.',
      tripImage: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934',
      private: false,
      status: 'PLANNING',
      hostId: alice.id,
      locations: {
        connect: [{ id: yosemite.id }, { id: napa.id }],
      },
    },
  });
  console.log('Created trip:', roadTrip);

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
