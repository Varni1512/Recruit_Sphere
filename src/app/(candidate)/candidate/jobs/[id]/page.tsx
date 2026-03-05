"use client"

import { MapPin, Briefcase, DollarSign, Calendar, Building2, CheckCircle2, ArrowLeft, Upload, FileText, ExternalLink } from "lucide-react"
import { useState, use } from "react"
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { availableJobs } from "../page"

export default function CandidateJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [isApplying, setIsApplying] = useState(false)
    const [coverLetter, setCoverLetter] = useState("")

    // Find the specific job from the shared mock data
    const job = availableJobs.find(j => j.id === id)

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <h1 className="text-2xl font-bold">Job Not Found</h1>
                <p className="text-muted-foreground mt-2">The job you are looking for does not exist or has been removed.</p>
                <Button className="mt-6" asChild>
                    <Link href="/candidate/jobs">Back to Jobs</Link>
                </Button>
            </div>
        )
    }

    if (isApplying) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4">
                <div className="flex items-center gap-4 shrink-0 mt-4 sm:mt-0">
                    <Button variant="ghost" size="icon" onClick={() => setIsApplying(false)} className="shrink-0 group">
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-1">Apply for {job.title}</h1>
                        <p className="text-primary font-medium mt-1">
                            {job.company}
                        </p>
                    </div>
                </div>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Submit Your Application</CardTitle>
                        <CardDescription>Please provide your most up-to-date information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="resume">Resume / CV</Label>
                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Click to upload resume</p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="coverLetter">Cover Letter</Label>
                                <div className="border rounded-md overflow-hidden bg-background">
                                    <MDEditor
                                        value={coverLetter}
                                        onChange={(val) => setCoverLetter(val || '')}
                                        height={250}
                                        preview="edit"
                                        hideToolbar={false}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="portfolio">Portfolio / Work Links</Label>
                                <Input id="portfolio" placeholder="https://" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="salary">Expected Salary (Optional)</Label>
                                <Input id="salary" placeholder="e.g. $120,000" />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t flex items-center justify-end gap-3 sticky bottom-0 bg-card z-10 py-4 -mx-6 px-6">
                            <Button variant="outline" onClick={() => setIsApplying(false)}>Back to Details</Button>
                            <Button onClick={() => {
                                alert("Application Submitted successfully!")
                                router.push('/candidate/applications')
                            }}>
                                Submit Application
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 mt-4 sm:mt-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="shrink-0 group">
                        <Link href="/candidate/jobs">
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                        <p className="text-primary font-medium text-lg mt-1">
                            {job.company}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button className="w-full sm:w-auto shadow-md" size="lg" onClick={() => setIsApplying(true)}>Apply Now</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-foreground leading-relaxed">
                                {job.description}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Nulla quis lorem ut libero malesuada feugiat. Donec sollicitudin molestie malesuada.
                            </p>
                            <h4 className="font-semibold mt-6 mb-2">Key Responsibilities</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                <li>Lead the design and development of core features.</li>
                                <li>Collaborate with cross-functional teams to define requirements.</li>
                                <li>Ensure high performance and responsiveness of the application.</li>
                                <li>Identify and resolve bottlenecks and bugs.</li>
                            </ul>
                            <h4 className="font-semibold mt-6 mb-2">Requirements</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                <li>Proven experience in the specified domain.</li>
                                <li>Strong problem-solving and communication skills.</li>
                                <li>Ability to work independently and as part of a team.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Location</div>
                                        <div className="font-medium mt-1 text-sm">{job.location}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Job Type</div>
                                        <div className="font-medium mt-1 text-sm">{job.type}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Experience Level</div>
                                        <div className="font-medium mt-1 text-sm">{job.experience}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                        <span className="h-5 w-5 flex items-center justify-center font-bold text-lg">$</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Estimated Salary</div>
                                        <div className="font-medium mt-1 text-sm">{job.salary}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="font-normal text-xs px-2 py-1">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
