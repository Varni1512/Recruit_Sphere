import { getAllApplications, getAllJobs } from "@/app/actions/jobActions"
import { CandidatesClient } from "./CandidatesClient"

export default async function CandidatesPage() {
    // Fetch only active candidates as requested
    const [appsRes, jobsRes] = await Promise.all([
        getAllApplications(true),
        getAllJobs()
    ])
    const candidates = appsRes.success ? appsRes.applications : []
    const jobs = jobsRes.success ? (jobsRes.jobs || []) : []

    const formattedJobs = jobs.map((j: any) => ({
        id: j._id || j.id,
        title: j.title,
        company: j.company || "Recruit Sphere",
        pipelineStages: j.hiringPipeline?.map((r: any) => r.roundName) || []
    }))

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

            <CandidatesClient initialCandidates={candidates} jobs={formattedJobs} />
        </div>
    )
}
