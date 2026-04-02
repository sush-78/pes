import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Batch } from './models/Batch.js';
import { Examination } from './models/Examination.js';
import { Enrollment } from './models/Enrollment.js';
import { Document } from './models/Document.js';
import { UIDMap } from './models/UIDMap.js';
import { PeerEvaluation } from './models/PeerEvaluation.js';

dotenv.config();

const setupRichTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected for rich seeding...');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Batch.deleteMany({});
    await Examination.deleteMany({});
    await Enrollment.deleteMany({});
    await Document.deleteMany({});
    await UIDMap.deleteMany({});
    await PeerEvaluation.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Teacher
    const teacher = await User.create({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      password: hashedPassword,
      role: 'teacher',
      isVerified: true
    });

    // 2. Create 5 Students
    const students = [];
    for (let i = 1; i <= 5; i++) {
        students.push(await User.create({
            name: `Student ${i}`,
            email: `student${i}@test.com`,
            password: hashedPassword,
            role: 'student',
            isVerified: true
        }));
    }

    // 3. Setup Course and Batch
    const course = await Course.create({ courseId: 'CS101', courseName: 'Full Stack Dev' });
    const batch = await Batch.create({ batchId: 'BATCH-2026', instructor: teacher._id, course: course._id });

    // 4. Enroll Students
    for (const student of students) {
        await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });
    }

    // 5. Create Exam
    const exam = await Examination.create({
      name: 'Anomaly Test - Multiple Students',
      batch: batch._id,
      date: new Date(),
      time: '12:00 PM',
      number_of_questions: 5,
      duration: 60,
      totalMarks: 100,
      k: 3,
      total_students: 5,
      createdBy: teacher._id,
      completed: false,
      evaluations_sent: true,
      flags: true
    });

    // 6. Each student submits a document
    const docs = [];
    for (let i = 0; i < 5; i++) {
        const student = students[i];
        const doc = await Document.create({
            uniqueId: `DOC-${i+1}`,
            examId: exam._id,
            uploadedBy: student._id,
            documentPath: `uploads/answer-${i+1}.pdf`
        });
        const uid = await UIDMap.create({
            uniqueId: `UID-K-${i+1}`,
            userId: student._id,
            examId: exam._id
        });
        docs.push({ doc, uid, student });
    }

    // 7. Data Scenario for Document 1 (Student 1's submission)
    // We want some completed evaluations and one flagged anomaly.
    
    // Evaluation 1 for Doc 1 (by Student 2) - NORMAL (Score: 80)
    await PeerEvaluation.create({
      evaluator: students[1]._id,
      student: students[0]._id,
      exam: exam._id,
      document: docs[0].doc._id,
      uid: docs[0].uid._id,
      score: [15, 15, 20, 20, 10], // 80 Total
      feedback: ["Good", "Ok", "Great", "Nice", "Fair"],
      eval_status: 'completed',
      status: 'Normal',
      deviation: 0
    });

    // Evaluation 2 for Doc 1 (by Student 3) - NORMAL (Score: 84)
    await PeerEvaluation.create({
      evaluator: students[2]._id,
      student: students[0]._id,
      exam: exam._id,
      document: docs[0].doc._id,
      uid: docs[0].uid._id,
      score: [16, 16, 20, 20, 12], // 84 Total
      feedback: ["Ok", "Ok", "Great", "Nice", "Fair"],
      eval_status: 'completed',
      status: 'Normal',
      deviation: 0
    });

    // At this point, Avg = (80 + 84) / 2 = 82
    
    // Evaluation 3 for Doc 1 (by Student 4) - ANOMALY (Score: 60)
    // Deviation = 82 - 60 = 22 (> 15 threshold)
    await PeerEvaluation.create({
      evaluator: students[3]._id,
      student: students[0]._id,
      exam: exam._id,
      document: docs[0].doc._id,
      uid: docs[0].uid._id,
      score: [10, 10, 15, 15, 10], // 60 Total
      feedback: ["Poor", "Needs improvement", "Fair", "Ok", "Bad"],
      eval_status: 'completed',
      status: 'Needs Review',
      deviation: 22
    });

    // 8. Other evaluations to fill the quota
    // We'll leave one pending for Student 5 to evaluate Student 1
    await PeerEvaluation.create({
      evaluator: students[4]._id,
      student: students[0]._id,
      exam: exam._id,
      document: docs[0].doc._id,
      uid: docs[0].uid._id,
      eval_status: 'pending'
    });

    console.log('\n--- Rich Seeding Complete ---');
    console.log('Test Teacher: teacher@test.com / password123');
    console.log('Students: student1@test.com ... student5@test.com (All password123)');
    console.log('\nScenario Summary:');
    console.log('- Exam: Anomaly Test - Multiple Students');
    console.log('- 5 Students enrolled, all submitted documents.');
    console.log('- Student 1\'s document has 3 completed evaluations.');
    console.log('- Evaluation by Student 4 IS AN ANOMALY (Status: Needs Review, Deviation: 22).');
    console.log('- Student 5 has a pending evaluation for Student 1.');
    console.log('----------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

setupRichTestData();
