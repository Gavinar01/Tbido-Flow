import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User, IUser } from "../models/User";
import { Reservation } from "../models/Reservation";
import { hashPassword } from "../lib/auth";

async function createTestData() {
  try {
    await connectToDatabase();
    
    // Create a test user
    const testUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@test.com',
      password: await hashPassword('test123'),
      organization: 'Test Organization',
      isAdmin: false
    };

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUserData.email });
    let testUser: IUser;
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      testUser = existingUser;
    } else {
      testUser = new User(testUserData);
      await testUser.save();
      console.log('✅ Test user created:', testUser.email);
    }

    // Create some test reservations
    const testReservations = [
      {
        userId: testUser._id,
        venue: 'Conference Room A',
        purpose: 'Weekly Team Meeting',
        date: new Date('2024-02-15'),
        startTime: '09:00',
        endTime: '10:00',
        participantCount: 8,
        organizerName: 'John Doe',
        organizerOrganization: 'Test Organization',
        status: 'confirmed' as const
      },
      {
        userId: testUser._id,
        venue: 'Main Auditorium',
        purpose: 'Product Presentation',
        date: new Date('2024-02-20'),
        startTime: '14:00',
        endTime: '16:00',
        participantCount: 15,
        organizerName: 'John Doe',
        organizerOrganization: 'Test Organization',
        status: 'confirmed' as const
      }
    ];

    for (const reservationData of testReservations) {
      // Check if reservation already exists
      const existingReservation = await Reservation.findOne({
        userId: testUser._id,
        venue: reservationData.venue,
        date: reservationData.date
      });

      if (!existingReservation) {
        const reservation = new Reservation(reservationData);
        await reservation.save();
        console.log('✅ Test reservation created:', reservationData.venue, reservationData.date.toDateString());
      } else {
        console.log('ℹ️  Test reservation already exists:', reservationData.venue);
      }
    }

    console.log('\n🎯 Test Credentials:');
    console.log('📧 Email: user@test.com');
    console.log('🔑 Password: test123');
    console.log('\n🎯 Admin Credentials:');
    console.log('📧 Email: admin@venuebook.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
