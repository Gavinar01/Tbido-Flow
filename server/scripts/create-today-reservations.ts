import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";

async function createTodayReservations() {
  try {
    await connectToDatabase();
    
    // Get test user
    const testUser = await User.findOne({ email: 'user@test.com' });
    if (!testUser) {
      console.log('❌ Test user not found. Run create-test-data script first.');
      process.exit(1);
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Create some reservations for today to demonstrate availability
    const todayReservations = [
      {
        userId: testUser._id,
        venue: 'Conference Room A',
        purpose: 'Morning Standup',
        date: today,
        startTime: '09:00',
        endTime: '09:30',
        participantCount: 6,
        organizerName: 'John Doe',
        organizerOrganization: 'Tech Team',
        status: 'confirmed' as const
      },
      {
        userId: testUser._id,
        venue: 'Conference Room B',
        purpose: 'Client Presentation',
        date: today,
        startTime: '14:00',
        endTime: '15:30',
        participantCount: 8,
        organizerName: 'Sarah Smith',
        organizerOrganization: 'Sales Team',
        status: 'confirmed' as const
      },
      {
        userId: testUser._id,
        venue: 'Main Auditorium',
        purpose: 'All Hands Meeting',
        date: today,
        startTime: '16:00',
        endTime: '17:00',
        participantCount: 20,
        organizerName: 'CEO Office',
        organizerOrganization: 'Leadership',
        status: 'confirmed' as const
      },
      {
        userId: testUser._id,
        venue: 'Board Room',
        purpose: 'Executive Review',
        date: today,
        startTime: '10:00',
        endTime: '12:00',
        participantCount: 5,
        organizerName: 'Executive Team',
        organizerOrganization: 'Leadership',
        status: 'confirmed' as const
      }
    ];

    for (const reservationData of todayReservations) {
      // Check if reservation already exists
      const existingReservation = await Reservation.findOne({
        venue: reservationData.venue,
        date: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        },
        startTime: reservationData.startTime
      });

      if (!existingReservation) {
        const reservation = new Reservation(reservationData);
        await reservation.save();
        console.log('✅ Today reservation created:', reservationData.venue, reservationData.startTime + '-' + reservationData.endTime);
      } else {
        console.log('ℹ️  Today reservation already exists:', reservationData.venue, reservationData.startTime);
      }
    }

    console.log(`\n📅 Created reservations for ${todayStr}`);
    console.log('🔄 The venue availability display will now show real-time status!');
    console.log('\n📋 Today\'s Schedule:');
    console.log('• Conference Room A: 9:00-9:30 AM (Morning Standup)');
    console.log('• Board Room: 10:00 AM-12:00 PM (Executive Review)');
    console.log('• Conference Room B: 2:00-3:30 PM (Client Presentation)');
    console.log('• Main Auditorium: 4:00-5:00 PM (All Hands Meeting)');
    console.log('\n✅ Available venues: Meeting Room 1, Meeting Room 2, Training Room, Event Hall');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating today reservations:', error);
    process.exit(1);
  }
}

createTodayReservations();
