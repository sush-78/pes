import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Batch } from './models/Batch.js';
import { Examination } from './models/Examination.js';
import { Enrollment } from './models/Enrollment.js';
import { Document } from './models/Document.js';
import { UIDMap } from './models/UIDMap.js';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { submitEvaluation } from './controllers/studentController.js';

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Simulating Student Evaluation Submission ---');

        // 1. Find User (Test Student)
        const student = await User.findOne({ email: 'student@test.com' });
        if (!student) throw new Error('Student not found');

        // 2. Find Pending Evaluation for "Peer Student" (Student B)
        // From seed.js: Student B's name is "Peer Student"
        const studentB = await User.findOne({ name: 'Peer Student' });
        const evalTask = await PeerEvaluation.findOne({ 
            evaluator: student._id, 
            student: studentB._id, 
            eval_status: 'pending' 
        });

        if (!evalTask) {
            console.log('No pending evaluation found. Maybe it was already submitted?');
            process.exit(0);
        }

        console.log(`Found evaluation task ID: ${evalTask._id}`);
        console.log(`Evaluating Peer Student (Document ID: ${evalTask.document})`);

        // 3. Mock Request and Response for submitEvaluation
        const req = {
            user: { _id: student._id },
            body: {
                evaluationId: evalTask._id.toString(),
                examId: evalTask.exam.toString(),
                marks: [12, 12, 12, 12, 12], // Total 60
                feedback: ["Nice", "Ok", "Good", "Fine", "Decent"]
            }
        };

        const res = {
            status: (code) => {
                const statusObj = {
                    json: (data) => {
                        console.log('\n--- API Response ---');
                        console.log(`HTTP Status: ${code}`);
                        console.log(JSON.stringify(data, null, 2));
                        console.log('--------------------');
                        
                        if (data.status === 'Needs Review') {
                            console.log('\n🎉 SUCCESS: Anomaly detected! Status changed to "Needs Review".');
                            console.log(`Deviation detected: ${data.deviation} (Average was 85, Current is 60)`);
                        } else {
                            console.log('\n❌ FAILED: Anomaly not detected as expected.');
                        }
                        process.exit(0);
                    }
                };
                return statusObj;
            }
        };

        console.log('\nSubmitting scores: [12, 12, 12, 12, 12] (Total: 60)');
        await submitEvaluation(req, res);

    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
};

runTest();
