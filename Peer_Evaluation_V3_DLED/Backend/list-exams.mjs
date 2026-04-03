import mongoose from 'mongoose';
import { Examination } from './models/Examination.js';
import dotenv from 'dotenv';
dotenv.config();

async function listExams() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ProjectPES');
    console.log('Connected to MongoDB');

    const exams = await Examination.find({}).select('name _id');
    console.log('Existing Exams:');
    exams.forEach(ex => console.log(`- ${ex.name} (ID: ${ex._id})`));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listExams();
