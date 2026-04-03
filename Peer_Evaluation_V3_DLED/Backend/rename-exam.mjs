import mongoose from 'mongoose';
import { Examination } from './models/Examination.js';
import dotenv from 'dotenv';
dotenv.config();

async function renameExam() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB');

    const result = await Examination.updateOne(
      { name: "Anomaly Test - Multiple Students" },
      { $set: { name: "Assessment" } }
    );

    if (result.matchedCount > 0) {
      console.log('Successfully renamed exam to Assessment');
    } else {
      console.log('No exam found with that name. Checking all exams:');
      const all = await Examination.find({});
      all.forEach(e => console.log(`- ${e.name}`));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

renameExam();
