require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Need to just connect and query the raw collection using mongoose models without importing the ts files which cause issues.
async function checkDb() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    const db = mongoose.connection.db;
    const app = await db.collection('applications').find().sort({createdAt: -1}).limit(1).toArray();
    console.log("Latest Application Resume URL:", app[0].resumeUrl);
    console.log("Latest Application Score:", app[0].resumeScore);
    console.log("Full App object:", app[0]);
    process.exit(0);
}
checkDb().catch(console.error);
