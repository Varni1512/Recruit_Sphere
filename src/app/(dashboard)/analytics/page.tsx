import { ArrowDownRight, ArrowUpRight, Target, Timer, TrendingUp, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { FunnelChart } from "@/components/analytics/funnel-chart"
import { TimeToHireChart } from "@/components/analytics/time-to-hire-chart"

const topSources = [
    { name: "LinkedIn", count: 856, rate: "45%", trend: "up" },
    { name: "Company Career Page", count: 432, rate: "25%", trend: "up" },
    { name: "Referrals", count: 215, rate: "15%", trend: "down" },
    { name: "Indeed", count: 180, rate: "10%", trend: "down" },
    { name: "Other Job Boards", count: 85, rate: "5%", trend: "up" },
]

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-6 w-full pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Track your recruitment metrics and pipeline health.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">22 Days</div>
                        <p className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                            -3 days from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Offer Acceptance</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            +2.4% from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Cost per Hire</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$4,250</div>
                        <p className="text-xs text-rose-500 font-medium flex items-center mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            +$150 from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,245</div>
                        <p className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            +12% from last quarter
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                        <CardDescription>
                            Candidate drop-off rates at each stage of the pipeline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0 pb-4">
                        <FunnelChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3 shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle>Top Candidate Sources</CardTitle>
                        <CardDescription>
                            Where your best candidates are coming from.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-6">
                            {topSources.map((source, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-sm">{source.name}</span>
                                        <span className="text-xs text-muted-foreground">{source.count} candidates</span>
                                    </div>
                                    <div className="flex flex-col text-right gap-1">
                                        <span className="font-medium text-sm">{source.rate}</span>
                                        <Badge variant={source.trend === "up" ? "default" : "secondary"} className="h-5 px-1.5 min-w-[36px] items-center justify-center flex ml-auto">
                                            {source.trend === "up" ? (
                                                <ArrowUpRight className="h-3 w-3" />
                                            ) : (
                                                <ArrowDownRight className="h-3 w-3" />
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle>Time to Hire Over Time</CardTitle>
                        <CardDescription>
                            Average days to hire across all departments over the last year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <TimeToHireChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
