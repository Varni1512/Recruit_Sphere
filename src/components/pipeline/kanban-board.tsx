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
                        <KanbanColumn key={col.id} column={col}>
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
                const newCandidates = [...candidates]
                newCandidates[activeIndex].status = overId as string
                return arrayMove(newCandidates, activeIndex, activeIndex) // just update status
            })
            // Persist to DB asynchronously
            updateApplicationStatus(activeId as string, overId as string).catch(console.error)
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        const activeId = active.id
        
        // Record initial status to check if saving is needed
        const previousStatus = candidates.find(c => c.id === activeId)?.status

        setActiveId(null)
        if (!over) return

        const overId = over.id

        if (activeId === overId) return

        setCandidates((candidates) => {
            const activeIndex = candidates.findIndex((c) => c.id === activeId)
            const overIndex = candidates.findIndex((c) => c.id === overId)

            if (overIndex !== -1 && candidates[activeIndex].status === candidates[overIndex].status) {
                // Determine if status actually changed to persist DB (rare here, handled in handleDragOver, but just in case)
                return arrayMove(candidates, activeIndex, overIndex)
            }
            return candidates
        })
        
        // Final drag end handler: if it was dropped on another candidate, handleDragOver already updated the UI state.
        // We ensure DB matches by pushing the active candidate's new status. 
        // We find the active candidate in the new candidates list reliably.
        setCandidates((currentCandidates) => {
            const currentActive = currentCandidates.find((c) => c.id === activeId)
            if (currentActive && previousStatus !== currentActive.status) {
                updateApplicationStatus(currentActive.id, currentActive.status).catch(console.error)
            }
            return currentCandidates
        })
    }
}
