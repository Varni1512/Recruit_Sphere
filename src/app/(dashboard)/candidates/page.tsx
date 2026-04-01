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

import { getAllApplications, updateApplicationStatus } from "@/app/actions/jobActions"
import { StatusActionItem, RejectActionItem } from "./StatusActions"

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

export default async function CandidatesPage() {
    const res = await getAllApplications()
    const candidates = res.success ? res.applications : []

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
                    <p className="text-muted-foreground">
                        View and manage applications across all jobs.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex w-full max-w-sm items-center space-x-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search candidates by name, email..."
                                className="pl-8"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
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
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {candidates?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No candidates have applied yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {candidates?.map((candidate: any) => (
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
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium">{candidate.score}</span>
                                        </div>
                                    </TableCell>
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
                                                                            <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                View PDF
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0">
                                                                            <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between pointer-events-auto mt-6 sm:mt-0">
                                                                                <DialogTitle>Resume Preview</DialogTitle>
                                                                                <Button size="sm" asChild className="mr-6">
                                                                                    <a href={getProxyResumeUrl(candidate.resumeUrl)} download="resume" target="_blank" rel="noopener noreferrer">
                                                                                        <Download className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Download Document</span>
                                                                                    </a>
                                                                                </Button>
                                                                            </DialogHeader>
                                                                            <div className="flex-1 overflow-hidden" style={{ minHeight: "50vh" }}>
                                                                                <iframe 
                                                                                    src={getInlinePreviewUrl(candidate.resumeUrl)}
                                                                                    className="w-full h-full border-0 bg-white" 
                                                                                    title="Resume Preview" 
                                                                                />
                                                                            </div>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                    <Button size="sm" variant="secondary" asChild className="flex-1 sm:flex-none">
                                                                        <a href={getProxyResumeUrl(candidate.resumeUrl)} download target="_blank" rel="noopener noreferrer">
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-3 mt-4">
                                                        <Button className="w-full">Schedule Interview</Button>
                                                        <Button variant="outline" className="w-full">Reject Candidate</Button>
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {["Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"].map((stage) => {
                                                                const stages = ["Applied", "Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"];
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
                                                            })}
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
