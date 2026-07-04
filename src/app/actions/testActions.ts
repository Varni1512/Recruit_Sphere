"use server"

import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import Job from "@/models/Job"
import Application from "@/models/Application"
import { sendEmail } from "@/lib/email"

export async function generateDummyTest(email: string) {
    try {
        await connectToDatabase()

        // 1. Create or get dummy user
        let user: any = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                firstName: "Test",
                lastName: "Candidate",
                email,
                password: "dummy",
                role: "candidate",
            })
        }

        // 2. Create Dummy Job with the requested structure
        const dummyJob: any = await Job.create({
            title: "Software Engineer (Testing)",
            company: "Recruit Sphere",
            department: "Engineering",
            type: "Full-time",
            locationType: "Remote",
            location: "Remote",
            description: "Dummy job for testing exams.",
            status: "Active",
            candidatesCount: 0,
            experience: "Entry Level",
            salary: "10 LPA",
            tags: ["Testing"],
            atsKeywords: ["Testing"],
            atsCriteriaScore: 50,
            applicationCloseDays: 7,
            hiringDeadlineDays: 14,
            hiringPipeline: [
                { roundName: "Aptitude Round", totalScore: 10, passingScore: 5 },
                { roundName: "Coding Round", totalScore: 20, passingScore: 10 }
            ],
            aptitudeQuestions: [
                { question: "What is 2 + 2?", questionType: "mcq", options: ["3", "4", "5", "6"], answer: "4", marks: 2 },
                { question: "What is the capital of France?", questionType: "mcq", options: ["London", "Berlin", "Paris", "Madrid"], answer: "Paris", marks: 2 },
                { question: "Solve 10 / 2", questionType: "mcq", options: ["2", "5", "10", "20"], answer: "5", marks: 2 },
                { question: "If x = 5, what is x * 2?", questionType: "mcq", options: ["5", "10", "15", "20"], answer: "10", marks: 2 },
                { question: "Which is a programming language?", questionType: "mcq", options: ["Snake", "Python", "Cobra", "Viper"], answer: "Python", marks: 2 },
            ],
            examDuration: 5, // 5 min for aptitude
            codingExamDuration: 10,
            codingQuestions: [
                {
                    title: "Two Sum",
                    problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    marks: 10,
                    constraints: "2 <= nums.length <= 10^4",
                    testCases: [
                        { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
                        { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: false },
                        { input: "2\n3 3\n6", expectedOutput: "0 1", isHidden: true }
                    ],
                    boilerplates: [
                        {
                            language: "python",
                            code: "def twoSum(nums, target):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    nums = list(map(int, input().split()))\n    target = int(input())\n    result = twoSum(nums, target)\n    print(result[0], result[1])"
                        }
                    ]
                },
                {
                    title: "Valid Palindrome",
                    problemStatement: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.",
                    marks: 10,
                    constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
                    testCases: [
                        { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isHidden: false },
                        { input: "race a car", expectedOutput: "false", isHidden: false },
                        { input: " ", expectedOutput: "true", isHidden: true }
                    ],
                    boilerplates: [
                        {
                            language: "python",
                            code: "def isPalindrome(s: str) -> bool:\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    s = input()\n    print(str(isPalindrome(s)).lower())"
                        }
                    ]
                }
            ],
            aptitudeExamWindow: {
                start: new Date(Date.now() - 1000000), // Open now
                end: new Date(Date.now() + 86400000 * 7), // 7 days from now
            },
            codingExamWindow: {
                start: new Date(Date.now() - 1000000),
                end: new Date(Date.now() + 86400000 * 7),
            }
        })

        // 3. Create Application
        const application: any = await Application.create({
            jobId: dummyJob._id,
            candidateId: user._id,
            firstName: user.firstName || "Test",
            lastName: user.lastName || "Candidate",
            email: user.email,
            mobile: "1234567890",
            address: "Test Location",
            collegeYear: "2026",
            collegeBranch: "CS",
            qualifications: "B.Tech",
            gender: "Male",
            status: "Applied", // Standard starting stage
            resumeUrl: "https://example.com/dummy.pdf",
            aptitudeExamStarted: false,
            aptitudeExamSubmitted: false,
            codingExamStarted: false,
            codingExamSubmitted: false,
        })

        // 4. Send Emails
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const aptitudeLink = `${baseUrl}/exam/${application._id}`
        const codingLink = `${baseUrl}/coding-exam/${application._id}`

        await sendEmail({
            to: email,
            subject: "Action Required: Aptitude Assessment",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Aptitude Assessment</h2>
                    <p>Hi ${user.firstName || "Candidate"},</p>
                    <p>You have been invited to take the Aptitude Assessment for the testing job.</p>
                    <p><strong>Duration:</strong> 5 minutes</p>
                    <a href="${aptitudeLink}" style="display:inline-block; padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px; margin-top: 10px;">Start Aptitude Test</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">This is a test email generated from Recruit Sphere.</p>
                </div>
            `
        })

        await sendEmail({
            to: email,
            subject: "Action Required: Coding Assessment",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Coding Assessment</h2>
                    <p>Hi ${user.firstName || "Candidate"},</p>
                    <p>You have been invited to take the Coding Assessment for the testing job.</p>
                    <p><strong>Duration:</strong> 10 minutes</p>
                    <a href="${codingLink}" style="display:inline-block; padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px; margin-top: 10px;">Start Coding Test</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">This is a test email generated from Recruit Sphere.</p>
                </div>
            `
        })

        return { success: true }
    } catch (e: any) {
        console.error("Test dummy generation error:", e)
        return { success: false, error: e.message }
    }
}
