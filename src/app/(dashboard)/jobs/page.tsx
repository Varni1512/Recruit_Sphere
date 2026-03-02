"use client"

import Link from "next/link"
import { Building2, Calendar, MapPin, MoreHorizontal, Plus } from "lucide-react"

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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { useRouter } from "next/navigation"

const jobs = [
    { id: "1", title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time", status: "Active", candidates: 45, createdAt: "2d ago" },
    { id: "2", title: "Product Marketing Manager", department: "Marketing", location: "New York, NY", type: "Full-time", status: "Active", candidates: 12, createdAt: "5d ago" },
    { id: "3", title: "UX Designer", department: "Design", location: "London, UK", type: "Full-time", status: "Active", candidates: 32, createdAt: "1w ago" },
    { id: "4", title: "Backend Developer", department: "Engineering", location: "Remote", type: "Contract", status: "Paused", candidates: 89, createdAt: "2w ago" },
    { id: "5", title: "Content Strategist", department: "Marketing", location: "Remote", type: "Part-time", status: "Paused", candidates: 15, createdAt: "3w ago" },
    { id: "6", title: "Data Analyst", department: "Data", location: "San Francisco, CA", type: "Full-time", status: "Paused", candidates: 54, createdAt: "1m ago" },
    { id: "7", title: "VP of Engineering", department: "Engineering", location: "Remote", type: "Full-time", status: "Closed", candidates: 124, createdAt: "2m ago" },
    { id: "8", title: "Sales Executive", department: "Sales", location: "Austin, TX", type: "Full-time", status: "Closed", candidates: 8, createdAt: "3m ago" },
    { id: "9", title: "Customer Success Rep", department: "Support", location: "Remote", type: "Contract", status: "Closed", candidates: 67, createdAt: "4m ago" },
]

function JobCard({ job }: { job: typeof jobs[0] }) {
    const router = useRouter()

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-1">{job.department}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/jobs/${job.id}/edit`)}
                            >
                                Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => alert(`Closed job: ${job.title}`)}
                            >
                                Close Job
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Posted {job.createdAt}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
                <Badge variant={job.status === "Active" ? "default" : job.status === "Paused" ? "secondary" : "outline"}>
                    {job.status}
                </Badge>
                <div className="flex -space-x-2">
                    <span className="text-sm font-medium mr-3">{job.candidates} candidates</span>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function JobsPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
                    <p className="text-muted-foreground">
                        Manage your open positions and track candidates.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/jobs/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Job
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="paused">Paused</TabsTrigger>
                    <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.filter(j => j.status === "Active").map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                </TabsContent>

                <TabsContent value="paused" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.filter(j => j.status === "Paused").map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                </TabsContent>

                <TabsContent value="closed" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.filter(j => j.status === "Closed").map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
