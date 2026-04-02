import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { Examination } from './models/Examination.js';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Batch } from './models/Batch.js';
import { Enrollment } from './models/Enrollment.js';
import { Document } from './models/Document.js';
import { UIDMap } from './models/UIDMap.js';

dotenv.config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const exam = await Examination.findOne({ name: 'Anomaly Test - Multiple Students' });
    if (!exam) {
      console.log('Exam not found! Run full-seed first.');
      process.exit(1);
    }

    const flagged = await PeerEvaluation.find({
      exam: exam._id,
      $or: [
        { ticket: 2 },
        { status: "Needs Review" }
      ]
    }).populate('exam student evaluator document');

    console.log(`Exam ID: ${exam._id}`);
    console.log(`Flagged Count: ${flagged.length}`);
    if (flagged.length > 0) {
      flagged.forEach((f, i) => {
        console.log(`[${i+1}] Evaluator: ${f.evaluator?.name}, Student: ${f.student?.name}, Status: ${f.status}, Ticket: ${f.ticket}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

verify();
