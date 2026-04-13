"use client"

import { Building2, Save, ArrowLeft, X, GripVertical, Star, Calendar } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createJob } from "@/app/actions/jobActions"
import { extractKeywordsFromText } from "@/lib/atsUtils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

import dynamic from 'next/dynamic'

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

export default function CreateJobPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [department, setDepartment] = useState("")
    const [type, setType] = useState("")
    const [locationType, setLocationType] = useState("")
    const [location, setLocation] = useState("")
    const [experience, setExperience] = useState("")
    const [salary, setSalary] = useState("")
    const [description, setDescription] = useState("")
    const [applicationCloseDays, setApplicationCloseDays] = useState<number>(3)
    const [hiringDeadlineDays, setHiringDeadlineDays] = useState<number>(15)
    const [isSaving, setIsSaving] = useState(false)
    const [showATSModal, setShowATSModal] = useState(false)
    const [atsKeywords, setAtsKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")
    const [atsCriteriaScore, setAtsCriteriaScore] = useState<number>(75)

    const [pipelineRounds, setPipelineRounds] = useState([
        { id: "aptitude", name: "Aptitude", selected: false, totalScore: 100, passingScore: 70 },
        { id: "coding", name: "Coding", selected: false, totalScore: 100, passingScore: 70 },
        { id: "coding2", name: "Coding 2", selected: false, totalScore: 100, passingScore: 70 },
        { id: "ai_interview", name: "AI Interview", selected: false, totalScore: 100, passingScore: 70 },
        { id: "tech_interview", name: "Technical Interview", selected: false, totalScore: 100, passingScore: 70 },
        { id: "final_interview", name: "Final Interview", selected: false, totalScore: 100, passingScore: 70 },
    ])

    const toggleRound = (id: string) => {
        setPipelineRounds(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r))
    }

    const updateRoundScore = (id: string, field: 'totalScore' | 'passingScore', value: number) => {
        setPipelineRounds(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    }

    const addKeyword = () => {
        if (newKeyword.trim() && !atsKeywords.includes(newKeyword.trim())) {
            setAtsKeywords([...atsKeywords, newKeyword.trim()])
            setNewKeyword("")
        }
    }

    const handlePreSave = () => {
        if (!title || !department || !type || !locationType || !location || !experience || !salary) {
            alert("Please fill in all required fields.")
            return
        }
        const extracted = extractKeywordsFromText(description || title)
        setAtsKeywords(extracted)
        setShowATSModal(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const selectedRounds = pipelineRounds
                .filter(r => r.selected)
                .map(r => ({
                    roundName: r.name,
                    totalScore: r.totalScore,
                    passingScore: r.passingScore
                }))

            const result = await createJob({
                title,
                department,
                type,
                locationType,
                location,
                experience,
                salary,
                description,
                atsKeywords,
                atsCriteriaScore,
                applicationCloseDays,
                hiringDeadlineDays,
                hiringPipeline: selectedRounds
            })

            if (result.success) {
                router.push('/jobs')
            } else {
                alert("Failed to create job: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setIsSaving(false)
            setShowATSModal(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-6 px-1">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/jobs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
                    <p className="text-muted-foreground">
                        Fill out the details to create a new job opening.
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
                        <Input id="title" placeholder="e.g. Senior Product Designer" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                            <Input id="location" placeholder="e.g. New York, NY" value={location} onChange={(e) => setLocation(e.target.value)} />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="app-days">Application Window (Days)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="app-days" type="number" value={applicationCloseDays} onChange={(e) => setApplicationCloseDays(Number(e.target.value))} />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">days to apply</span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hiring-days">Hiring Window (Days)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="hiring-days" type="number" value={hiringDeadlineDays} onChange={(e) => setHiringDeadlineDays(Number(e.target.value))} />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">total days to hire</span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid gap-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-lg font-bold">Hiring Pipeline</Label>
                            <p className="text-sm text-muted-foreground">Select the rounds for this job and set the qualifying scores.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pipelineRounds.map((round) => (
                                <div key={round.id} className={`p-4 rounded-xl border transition-all ${round.selected ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-muted/10 border-border/50'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox 
                                                id={`round-${round.id}`} 
                                                checked={round.selected} 
                                                onCheckedChange={() => toggleRound(round.id)}
                                            />
                                            <Label htmlFor={`round-${round.id}`} className="font-semibold cursor-pointer">{round.name}</Label>
                                        </div>
                                    </div>
                                    
                                    {round.selected && (
                                        <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs text-muted-foreground">Total Score</Label>
                                                <Input 
                                                    type="number" 
                                                    className="h-8 text-sm"
                                                    value={round.totalScore} 
                                                    onChange={(e) => updateRoundScore(round.id, 'totalScore', Number(e.target.value))} 
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs text-muted-foreground">Passing Score</Label>
                                                <Input 
                                                    type="number" 
                                                    className="h-8 text-sm text-primary font-medium"
                                                    value={round.passingScore} 
                                                    onChange={(e) => updateRoundScore(round.id, 'passingScore', Number(e.target.value))} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
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
                </CardContent>
                <CardFooter className="flex justify-end gap-4 border-t px-6 py-4">
                    <Button variant="outline" asChild disabled={isSaving}>
                        <Link href="/jobs">Cancel</Link>
                    </Button>
                    <Button onClick={handlePreSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Job"}
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={showATSModal} onOpenChange={setShowATSModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Configure ATS Scoring</DialogTitle>
                        <DialogDescription>
                            We automatically extracted priority keywords from your description. The system will use these to scan incoming candidate resumes and automatically shortlist them if their score is high enough.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Extracted Keywords</Label>
                            <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-muted/50 min-h-[80px] content-start">
                                {atsKeywords.length === 0 ? <p className="text-sm text-muted-foreground">No keywords extracted.</p> : null}
                                {atsKeywords.map((keyword, i) => (
                                    <Badge key={i} variant="secondary" className="flex items-center gap-1 pr-1.5 py-1">
                                        {keyword}
                                        <button 
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
                            <Label htmlFor="criteriaScore">Minimum Shortlisting Score (%)</Label>
                            <Input 
                                id="criteriaScore" 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={atsCriteriaScore} 
                                onChange={(e) => setAtsCriteriaScore(Number(e.target.value))} 
                            />
                            <p className="text-xs text-muted-foreground text-balance">Candidates with a resume match score equal or above this will bypass the Applied stage and immediately enter the Shortlisted stage.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowATSModal(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Posting..." : "Confirm & Post Job"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
