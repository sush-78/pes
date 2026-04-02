import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { Course } from './models/Course.js';
import { Batch } from './models/Batch.js';
import { Examination } from './models/Examination.js';
import { Enrollment } from './models/Enrollment.js';
import { Document } from './models/Document.js';
import { UIDMap } from './models/UIDMap.js';
import { submitEvaluation } from './controllers/studentController.js';

dotenv.config();

const simulate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Simulating Live Submission from Student 5 ---');

        // 1. Find Student 5
        const student5 = await User.findOne({ email: 'student5@test.com' });
        if (!student5) throw new Error('Student 5 not found');

        // 2. Find Pending Evaluation for Student 1
        const student1 = await User.findOne({ name: 'Student 1' });
        const evalTask = await PeerEvaluation.findOne({ 
            evaluator: student5._id, 
            student: student1._id, 
            eval_status: 'pending' 
        });

        if (!evalTask) {
            console.log('No pending evaluation found for Student 5 evaluating Student 1.');
            process.exit(0);
        }

        console.log(`Found evaluation task ID: ${evalTask._id}`);
        console.log(`Evaluating Student 1 (Submission ID: ${evalTask.document})`);

        // 3. Mock Request and Response
        const req = {
            user: { _id: student5._id },
            body: {
                evaluationId: evalTask._id.toString(),
                examId: evalTask.exam.toString(),
                marks: [15, 15, 15, 15, 15], // Total 75
                feedback: ["Good", "Nice", "Ok", "Fine", "Decent"]
            }
        };

        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log('\n--- API Response for Student 5 ---');
                    console.log(`Status: ${data.status}`);
                    console.log(`Deviation: ${data.deviation}`);
                    console.log(`Message: ${data.message}`);
                    
                    if (data.status === 'Normal') {
                        console.log('\n✅ SUCCESS: Submission is "Normal" as it is close to the updated average.');
                    } else {
                        console.log('\n⚠️ Flagged: Submission detected as anomaly.');
                    }
                    process.exit(0);
                }
            })
        };

        console.log('\nSubmitting score: 75');
        await submitEvaluation(req, res);

    } catch (error) {
        console.error('Error during simulation:', error);
        process.exit(1);
    }
};

simulate();
