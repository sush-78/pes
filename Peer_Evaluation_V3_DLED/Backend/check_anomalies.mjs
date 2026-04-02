import mongoose from 'mongoose';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { User } from './models/User.js';

async function checkAnomalies() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB\n');

    const evals = await PeerEvaluation.find({ eval_status: 'completed' })
      .populate('evaluator', 'name email')
      .populate('student', 'name email');

    console.log('--- ALL COMPLETED EVALUATIONS ---');
    evals.forEach(e => {
      const totalScore = e.score.reduce((a, b) => a + b, 0);
      console.log(`Evaluator: ${e.evaluator.name} | Student: ${e.student.name} | Total Score: ${totalScore} | Status: ${e.status} | Deviation: ${e.deviation.toFixed(2)}`);
    });

    console.log('\n--- BREAKDOWN BY EVALUATED STUDENT ---');
    const studentIds = [...new Set(evals.map(e => e.student._id.toString()))];
    
    for (const studentId of studentIds) {
      const studentEvals = evals.filter(e => e.student._id.toString() === studentId);
      const studentName = studentEvals[0].student.name;
      const totalMarks = studentEvals.map(e => e.score.reduce((a, b) => a + b, 0));
      
      // Calculate average of OTHERS for each evaluation to see how the system flagged it
      console.log(`\nStudent: ${studentName}`);
      
      for (let i = 0; i < studentEvals.length; i++) {
        const currentEval = studentEvals[i];
        const currentScore = totalMarks[i];
        
        // Others for THIS specific evaluation
        const otherScores = totalMarks.filter((_, idx) => idx !== i);
        const avgOthers = otherScores.length > 0 ? otherScores.reduce((a, b) => a + b, 0) / otherScores.length : currentScore;
        const devFromOthers = Math.abs(currentScore - avgOthers);
        
        console.log(`  - From ${currentEval.evaluator.name}: Score ${currentScore} | Dev from Others: ${devFromOthers.toFixed(2)} | Status: ${currentEval.status}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAnomalies();
