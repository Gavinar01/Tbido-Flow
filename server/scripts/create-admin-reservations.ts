import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";

async function createAdminReservations() {
  try {
    await connectToDatabase();
    
    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@venuebook.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('Creating reservations for admin user:', adminUser.email);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create some reservations for the admin user
    const adminReservations = [
      {
        userId: adminUser._id,
        venue: 'Conference Room A',
        purpose: 'Admin Strategy Meeting',
        date: tomorrow,
        startTime: '14:00',
        endTime: '15:30',
        participantCount: 8,
        organizerName: 'Admin User',
        organizerOrganization: 'Flow Administration',
        status: 'confirmed' as const
      },
      {
        userId: adminUser._id,
        venue: 'Board Room',
        purpose: 'Executive Planning Session',
        date: today,
        startTime: '15:00',
        endTime: '16:00',
        participantCount: 5,
        organizerName: 'Admin User',
        organizerOrganization: 'Flow Administration',
        status: 'confirmed' as const
      }
    ];

    for (const reservationData of adminReservations) {
      // Check if similar reservation already exists
      const existingReservation = await Reservation.findOne({
        userId: adminUser._id,
        venue: reservationData.venue,
        date: {
          $gte: new Date(reservationData.date.getFullYear(), reservationData.date.getMonth(), reservationData.date.getDate()),
          $lt: new Date(reservationData.date.getFullYear(), reservationData.date.getMonth(), reservationData.date.getDate() + 1)
        }
      });

      if (!existingReservation) {
        const reservation = new Reservation(reservationData);
        await reservation.save();
        console.log('✅ Admin reservation created:', reservationData.venue, reservationData.date.toDateString(), `${reservationData.startTime}-${reservationData.endTime}`);
      } else {
        console.log('ℹ️  Admin reservation already exists:', reservationData.venue, reservationData.date.toDateString());
      }
    }

    // Show admin's reservations
    const adminReservationsList = await Reservation.find({ userId: adminUser._id }).sort({ date: 1 });
    console.log('\n📋 Admin\'s reservations:');
    adminReservationsList.forEach(r => {
      console.log(`- ${r.venue}: ${r.date.toDateString()} ${r.startTime}-${r.endTime} (${r.status})`);
    });

    console.log(`\n✅ Admin now has ${adminReservationsList.length} reservation(s)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin reservations:', error);
    process.exit(1);
  }
}

createAdminReservations();
