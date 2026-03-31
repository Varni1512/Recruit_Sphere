"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, Briefcase, FileText, CheckCircle2, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { auth } from "@/lib/localAuth"
import { getUserProfile, calculateProfileCompletion } from "@/lib/profileUtils"
import { getCandidateApplications } from "@/app/actions/jobActions"

export default function CandidateDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userFirstName, setUserFirstName] = useState("Candidate")
    const [completionPercentage, setCompletionPercentage] = useState(0)
    const [applications, setApplications] = useState<any[]>([])

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                // Fetch profile
                const cacheKey = `candidateProfile_${user.uid}`
                const cachedRaw = localStorage.getItem(cacheKey)
                if (cachedRaw) {
                    const cached = JSON.parse(cachedRaw) as { profile?: any; completion?: number }
                    if (cached.profile) {
                        setUserFirstName(cached.profile.fullName?.split(" ")[0] || "Candidate")
                    }
                    if (typeof cached.completion === "number") {
                        setCompletionPercentage(cached.completion)
                    }
                }

                const profile = await getUserProfile(user.uid)
                if (profile) {
                    setUserFirstName(profile.fullName?.split(" ")[0] || "Candidate")
                    setCompletionPercentage(calculateProfileCompletion(profile))
                }

                // Fetch applications
                const res = await getCandidateApplications(user.uid)
                if (res.success) {
                    setApplications(res.applications)
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error)
            } finally {
                setLoading(false)
            }
        })
        return () => unsubscribe()
    }, [router])

    if (loading) {
        return <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground animate-pulse">Loading dashboard...</div>
    }

    const offersReceived = applications.filter(a => a.status === "Offer" || a.status === "Hire").length
    const recentApplications = applications.slice(0, 4)

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">👋 Welcome back, {userFirstName}!</h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your job search today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild>
                        <Link href="/candidate/jobs">Explore Jobs</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime applications
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            No scheduled interviews
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{offersReceived}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {offersReceived === 0 ? "Keep applying!" : `You have ${offersReceived} pending offer${offersReceived > 1 ? 's' : ''}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionPercentage}%</div>
                        <div className="mt-2 h-1.5 w-full bg-secondary overflow-hidden rounded-full">
                            <div className="h-full bg-primary" style={{ width: `${completionPercentage}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>Track the status of your latest job applications.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/candidate/applications">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentApplications.map((app) => (
                                <div key={app.id} className="flex items-center justify-between group">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-none">{app.role}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {app.company} • Applied {app.appliedDate}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            app.status === 'Hire' || app.status === 'Offer' ? 'default' :
                                            app.status === 'Rejected' ? 'destructive' :
                                            app.status === 'Applied' ? 'outline' : 'secondary'
                                        }
                                        className={app.status === 'Hire' || app.status === 'Offer' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                    >
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                            {recentApplications.length === 0 && (
                                <p className="text-muted-foreground text-sm text-center py-4">You haven't applied to any jobs yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming Interviews</CardTitle>
                        <CardDescription>Don't be late for these scheduled calls.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-xl">
                            <Calendar className="h-8 w-8 text-muted-foreground mb-3" />
                            <p className="font-semibold text-sm">No interviews scheduled</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">When a recruiter schedules an interview with you, it will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
