import "dotenv/config";
import { connectToDatabase } from "../lib/database";
import { User } from "../models/User";

async function checkAdmins() {
  try {
    await connectToDatabase();
    
    const admins = await User.find({ isAdmin: true });
    console.log('All admin users:', admins.map(u => ({ 
      email: u.email, 
      id: u._id, 
      isAdmin: u.isAdmin 
    })));
    
    const venuebookAdmin = await User.findOne({ email: 'admin@venuebook.com' });
    if (venuebookAdmin) {
      console.log('VenueBook admin exists:', { 
        email: venuebookAdmin.email, 
        isAdmin: venuebookAdmin.isAdmin 
      });
    } else {
      console.log('VenueBook admin does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admins:', error);
    process.exit(1);
  }
}

checkAdmins();
