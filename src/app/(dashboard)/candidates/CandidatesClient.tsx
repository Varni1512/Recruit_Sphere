"use client"

import { useState, useMemo } from "react"
import { Eye, Filter, Link as LinkIcon, Mail, MapPin, MoreHorizontal, Search, Star, Download, FileText, Phone, Github } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { StatusActionItem, RejectActionItem, SendEmailActionItem } from "./StatusActions"

const normalizeResumeUrl = (url: string) =>
    url.startsWith("http://res.cloudinary.com") ? url.replace("http://", "https://") : url

const isPdfResume = (url: string) => /\.pdf($|\?)/i.test(url)

const getProxyResumeUrl = (url: string) =>
    url.startsWith("http") ? `/api/proxy-pdf?url=${encodeURIComponent(normalizeResumeUrl(url))}` : url

const getInlinePreviewUrl = (url: string) => {
    const normalizedUrl = normalizeResumeUrl(url)
    if (isPdfResume(normalizedUrl)) {
        return getProxyResumeUrl(normalizedUrl)
    }
    if (normalizedUrl.startsWith("http")) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(normalizedUrl)}`
    }
    return normalizedUrl
}

interface CandidatesClientProps {
    initialCandidates: any[]
    jobs: any[]
}

export function CandidatesClient({ initialCandidates, jobs = [] }: CandidatesClientProps) {
    const [selectedJobId, setSelectedJobId] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("shortlisted")

    const displayRounds = useMemo(() => {
        if (selectedJobId === "all") {
            const allRounds = new Set<string>();
            jobs.forEach(job => {
                job.pipelineStages?.forEach((stage: string) => allRounds.add(stage));
            });
            const standardOrder = ["Aptitude", "Coding", "AI Interview", "Technical Interview", "Final Interview"];
            return Array.from(allRounds).sort((a, b) => {
                const indexA = standardOrder.indexOf(a);
                const indexB = standardOrder.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        } else {
            const job = jobs.find(j => j.id === selectedJobId);
            return job?.pipelineStages || [];
        }
    }, [selectedJobId, jobs]);

    const roundToScoreMap: Record<string, string> = {
        "Aptitude": "aptitudeScore",
        "Coding": "codingScore",
        "AI Interview": "aiInterviewScore",
        "Technical Interview": "technicalInterviewScore",
        "Final Interview": "finalInterviewScore"
    };
    
    // Filter by job and search query
    const filteredCandidates = initialCandidates.filter(c => {
        if (selectedJobId !== "all" && c.jobId !== selectedJobId) return false
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return c.name.toLowerCase().includes(query) || 
                   c.email.toLowerCase().includes(query) ||
                   c.role.toLowerCase().includes(query)
        }
        if (statusFilter === "shortlisted" && !["Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"].includes(c.status)) {
            return false
        }
        
        return true
    })

    return (
        <div className="flex flex-col gap-4">
            {jobs.length > 0 && (
                <div className="w-full max-w-sm mb-2">
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Job" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id}>
                                    {job.company} - {job.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex w-full max-w-sm items-center space-x-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search candidates by name, email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shortlisted">Shortlisted & Above</SelectItem>
                                    <SelectItem value="all">All Candidates</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Applied Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="whitespace-nowrap">Resume</TableHead>
                                {displayRounds.map((round: string) => (
                                    <TableHead key={round} className="whitespace-nowrap">{round}</TableHead>
                                ))}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCandidates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={displayRounds.length + 5} className="text-center py-10 text-muted-foreground">
                                        No candidates match the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredCandidates.map((candidate: any) => (
                                <TableRow key={candidate.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm w-32 truncate" title={candidate.name}>{candidate.name}</span>
                                            <span className="text-xs text-muted-foreground w-32 truncate" title={candidate.email}>{candidate.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">{candidate.role}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                candidate.status === "Hire" || candidate.status === "Offer" ? "default" :
                                                candidate.status === "Rejected" ? "destructive" :
                                                candidate.status === "Applied" ? "outline" : "secondary"
                                            }
                                            className={candidate.status === "Hire" || candidate.status === "Offer" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                        >
                                            {candidate.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center bg-muted/50 rounded-md px-2 py-1 font-medium text-xs">
                                            {candidate.resumeScore ?? 0}
                                        </div>
                                    </TableCell>
                                    {displayRounds.map((round: string) => {
                                        const scoreKey = roundToScoreMap[round];
                                        return (
                                            <TableCell key={round}>
                                                <div className="flex items-center justify-center bg-muted/50 rounded-md px-2 py-1 font-medium text-xs">
                                                    {scoreKey ? (candidate[scoreKey] ?? 0) : 0}
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-right whitespace-nowrap">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon" className="mr-2">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View candidate details</span>
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent className="sm:max-w-md w-[95vw] sm:w-[450px] overflow-y-auto p-4 sm:p-5">
                                                <SheetHeader className="p-0">
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div>
                                                            <SheetTitle className="text-xl">{candidate.name}</SheetTitle>
                                                            <SheetDescription className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">{candidate.location}</span>
                                                            </SheetDescription>
                                                        </div>
                                                    </div>
                                                </SheetHeader>
                                                <div className="grid gap-6 py-6">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                            <a href={`mailto:${candidate.email}`} className="hover:underline truncate">{candidate.email}</a>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                            <span>{candidate.mobile || "N/A"}</span>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-2">
                                                            {candidate.linkedinLink && candidate.linkedinLink !== "#" && (
                                                                <div className="flex flex-1 items-center gap-2 min-w-[120px]">
                                                                    <LinkIcon className="h-4 w-4 shrink-0 text-[#0a66c2]" />
                                                                    <a href={candidate.linkedinLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">LinkedIn</a>
                                                                </div>
                                                            )}
                                                            {candidate.githubLink && candidate.githubLink !== "#" && (
                                                                <div className="flex flex-1 items-center gap-2 min-w-[120px]">
                                                                    <Github className="h-4 w-4 shrink-0" />
                                                                    <a href={candidate.githubLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">GitHub</a>
                                                                </div>
                                                            )}
                                                            {candidate.codolioLink && candidate.codolioLink !== "#" && (
                                                                <div className="flex flex-1 items-center gap-2 min-w-[120px]">
                                                                    <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                    <a href={candidate.codolioLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">Codolio</a>
                                                                </div>
                                                            )}
                                                            {candidate.website && candidate.website !== "#" && (
                                                                <div className="flex flex-1 items-center gap-2 min-w-[120px]">
                                                                    <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                    <a href={candidate.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">Website</a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="flex flex-col border rounded-lg p-3 bg-muted/20">
                                                            <span className="text-xs text-muted-foreground">Applied Role</span>
                                                            <span className="font-medium text-sm line-clamp-1" title={candidate.role}>{candidate.role}</span>
                                                        </div>
                                                        <div className="flex flex-col border rounded-lg p-3 bg-muted/20">
                                                            <span className="text-xs text-muted-foreground">Qualifications</span>
                                                            <span className="font-medium text-sm line-clamp-1" title={candidate.qualifications}>{candidate.qualifications || "N/A"}</span>
                                                        </div>
                                                        <div className="flex flex-col border rounded-lg p-3 bg-muted/20">
                                                            <span className="text-xs text-muted-foreground">College Branch</span>
                                                            <span className="font-medium text-sm line-clamp-1" title={candidate.collegeBranch}>{candidate.collegeBranch || "N/A"}</span>
                                                        </div>
                                                        <div className="flex flex-col border rounded-lg p-3 bg-muted/20">
                                                            <span className="text-xs text-muted-foreground">Graduation Year</span>
                                                            <span className="font-medium text-sm line-clamp-1">{candidate.collegeYear || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {candidate.resumeUrl && candidate.resumeUrl !== "#" && (
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3">Resume</h4>
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border rounded-lg p-4 bg-muted/10 gap-4 sm:gap-2">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-8 w-8 text-red-500" />
                                                                    <div>
                                                                        <p className="font-medium text-sm">Resume.pdf</p>
                                                                        <p className="text-xs text-muted-foreground">Uploaded {candidate.appliedAt}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">Preview</Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="max-w-4xl w-full h-[90vh]">
                                                                            <DialogHeader>
                                                                                <DialogTitle>Resume Preview</DialogTitle>
                                                                            </DialogHeader>
                                                                            <div className="flex-1 w-full h-full min-h-[500px]">
                                                                                <iframe 
                                                                                    src={getInlinePreviewUrl(candidate.resumeUrl)} 
                                                                                    className="w-full h-full border-0 rounded-md"
                                                                                    title="Resume Preview"
                                                                                />
                                                                            </div>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => window.open(candidate.resumeUrl, '_blank')}>
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[200px]">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => window.open(getInlinePreviewUrl(candidate.resumeUrl), '_blank')}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Resume
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(candidate.resumeUrl, '_blank')}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Resume
                                                </DropdownMenuItem>
                                                
                                                <SendEmailActionItem candidateId={candidate.id} />
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {(() => {
                                                                const jobStages = candidate.pipelineStages && candidate.pipelineStages.length > 0 
                                                                    ? candidate.pipelineStages 
                                                                    : ["Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"];
                                                                const displayStages = jobStages.filter((s: string) => s !== "Applied");
                                                                const stages = ["Applied", ...displayStages];
                                                                
                                                                return displayStages.map((stage: string) => {
                                                                    const currentIndex = stages.indexOf(candidate.status);
                                                                    const targetIndex = stages.indexOf(stage);
                                                                    const isDisabled = targetIndex <= currentIndex || candidate.status === "Rejected";

                                                                    return (
                                                                        <StatusActionItem 
                                                                            key={stage} 
                                                                            stage={stage} 
                                                                            candidateId={candidate.id} 
                                                                            isDisabled={isDisabled} 
                                                                        />
                                                                    );
                                                                })
                                                            })()}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                
                                                <DropdownMenuSeparator />
                                                <RejectActionItem 
                                                    candidateId={candidate.id} 
                                                    isDisabled={candidate.status === "Rejected" || candidate.status === "Hire"} 
                                                />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
