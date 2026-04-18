"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
    Building2, Shield, Lock, Eye, Scale, 
    ArrowLeft, Mail, Info
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
                <section className="py-16 md:py-16">
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
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Privacy Policy</h1>
                                <p className="text-muted-foreground font-medium">Last Updated: April 18, 2026</p>
                                <div className="h-1.5 w-20 bg-primary" />
                            </div>

                            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Info className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">Overview</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        At Recruit Sphere, we operate as a professional hiring agency. Your privacy is paramount. This policy outlines how we handle candidate data and client information within our AI-driven recruitment pipeline.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Lock className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">Data Collection</h2>
                                    </div>
                                    <p className="text-muted-foreground">
                                        We collect information necessary to fulfill our recruitment services:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        <li><strong>Personal Information:</strong> Name, email, phone number, and professional social profiles.</li>
                                        <li><strong>Professional Data:</strong> Resumes, portfolios, and employment history.</li>
                                        <li><strong>Assessment Data:</strong> Scores from proctored coding rounds and AI-conducted video interviews.</li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Shield className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">AI and Data Processing</h2>
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        Our platform uses advanced Machine Learning models to:
                                    </p>
                                    <div className="p-6 rounded-xl bg-muted/30 border border-primary/10 italic text-sm text-foreground/80">
                                        "Perform automated resume intelligence, assessment scoring, and behavioral analysis during video interviews to provide objective candidate shortlisting."
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Eye className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">Third-Party Sharing</h2>
                                    </div>
                                    <p className="text-muted-foreground">
                                        As a service provider for companies, we share candidate data specifically with the client company for the role you have applied for. We do not sell your data to marketers or external data brokers.
                                    </p>
                                </section>

                                <section className="space-y-4 pt-8 border-t">
                                    <h2 className="text-2xl font-bold text-foreground">Contact Privacy Team</h2>
                                    <p className="text-muted-foreground">
                                        If you have questions regarding your data or wish to exercise your right to erasure, please contact us.
                                    </p>
                                    <div className="flex items-center gap-2 font-bold text-primary">
                                        <Mail className="h-5 w-5" />
                                        <a href="mailto:varni1505@gmail.com">varni1505@gmail.com</a>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer (Consistent with Home) */}
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
                            © {new Date().getFullYear()} Recruit Sphere. Internal Administration Only.
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
