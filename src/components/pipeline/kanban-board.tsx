"use client"

import { useState } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { updateApplicationStatus } from "@/app/actions/jobActions"

export type Candidate = {
    id: string
    name: string
    role: string
    score: number
    status: string
    photoUrl?: string
}

export type Column = {
    id: string
    title: string
}

const defaultColumns: Column[] = [
    { id: "Applied", title: "Applied" },
    { id: "Shortlisted", title: "Shortlisted" },
    { id: "Coding Round", title: "Coding Round" },
    { id: "Apptitude Round", title: "Apptitude Round" },
    { id: "AI Interview Round", title: "AI Interview Round" },
    { id: "Interview Round", title: "Interview Round" },
    { id: "Hire", title: "Hire" },
    { id: "Rejected", title: "Rejected" },
]

interface KanbanBoardProps {
    initialCandidates: Candidate[]
}

export function KanbanBoard({ initialCandidates }: KanbanBoardProps) {
    const [columns] = useState<Column[]>(defaultColumns)
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const activeCandidate = candidates.find((c) => c.id === activeId)

    return (
        <div className="flex h-full w-full gap-4 overflow-x-auto pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {columns.map((col) => {
                    const columnCandidates = candidates.filter((c) => c.status === col.id)
                    return (
                        <KanbanColumn key={col.id} column={col} count={columnCandidates.length}>
                            <SortableContext
                                id={col.id}
                                items={columnCandidates.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col gap-3 min-h-[150px]">
                                    {columnCandidates.map((candidate) => (
                                        <KanbanCard key={candidate.id} candidate={candidate} />
                                    ))}
                                </div>
                            </SortableContext>
                        </KanbanColumn>
                    )
                })}

                <DragOverlay>
                    {activeCandidate ? <KanbanCard candidate={activeCandidate} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        setActiveId(active.id as string)
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveCandidate = active.data.current?.type === "Candidate"
        const isOverCandidate = over.data.current?.type === "Candidate"

        if (!isActiveCandidate) return

        // Dropping a candidate over another candidate
        if (isActiveCandidate && isOverCandidate) {
            setCandidates((candidates) => {
                const activeIndex = candidates.findIndex((c) => c.id === activeId)
                const overIndex = candidates.findIndex((c) => c.id === overId)

                if (candidates[activeIndex].status !== candidates[overIndex].status) {
                    const newCandidates = [...candidates]
                    newCandidates[activeIndex].status = candidates[overIndex].status
                    return arrayMove(newCandidates, activeIndex, overIndex)
                }

                return arrayMove(candidates, activeIndex, overIndex)
            })
        }

        const isOverColumn = over.data.current?.type === "Column"

        // Dropping a candidate over a column
        if (isActiveCandidate && isOverColumn) {
            setCandidates((candidates) => {
                const activeIndex = candidates.findIndex((c) => c.id === activeId)
                if (candidates[activeIndex].status !== overId) {
                    const newCandidates = [...candidates]
                    newCandidates[activeIndex].status = overId as string
                    return arrayMove(newCandidates, activeIndex, activeIndex)
                }
                return candidates
            })
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id
        const overId = over.id

        const activeCandidate = candidates.find((c) => c.id === activeId)
        if (!activeCandidate) return

        // Finalize state and update DB
        const isOverColumn = over.data.current?.type === "Column"
        const isOverCandidate = over.data.current?.type === "Candidate"

        let targetStatus = activeCandidate.status

        if (isOverColumn) {
            targetStatus = overId as string
        } else if (isOverCandidate) {
            const overCandidate = candidates.find((c) => c.id === overId)
            if (overCandidate) {
                targetStatus = overCandidate.status
            }
        }

        // Only update if status changed or if it's a reorder within the same column (DB doesn't track order yet, but we update status)
        // We always trigger the update to ensure DB is in sync with the last dropped position's status
        try {
            await updateApplicationStatus(activeId as string, targetStatus)
        } catch (error) {
            console.error("Failed to update status:", error)
            // Optionally revert local state if DB update fails
        }

        if (activeId === overId) return

        setCandidates((candidates) => {
            const activeIndex = candidates.findIndex((c) => c.id === activeId)
            const overIndex = candidates.findIndex((c) => c.id === overId)

            if (overIndex !== -1) {
                return arrayMove(candidates, activeIndex, overIndex)
            }
            return candidates
        })
    }
}
