import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { getAllApplications } from "@/app/actions/jobActions"

export default async function PipelinePage() {
    const res = await getAllApplications()
    const candidates = res.success ? res.applications : []

    const formattedCandidates = candidates.map((app: any) => ({
        id: app.id,
        name: app.name,
        role: app.role,
        score: app.score,
        status: app.status,
        photoUrl: app.photoUrl,
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
                <KanbanBoard initialCandidates={formattedCandidates} />
            </div>
        </div>
    )
}
