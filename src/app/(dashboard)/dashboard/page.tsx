import { Activity, Briefcase, Users, FileSignature } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentApplications } from "@/components/dashboard/recent-applications"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDashboardStats } from "@/app/actions/dashboardActions"

export default async function Dashboard() {
    const res = await getDashboardStats()
    const {
        totalJobs = 0,
        totalCandidates = 0,
        interviewsScheduled = 0,
        offersAccepted = 0,
        recentApplications = [],
        chartData = []
    } = res.data || {}

    return (
        <div className="flex flex-col gap-4 w-full h-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your current hiring pipeline.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/jobs/create">Post a Job</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            Active positions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCandidates}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registered applicants
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{interviewsScheduled}</div>
                        <p className="text-xs text-muted-foreground">
                            Candidates in interview stage
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Offers Accepted</CardTitle>
                        <FileSignature className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{offersAccepted}</div>
                        <p className="text-xs text-muted-foreground">
                            Candidates hired
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
                <Card className="md:col-span-2 lg:col-span-4 flex flex-col min-h-0">
                    <CardHeader className="shrink-0 pb-2">
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            Candidate applications over the past 12 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 flex-1 min-h-0 pb-2">
                        <OverviewChart data={chartData} />
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 lg:col-span-3 flex flex-col min-h-0">
                    <CardHeader className="shrink-0 pb-2">
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>
                            Latest candidates added to the pipeline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto pb-2">
                        <RecentApplications applications={recentApplications} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
