import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { Examination } from './models/Examination.js';
import { TeacherController } from './controllers/teacherController.js'; // Not possible directly
import { fetch } from 'node-fetch'; // Not available

dotenv.config();

// We'll simulate the getResultsAnalytics logic here
const verifyAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const exam = await Examination.findOne({ name: 'Anomaly Test - Multiple Students' });
        if (!exam) {
            console.log('Exam not found!');
            process.exit(1);
        }

        const evaluations = await PeerEvaluation.find({ exam: exam._id });
        
        let completed = 0, pending = 0, flagged = 0;
        evaluations.forEach(ev => {
            if (ev.eval_status === "completed" && ev.ticket === 0) completed += 1;
            else if (ev.eval_status === "pending" && ev.ticket === 0) pending += 1;
            
            // This is the logic I fixed in teacherController.js
            if (ev.ticket === 1 || ev.ticket === 2 || ev.status === "Needs Review") {
                flagged += 1;
            }
        });

        console.log(`Exam: ${exam.name}`);
        console.log(`Total Evaluations: ${evaluations.length}`);
        console.log(`Stats -> Completed: ${completed}, Pending: ${pending}, Flagged: ${flagged}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyAnalytics();
