import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { Batch } from './models/Batch.js';
import { Course } from './models/Course.js';
import { Examination } from './models/Examination.js';

dotenv.config();

const testApi = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student4 = await User.findOne({ email: 'student4@test.com' });
        
        if (!student4) {
            console.log('Student 4 not found! Run npm run full-seed first.');
            process.exit(1);
        }

        console.log(`\n--- Backend API Test for Student 4 (${student4.name}) ---`);
        
        // Find evaluations where our student is the evaluator
        const evaluations = await PeerEvaluation.find({ evaluator: student4._id })
            .populate('exam')
            .populate('document');
            
        console.log(`Total Evaluations Found: ${evaluations.length}`);
        
        evaluations.forEach((ev, i) => {
            const totalScore = Array.isArray(ev.score) ? ev.score.reduce((a,b) => a+b,0) : ev.score;
            console.log(`\n[${i+1}] Evaluation Details:`);
            console.log(`    Exam: ${ev.exam?.name || 'NULL'}`);
            console.log(`    Status: ${ev.eval_status}`);
            console.log(`    Score Given: ${totalScore}`);
            console.log(`    Validation: ${ev.status}`);
            console.log(`    Deviation: ${ev.deviation || 0}`);
            
            if (ev.status === 'Needs Review' && ev.deviation > 15) {
                console.log('    ✅ VERIFIED: Anomaly correctly flagged in DB.');
            } else if (ev.status === 'Normal') {
                console.log('    ✅ VERIFIED: Normal evaluation correctly flagged in DB.');
            }
        });

        console.log('\n--- Test Complete ---');
        process.exit(0);
    } catch (e) {
        console.error('API Test Error:', e);
        process.exit(1);
    }
};

testApi();
