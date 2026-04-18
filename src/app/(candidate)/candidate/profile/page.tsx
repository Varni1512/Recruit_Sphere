"use client"

import { Building2, Calendar as CalendarIcon, FileText, Link as LinkIcon, MapPin, Plus, Save, Trash2, Upload, Eye, Download, Linkedin, Github } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
    ssr: false,
    // Fast placeholder so the page layout appears immediately.
    loading: () => (
        <div className="w-full h-[200px] rounded-md bg-muted/40 animate-pulse" />
    ),
})
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { auth, updateProfile } from "@/lib/localAuth"
import { getUserProfile, calculateProfileCompletion, saveUserProfile, type Experience } from "@/lib/profileUtils"
import { uploadToCloudinary } from "@/app/actions/uploadActions"
import { syncCompletionCookieAction } from "@/app/actions/profileActions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

const normalizeResumeUrl = (url: string) =>
    url.startsWith("http://res.cloudinary.com") ? url.replace("http://", "https://") : url

const isPdfResume = (url: string, fileName: string) =>
    /\.pdf($|\?)/i.test(url) || /\.pdf$/i.test(fileName)

const getProxyResumeUrl = (url: string) =>
    url.startsWith("http") ? `/api/proxy-pdf?url=${encodeURIComponent(normalizeResumeUrl(url))}` : url

const getInlinePreviewUrl = (url: string, fileName: string) => {
    const normalizedUrl = normalizeResumeUrl(url)
    if (isPdfResume(normalizedUrl, fileName)) {
        return getProxyResumeUrl(normalizedUrl)
    }
    if (normalizedUrl.startsWith("http")) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(normalizedUrl)}`
    }
    return normalizedUrl
}

export default function CandidateProfilePage() {
    const [summary, setSummary] = useState("")
    const [skills, setSkills] = useState<string[]>([])
    const [newSkill, setNewSkill] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState("")
    const [portfolio, setPortfolio] = useState("")
    const [linkedin, setLinkedin] = useState("")
    const [github, setGithub] = useState("")
    const [photoUrl, setPhotoUrl] = useState("")

    const [resumeUrl, setResumeUrl] = useState("")
    const [resumeName, setResumeName] = useState("")
    const [experiences, setExperiences] = useState<Experience[]>([])

    const [showExperienceForm, setShowExperienceForm] = useState(false)
    const [newExp, setNewExp] = useState<Partial<Experience>>({
        role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: ""
    })

    const [isEditing, setIsEditing] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isUploadingResume, setIsUploadingResume] = useState(false)
    const [completionPercentage, setCompletionPercentage] = useState(0)

    const router = useRouter()

    useEffect(() => {
        // Avoid double-loading when auth state first hydrates.
        let loadingUid: string | null = null

        // 0) Super-fast cache hydrate (before auth listener fires)
        try {
            if (typeof window !== "undefined" && !loadingUid) {
                const lastUid = localStorage.getItem("candidateLastUid")
                if (lastUid) {
                    const cacheKey = `candidateProfile_${lastUid}`
                    const cachedRaw = localStorage.getItem(cacheKey)
                    if (cachedRaw) {
                        const cached = JSON.parse(cachedRaw) as { profile?: any; completion?: number }
                        const cachedProfile = cached.profile
                        const cachedCompletion = cached.completion
                        if (cachedProfile) {
                            setFullName(cachedProfile.fullName || "")
                            setPhone(cachedProfile.phone || "")
                            setLocation(cachedProfile.location || "")
                            setSummary(cachedProfile.summary || "")
                            setSkills(cachedProfile.skills || [])
                            setPortfolio(cachedProfile.portfolio || "")
                            setLinkedin(cachedProfile.linkedin || "")
                            setGithub(cachedProfile.github || "")
                            setPhotoUrl(cachedProfile.photoUrl || "")
                            setResumeUrl(cachedProfile.resumeUrl || "")
                            setResumeName(cachedProfile.resumeName || "")
                            setExperiences(cachedProfile.experiences || [])

                            const completionFromCache =
                                typeof cachedCompletion === "number"
                                    ? cachedCompletion
                                    : calculateProfileCompletion(cachedProfile)

                            setCompletionPercentage(completionFromCache)
                            if (completionFromCache > 0) setIsEditing(false)
                            setIsLoading(false)
                            syncCompletionCookieAction(completionFromCache).catch(console.error)
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error hydrating profile from lastUid cache", error)
        }

        const loadProfile = async (user: any) => {
            if (!user?.uid) return
            if (loadingUid === user.uid) return
            loadingUid = user.uid

            setEmail(user.email || "")
            const cacheKey = `candidateProfile_${user.uid}`

            // 1) Instant UI: hydrate from local cache
            try {
                if (typeof window !== "undefined") {
                    const cachedRaw = localStorage.getItem(cacheKey)
                    if (cachedRaw) {
                        const cached = JSON.parse(cachedRaw) as { profile?: any; completion?: number }
                        const cachedProfile = cached.profile
                        const cachedCompletion = cached.completion

                        if (cachedProfile) {
                            setFullName(cachedProfile.fullName || "")
                            setPhone(cachedProfile.phone || "")
                            setLocation(cachedProfile.location || "")
                            setSummary(cachedProfile.summary || "")
                            setSkills(cachedProfile.skills || [])
                            setPortfolio(cachedProfile.portfolio || "")
                            setLinkedin(cachedProfile.linkedin || "")
                            setGithub(cachedProfile.github || "")
                            setPhotoUrl(cachedProfile.photoUrl || "")
                            setResumeUrl(cachedProfile.resumeUrl || "")
                            setResumeName(cachedProfile.resumeName || "")
                            setExperiences(cachedProfile.experiences || [])

                            const completionFromCache =
                                typeof cachedCompletion === "number"
                                    ? cachedCompletion
                                    : calculateProfileCompletion(cachedProfile)

                            setCompletionPercentage(completionFromCache)
                            if (completionFromCache > 0) setIsEditing(false)
                            setIsLoading(false)
                            syncCompletionCookieAction(completionFromCache).catch(console.error)
                        }
                    }
                }
            } catch (error) {
                console.error("Error reading cached profile", error)
            }

            // 2) Refresh in background
            try {
                const profile = await getUserProfile(user.uid)
                if (profile) {
                    setFullName(profile.fullName || "")
                    setPhone(profile.phone || "")
                    setLocation(profile.location || "")
                    setSummary(profile.summary || "")
                    setSkills(profile.skills || [])
                    setPortfolio(profile.portfolio || "")
                    setLinkedin(profile.linkedin || "")
                    setGithub(profile.github || "")
                    setPhotoUrl(profile.photoUrl || "")
                    setResumeUrl(profile.resumeUrl || "")
                    setResumeName(profile.resumeName || "")
                    setExperiences(profile.experiences || [])

                    const completion = calculateProfileCompletion(profile)
                    setCompletionPercentage(completion)
                    if (completion > 0) setIsEditing(false)
                    syncCompletionCookieAction(completion).catch(console.error)

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
                        console.error("Error caching profile", error)
                    }
                }
            } catch (error) {
                console.error("Error refreshing profile", error)
            } finally {
                setIsLoading(false)
            }
        }

        // Start immediately if auth already has a user.
        const currentUser = auth.currentUser
        if (currentUser) {
            loadProfile(currentUser)
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                router.push("/login")
                return
            }
            loadProfile(user)
        })

        return () => unsubscribe()
    }, [router])

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

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadToCloudinary(formData)

            if ('url' in result && result.url) {
                setPhotoUrl(result.url)
            } else {
                console.error("Upload failed", result)
                alert("Failed to upload photo")
            }
        } catch (error) {
            console.error("Error uploading to Cloudinary", error)
            alert("Failed to upload photo")
        } finally {
            setIsUploading(false)
        }
    }

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingResume(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadToCloudinary(formData)

            if ('url' in result && result.url) {
                setResumeUrl(result.url)
                setResumeName(result.name || file.name)
            } else {
                console.error("Upload failed", result)
                alert("Failed to upload resume")
            }
        } catch (error) {
            console.error("Error uploading to Cloudinary", error)
            alert("Failed to upload resume")
        } finally {
            setIsUploadingResume(false)
        }
    }

    const handleRemoveResume = () => {
        setResumeUrl("")
        setResumeName("")
    }

    const handleAddExperience = () => {
        if (!newExp.role || !newExp.company) {
            alert("Role and Company are required.");
            return;
        }
        const exp: Experience = {
            id: Date.now().toString(),
            role: newExp.role,
            company: newExp.company,
            location: newExp.location || "",
            startDate: newExp.startDate || "",
            endDate: newExp.endDate || "",
            current: newExp.current || false,
            description: newExp.description || ""
        }
        setExperiences([...experiences, exp])
        setNewExp({ role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" })
        setShowExperienceForm(false)
    }

    const handleRemoveExperience = (id: string) => {
        setExperiences(experiences.filter(exp => exp.id !== id))
    }

    const handleSaveProfile = async () => {
        const user = auth.currentUser
        if (!user) return

        setIsSaving(true)
        try {
            const profileData = {
                fullName,
                email,
                phone,
                location,
                summary,
                skills,
                portfolio,
                linkedin,
                github,
                photoUrl,
                resumeUrl,
                resumeName,
                experiences
            }

            await saveUserProfile(user.uid, profileData)

            if (user.photoURL !== photoUrl || user.displayName !== fullName) {
                try {
                    await updateProfile(user, {
                        displayName: fullName,
                        photoURL: photoUrl
                    })
                } catch (err) {
                    console.error("Failed to update auth profile", err)
                }
            }

            const newCompletion = calculateProfileCompletion(profileData)
            setCompletionPercentage(newCompletion)
            setIsEditing(false)

            try {
                if (typeof window !== "undefined") {
                    const cacheKey = `candidateProfile_${user.uid}`
                    localStorage.setItem(
                        cacheKey,
                        JSON.stringify({
                            profile: profileData,
                            completion: newCompletion,
                        })
                    )
                }
            } catch (error) {
                console.error("Error caching profile after save", error)
            }

            if (newCompletion >= 80) {
                router.push('/candidate/dashboard')
            } else {
                alert("Profile saved successfully!")
            }

        } catch (error) {
            console.error("Error saving profile", error)
            alert("Failed to save profile")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-2 animate-pulse">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                    <div className="space-y-2 w-full sm:w-auto">
                        <div className="h-7 w-40 bg-muted rounded" />
                        <div className="h-4 w-64 bg-muted rounded" />
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex flex-col w-full sm:w-[200px] gap-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Profile Completion</span>
                                <span>...</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded" />
                        </div>
                        <div className="h-10 w-32 bg-muted rounded" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <div className="h-64 w-full bg-muted rounded-xl" />
                        <div className="h-56 w-full bg-muted rounded-xl" />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <div className="h-52 w-full bg-muted rounded-xl" />
                        <div className="h-64 w-full bg-muted rounded-xl" />
                        <div className="h-40 w-full bg-muted rounded-xl" />
                    </div>
                </div>
            </div>
        )
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
                            <span>{completionPercentage}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                    </div>
                    {isEditing ? (
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                            {isSaving ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            Change Detail
                        </Button>
                    )}

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
                                    <AvatarImage src={photoUrl || `https://ui-avatars.com/api/?name=${fullName || email}&background=random`} alt="Candidate Avatar" />
                                    <AvatarFallback>CA</AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="relative">
                                        <Button variant="outline" size="sm" disabled={isUploading}>
                                            {isUploading ? "Uploading..." : "Change Photo"}
                                        </Button>
                                        <input
                                            title="Upload Photo"
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handlePhotoUpload}
                                            disabled={isUploading}
                                        />
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} disabled={!isEditing} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} disabled={true} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} disabled={!isEditing} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resume</CardTitle>
                            <CardDescription>Upload your latest resume (PDF, Word).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isEditing && (
                                <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleResumeUpload}
                                        disabled={isUploadingResume}
                                        title="Upload Resume"
                                    />
                                    <div className="p-3 bg-primary/10 text-primary rounded-full">
                                        <Upload className={isUploadingResume ? "h-5 w-5 animate-bounce" : "h-5 w-5"} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {isUploadingResume ? "Uploading..." : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, Word (Max size: 5MB)</p>
                                    </div>
                                </div>
                            )}

                            {resumeUrl ? (
                                <div className="mt-4 p-3 border rounded-md flex items-center justify-between bg-muted/10">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-primary shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <a href={getProxyResumeUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate hover:underline text-primary">
                                                {resumeName || "Candidate Resume"}
                                            </a>
                                            <p className="text-xs text-muted-foreground">Attached</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 hover:bg-muted" 
                                                    title="View Resume"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 gap-0">
                                                <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
                                                    <DialogTitle>Resume Preview</DialogTitle>
                                                    <Button size="sm" asChild className="mr-6">
                                                        <a href={getProxyResumeUrl(resumeUrl)} download={resumeName || "resume"} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4 mr-2" /> Download Document
                                                        </a>
                                                    </Button>
                                                </DialogHeader>
                                                <div className="flex-1 overflow-hidden relative bg-muted/30" style={{ minHeight: "50vh" }}>
                                                    <iframe
                                                        src={getInlinePreviewUrl(resumeUrl, resumeName)}
                                                        className="w-full h-full border-0 bg-white"
                                                        title="Resume Preview"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-muted" 
                                            title="Download Resume"
                                            asChild
                                        >
                                            <a href={getProxyResumeUrl(resumeUrl)} download={resumeName || "resume"} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        {isEditing && (
                                            <Button variant="ghost" size="icon" onClick={handleRemoveResume} className="text-destructive h-8 w-8 shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                !isEditing && (
                                    <div className="text-sm text-muted-foreground italic mt-2">No resume attached.</div>
                                )
                            )}
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
                            <div className="border rounded-md overflow-hidden bg-background min-h-[100px] p-1">
                                <MDEditor
                                    value={summary}
                                    onChange={(val) => setSummary(val || '')}
                                    height={200}
                                    preview={isEditing ? "edit" : "preview"}
                                    hideToolbar={!isEditing}
                                    className="w-full border-none shadow-none"
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
                            {isEditing && (
                                <Button variant="outline" size="sm" onClick={() => setShowExperienceForm(!showExperienceForm)}>
                                    {showExperienceForm ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Add Experience</>}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {showExperienceForm && isEditing && (
                                <div className="p-4 border rounded-md mb-6 bg-muted/20 space-y-4 relative">
                                    <h4 className="font-semibold text-sm">Add New Experience</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2 col-span-2 sm:col-span-1">
                                            <Label>Role/Title</Label>
                                            <Input placeholder="e.g. Software Engineer" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2 col-span-2 sm:col-span-1">
                                            <Label>Company</Label>
                                            <Input placeholder="e.g. Google" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2 col-span-2 sm:col-span-1">
                                            <Label>Location</Label>
                                            <Input placeholder="e.g. New York, NY" value={newExp.location} onChange={(e) => setNewExp({ ...newExp, location: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2 col-span-2 sm:col-span-1 flex items-end">
                                            <div className="flex items-center gap-2 mb-3">
                                                <input type="checkbox" id="current" checked={newExp.current} onChange={(e) => setNewExp({ ...newExp, current: e.target.checked })} className="rounded border-gray-300" />
                                                <Label htmlFor="current" className="font-normal">I currently work here</Label>
                                            </div>
                                        </div>
                                        <div className="grid gap-2 col-span-2 sm:col-span-1">
                                            <Label>Start Date</Label>
                                            <Input placeholder="e.g. Jan 2020" value={newExp.startDate} onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2 col-span-2 sm:col-span-1">
                                            <Label>End Date</Label>
                                            <Input placeholder="e.g. Present or Dec 2023" value={newExp.endDate} disabled={newExp.current} onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Textarea placeholder="Describe your responsibilities and achievements..." rows={3} value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" onClick={handleAddExperience}>Add Role</Button>
                                    </div>
                                </div>
                            )}

                            {experiences.length > 0 ? (
                                experiences.map((exp, index) => (
                                    <div key={exp.id || index} className="relative pl-6 border-l pb-6 last:pb-0 last:border-transparent">
                                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                                        {isEditing && (
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveExperience(exp.id)} className="absolute -right-2 top-0 text-destructive h-8 w-8 hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2 pr-8">
                                            <h4 className="font-bold text-lg">{exp.role}</h4>
                                            <Badge variant="secondary" className="w-fit">
                                                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Building2 className="h-4 w-4" /> {exp.company}
                                            <span className="text-border">•</span>
                                            <MapPin className="h-4 w-4" /> {exp.location}
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="relative pl-6 border-l pb-6 last:pb-0 last:border-transparent text-muted-foreground">
                                    <div className="absolute w-3 h-3 bg-muted rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                                    <h4 className="font-bold text-lg mb-2">No Experience Added</h4>
                                    <p className="text-sm leading-relaxed">
                                        Click &quot;Add Experience&quot; in edit mode to populate your history.
                                    </p>
                                </div>
                            )}
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
                                        {isEditing && (
                                            <button
                                                title="Remove Skill"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="ml-1 text-muted-foreground hover:text-foreground focus:outline-none"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                                {skills.length === 0 && <span className="text-sm text-muted-foreground">No skills added yet.</span>}
                            </div>
                            {isEditing && (
                                <div className="relative">
                                    <Input
                                        placeholder="Type a skill and press Enter..."
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                    />
                                </div>
                            )}
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
                                    <Input id="portfolio" className="rounded-l-none" placeholder="https://" value={portfolio} onChange={e => setPortfolio(e.target.value)} disabled={!isEditing} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center border border-r-0 rounded-l-md bg-muted px-3 h-10 text-muted-foreground">
                                        <Linkedin className="h-4 w-4" />
                                    </div>
                                    <Input id="linkedin" className="rounded-l-none" placeholder="linkedin.com/in/" value={linkedin} onChange={e => setLinkedin(e.target.value)} disabled={!isEditing} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="github">GitHub Profile</Label>
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center border border-r-0 rounded-l-md bg-muted px-3 h-10 text-muted-foreground">
                                        <Github className="h-5 w-5" />
                                    </div>
                                    <Input id="github" className="rounded-l-none" placeholder="github.com/" value={github} onChange={e => setGithub(e.target.value)} disabled={!isEditing} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
