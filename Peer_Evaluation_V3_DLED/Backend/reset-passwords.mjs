import mongoose from 'mongoose';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Update ALL users to have the same password and be verified for easy testing
    const result = await User.updateMany(
      {}, 
      { $set: { password: hashedPassword, isVerified: true } }
    );
    
    console.log(`Successfully reset ${result.modifiedCount} accounts.`);
    console.log('Credentials: password123 for all users.');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();
