import mongoose from 'mongoose';
import { PeerEvaluation } from './models/PeerEvaluation.js';

async function updateAllPeerAverages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pes');
    console.log('Connected to MongoDB. Starting recalculation of peer averages...');

    const allEvals = await PeerEvaluation.find({ eval_status: 'completed' });
    
    // Group evaluations by the student being evaluated (and document/exam)
    const evalsByDocument = {};
    for (const ev of allEvals) {
        const docId = ev.document.toString();
        if (!evalsByDocument[docId]) {
            evalsByDocument[docId] = [];
        }
        evalsByDocument[docId].push(ev);
    }
    
    for (const [docId, evalsForDoc] of Object.entries(evalsByDocument)) {
        const totalMarksArray = evalsForDoc.map(e => e.score.reduce((a, b) => a + b, 0));
        
        for (let i = 0; i < evalsForDoc.length; i++) {
            const currentEval = evalsForDoc[i];
            const currentScore = totalMarksArray[i];
            
            // Other peers' scores logic
            const otherScores = totalMarksArray.filter((_, idx) => idx !== i);
            const avgOthers = otherScores.length > 0 ? otherScores.reduce((a, b) => a + b, 0) / otherScores.length : currentScore;
            const dev = Math.abs(currentScore - avgOthers);
            
            let status = 'Normal';
            if (dev > 15 && otherScores.length > 0) {
                status = 'Needs Review';
            }
            
            // Update in DB
            await PeerEvaluation.updateOne(
                { _id: currentEval._id },
                { 
                    $set: { 
                        peerAverage: avgOthers,
                        deviation: dev,
                        status: status
                    } 
                }
            );
        }
    }
    
    console.log('Successfully recalculated all peer averages.');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateAllPeerAverages();
