"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { availableJobs } from "@/lib/dummyData"
import { auth } from "@/lib/localAuth"
import { getUserProfile, calculateProfileCompletion } from "@/lib/profileUtils"

export default function CandidateJobsPage() {
    const router = useRouter()
    const [checkingAccess, setCheckingAccess] = useState(true)
    const [canAccess, setCanAccess] = useState(false)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                const cacheKey = `candidateProfile_${user.uid}`
                let completionFromCache: number | null = null

                try {
                    if (typeof window !== "undefined") {
                        const cachedRaw = localStorage.getItem(cacheKey)
                        if (cachedRaw) {
                            const cached = JSON.parse(cachedRaw) as { profile?: any; completion?: number }
                            if (typeof cached.completion === "number") {
                                completionFromCache = cached.completion
                            } else if (cached.profile) {
                                completionFromCache = calculateProfileCompletion(cached.profile)
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error reading cached profile for jobs page", error)
                }

                // If cache confidently says 80%+, allow immediately
                if (completionFromCache !== null && completionFromCache >= 80) {
                    setCanAccess(true)
                    setCheckingAccess(false)
                    return
                }

                // Fallback to profile storage check
                const profile = await getUserProfile(user.uid)
                const completion = calculateProfileCompletion(profile)

                if (completion >= 80) {
                    setCanAccess(true)
                    try {
                        if (typeof window !== "undefined") {
                            localStorage.setItem(
                                cacheKey,
                                JSON.stringify({
                                    profile,
                                    completion,
                                })
                            )
                        }
                    } catch (error) {
                        console.error("Error caching profile for jobs page", error)
                    }
                } else {
                    alert("Please complete at least 80% of your profile before browsing jobs.")
                    router.push("/candidate/profile")
                }
            } catch (error) {
                console.error("Error checking profile completion for jobs page", error)
                router.push("/candidate/profile")
            } finally {
                setCheckingAccess(false)
            }
        })

        return () => unsubscribe()
    }, [router])

    if (checkingAccess && !canAccess) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                Checking your profile completion...
            </div>
        )
    }

    if (!canAccess) {
        return null
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4">
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
                <div className="hidden md:flex flex-col gap-6 col-span-1 border-r pr-6 sticky top-0 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
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
                <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col gap-4">
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

                    <div className="pb-6">
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
