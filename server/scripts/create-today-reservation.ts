import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";

async function createTodayReservation() {
  try {
    await connectToDatabase();
    
    // Get test user
    const testUser = await User.findOne({ email: 'user@test.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    const today = new Date();
    console.log('Creating reservation for today:', today.toDateString());

    // Create a reservation for business hours to test
    const startTime = '10:00';
    const endTime = '11:00';

    const todayReservation = {
      userId: testUser._id,
      venue: 'Meeting Room 1',
      purpose: 'Testing Venue Availability',
      date: today,
      startTime: startTime,
      endTime: endTime,
      participantCount: 5,
      organizerName: 'Test User',
      organizerOrganization: 'Test Org',
      status: 'confirmed' as const
    };

    // Check if similar reservation already exists
    const existingReservation = await Reservation.findOne({
      venue: 'Meeting Room 1',
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (!existingReservation) {
      const reservation = new Reservation(todayReservation);
      await reservation.save();
      console.log('✅ Today reservation created:', 'Meeting Room 1', `${startTime}-${endTime}`);
    } else {
      console.log('ℹ️  Reservation already exists for Meeting Room 1 today');
    }

    // List all reservations to verify
    const allReservations = await Reservation.find({}).sort({ date: 1 });
    console.log('\n📋 All reservations in database:');
    allReservations.forEach(r => {
      console.log(`- ${r.venue}: ${r.date.toDateString()} ${r.startTime}-${r.endTime} (${r.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating today reservation:', error);
    process.exit(1);
  }
}

createTodayReservation();
