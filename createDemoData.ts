import mongoose from 'mongoose';
import Job from './src/models/Job';
import Application from './src/models/Application';
import User from './src/models/User';
import dotenv from 'dotenv';
import { sendEmail } from './src/lib/email';

dotenv.config({ path: '.env.local' });

async function run() {
    await mongoose.connect(process.env.MONGODB_URI!);

    // Create Job
    const job = new Job({
        title: 'Frontend Intern',
        department: 'Engineering',
        type: 'Internship',
        locationType: 'Remote',
        location: 'Remote',
        description: 'We are looking for a passionate Frontend Intern skilled in React, Next.js, and modern CSS frameworks like Tailwind. You should have a good eye for design and performance. Responsibilities include building UI components and optimizing web applications.',
        atsKeywords: ['React', 'Next.js', 'Tailwind', 'Frontend', 'JavaScript'],
        candidatesCount: 1,
        hiringPipeline: [
            { roundName: "AI Interview Round", totalScore: 100, passingScore: 70 }
        ]
    });
    await job.save();

    // Create User if not exists
    let user = await User.findOne({ email: 'varni1505@gmail.com' });
    if (!user) {
        user = new User({
            email: 'varni1505@gmail.com',
            firstName: 'Varni',
            lastName: 'Patel',
            role: 'candidate',
            skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Next.js']
        });
        await user.save();
    }

    // Create Application
    const app = new Application({
        jobId: job._id,
        candidateId: user._id,
        firstName: 'Varni',
        lastName: 'Patel',
        email: 'varni1505@gmail.com',
        mobile: '9876543210',
        address: 'India',
        collegeYear: '2025',
        collegeBranch: 'Computer Science',
        qualifications: 'B.Tech',
        gender: 'Male',
        resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf', // dummy
        status: 'AI Interview Round'
    });
    await app.save();

    const demoLink = `http://localhost:3000/interview/${app._id}`;

    // Send Email
    await sendEmail({
        to: 'varni1505@gmail.com',
        subject: 'Your AI Interview Link - Recruit Sphere',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>You have been invited to an AI Interview!</h2>
                <p>Role: Frontend Intern</p>
                <p>Click the link below to begin your fully automated AI Video Interview. Ensure you have a working camera and microphone.</p>
                <a href="${demoLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Start AI Interview</a>
                <p><br>Or copy this link: ${demoLink}</p>
            </div>
        `
    });

    console.log("Demo link generated and emailed:", demoLink);
    process.exit(0);
}

run().catch(console.error);
