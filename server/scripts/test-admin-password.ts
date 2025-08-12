import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";
import { comparePassword, hashPassword } from "../lib/auth";

async function testAdminPassword() {
  try {
    await connectToDatabase();
    
    const venuebookAdmin = await User.findOne({ email: 'admin@venuebook.com' });
    if (!venuebookAdmin) {
      console.log('❌ VenueBook admin does not exist');
      return;
    }
    
    console.log('✅ VenueBook admin found:', { 
      email: venuebookAdmin.email, 
      isAdmin: venuebookAdmin.isAdmin 
    });
    
    // Test password with "admin123"
    const testPassword = "admin123";
    console.log('🔐 Testing password:', testPassword);
    
    const isValid = await comparePassword(testPassword, venuebookAdmin.password);
    console.log('✅ Password valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Password is incorrect. Updating admin password...');
      const newHashedPassword = await hashPassword(testPassword);
      venuebookAdmin.password = newHashedPassword;
      await venuebookAdmin.save();
      console.log('✅ Admin password updated successfully');
      
      // Test again
      const retestValid = await comparePassword(testPassword, venuebookAdmin.password);
      console.log('✅ Password retest valid:', retestValid);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing admin password:', error);
    process.exit(1);
  }
}

testAdminPassword();
