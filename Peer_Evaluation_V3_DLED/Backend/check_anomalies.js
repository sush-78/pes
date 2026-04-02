const mongoose = require('mongoose');
const path = require('path');

// Dynamically import models
const { PeerEvaluation } = require('./models/PeerEvaluation.js');
const { User } = require('./models/User.js');

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
    const students = [...new Set(evals.map(e => e.student.name))];
    
    students.forEach(studentName => {
      const studentEvals = evals.filter(e => e.student.name === studentName);
      const totalMarks = studentEvals.map(e => e.score.reduce((a, b) => a + b, 0));
      const avg = totalMarks.reduce((a, b) => a + b, 0) / totalMarks.length;
      
      console.log(`\nStudent: ${studentName}`);
      console.log(`Average Score Received: ${avg.toFixed(2)}`);
      studentEvals.forEach(e => {
        const score = e.score.reduce((a, b) => a + b, 0);
        const dev = Math.abs(score - avg);
        console.log(`  - From ${e.evaluator.name}: ${score} (Dev from current avg: ${dev.toFixed(2)}) -> ${e.status}`);
      });
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAnomalies();
