const { PrismaClient, RSVPStatus, TripStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data to prevent unique constraint errors
  await prisma.tripRSVP.deleteMany();
  await prisma.tripCoHost.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.pollResponse.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.proposedGuest.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();

  // --- 1. Create Users ---
  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      id: 'user_1',
      email: 'alice@example.com',
      name: 'Alice',
      phoneNumber: '1112223333',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user_2',
      email: 'bob@example.com',
      name: 'Bob',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user_3',
      email: 'charlie@example.com',
      name: 'Charlie',
    },
  });

  // ADDED: user4 and user5
  const user4 = await prisma.user.create({
    data: {
      id: 'user_4',
      email: 'diana@example.com',
      name: 'Diana',
      phoneNumber: '4445556666',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      id: 'user_5',
      email: 'eve@example.com',
      name: 'Eve',
    },
  });


  // --- 2. Create Locations ---
  console.log('Creating locations...');
  const locationSF = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
      name: 'San Francisco',
      address: 'San Francisco, CA, USA',
      latitude: 37.7749,
      longitude: -122.4194,
      types: ['locality', 'political'],
    },
  });

  const locationLA = await prisma.location.create({
    data: {
      googlePlaceId: 'ChIJE9on3F3HwoAR9AhGJW_fL-I',
      name: 'Los Angeles',
      address: 'Los Angeles, CA, USA',
      latitude: 34.0522,
      longitude: -118.2437,
      types: ['locality', 'political'],
    },
  });

  // --- 3. Create a Trip with Nested Relations ---
  console.log('Creating a trip with nested data...');
  const trip1 = await prisma.trip.create({
    data: {
      title: 'California Road Trip',
      description: 'An epic road trip from SF to LA.',
      city: 'California',
      status: TripStatus.PLANNING,
      host: { connect: { id: user1.id } },
      locations: { connect: [{ id: locationSF.id }, { id: locationLA.id }] },
      guestList: {
        createMany: {
          data: [
            { email: 'guest1@example.com', name: 'Guest One' },
            { email: 'guest2@example.com', name: 'Guest Two' },
          ],
        },
      },
      coHosts: {
        create: { user: { connect: { id: user2.id } } },
      },
      rsvps: {
        create: [
          { user: { connect: { id: user2.id } }, status: RSVPStatus.YES },
          { user: { connect: { id: user3.id } }, status: RSVPStatus.MAYBE },
        ],
      },
      comments: {
        create: {
          text: 'This is going to be so much fun!',
          author: { connect: { id: user2.id } },
          location: { connect: { id: locationSF.id } },
        },
      },
      polls: {
        create: {
          question: 'What should we eat for dinner on the first night?',
          options: ['Pizza', 'Tacos', 'Sushi'],
          responses: {
            create: [
              { user: { connect: { id: user1.id } }, option: 'Tacos' },
              { user: { connect: { id: user2.id } }, option: 'Tacos' },
              { user: { connect: { id: user3.id } }, option: 'Sushi' },
            ],
          },
        },
      },
    },
  });

  // --- 4. Create User Preferences for ALL users ---
  console.log('Creating user preferences...');
  // Preferences for Alice
  await prisma.userPreferences.create({
    data: {
      user: { connect: { id: user1.id } },
      age: 30,
      dietaryRestrictions: ['Vegetarian'],
      location: 'San Francisco',
      activityPreferences: ['hiking', 'museums', 'reading'],
      budget: '3',
      travelStyle: ['Relaxing', 'Cultural'],
    },
  });
  // Preferences for Bob
  await prisma.userPreferences.create({
    data: {
      user: { connect: { id: user2.id } },
      age: 25,
      activityPreferences: ['concerts', 'dining out', 'nightlife'],
      budget: '4',
      travelStyle: ['Adventurous', 'Spontaneous'],
      preferredTransportation: ['Rideshare'],
    },
  });
  // Preferences for Charlie
  await prisma.userPreferences.create({
    data: {
      user: { connect: { id: user3.id } },
      age: 42,
      dietaryRestrictions: ['Gluten-Free'],
      activityPreferences: ['sightseeing', 'photography'],
      budget: '2',
      travelStyle: ['Family-Friendly', 'Planned'],
    },
  });
  // Preferences for Diana
  await prisma.userPreferences.create({
    data: {
      user: { connect: { id: user4.id } },
      age: 28,
      activityPreferences: ['shopping', 'spa', 'beach'],
      budget: '4',
      travelStyle: ['Luxury', 'Relaxing'],
      accessibilityNeeds: ['Wheelchair accessible venues'],
    },
  });
  // Preferences for Eve
  await prisma.userPreferences.create({
    data: {
      user: { connect: { id: user5.id } },
      age: 35,
      activityPreferences: ['hiking', 'camping', 'nature'],
      budget: '1',
      travelStyle: ['Budget-Friendly', 'Adventurous'],
    },
  });


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