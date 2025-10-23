import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';

// Load environment variables
dotenv.config();

const clearUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearUsers();
