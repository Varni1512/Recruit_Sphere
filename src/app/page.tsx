"use client"

import * as React from "react"
import { motion, type Variants, useMotionValue, useTransform, animate, useInView } from "framer-motion"
import { useEffect, useRef, useTransition } from "react"
import Link from "next/link"
import {
    Building2, Bot, CalendarDays, ShieldCheck, Video, Zap,
    FileSearch, ArrowRight, CheckCircle, ChevronRight,
    Users, Check, Mail, Phone, Linkedin, ClipboardList,
    Cpu, UserCheck, Search, Briefcase, Star, Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { sendContactForm } from "@/app/actions/contact"

/**
 * Shared animation variants for staggered entry.
 */
const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
}

const COMPANY_FEATURES = [
    {
        icon: Bot,
        title: "End-to-End AI Agency",
        description: "Submit your requirements and deadline. We handle sourcing, screening, and scheduling. No software for your HR team to manage.",
    },
    {
        icon: FileSearch,
        title: "Instant Resume Intelligence",
        description: "Our machine learning models parse job descriptions and instantly screen candidate resumes, setting dynamic passing thresholds.",
    },
    {
        icon: CalendarDays,
        title: "Smart Auto-Scheduling",
        description: "The platform automatically constructs the complete hiring timeline—from coding rounds to interviews—based on your deadline.",
    },
    {
        icon: ShieldCheck,
        title: "Proctored Assessments",
        description: "Shortlisted candidates progress through highly secure, anti-cheat proctored coding and aptitude testing environments.",
    },
    {
        icon: Video,
        title: "AI-Conducted Interviews",
        description: "An advanced AI conducts dynamic video/audio interviews personalized for each candidate to validate their specific competencies.",
    },
    {
        icon: Zap,
        title: "75% Faster Time-to-Hire",
        description: "By eliminating human bottlenecks in initial screening and logistical scheduling, we secure the perfect hire in record time.",
    }
]

const PROCESS_STEPS = [
    {
        step: "01",
        title: "Submit Requirements",
        icon: ClipboardList,
        description: "Upload your Job Description and set your hiring deadline. We align our AI logic to your specific constraints."
    },
    {
        step: "02",
        title: "AI Pipeline Execution",
        icon: Cpu,
        description: "Our autonomous agents source, screen, and assess candidates through proctored rounds and Video AI interviews."
    },
    {
        step: "03",
        title: "Finalist Selection",
        icon: UserCheck,
        description: "Review a ranked list of top-tier, verified finalists and move directly to the final offer stage."
    }
]

/**
 * A reusable component for animated counting numbers.
 */
function RollingNumber({ value, duration = 2 }: { value: number; duration?: number }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            const controls = animate(count, value, { duration, ease: "easeOut" });
            return () => controls.stop();
        }
    }, [isInView, value, duration, count]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Home() {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 scroll-smooth">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Recruit Sphere</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#capabilities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Capabilities
                        </Link>
                        <Link href="#process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Process
                        </Link>
                        <Link href="#candidates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            For Candidates
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="hidden sm:inline-flex font-medium">
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild className="font-medium shadow-sm">
                            <a href="mailto:admin@recruitsphere.com">Partner With Us</a>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 md:pt-24 md:pb-16 overflow-hidden">
                    {/* Subtle grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="max-w-5xl mx-auto space-y-8"
                        >
                            <motion.div variants={fadeUpVariants} className="inline-flex justify-center">
                                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/15 border-0">
                                    Introducing Hiring-as-a-Service
                                </Badge>
                            </motion.div>

                            <motion.h1 variants={fadeUpVariants} className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight leading-[1.15]">
                                We automate your entire hiring pipeline with AI.
                            </motion.h1>

                            <motion.p variants={fadeUpVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Supply the job description and deadline. We deliver the perfect hire. No complex software for your team to learn, no resumes to review.
                            </motion.p>

                            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Button size="lg" asChild className="h-12 px-8 text-base shadow-sm hover:shadow-md transition-all">
                                    <a href="mailto:admin@recruitsphere.com">
                                        Partner With Us
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base bg-background transition-all">
                                    <Link href="/login" className="flex items-center gap-2">
                                        Explore Open Roles <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Abstract Hero Visual - Candidate Intelligence Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="mt-20 mx-auto max-w-5xl rounded-2xl border bg-card/60 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden text-left"
                        >
                            <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5 focus-within:ring-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                    </div>
                                    <div className="h-4 w-px bg-border mx-2" />
                                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                        <Search className="h-3 w-3" /> Talent Intelligence / active_pipeline
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">AI LIVE</Badge>
                                </div>
                            </div>

                            <div className="p-0 md:flex divide-x divide-border">
                                {/* Left: Candidate List */}
                                <div className="w-full md:w-1/3 p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold uppercase tracking-tight text-white/40">Top Match Candidates</h4>
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    {[
                                        { name: "Alex Rivers", role: "Sr. Frontend Eng", score: 98, status: "Ready" },
                                        { name: "Sarah Chen", role: "ML Engineer", score: 94, status: "Screning" },
                                        { name: "Marcus J.", role: "PM Specialist", score: 92, status: "Ready" }
                                    ].map((c, i) => (
                                        <div key={i} className={cn(
                                            "p-3 rounded-xl border flex items-center justify-between transition-all hover:bg-muted/30 cursor-pointer",
                                            i === 0 ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-muted/10 border-transparent"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-muted-foreground/20">
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">{c.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">{c.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{c.role}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-primary">{c.score}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Center: Active Intelligence View */}
                                <div className="flex-1 p-8 bg-muted/5 space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14 border-2 border-primary/20">
                                                <AvatarFallback className="text-lg bg-primary/10 text-primary font-black">AR</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-xl font-bold tracking-tight">Alex Rivers</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Remote OK</Badge>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Node.js Expert</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1">
                                                <Star className="h-3 w-3 fill-emerald-500" /> Platinum Match
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Pipeline Score: 98.4</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <span>AI Tech Assessment</span>
                                                <span className="text-foreground">96/100</span>
                                            </div>
                                            <Progress value={96} className="h-1" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <span>Cultural Alignment</span>
                                                <span className="text-foreground">92%</span>
                                            </div>
                                            <Progress value={92} className="h-1" />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest mb-2">
                                            <Bot className="h-3 w-3" /> Recruit Sphere AI Insights
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            "Candidate demonstrated exceptional problem solving during the proctored coding round. Detected high potential for team leadership."
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Action Feed */}
                                <div className="hidden lg:block w-64 p-6 bg-muted/20 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activity Timeline</h4>
                                    <div className="space-y-6">
                                        {[
                                            { action: "Resume Screen", time: "2m ago", done: true },
                                            { action: "Logic Test", time: "1h ago", done: true },
                                            { action: "AI Audio Int.", time: "Running", done: false },
                                        ].map((act, i) => (
                                            <div key={i} className="flex gap-4 items-start relative pb-6 border-l ml-2 last:border-0 pl-4 border-muted">
                                                <div className={cn(
                                                    "absolute -left-[5px] top-0 w-2 h-2 rounded-full",
                                                    act.done ? "bg-emerald-500" : "bg-primary animate-pulse"
                                                )} />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-foreground leading-none">{act.action}</p>
                                                    <p className="text-[9px] text-muted-foreground">{act.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <Button size="sm" className="w-full text-[10px] h-8 font-black uppercase tracking-widest font-sans leading-none">
                                            Schedule Interview
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Social Proof / Metrics */}
                <section className="py-12 border-y bg-muted/20">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
                            <div className="px-4">
                                <div className="text-3xl font-bold tracking-tight"><RollingNumber value={75} />%</div>
                                <div className="text-sm text-muted-foreground mt-1 text-center">Faster Time-to-Hire</div>
                            </div>
                            <div className="px-4">
                                <div className="text-3xl font-bold tracking-tight"><RollingNumber value={99} />%</div>
                                <div className="text-sm text-muted-foreground mt-1 text-center">Screening Accuracy</div>
                            </div>
                            <div className="px-4">
                                <div className="text-3xl font-bold tracking-tight">Zero</div>
                                <div className="text-sm text-muted-foreground mt-1 text-center">Software Oversight</div>
                            </div>
                            <div className="px-4">
                                <div className="text-3xl font-bold tracking-tight"><RollingNumber value={24} />/7</div>
                                <div className="text-sm text-muted-foreground mt-1 text-center">Autonomous Execution</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Capabilities Section */}
                <section id="capabilities" className="py-16 md:py-16">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="max-w-3xl mb-16 text-left">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-left">Enterprise-grade hiring, <br /> orchestration handled.</h2>
                            <p className="text-lg text-muted-foreground text-left leading-relaxed">
                                Recruit Sphere operates as a high-performance hiring engine. You define the target outcomes; our machine learning workflows ensure the talent is sourced and verified.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {COMPANY_FEATURES.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={fadeUpVariants}
                                    custom={i}
                                >
                                    <Card className="h-full border-muted-foreground/10 bg-card hover:bg-muted/10 transition-colors shadow-sm">
                                        <CardContent className="p-6">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                                                <feature.icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed text-sm">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section id="process" className="py-16 md:py-16 bg-muted/30 border-y">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Defined Process. Rapid Results.</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                A streamlined methodology engineered to minimize organizational drag while rapidly fulfilling complex role requirements.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Desktop Connecting Line */}
                            <div className="hidden md:block absolute top-[60px] left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                            {PROCESS_STEPS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUpVariants}
                                    custom={i}
                                    className="relative group pt-10"
                                >
                                    <Card className="h-full bg-card/40 border-muted-foreground/10 group-hover:border-primary/20 transition-all shadow-sm overflow-hidden">
                                        <CardContent className="p-8 text-center sm:text-left">
                                            {/* Step Number Overlay */}
                                            <div className="absolute top-4 right-6 text-5xl font-black text-foreground/5 pointer-events-none group-hover:text-primary/10 transition-colors">
                                                {item.step}
                                            </div>

                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 mx-auto sm:mx-0 shadow-inner group-hover:scale-110 transition-transform">
                                                <item.icon className="h-7 w-7" />
                                            </div>

                                            <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Candidate Value Prop Section */}
                <section id="candidates" className="py-16 md:py-16 overflow-hidden">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-left leading-[1.2]">
                                    For Candidates: <br /> Absolute Transparency.
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-left">
                                    The application process shouldn't be a black box. Our platform ensures merit-based progression, unified tracking, and zero-latency status updates.
                                </p>

                                <ul className="space-y-6">
                                    {[
                                        { title: "Status Immediacy", desc: "Receive automated AI notifications on application results—redefining candidate respect." },
                                        { title: "Verified Competency", desc: "Demonstrate your domain expertise through structured, proctored evaluations." },
                                        { title: "Unified Command Center", desc: "Manage interview logistics, review assessment performance, and track multiple pipelines." }
                                    ].map((li, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-lg font-semibold mb-1 text-left">{li.title}</h4>
                                                <p className="text-muted-foreground text-left leading-relaxed">{li.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Button size="lg" asChild className="h-12 px-8">
                                        <Link href="/signup">Join the Pipeline</Link>
                                    </Button>
                                    <Button size="lg" variant="secondary" asChild className="h-12 px-8 bg-muted hover:bg-muted/80">
                                        <Link href="/login">View Opportunities</Link>
                                    </Button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative lg:p-4 text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl -z-10 rounded-full" />
                                <Card className="shadow-2xl border-muted overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                                            <div className="font-semibold text-sm">Application Activity</div>
                                            <Badge variant="outline" className="text-xs font-semibold px-2 border-emerald-500/30 text-emerald-600">Shortlisted</Badge>
                                        </div>
                                        <div className="p-6 md:p-8 space-y-6">
                                            {[
                                                { round: "Initial AI Screening", status: "Passed", score: "Match: 92%", active: false },
                                                { round: "Technical Assessment", status: "Passed", score: "185/200", active: false },
                                                { round: "AI Video Interview", status: "Scheduled", score: "Tomorrow, 10 AM", active: true },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 relative">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full border-4 border-background shadow-xs flex items-center justify-center shrink-0 z-10",
                                                        item.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        {item.active ? <Video className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 p-4 rounded-lg border bg-muted/20 text-left">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="font-bold text-sm tracking-tight">{item.round}</div>
                                                            <div className="text-[10px] font-black uppercase text-muted-foreground">{item.status}</div>
                                                        </div>
                                                        <div className="flex justify-between text-xs transition-opacity group-hover:opacity-100">
                                                            <span className="text-muted-foreground">Result Details</span>
                                                            <span className="font-bold text-foreground">{item.score}</span>
                                                        </div>
                                                    </div>
                                                    {i < 2 && (
                                                        <div className="absolute left-5 top-10 w-0.5 h-6 bg-border -z-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Contact & Final CTA Section */}
                <section id="contact" className="py-16 md:py-16 bg-[#0a0a0a] text-white">
                    <div className="container  mx-auto px-4 md:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            {/* Left Side: Contact Info */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                                        Let's Build Your <br /> Winning Team.
                                    </h2>
                                    <p className="text-lg md:text-xl text-white/60 leading-relaxed font-medium">
                                        Ready to scale your technical team with verified AI-vetted talent? Contact us today for a partnership strategy.
                                    </p>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Email Us</p>
                                            <a href="mailto:varni1505@gmail.com" className="text-lg font-bold hover:text-primary transition-colors">varni1505@gmail.com</a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Call Us</p>
                                            <p className="text-lg font-bold">+91 96245 45457</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Linkedin className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">LinkedIn</p>
                                            <a href="https://linkedin.com/in/varni1505" target="_blank" className="text-lg font-bold hover:text-primary transition-colors">linkedin.com/in/varni1505</a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Side: Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
                                    <CardContent className="p-8">
                                        <form
                                            ref={formRef}
                                            action={async (formData) => {
                                                startTransition(async () => {
                                                    try {
                                                        const res = await sendContactForm(formData);
                                                        if (res.success) {
                                                            alert("Message sent successfully!");
                                                            formRef.current?.reset();
                                                        } else {
                                                            alert("Failed to send message: " + (res.error || "Unknown error"));
                                                        }
                                                    } catch (err) {
                                                        alert("An unexpected error occurred.");
                                                    }
                                                });
                                            }}
                                            className="space-y-6"
                                        >
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Full Name</label>
                                                    <Input name="name" placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Work Email</label>
                                                    <Input name="email" type="email" placeholder="john@company.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Company Name</label>
                                                <Input name="company" placeholder="Acme Inc." className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Your Message</label>
                                                <Textarea name="message" placeholder="Tell us about your hiring needs..." required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[120px]" />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isPending}
                                                className="w-full h-14 text-lg font-bold shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                                            >
                                                {isPending ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    "Send Inquiry Request"
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Simplified Footer */}
            <footer className="border-t py-12 bg-muted/20">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-black tracking-tighter">Recruit Sphere</span>
                        </div>

                        <p className="text-xs text-muted-foreground/60 font-medium" suppressHydrationWarning>
                            © {new Date().getFullYear()} Recruit Sphere. All intellectual property remains with the Internal Administration.
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
