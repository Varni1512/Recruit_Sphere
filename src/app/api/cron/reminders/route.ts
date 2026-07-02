import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';
import Application from '@/models/Application';
import Notification from '@/models/Notification';
import { sendEmail } from '@/lib/email';
import { getReminderEmailTemplate } from '@/lib/emailTemplates';
import { format } from 'date-fns';

export async function GET(req: Request) {
    try {
        // Authenticate the cron job (e.g., using a secret token)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const now = new Date();
        const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

        // Find jobs with rounds scheduled between now and 12 hours from now
        const jobs = await Job.find({
            'roundSchedule.date': {
                $gte: now,
                $lte: twelveHoursFromNow,
            }
        });

        let remindersSent = 0;

        for (const job of jobs) {
            // Get the specific rounds that are happening within the next 12 hours
            const upcomingRounds = (job.roundSchedule || []).filter((round: any) => {
                const roundDate = new Date(round.date);
                return roundDate >= now && roundDate <= twelveHoursFromNow;
            });

            for (const round of upcomingRounds) {
                // Find applications that are currently in this round's status
                const applications = await Application.find({
                    jobId: job._id,
                    status: round.roundName,
                });

                for (const app of applications) {
                    // Check if a reminder has already been sent
                    const existingReminder = await Notification.findOne({
                        relatedApplicationId: app._id.toString(),
                        type: 'REMINDER_SENT',
                        message: { $regex: round.roundName, $options: 'i' } // Ensure it's for this specific round
                    });

                    if (!existingReminder) {
                        // Send the email
                        const examLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/candidate/jobs/${job._id}`;
                        const formattedTime = format(new Date(round.date), 'PPPP p');
                        
                        const emailHtml = getReminderEmailTemplate({
                            candidateName: app.firstName,
                            role: job.title,
                            roundName: round.roundName,
                            examLink: examLink,
                            scheduledTime: formattedTime
                        });

                        const emailResult = await sendEmail({
                            to: app.email,
                            subject: `Reminder: Your ${round.roundName} for ${job.title} is scheduled soon!`,
                            html: emailHtml
                        });

                        if (emailResult.success) {
                            // Log the notification to prevent duplicate reminders
                            await Notification.create({
                                recipientEmail: app.email,
                                type: 'REMINDER_SENT',
                                message: `Sent reminder for ${round.roundName}.`,
                                relatedJobId: job._id.toString(),
                                relatedApplicationId: app._id.toString()
                            });
                            remindersSent++;
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, remindersSent });
    } catch (error: any) {
        console.error('Error processing cron reminders:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
