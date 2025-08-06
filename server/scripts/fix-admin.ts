import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";
import { hashPassword } from "../lib/auth";

async function fixAdminUser() {
  try {
    await connectToDatabase();
    
    // First, let's see what admin users exist
    const existingAdmins = await User.find({ isAdmin: true });
    console.log('Existing admin users:', existingAdmins.map(u => ({ email: u.email, id: u._id })));
    
    // Check if our desired admin exists
    const desiredAdmin = await User.findOne({ email: 'admin@venuebook.com' });
    if (desiredAdmin) {
      // Update existing user to be admin
      desiredAdmin.isAdmin = true;
      await desiredAdmin.save();
      console.log('✅ Updated existing user to admin:', desiredAdmin.email);
    } else {
      // Create new admin user
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@venuebook.com',
        password: await hashPassword('admin123'),
        organization: 'VenueBook Administration',
        isAdmin: true
      };

      const admin = new User(adminData);
      await admin.save();
      console.log('✅ New admin user created:', admin.email);
    }

    // Also check if the cybernest admin should be updated
    const cybernestAdmin = await User.findOne({ email: 'admin@cybernest.com' });
    if (cybernestAdmin) {
      cybernestAdmin.email = 'admin@venuebook.com';
      cybernestAdmin.isAdmin = true;
      await cybernestAdmin.save();
      console.log('✅ Updated cybernest admin email to:', cybernestAdmin.email);
    }
    
    console.log('\n📧 Admin Email: admin@venuebook.com');
    console.log('🔑 Admin Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
    process.exit(1);
  }
}

fixAdminUser();
