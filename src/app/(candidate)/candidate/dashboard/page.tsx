import { ArrowUpRight, Briefcase, FileText, CheckCircle2, Calendar } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const upcomingInterviews = [
    {
        id: "1",
        company: "Stark Industries",
        role: "Frontend Engineer",
        date: "Tomorrow, 10:00 AM",
        type: "Technical",
    },
    {
        id: "2",
        company: "Wayne Enterprises",
        role: "React Developer",
        date: "Thursday, 2:30 PM",
        type: "Culture Fit",
    }
]

const recentApplications = [
    {
        id: "1",
        company: "Acme Corp",
        role: "Senior UX Designer",
        applied: "2 days ago",
        status: "Screening",
    },
    {
        id: "2",
        company: "Globex",
        role: "Product Manager",
        applied: "1 week ago",
        status: "Applied",
    },
    {
        id: "3",
        company: "Initech",
        role: "Full Stack Engineer",
        applied: "2 weeks ago",
        status: "Interviewing",
    },
    {
        id: "4",
        company: "Umbrella Corp",
        role: "Security Researcher",
        applied: "3 weeks ago",
        status: "Rejected",
    }
]

export default function CandidateDashboard() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-auto pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">👋 Welcome back, Alex!</h1>
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
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +2 from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Next one tomorrow
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            You have 1 pending offer
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Add a portfolio to reach 100%
                        </p>
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
                                            {app.company} • Applied {app.applied}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            app.status === 'Interviewing' ? 'default' :
                                                app.status === 'Rejected' ? 'destructive' :
                                                    app.status === 'Screening' ? 'secondary' : 'outline'
                                        }
                                    >
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming Interviews</CardTitle>
                        <CardDescription>Don't be late for these scheduled calls.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingInterviews.map((interview) => (
                                <div key={interview.id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-sm">{interview.company}</p>
                                                <p className="text-xs text-muted-foreground">{interview.role}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] h-5">{interview.type}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs font-medium text-foreground">{interview.date}</span>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                                <Link href="/candidate/interviews">
                                                    Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
