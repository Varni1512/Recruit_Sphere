"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
    Building2, FileText, Scale, ShieldAlert, Zap,
    Mail, CheckCircle2, AlertCircle, ArrowLeft,
    Gavel
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 scroll-smooth">
            {/* Navigation (Consistent with Home) */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Recruit Sphere</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/#capabilities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Capabilities
                        </Link>
                        <Link href="/#process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Process
                        </Link>
                        <Link href="/#candidates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            For Candidates
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="hidden sm:inline-flex font-medium">
                            <Link href="/">Back to Home</Link>
                        </Button>
                        <Button asChild className="font-medium shadow-sm">
                            <Link href="/login">Portal Login</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-16 md:py-16 ">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-12"
                        >
                            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
                                <Link href="/" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back to Home
                                </Link>
                            </Button>

                            <div className="space-y-4">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Terms of Service</h1>
                                <p className="text-muted-foreground font-medium">Effective Date: {new Date().toLocaleDateString()}</p>
                                <div className="h-1 w-20 bg-primary" />
                            </div>

                            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Scale className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">1. Acceptance of Terms</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        By accessing or using the Recruit Sphere platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you, whether personally or on behalf of an entity, and Recruit Sphere. If you do not agree with all of these terms, you are expressly prohibited from using the Service and must discontinue use immediately.
                                    </p>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Zap className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">2. User Responsibilities & Conduct</h2>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-xl border bg-muted/20 space-y-3 shadow-sm">
                                            <h4 className="font-bold flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-primary" /> Client Companies
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Clients must provide accurate, non-discriminatory job descriptions and adhere to established hiring timelines. You agree not to misuse the platform to harvest candidate data for unrelated purposes. Recruit Sphere is a facilitator; all final hiring decisions and employment liabilities remain solely with the Client Company.
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-xl border bg-muted/20 space-y-3 shadow-sm">
                                            <h4 className="font-bold flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" /> Candidates
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Candidates must provide truthful profile and professional data. Any attempt to compromise, reverse-engineer, or circumvent our proctored assessments (including using unauthorized third-party aids or AI tools during exams/interviews) constitutes a material breach and will result in immediate disqualification and account termination.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <ShieldAlert className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">3. AI-Driven Evaluations and Disclaimers</h2>
                                    </div>
                                    <p className="text-muted-foreground">
                                        You acknowledge that our recruitment workflow heavily leverages Artificial Intelligence (AI) for resume parsing, aptitude scoring, coding challenge evaluation, and video interview analysis. While these systems are engineered for high precision and objectivity:
                                    </p>
                                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <p className="text-sm text-amber-700 font-medium">
                                                Recruit Sphere makes no warranties regarding the absolute accuracy or bias-free nature of automated decisions. We do not guarantee employment, interview placement, or any specific recruitment outcome for any candidate.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Gavel className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">4. Limitation of Liability</h2>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL RECRUIT SPHERE, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
                                    </p>
                                </section>

                                <section className="space-y-4 border-t pt-10">
                                    <h2 className="text-2xl font-bold text-foreground">5. Modifications to Terms</h2>
                                    <p className="text-muted-foreground text-sm">
                                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                                    </p>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/20 mt-auto">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-black tracking-tighter">Recruit Sphere</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground/60 font-medium" suppressHydrationWarning>
                            © {new Date().getFullYear()} Recruit Sphere. All rights reserved.
                        </p>

                        <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                            <a href="mailto:varni1505@gmail.com" className="hover:text-primary transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
