"use client"

import { Building2, Calendar, MapPin, Search } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export const availableJobs = [
    {
        id: "1",
        title: "Senior Product Designer",
        company: "Acme Corp",
        location: "New York, NY (Hybrid)",
        type: "Full-time",
        experience: "Senior",
        salary: "$130k - $160k",
        posted: "2 hours ago",
        tags: ["Figma", "Design Systems", "UX Research"],
        description: "We are looking for an experienced Senior Product Designer to join our dynamic team and lead the design of our core platform features."
    },
    {
        id: "2",
        title: "Frontend Engineer",
        company: "Stark Industries",
        location: "Remote",
        type: "Full-time",
        experience: "Mid-Level",
        salary: "$110k - $140k",
        posted: "5 hours ago",
        tags: ["React", "TypeScript", "Next.js"],
        description: "Join Stark Industries to build cutting-edge web applications using modern technologies like React and Next.js."
    },
    {
        id: "3",
        title: "Marketing Manager",
        company: "Wayne Enterprises",
        location: "Gotham City (On-site)",
        type: "Full-time",
        experience: "Mid-Level",
        salary: "$90k - $120k",
        posted: "1 day ago",
        tags: ["Growth", "B2B", "Content"],
        description: "Lead our B2B marketing initiatives and grow our enterprise customer base through strategic campaigns."
    },
    {
        id: "4",
        title: "DevOps Engineer",
        company: "Globex",
        location: "Remote",
        type: "Contract",
        experience: "Senior",
        salary: "$80 - $120 / hr",
        posted: "2 days ago",
        tags: ["AWS", "Kubernetes", "CI/CD"],
        description: "Help us scale our infrastructure and improve our deployment pipelines across our global architecture."
    },
    {
        id: "5",
        title: "Junior Data Analyst",
        company: "Initech",
        location: "Austin, TX (Hybrid)",
        type: "Full-time",
        experience: "Entry",
        salary: "$65k - $85k",
        posted: "3 days ago",
        tags: ["SQL", "Python", "Tableau"],
        description: "Analyze user behavior data to help our product team make informed decisions and improve our metrics."
    },
    {
        id: "6",
        title: "VP of Engineering",
        company: "Umbrella Corp",
        location: "Remote",
        type: "Full-time",
        experience: "Director",
        salary: "$180k - $220k",
        posted: "1 week ago",
        tags: ["Leadership", "Cloud", "Strategy"],
        description: "Lead a global engineering organization of 50+ engineers to deliver scalable healthcare solutions."
    },
]

export default function CandidateJobsPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Browse Jobs</h1>
                    <p className="text-muted-foreground mt-1">
                        Find and apply for your next career opportunity.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 flex-1 min-h-0">

                {/* Filters Sidebar */}
                <div className="hidden md:flex flex-col gap-6 col-span-1 border-r pr-6 overflow-auto">
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Filters</h3>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Job Type</label>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Experience</label>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="entry">Entry Level</SelectItem>
                                <SelectItem value="mid">Mid-Level</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                                <SelectItem value="director">Director/Executive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Location</label>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Anywhere" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Anywhere</SelectItem>
                                <SelectItem value="remote">Remote Only</SelectItem>
                                <SelectItem value="onsite">On-site</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <Button variant="outline" className="w-full">Clear Filters</Button>
                </div>

                {/* Main Job List */}
                <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col h-full gap-4 min-h-0 overflow-hidden">
                    <div className="flex gap-2 shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by job title, company, or keywords..."
                                className="pl-8 bg-background h-10 shadow-sm"
                            />
                        </div>
                        <Button className="shrink-0 h-10 px-8">Search</Button>
                        <Button variant="outline" className="shrink-0 md:hidden h-10">Filters</Button>
                    </div>

                    <div className="flex-1 overflow-auto bg-transparent pb-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {availableJobs.map((job) => (
                                <Card key={job.id} className="flex flex-col hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg line-clamp-1" title={job.title}>{job.title}</CardTitle>
                                                <CardDescription className="text-primary font-medium mt-1 truncate">
                                                    {job.company}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary" className="shrink-0 whitespace-nowrap">
                                                {job.posted}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4 flex-1">
                                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2 truncate">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 shrink-0" />
                                                <span>{job.type} • {job.experience}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                                            {job.tags.map(tag => (
                                                <Badge key={tag} variant="outline" className="text-[10px] sm:text-xs font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 pb-4 px-6 border-t mt-4 flex items-center justify-between">
                                        <span className="text-sm font-semibold">{job.salary}</span>
                                        <Button size="sm" asChild>
                                            <Link href={`/candidate/jobs/${job.id}`}>View & Apply</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
