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

const setupEvaluationTest = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for evaluation setup...');

    // 2. Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Batch.deleteMany({});
    await Examination.deleteMany({});
    await Enrollment.deleteMany({});
    await Document.deleteMany({});
    await UIDMap.deleteMany({});
    await PeerEvaluation.deleteMany({});
    console.log('Cleared existing data.');

    // 3. Create Hashed Password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 4. Create Users
    const teacher = await User.create({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      password: hashedPassword,
      role: 'teacher',
      isVerified: true
    });

    const studentA = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student',
      isVerified: true
    });

    const studentB = await User.create({
      name: 'Peer Student',
      email: 'peer@test.com',
      password: hashedPassword,
      role: 'student',
      isVerified: true
    });

    const student2 = await User.create({
      name: 'Test Student 2',
      email: 'student2@test.com',
      password: hashedPassword,
      role: 'student',
      isVerified: true
    });

    const studentC = await User.create({
      name: 'Other Evaluator',
      email: 'other@test.com',
      password: hashedPassword,
      role: 'student',
      isVerified: true
    });

    console.log('Created Teacher and Student accounts.');

    // 5. Create Course & Batch
    const course = await Course.create({
      courseId: 'CS101',
      courseName: 'Full Stack Web Development',
      openCourse: true
    });

    const batch = await Batch.create({
      batchId: 'BATCH-2026-A',
      instructor: teacher._id,
      course: course._id
    });
    console.log('Created Course and Batch.');

    // 6. Enroll Students
    await Enrollment.create([
      { student: studentA._id, batch: batch._id, course: course._id },
      { student: studentB._id, batch: batch._id, course: course._id },
      { student: student2._id, batch: batch._id, course: course._id },
      { student: studentC._id, batch: batch._id, course: course._id }
    ]);
    console.log('Enrolled Students.');

    // 7. Create Examination
    const exam = await Examination.create({
      name: 'Anomaly Detection Midterm',
      batch: batch._id,
      date: new Date(),
      time: '10:00 AM',
      number_of_questions: 5,
      duration: 60,
      totalMarks: 100,
      k: 3,
      total_students: 3,
      createdBy: teacher._id,
      completed: false,
      evaluations_sent: true,
      flags: true
    });
    console.log('Created Exam.');

    // 8. Create Document for Peer Student (Student B)
    const peerDoc = await Document.create({
      uniqueId: 'DOC-999',
      examId: exam._id,
      uploadedBy: studentB._id,
      documentPath: 'uploads/sample-answer.pdf'
    });

    const peerUID = await UIDMap.create({
      uniqueId: 'UID-999',
      userId: studentB._id,
      examId: exam._id
    });
    console.log('Created peer document and UID map for Student B.');

    // 9. Existing Evaluation for Peer Document (to set an average score)
    // We'll set a score that sums to 85 marks.
    await PeerEvaluation.create({
      evaluator: studentC._id,
      student: studentB._id,
      exam: exam._id,
      document: peerDoc._id,
      uid: peerUID._id,
      score: [15, 20, 20, 20, 10], // Total: 85
      feedback: ["Good", "Very Good", "Excellent", "Well done", "Average"],
      eval_status: 'completed',
      status: 'Normal',
      deviation: 0
    });
    console.log('Seeded an existing evaluation (Score: 85) for Peer B.');

    // 10. Pending Evaluation task for Test Student (Student A)
    // Test Student will evaluate Student B's document.
    await PeerEvaluation.create({
      evaluator: studentA._id,
      student: studentB._id,
      exam: exam._id,
      document: peerDoc._id,
      uid: peerUID._id,
      eval_status: 'pending'
    });
    console.log('Created pending evaluation task for Test Student.');

    console.log('\n--- Ready to Test Student Evaluation ---');
    console.log('1. Login: student@test.com / password123');
    console.log('2. Go to: "Pending Evaluations" or "My Evaluations"');
    console.log('3. Action: Submit scores for "Peer Student"');
    console.log('4. Hint: Submit a score very different from 85 (e.g., total of 60)');
    console.log('5. Result: Observe status change to "Needs Review"');
    console.log('----------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error during evaluation setup:', error);
    process.exit(1);
  }
};

setupEvaluationTest();
