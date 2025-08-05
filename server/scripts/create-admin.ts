import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";
import { hashPassword } from "../lib/auth";

async function createAdminUser() {
  try {
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@venuebook.com',
      password: await hashPassword('admin123'), // Change this password!
      organization: 'VenueBook Administration',
      isAdmin: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the admin password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
