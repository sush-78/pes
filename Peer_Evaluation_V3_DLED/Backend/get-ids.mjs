import mongoose from 'mongoose';
import { Enrollment } from './models/Enrollment.js';
import { User } from './models/User.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/pes');
  const s1 = await User.findOne({ email: 'student1@test.com' });
  const e = await Enrollment.findOne({ student: s1._id });
  console.log('batch:', e.batch, 'course:', e.course);
  mongoose.disconnect();
}
run();
