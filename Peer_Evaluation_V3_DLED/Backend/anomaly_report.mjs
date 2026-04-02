import mongoose from 'mongoose';
import { PeerEvaluation } from './models/PeerEvaluation.js';
import { User } from './models/User.js';

async function generateReport() {
  await mongoose.connect('mongodb://localhost:27017/pes');

  const evals = await PeerEvaluation.find({ eval_status: 'completed' })
    .populate('student', 'name')
    .populate('evaluator', 'name');

  const students = [...new Set(evals.map(e => e.student.name))];

  console.log('--- Evaluation Breakdown ---\n');

  for (const name of students) {
    const studentEvals = evals.filter(e => e.student.name === name);
    const scores = studentEvals.map(e => e.score.reduce((a, b) => a + b, 0));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    console.log(`Student: ${name} (Average: ${avg.toFixed(1)})`);
    studentEvals.forEach(e => {
      const total = e.score.reduce((a, b) => a + b, 0);
      
      // Calculate average of OTHERS at the time of submission (or just current others for simplicity)
      const others = scores.filter(s => s !== total);
      const avgOthers = others.length > 0 ? others.reduce((a, b) => a + b, 0) / others.length : total;
      const dev = Math.abs(total - avgOthers);

      console.log(`  - Evaluator: ${e.evaluator.name} | Score: ${total} | Dev from others: ${dev.toFixed(1)} | Status: ${e.status}`);
    });
    console.log('');
  }

  await mongoose.disconnect();
}

generateReport();
