"use client"

import { useEffect, useState, use } from "react"
import { MapPin, Briefcase, DollarSign, Calendar, Building2, CheckCircle2, ArrowLeft, Upload, FileText, ExternalLink } from "lucide-react"
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
import { auth } from "@/lib/localAuth"
import { getUserProfile, calculateProfileCompletion } from "@/lib/profileUtils"
import { getJobById, applyToJob } from "@/app/actions/jobActions"
import { uploadToCloudinary } from "@/app/actions/uploadActions"
import MarkdownViewer from "@/components/MarkdownViewer"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function CandidateJobDetailsPage({ params }: { params: { id: string } }) {
    const id = params.id
    const router = useRouter()
    const [isApplying, setIsApplying] = useState(false)
    const [checkingAccess, setCheckingAccess] = useState(true)
    const [canAccess, setCanAccess] = useState(false)
    const [job, setJob] = useState<any>(null)
    const [loadingJob, setLoadingJob] = useState(true)

    // Form fields
    const [firstName, setFirstName] = useState("")
    const [middleName, setMiddleName] = useState("")
    const [lastName, setLastName] = useState("")
    const [mobile, setMobile] = useState("")
    const [email, setEmail] = useState("")
    const [githubLink, setGithubLink] = useState("")
    const [linkedinLink, setLinkedinLink] = useState("")
    const [codolioLink, setCodolioLink] = useState("")
    const [website, setWebsite] = useState("")
    const [address, setAddress] = useState("")
    const [collegeYear, setCollegeYear] = useState("")
    const [collegeBranch, setCollegeBranch] = useState("")
    const [qualifications, setQualifications] = useState("")
    const [gender, setGender] = useState("")
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleApplyJob = async () => {
        if (!firstName || !lastName || !mobile || !email || !address || !collegeYear || !collegeBranch || !qualifications || !gender || !termsAccepted || !resumeFile) {
            alert("Please fill in all mandatory fields, accept the terms, and upload your resume PDF.")
            return
        }
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append("file", resumeFile)
            
            const uploadResult = await uploadToCloudinary(formData) as any
            if (uploadResult.error) {
                alert("Resume upload failed: " + uploadResult.error)
                setIsSubmitting(false)
                return
            }

            const payload = {
                jobId: job.id,
                candidateId: auth.currentUser?.uid || "",
                firstName,
                middleName,
                lastName,
                mobile,
                email,
                githubLink,
                linkedinLink,
                codolioLink,
                website,
                resumeUrl: (uploadResult as any).url,
                address,
                collegeYear,
                collegeBranch,
                qualifications,
                gender
            }

            const res = await applyToJob(payload)
            if (res.success) {
                alert("Application Submitted Successfully!")
                router.push('/candidate/applications')
            } else {
                alert("Database Error: " + res.error)
            }
        } catch (e: any) {
            alert("Error submitting application: " + e.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                const cacheKey = `candidateProfile_${user.uid}`
                let completionFromCache: number | null = null
                let cachedProfile: any = null

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
                            if (cached.profile) {
                                cachedProfile = cached.profile
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error reading cached profile for job details page", error)
                }

                setEmail(user.email || "")

                if (completionFromCache !== null && completionFromCache >= 80) {
                    setCanAccess(true)
                    if (cachedProfile) {
                        const names = (cachedProfile.fullName || "").split(" ")
                        setFirstName(names[0] || "")
                        setLastName(names.slice(1).join(" ") || "")
                        setMobile(cachedProfile.phone || "")
                        setAddress(cachedProfile.currentLocation || "")
                        setLinkedinLink(cachedProfile.linkedin || "")
                        setGithubLink(cachedProfile.github || "")
                    }
                    setCheckingAccess(false)
                    return
                }

                const profile = await getUserProfile(user.uid)
                const completion = calculateProfileCompletion(profile)

                if (completion >= 80) {
                    setCanAccess(true)
                    try {
                        const names = (profile?.fullName || "").split(" ")
                        setFirstName(names[0] || "")
                        setLastName(names.slice(1).join(" ") || "")
                        setMobile(profile?.phone || "")
                        setAddress((profile as any)?.currentLocation || "")
                        setLinkedinLink(profile?.linkedin || "")
                        setGithubLink(profile?.github || "")

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
                        console.error("Error caching profile for job details page", error)
                    }
                } else {
                    alert("Please complete at least 80% of your profile before viewing job details.")
                    router.push("/candidate/profile")
                }
            } catch (error) {
                console.error("Error checking profile completion for job details page", error)
                router.push("/candidate/profile")
            } finally {
                setCheckingAccess(false)
            }
        })

        const fetchJob = async () => {
            if (id) {
                const res = await getJobById(id)
                if (res.success) setJob(res.job)
                setLoadingJob(false)
            }
        }
        fetchJob()

        return () => unsubscribe()
    }, [router, id])

    // Render loading states where applicable

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

    if (loadingJob) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                Loading job details...
            </div>
        )
    }

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* IDENTITY */}
                            <div className="grid gap-2">
                                <Label>First Name *</Label>
                                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Middle Name</Label>
                                <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="A." />
                            </div>
                            <div className="grid gap-2">
                                <Label>Last Name *</Label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Gender *</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* CONTACT & LINKS */}
                            <div className="grid gap-2">
                                <Label>Email Address *</Label>
                                <Input value={email} readOnly className="bg-muted/50 cursor-not-allowed text-muted-foreground" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Mobile Number *</Label>
                                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+1 234 567 890" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Address *</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, Country" />
                            </div>
                            <div className="grid gap-2">
                                <Label>LinkedIn Profile</Label>
                                <Input value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div className="grid gap-2">
                                <Label>GitHub Profile</Label>
                                <Input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/..." />
                            </div>
                            <div className="grid gap-2">
                                <Label>Codolio Link</Label>
                                <Input value={codolioLink} onChange={(e) => setCodolioLink(e.target.value)} placeholder="https://codolio.com/..." />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Personal Website (Optional)</Label>
                                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                            </div>

                            {/* EDUCATION */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label>College Qualifications / Degree *</Label>
                                <Input value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="B.Tech in Computer Science" />
                            </div>
                            <div className="grid gap-2">
                                <Label>College Branch *</Label>
                                <Input value={collegeBranch} onChange={(e) => setCollegeBranch(e.target.value)} placeholder="Computer Science and Engineering" />
                            </div>
                            <div className="grid gap-2">
                                <Label>College Graduation Year *</Label>
                                <Input value={collegeYear} onChange={(e) => setCollegeYear(e.target.value)} placeholder="2025" />
                            </div>

                            {/* RESUME UPLOAD */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Resume (PDF) *</Label>
                                <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <Input 
                                        type="file" 
                                        accept=".pdf" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setResumeFile(e.target.files[0])
                                            }
                                        }}
                                    />
                                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Click or drag PDF to upload resume</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {resumeFile ? <span className="text-primary font-bold">{resumeFile.name}</span> : "PDF up to 5MB"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        {/* TERMS */}
                        <div className="flex items-center space-x-2 border rounded-lg p-4 bg-muted/10 mt-4">
                            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(val) => setTermsAccepted(val as boolean)} />
                            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                                I verify that all the information provided is accurate and I agree to the <Link href="#" className="underline">Terms and Conditions</Link>.
                            </Label>
                        </div>

                        <div className="mt-8 pt-6 border-t flex items-center justify-end gap-3 sticky bottom-0 bg-card z-10 py-4 -mx-6 px-6">
                            <Button type="button" variant="outline" onClick={() => setIsApplying(false)} disabled={isSubmitting}>Back to Details</Button>
                            <Button onClick={handleApplyJob} disabled={isSubmitting || !termsAccepted}>
                                {isSubmitting ? "Submitting Application..." : "Submit Application"}
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
                        <CardContent>
                            <div className="text-muted-foreground">
                                <MarkdownViewer source={job.description} />
                            </div>
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
                                {job.tags.map((tag: string) => (
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
