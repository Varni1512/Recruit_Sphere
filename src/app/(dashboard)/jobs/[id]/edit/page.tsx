"use client"

import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getJobById, updateJob } from "@/app/actions/jobActions"
import dynamic from 'next/dynamic'
import { Badge } from "@/components/ui/badge"

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function EditJobPage({ params }: { params: { id: string } }) {
    const id = params.id
    const router = useRouter()
    
    const [title, setTitle] = useState("")
    const [department, setDepartment] = useState("")
    const [type, setType] = useState("")
    const [locationType, setLocationType] = useState("")
    const [location, setLocation] = useState("")
    const [experience, setExperience] = useState("")
    const [salary, setSalary] = useState("")
    const [description, setDescription] = useState("")
    const [atsKeywords, setAtsKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")
    const [atsCriteriaScore, setAtsCriteriaScore] = useState<number>(75)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const addKeyword = () => {
        if (newKeyword.trim() && !atsKeywords.includes(newKeyword.trim())) {
            setAtsKeywords([...atsKeywords, newKeyword.trim()])
            setNewKeyword("")
        }
    }

    useEffect(() => {
        const fetchJob = async () => {
            if (id) {
                const res = await getJobById(id)
                if (res.success && res.job) {
                    setTitle(res.job.title)
                    setDepartment(res.job.department)
                    setType(res.job.type)
                    setLocationType(res.job.locationType)
                    setLocation(res.job.location)
                    setExperience(res.job.experience || "")
                    setSalary(res.job.salary || "")
                    setDescription(res.job.description)
                    setAtsKeywords(res.job.atsKeywords || [])
                    setAtsCriteriaScore(res.job.atsCriteriaScore || 75)
                }
                setIsLoading(false)
            }
        }
        fetchJob()
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateJob(id, {
                title,
                department,
                type,
                locationType,
                location,
                experience,
                salary,
                description,
                atsKeywords,
                atsCriteriaScore
            })
            if (result.success) {
                router.push(`/jobs/${id}`)
            } else {
                alert("Failed to update job: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center p-20 text-muted-foreground">Loading job details...</div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-8 px-1">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/jobs/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
                    <p className="text-muted-foreground">
                        Update the details of the job position.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                        Basic information about the position.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Employment Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location-type">Location Type</Label>
                            <Select value={locationType} onValueChange={setLocationType}>
                                <SelectTrigger id="location-type">
                                    <SelectValue placeholder="Select location type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="onsite">On-site</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="experience">Experience Level</Label>
                            <Select value={experience} onValueChange={setExperience}>
                                <SelectTrigger id="experience">
                                    <SelectValue placeholder="Select experience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                                    <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                                    <SelectItem value="Senior">Senior</SelectItem>
                                    <SelectItem value="Director/Executive">Director/Executive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="salary">Estimated Salary</Label>
                            <Input id="salary" placeholder="e.g. $80,000 - $100,000" value={salary} onChange={(e) => setSalary(e.target.value)} />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-2">
                        <Label htmlFor="description">Job Description</Label>
                        <div className="border rounded-md overflow-hidden bg-background">
                            <MDEditor
                                value={description}
                                onChange={(val) => setDescription(val || '')}
                                height={300}
                                preview="edit"
                                hideToolbar={false}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-2">
                        <Label>ATS Keyword Targets</Label>
                        <p className="text-xs text-muted-foreground">Used to automatically score and shortlist incoming resumes.</p>
                        <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-muted/50 min-h-[80px] content-start">
                            {atsKeywords.length === 0 ? <p className="text-sm text-muted-foreground">No keywords defined.</p> : null}
                            {atsKeywords.map((keyword, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1 pr-1.5 py-1">
                                    {keyword}
                                    <button 
                                        type="button"
                                        onClick={() => setAtsKeywords(prev => prev.filter((_, idx) => idx !== i))}
                                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Add custom keyword..." 
                                value={newKeyword} 
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addKeyword()
                                    }
                                }}
                            />
                            <Button type="button" onClick={addKeyword} variant="secondary">Add</Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="criteriaScore">Minimum ATS Shortlisting Score (%)</Label>
                        <Input 
                            id="criteriaScore" 
                            type="number" 
                            min="0" 
                            max="100" 
                            value={atsCriteriaScore} 
                            onChange={(e) => setAtsCriteriaScore(Number(e.target.value))} 
                        />
                        <p className="text-xs text-muted-foreground">Candidates must meet or exceed this percentage score to automatically bypass the Applied stage.</p>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-4 border-t px-6 py-4">
                    <Button variant="outline" asChild disabled={isSaving}>
                        <Link href={`/jobs/${id}`}>Cancel</Link>
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
