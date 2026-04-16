import { connectToDatabase } from './src/lib/mongodb';
import { Application } from './src/lib/mongodb';

async function checkLastApp() {
    await connectToDatabase();
    const app = await Application.find().sort({ createdAt: -1 }).limit(1).lean();
    console.log(JSON.stringify(app, null, 2));
    process.exit(0);
}

checkLastApp();
