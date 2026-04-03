import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB');

    const users = await User.find({ role: 'student' }).select('name email username');
    console.log('Registered Students:');
    users.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.username}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
