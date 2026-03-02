import { ArrowLeft, Building2, Calendar, MapPin, Edit } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function JobDetailsPage({ params }: { params: { id: string } }) {
    // Mock data for the specific job
    const job = {
        id: params.id,
        title: "Senior Product Designer",
        department: "Design",
        location: "Remote",
        type: "Full-time",
        status: "Active",
        candidates: 24,
        createdAt: "3 days ago",
        description: `We are looking for an experienced Senior Product Designer to join our dynamic team. You will be responsible for leading the design of our core product features, working closely with engineering and product management to deliver exceptional user experiences.

The ideal candidate has a strong portfolio demonstrating end-to-end design thinking, from user research and wireframing to high-fidelity prototyping and visual design.`,
        requirements: [
            "5+ years of experience in product design",
            "Strong portfolio demonstrating complex workflows",
            "Proficiency in Figma and modern design tools",
            "Experience working in Agile/Scrum environments",
            "Excellent communication and collaboration skills"
        ]
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/jobs">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                            <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                                {job.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {job.department} Department
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <Link href={`/jobs/${job.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="whitespace-pre-wrap text-muted-foreground">
                                {job.description}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                {job.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <div>
                                    <div className="font-medium text-foreground">Employment Type</div>
                                    <div>{job.type}</div>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <div>
                                    <div className="font-medium text-foreground">Location</div>
                                    <div>{job.location}</div>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <div>
                                    <div className="font-medium text-foreground">Date Posted</div>
                                    <div>{job.createdAt}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg border">
                                <div className="text-3xl font-bold">{job.candidates}</div>
                                <div className="text-sm text-muted-foreground mt-1">Total Applicants</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
