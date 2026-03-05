"use client"

import { Building2, Calendar as CalendarIcon, FileText, Link as LinkIcon, MapPin, Plus, Save, Trash2, Upload } from "lucide-react"
import { useState } from "react"
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function CandidateProfilePage() {
    const [summary, setSummary] = useState("Passionate and results-driven Senior Frontend Engineer with 5+ years of experience building scalable web applications. Expertise in React, TypeScript, and modern styling architectures. Deeply committed to creating accessible, high-performance UIs that solve real user problems.")
    const [skills, setSkills] = useState(["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"])
    const [newSkill, setNewSkill] = useState("")

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSkill.trim() && !skills.includes(newSkill.trim())) {
            e.preventDefault()
            setSkills([...skills, newSkill.trim()])
            setNewSkill("")
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove))
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your personal information, resume, and experience.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col w-full sm:w-[200px] gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span>Profile Completion</span>
                            <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                    </div>
                    <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Basic Info & Resume */}
                <div className="md:col-span-1 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Info</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="https://avatar.vercel.sh/alex.png" alt="Candidate Avatar" />
                                    <AvatarFallback>CA</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" size="sm">Change Photo</Button>
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" defaultValue="Alex Candidate" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="alex@example.com" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" defaultValue="New York, NY" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resume</CardTitle>
                            <CardDescription>Upload your latest resume (PDF, Word).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                                <div className="p-3 bg-primary/10 text-primary rounded-full">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB</p>
                                </div>
                            </div>

                            <div className="mt-4 p-3 border rounded-md flex items-center justify-between bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-medium truncate">alex_resume_2026.pdf</p>
                                        <p className="text-xs text-muted-foreground">Updated 2 days ago</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Experience, Education, Skills */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md overflow-hidden bg-background">
                                <MDEditor
                                    value={summary}
                                    onChange={(val) => setSummary(val || '')}
                                    height={200}
                                    preview="edit"
                                    hideToolbar={false}
                                    className="w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Experience</CardTitle>
                                <CardDescription>Showcase your previous roles.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" /> Add Experience
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative pl-6 border-l pb-6 last:pb-0 last:border-transparent">
                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                    <h4 className="font-bold text-lg">Senior Frontend Engineer</h4>
                                    <Badge variant="secondary" className="w-fit">2023 - Present</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Building2 className="h-4 w-4" /> TechCorp Solutions
                                    <span className="text-border">•</span>
                                    <MapPin className="h-4 w-4" /> New York, NY
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Led the frontend architecture migration to Next.js App Router for the core enterprise product, improving Lighthouse scores by 40%. Mentored junior developers and established CI/CD testing pipelines for the UI layer.
                                </p>
                            </div>
                            <div className="relative pl-6 border-l pb-6 last:pb-0 last:border-transparent">
                                <div className="absolute w-3 h-3 bg-muted-foreground rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                    <h4 className="font-bold text-lg">Frontend Developer</h4>
                                    <Badge variant="outline" className="w-fit">2020 - 2023</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Building2 className="h-4 w-4" /> StartUp Inc.
                                    <span className="text-border">•</span>
                                    <MapPin className="h-4 w-4" /> San Francisco, CA
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Developed responsive client-facing dashboards using React and Redux. Collaborated tightly with design teams to implement complex animations and micro-interactions.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Expertise</CardTitle>
                            <CardDescription>Add keywords that highlight your strengths.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1.5">
                                        {skill}
                                        <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-1 text-muted-foreground hover:text-foreground focus:outline-none"
                                        >
                                            &times;
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder="Type a skill and press Enter..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Links</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="portfolio">Portfolio / Website</Label>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center border border-r-0 rounded-l-md bg-muted px-3 h-10 text-muted-foreground">
                                        <LinkIcon className="h-4 w-4" />
                                    </div>
                                    <Input id="portfolio" className="rounded-l-none" placeholder="https://" defaultValue="https://alexcandidate.dev" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center border border-r-0 rounded-l-md bg-muted px-3 h-10 text-muted-foreground">
                                        in
                                    </div>
                                    <Input id="linkedin" className="rounded-l-none" placeholder="linkedin.com/in/" defaultValue="linkedin.com/in/alexcandidate" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="github">GitHub Profile</Label>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center border border-r-0 rounded-l-md bg-muted px-3 h-10 text-muted-foreground">
                                        gh
                                    </div>
                                    <Input id="github" className="rounded-l-none" placeholder="github.com/" defaultValue="github.com/alexcand" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
