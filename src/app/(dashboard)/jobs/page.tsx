"use client"

import Link from "next/link"
import { Building2, Calendar, MapPin, MoreHorizontal, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as XLSX from "xlsx"
import { Download } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getAllJobs, updateJobStatus, deleteJob, getApplicationsByJobId } from "@/app/actions/jobActions"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

function JobCard({ job, onUpdate }: { job: any, onUpdate: () => void }) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [candidates, setCandidates] = useState<any[]>([])
    const [loadingCandidates, setLoadingCandidates] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const fetchJobCandidates = async () => {
        setLoadingCandidates(true)
        const res = await getApplicationsByJobId(job.id)
        if (res.success) {
            setCandidates(res.applications)
        }
        setLoadingCandidates(false)
    }

    const handleDownloadExcel = () => {
        const worksheetData = candidates.map((c) => ({
            Name: c.name,
            Email: c.email,
            Mobile: c.mobile,
            Status: c.status,
            Score: c.score,
            "Applied At": c.appliedAt,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
        XLSX.writeFile(workbook, `Candidates_${job.title.replace(/\s+/g, '_')}.xlsx`);
    }

    const handleClose = async () => {
        setIsProcessing(true)
        await updateJobStatus(job.id, "Closed")
        onUpdate()
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this job?")) return
        setIsProcessing(true)
        await deleteJob(job.id)
        onUpdate()
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-1">{job.department}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/jobs/${job.id}/edit`)}
                            >
                                Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {job.status !== "Closed" && (
                                <DropdownMenuItem
                                    className="text-amber-500 cursor-pointer"
                                    onClick={handleClose}
                                    disabled={isProcessing}
                                >
                                    Close Job
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={handleDelete}
                                disabled={isProcessing}
                            >
                                Delete Job
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Posted {job.createdAt}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
                <Badge variant={job.status === "Active" ? "default" : job.status === "Paused" ? "secondary" : "outline"}>
                    {job.status}
                </Badge>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) fetchJobCandidates();
                }}>
                    <DialogTrigger asChild>
                        <div className="flex -space-x-2 cursor-pointer hover:underline text-primary">
                            <span className="text-sm font-medium mr-3">{job.candidates} candidates</span>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-[90vw]">
                        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                            <DialogTitle>Candidates for {job.title}</DialogTitle>
                            <Button size="sm" onClick={handleDownloadExcel} className="mr-6">
                                <Download className="h-4 w-4 mr-2" /> Download Excel
                            </Button>
                        </DialogHeader>
                        {loadingCandidates ? (
                            <div className="py-8 text-center text-muted-foreground">Loading candidates...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.length === 0 && (
                                         <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No candidates found.</TableCell>
                                        </TableRow>
                                    )}
                                    {candidates.map((c) => (
                                        <TableRow 
                                            key={c.id} 
                                            className={c.status === "Rejected" ? "bg-red-500/10 hover:bg-red-500/20" : c.status === "Shortlisted" ? "bg-green-500/10 hover:bg-green-500/20" : ""}
                                        >
                                            <TableCell>
                                                <div className="font-medium text-sm">{c.name}</div>
                                                <div className="text-xs text-muted-foreground">{c.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        c.status === "Hire" || c.status === "Offer" ? "default" :
                                                        c.status === "Rejected" ? "destructive" :
                                                        c.status === "Applied" ? "outline" : "secondary"
                                                    }
                                                >
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{c.score}</TableCell>
                                            <TableCell>{c.appliedAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchJobs = async () => {
        const res = await getAllJobs("all")
        if (res.success) setJobs(res.jobs)
        setLoading(false)
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
                    <p className="text-muted-foreground">
                        Manage your open positions and track candidates.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/jobs/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Job
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="paused">Paused</TabsTrigger>
                    <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    {loading ? <div className="text-center py-10 text-muted-foreground">Loading jobs...</div> : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:max-w-[95%]">
                            {jobs.map((job) => <JobCard key={job.id} job={job} onUpdate={fetchJobs} />)}
                            {jobs.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">No jobs posted yet.</div>}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:max-w-[95%]">
                        {jobs.filter(j => j.status === "Active").map((job) => <JobCard key={job.id} job={job} onUpdate={fetchJobs} />)}
                        {jobs.filter(j => j.status === "Active").length === 0 && !loading && <div className="col-span-full text-center py-10 text-muted-foreground">No active jobs.</div>}
                    </div>
                </TabsContent>

                <TabsContent value="paused" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:max-w-[95%]">
                        {jobs.filter(j => j.status === "Paused").map((job) => <JobCard key={job.id} job={job} onUpdate={fetchJobs} />)}
                        {jobs.filter(j => j.status === "Paused").length === 0 && !loading && <div className="col-span-full text-center py-10 text-muted-foreground">No paused jobs.</div>}
                    </div>
                </TabsContent>

                <TabsContent value="closed" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:max-w-[95%]">
                        {jobs.filter(j => j.status === "Closed").map((job) => <JobCard key={job.id} job={job} onUpdate={fetchJobs} />)}
                        {jobs.filter(j => j.status === "Closed").length === 0 && !loading && <div className="col-span-full text-center py-10 text-muted-foreground">No closed jobs.</div>}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
