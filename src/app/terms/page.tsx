"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ShieldCheck, ScrollText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsAndConditionsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-6">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ScrollText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
                            <p className="text-muted-foreground text-sm mt-1" suppressHydrationWarning>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm md:text-base leading-relaxed text-foreground/80">
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold flex items-center space-x-2 text-foreground">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span>1. Acceptance of Terms</span>
                        </h2>
                        <p>
                            By accessing and using Recruit Sphere, you accept and agree to be bound by the terms and provision of this agreement. 
                            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. 
                            Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
                        <p>
                            Recruit Sphere provides a platform connecting candidates with potential employers and recruiters. We do not guarantee employment, 
                            interview opportunities, or specific outcomes resulting from the use of our platform. We act as an intermediary to facilitate the 
                            application and recruitment process effectively.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-foreground">3. User Conduct and Account Security</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device.
                            You agree to accept responsibility for all activities that occur under your account or password. You must provide truthful, accurate, 
                            and complete information when creating a profile or submitting an application.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Do not upload false resumes or misleading professional experience.</li>
                            <li>Do not attempt to disrupt or compromise the platform's security.</li>
                            <li>Do not use our platform for unsolicited promotional or unauthorized purposes.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-foreground">4. Privacy Policy and Data Usage</h2>
                        <p>
                            Your privacy is critical to us. The submission of personal information through the platform is governed by our Privacy Policy. 
                            By applying for a job, you consent to your profile and application data being shared securely with the respective recruiter or company 
                            for the purpose of evaluation. We do not sell your personal data to non-affiliated third parties.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-foreground">5. Modifications and Interruptions</h2>
                        <p>
                            We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice to the user. You agree that 
                            Recruit Sphere shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
                        <p>
                            In no event shall Recruit Sphere, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
                            incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
                            intangible losses, resulting from your access to or use of or inability to access or use the service.
                        </p>
                    </section>
                </div>

                <div className="pt-8 pb-12 flex justify-center">
                    <Button variant="outline" className="px-8" asChild>
                        <Link href="/candidate/dashboard">Return to Dashboard</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
