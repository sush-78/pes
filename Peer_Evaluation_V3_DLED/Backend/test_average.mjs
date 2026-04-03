import mongoose from 'mongoose';
import { PeerEvaluation } from './models/PeerEvaluation.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/pes');
  const evals = await PeerEvaluation.find({ peerAverage: { $gt: 0 } }).select('status deviation peerAverage score student').populate('student', 'name');
  console.log(evals.map(e => ({
    student: e.student.name,
    score: e.score.reduce((a,b)=>a+b,0),
    peerAverage: e.peerAverage,
    deviation: e.deviation,
    status: e.status
  })));
  mongoose.disconnect();
}
run();
