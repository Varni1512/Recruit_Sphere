"use client"

import { AlertCircle, Building2, Calendar, FileText, MapPin, MoreHorizontal, XCircle } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/localAuth"
import { getCandidateApplications, withdrawApplication } from "@/app/actions/jobActions"

export default function CandidateApplicationsPage() {
    const router = useRouter()
    const [myApplications, setMyApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            const res = await getCandidateApplications(user.uid)
            if (res.success) {
                setMyApplications(res.applications)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [router])

    if (loading) {
        return <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground">Loading your applications...</div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                    <p className="text-muted-foreground mt-1">
                        Track the status and progress of all your job applications.
                    </p>
                </div>
                <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" /> Active
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" /> Closed
                    </div>
                </div>
            </div>

            <div className="rounded-xl">
                <div className="flex flex-col gap-4 pb-10">
                    {myApplications.length === 0 && !loading && (
                        <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-muted/10">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/30 mb-4">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                You haven't applied to any jobs yet. Start exploring opportunities to build your career.
                            </p>
                            <Button asChild>
                                <Link href="/candidate/jobs">Explore Jobs</Link>
                            </Button>
                        </div>
                    )}
                    {myApplications.map((app) => (
                        <Card key={app.id} className="relative overflow-hidden group">
                            {/* Status accent border */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1 ${app.status === 'Rejected' ? 'bg-destructive' :
                                app.status === 'Applied' ? 'bg-muted' :
                                    'bg-primary'
                                }`} />

                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row shadow-sm">
                                    {/* Left Details Section */}
                                    <div className="p-6 flex-1 flex flex-col gap-4 border-b md:border-b-0 md:border-r">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold">{app.role}</h3>
                                                <p className="text-muted-foreground font-medium mt-1">{app.company}</p>
                                            </div>
                                            <Badge
                                                variant={
                                                    app.status === 'Hire' || app.status === 'Offer' ? 'default' :
                                                    app.status === 'Rejected' ? 'destructive' :
                                                    app.status === 'Applied' ? 'outline' : 'secondary'
                                                }
                                                className={`uppercase px-2 ${app.status === 'Hire' || app.status === 'Offer' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                            >
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 shrink-0" /> {app.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 shrink-0" /> Applied: {app.appliedDate}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center justify-center bg-primary/10 text-primary h-5 w-5 rounded-full font-bold text-[10px]">
                                                    {app.resumeScore}
                                                </div>
                                                Resume Score
                                            </div>
                                        </div>

                                        {app.status === 'Rejected' && (
                                            <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/10 relative overflow-hidden group/feedback transition-all hover:bg-destructive/[0.08]">
                                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/feedback:opacity-40 transition-opacity">
                                                    <XCircle className="h-10 w-10 text-destructive" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                                        <h4 className="text-xs font-bold text-destructive uppercase tracking-widest">Application Status: Not Selected</h4>
                                                    </div>
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center justify-between border-b border-destructive/10 pb-2">
                                                                <p className="text-sm font-bold text-foreground italic">Dear {app.candidateName},</p>
                                                                {/* <Badge variant="outline" className="text-[9px] uppercase border-destructive/20 text-destructive bg-destructive/5">Official Notice</Badge> */}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                    {app.rejectionReason ? (
                                                                        <>
                                                                            Thank you for applying to Recruit Sphere. We regret to inform you that you have not been shortlisted for the role of <strong>{app.role}</strong> because: 
                                                                            <span className="block mt-2 p-2 bg-destructive/10 rounded border-l-4 border-destructive text-destructive font-semibold">
                                                                                {app.rejectionReason}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        "Thank you for your application. After careful evaluation of your profile against our current requirements, we have decided not to move forward with your candidacy at this time."
                                                                    )}
                                                                </p>
                                                                <div className="pt-2 flex items-center justify-between opacity-70">
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Processed by Recruit Sphere ATS</p>
                                                                    <p className="text-[10px] text-muted-foreground font-medium italic">Decision Final</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                        )}
                                    </div>

                                    {/* Right Actions / Pipeline Space */}
                                    <div className="p-6 md:w-80 shrink-0 bg-muted/5 flex flex-col justify-between">
                                        <div className="mb-4">
                                            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-wider">Pipeline Progress</h4>

                                            {/* Visual Pipeline Dots */}
                                            <div className="flex items-center justify-between relative mt-4">
                                                {/* Connecting line */}
                                                <div className="absolute left-[10%] right-[10%] h-0.5 bg-border top-1.5 -z-10" />
                                                <div
                                                    className={`absolute left-[10%] h-0.5 top-1.5 -z-10 ${app.status === 'Rejected' ? 'bg-destructive/50' : 'bg-primary'} transition-all`}
                                                    style={{ width: `${(app.currentStageIndex / (app.pipeline.length - 1)) * 80}%` }}
                                                />

                                                {app.pipeline.map((stage: string, i: number) => {
                                                    const isCompleted = i <= app.currentStageIndex
                                                    const isCurrent = i === app.currentStageIndex
                                                    const isRejected = app.status === 'Rejected'

                                                    const circleClass = isCompleted
                                                        ? (isRejected && isCurrent ? "bg-destructive border-transparent text-destructive-foreground shadow-sm" : "bg-primary border-transparent text-primary-foreground shadow-sm")
                                                        : "bg-background border-muted-foreground/30 text-transparent"

                                                    return (
                                                        <div key={stage} className="flex flex-col items-center gap-1 group/tooltip relative">
                                                            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${circleClass} flex items-center justify-center`}>
                                                                {isCompleted && !isRejected && <div className="w-1 h-1 bg-primary-foreground rounded-full" />}
                                                                {isRejected && isCurrent && <div className="w-1.5 h-0.5 bg-white rounded-full bg-destructive-foreground rotate-45" />}
                                                            </div>
                                                            {/* Tooltip emulation */}
                                                            <span className="absolute -bottom-6 opacity-0 group-hover/tooltip:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-50">
                                                                {stage}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="text-center mt-3 text-sm font-medium">
                                                Stage: {app.pipeline[app.currentStageIndex]}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-auto">
                                            <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                                                <Link href={`/candidate/jobs/${app.jobId}`}>View Original Job</Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                        onClick={async () => {
                                                            const confirmed = window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.");
                                                            if (confirmed) {
                                                                const res = await withdrawApplication(app.id);
                                                                if (res.success) {
                                                                    setMyApplications(prev => prev.filter(a => a.id !== app.id));
                                                                } else {
                                                                    alert("Failed to withdraw application.");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Withdraw Application
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
