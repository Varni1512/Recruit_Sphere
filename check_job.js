require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkJob() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Check job Document
    const job = await db.collection('jobs').findOne({ _id: new mongoose.Types.ObjectId('69e14606e926abfbbfab78e9') });
    console.log("Job Title:", job.title);
    console.log("Job Description length:", job.description.length);
    console.log("Job Keywords:", job.atsKeywords);
    console.log("Job Criteria Score:", job.atsCriteriaScore);
    
    // Now Check ATS Score again using THIS EXACT job data + the correct resume!
    const { calculateATSScore } = require('./src/lib/atsScoring.ts'); // Note: ts-node needed if we use ts, let's use the local ts test instead.
    
    process.exit(0);
}
checkJob().catch(console.error);
