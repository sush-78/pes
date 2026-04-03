import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('name email role');
    console.log('All Users:');
    users.forEach(u => console.log(`- ${u.name} | ${u.email} | Role: ${u.role}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllUsers();
