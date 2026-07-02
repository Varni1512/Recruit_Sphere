import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { getAllApplications, getAllJobs } from "@/app/actions/jobActions"

export default async function PipelinePage() {
    const [appsRes, jobsRes] = await Promise.all([
        getAllApplications(true), // Only active candidates
        getAllJobs()
    ])
    const candidates = appsRes.success ? appsRes.applications : []
    const jobs = jobsRes.success ? (jobsRes.jobs || []) : []

    const formattedCandidates = candidates.map((app: any) => ({
        id: app.id,
        jobId: app.jobId,
        name: app.name,
        role: app.role,
        score: app.resumeScore, // Just for Kanban display
        status: app.status,
        photoUrl: app.photoUrl,
    }))

    const formattedJobs = jobs.map((j: any) => ({
        id: j._id || j.id,
        title: j.title,
        company: j.company || "Recruit Sphere",
        pipelineStages: j.hiringPipeline?.map((r: any) => r.roundName) || []
    }))

    return (
        <div className="flex flex-col flex-1 w-full relative h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hiring Pipeline</h1>
                    <p className="text-muted-foreground">
                        Drag and drop candidates between stages to update their status.
                    </p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <KanbanBoard initialCandidates={formattedCandidates} jobs={formattedJobs} />
            </div>
        </div>
    )
}
