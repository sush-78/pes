import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Enrollment } from './models/Enrollment.js';
import { Examination } from './models/Examination.js';
import { Document } from './models/Document.js';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { Course } from './models/Course.js';
import { Batch } from './models/Batch.js';
import './models/UIDMap.js'; // Ensure UIDMap is registered for PeerEvaluation
import bcrypt from 'bcryptjs';

async function seedStudent7() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB');

    // 2. Get Exam (Anomaly Test)
    const exam = await Examination.findOne({ name: 'Anomaly Test - Multiple Students' });
    if (!exam) {
      console.error('Exam not found');
      return;
    }
    const batchId = exam.batch;

    // Get Course from Student 1 Enrollment
    const student1 = await User.findOne({ email: 'student1@test.com' });
    const s1Enrollment = await Enrollment.findOne({ student: student1._id });
    const courseId = s1Enrollment.course;

    // 1. Create Student 7
    const hashedPassword = await bcrypt.hash('password123', 10);
    let student7 = await User.findOne({ email: 'student7@test.com' });
    if (!student7) {
      student7 = new User({
        name: 'Student 7',
        email: 'student7@test.com',
        username: 'student7',
        password: hashedPassword,
        role: 'student',
        batchId: 'B-2024-CSE-01' // String
      });
      await student7.save();
      console.log('Student 7 created');
    }

    // 3. Enroll Student 7
    const existingEnrollment = await Enrollment.findOne({ student: student7._id, course: courseId });
    if (!existingEnrollment) {
      await new Enrollment({
        student: student7._id,
        batch: batchId,
        course: courseId,
      }).save();
      console.log('Student 7 enrolled');
    } else {
        console.log('Student 7 already enrolled');
    }

    // 4. Upload Document for Student 7
    let doc = await Document.findOne({ uploadedBy: student7._id, examId: exam._id });
    if (!doc) {
      doc = new Document({
        uploadedBy: student7._id,
        examId: exam._id,
        uniqueId: `student7_submission_${Date.now()}`,
        documentPath: 'uploads/student7_submission.pdf'
      });
      await doc.save();
      console.log('Document uploaded for Student 7');
    } else {
        console.log('Document already exists for Student 7');
    }

    // 5. Create Evaluations for Student 7
    const student2 = await User.findOne({ email: 'student2@test.com' });
    const student5 = await User.findOne({ email: 'student5@test.com' });
    const student4 = await User.findOne({ email: 'student4@test.com' });

    // Helper to create completed eval
    const createEval = async (evaluator, score, avg, dev, status) => {
      const existing = await PeerEvaluation.findOne({ evaluator: evaluator._id, student: student7._id, exam: exam._id });
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
        student: student7._id,
        exam: exam._id,
        document: doc._id,
        uid: new mongoose.Types.ObjectId(),
        score: [score, 0, 0], // Simplification
        feedback: ['Needs improvement', '', ''],
        eval_status: 'completed',
        status: status,
        deviation: dev,
        peerAverage: avg,
        evaluated_by: evaluator._id
      });
      await newEval.save();
      console.log(`Evaluation from ${evaluator.name} created (${status})`);
    };

    // Avg of others for standard scores: (70+72)/2 = 71 | Dev: |75-71|=4 (Normal)
    await createEval(student1, 75, 71, 4, 'Normal');
    
    // Avg of others: (75+72)/2 = 73.5 | Dev: |70-73.5|=3.5 (Normal)
    await createEval(student2, 70, 73.5, 3.5, 'Normal');
    
    // Avg of others: (75+70)/2 = 72.5 | Dev: |72-72.5|=0.5 (Normal)
    await createEval(student5, 72, 72.5, 0.5, 'Normal');

    // Case: Student 4 gives a very high score
    // Avg of others: (75+70+72)/3 = 72.33 | Dev: |100-72.33|=27.67 (Needs Review)
    await createEval(student4, 100, 72.33, 27.67, 'Needs Review');

    console.log('\nSeed complete! Student 7 now has 4 evaluations.');
    console.log('One from Student 4 is flagged as "Needs Review" due to high deviation (High score anomaly).');

    await mongoose.disconnect();
  } catch (err) {
    import('fs').then(fs => fs.writeFileSync('err.json', JSON.stringify(err, Object.getOwnPropertyNames(err))));
    console.error(err);
    process.exit(1);
  }
}

seedStudent7();
