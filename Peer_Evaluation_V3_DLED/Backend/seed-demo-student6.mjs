import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Enrollment } from './models/Enrollment.js';
import { Examination } from './models/Examination.js';
import { Document } from './models/Document.js';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { Course } from './models/Course.js';
import { Batch } from './models/Batch.js';
import bcrypt from 'bcryptjs';

async function seedStudent6() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB');

    // 2. Get Exam (Assessment)
    const exam = await Examination.findOne({ name: 'Assessment' });
    if (!exam) {
      console.error('Exam not found');
      return;
    }
    const batchId = exam.batch;

    // Get Course from Student 1 Enrollment
    const student1 = await User.findOne({ email: 'student1@test.com' });
    const s1Enrollment = await Enrollment.findOne({ student: student1._id });
    const courseId = s1Enrollment.course;

    // 1. Create Student 6
    const hashedPassword = await bcrypt.hash('password123', 10);
    let student6 = await User.findOne({ email: 'student6@test.com' });
    if (!student6) {
      student6 = new User({
        name: 'Student 6',
        email: 'student6@test.com',
        username: 'student6',
        password: hashedPassword,
        role: 'student',
        batchId: 'B-2024-CSE-01' // String
      });
      await student6.save();
      console.log('Student 6 created');
    }

    // 3. Enroll Student 6
    const existingEnrollment = await Enrollment.findOne({ student: student6._id, course: courseId });
    if (!existingEnrollment) {
      await new Enrollment({
        student: student6._id,
        batch: batchId,
        course: courseId,
      }).save();
      console.log('Student 6 enrolled');
    } else {
        console.log('Student 6 already enrolled');
    }

    // 4. Upload Document for Student 6
    let doc = await Document.findOne({ uploadedBy: student6._id, examId: exam._id });
    if (!doc) {
      doc = new Document({
        uploadedBy: student6._id,
        examId: exam._id,
        uniqueId: 'ST6-' + Date.now(),
        documentPath: 'uploads/student6_submission.pdf'
      });
      await doc.save();
      console.log('Document uploaded for Student 6');
    } else {
        console.log('Document already exists for Student 6');
    }

    // 5. Create Evaluations for Student 6
    const student2 = await User.findOne({ email: 'student2@test.com' });
    const student5 = await User.findOne({ email: 'student5@test.com' });
    const student4 = await User.findOne({ email: 'student4@test.com' });

    // Helper to create completed eval
    const createEval = async (evaluator, score, avg, dev, status) => {
      const existing = await PeerEvaluation.findOne({ evaluator: evaluator._id, student: student6._id, exam: exam._id });
      if (existing) {
            existing.score = [score, 0, 0];
            existing.eval_status = 'completed';
            existing.status = status;
            existing.deviation = dev;
            existing.peerAverage = avg;
            await existing.save();
            console.log(`Evaluation from ${evaluator.name} updated (${status})`);
            return;
      }

      const newEval = new PeerEvaluation({
        evaluator: evaluator._id,
        student: student6._id,
        exam: exam._id,
        document: doc._id,
        uid: new mongoose.Types.ObjectId(),
        score: [score, 0, 0], // Simplification
        feedback: ['Excellent work', '', ''],
        eval_status: 'completed',
        status: status,
        deviation: dev,
        peerAverage: avg,
        evaluated_by: evaluator._id
      });
      await newEval.save();
      console.log(`Evaluation from ${evaluator.name} created (${status})`);
    };

    // Avg of others for high scorers: (90+88)/2 = 89 | Dev: |85-89|=4 (Normal)
    await createEval(student1, 85, 89, 4, 'Normal');
    
    // Avg of others: (85+88)/2 = 86.5 | Dev: |90-86.5|=3.5 (Normal)
    await createEval(student2, 90, 86.5, 3.5, 'Normal');
    
    // Avg of others: (85+90)/2 = 87.5 | Dev: |88-87.5|=0.5 (Normal)
    await createEval(student5, 88, 87.5, 0.5, 'Normal');

    // Case: Student 4 gives a very low score
    // Avg of others: (85+90+88)/3 = 87.66 | Dev: |50-87.66|=37.66 (Needs Review)
    await createEval(student4, 50, 87.66, 37.66, 'Needs Review');

    console.log('\nSeed complete! Student 6 now has 4 evaluations.');
    console.log('One from Student 4 is flagged as "Needs Review" due to high deviation.');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedStudent6();
