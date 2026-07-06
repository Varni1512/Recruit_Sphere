"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
    Building2, Shield, Lock, Eye, Scale, 
    ArrowLeft, Mail, Info, FileText
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
                                <p className="text-muted-foreground font-medium">Effective Date: {new Date().toLocaleDateString()}</p>
                                <div className="h-1.5 w-20 bg-primary" />
                            </div>

                            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Info className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">1. Introduction</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        Recruit Sphere ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy outlines our practices regarding the collection, use, disclosure, and safeguarding of your information when you visit our website and use our AI-driven recruitment platform. By accessing or using our services, you consent to the data practices described in this policy.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Lock className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">2. Information We Collect</h2>
                                    </div>
                                    <p className="text-muted-foreground">
                                        We collect information that identifies, relates to, describes, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("Personal Information"). The categories of information we collect include:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        <li><strong>Identifiers:</strong> Name, email address, postal address, phone number, and unique device identifiers.</li>
                                        <li><strong>Professional or Employment-Related Information:</strong> Resumes, CVs, employment history, educational background, professional certifications, and portfolios.</li>
                                        <li><strong>Assessment Data:</strong> Responses to aptitude tests, coding challenges, behavioral assessments, and AI-conducted video/audio interviews.</li>
                                        <li><strong>Internet or Network Activity:</strong> Browsing history, search history, and interactions with our platform.</li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Shield className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">3. Use of AI and Automated Processing</h2>
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        Recruit Sphere utilizes artificial intelligence (AI) and machine learning algorithms to facilitate the recruitment process.
                                    </p>
                                    <div className="p-6 rounded-xl bg-muted/30 border border-primary/10 italic text-sm text-foreground/80 leading-relaxed">
                                        Our AI models process your professional data and assessment results to evaluate your qualifications against specific job requirements. This includes automated resume parsing, ATS scoring, and behavioral analysis during video interviews. While AI assists in the shortlisting process, final hiring decisions are always made by our client companies. You have the right to request human intervention or contest decisions based solely on automated processing.
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Eye className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">4. Data Sharing and Disclosure</h2>
                                    </div>
                                    <p className="text-muted-foreground">
                                        We do not sell your Personal Information. We share your information only in the following circumstances:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        <li><strong>With Client Companies:</strong> When you apply for a position, your profile, assessment scores, and interview data are shared with the prospective employer.</li>
                                        <li><strong>With Service Providers:</strong> We may share data with trusted third-party vendors who perform services on our behalf, such as hosting, data analysis, and email delivery (e.g., SMTP providers), under strict confidentiality agreements.</li>
                                        <li><strong>For Legal Reasons:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                                    </ul>
                                </section>
                                
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <FileText className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold m-0 text-foreground">5. Data Retention and Security</h2>
                                    </div>
                                    <p className="text-muted-foreground">
                                        We implement industry-standard administrative, technical, and physical security measures to protect your Personal Information. Your data is retained only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Upon request or account deletion, your data will be securely erased or anonymized.
                                    </p>
                                </section>

                                <section className="space-y-4 pt-8 border-t">
                                    <h2 className="text-2xl font-bold text-foreground">6. Contact Our Privacy Team</h2>
                                    <p className="text-muted-foreground">
                                        If you have any questions or concerns about this Privacy Policy, or if you wish to exercise your data protection rights (such as access, rectification, or erasure), please contact our Data Protection Officer:
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
