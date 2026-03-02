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
    { id: "applied", title: "Applied" },
    { id: "screened", title: "Screened" },
    { id: "shortlisted", title: "Shortlisted" },
    { id: "interview", title: "Interview" },
    { id: "offer", title: "Offer" },
    { id: "hired", title: "Hired" },
]

const initialCandidates: Candidate[] = [
    { id: "1", name: "Alex Carter", role: "Frontend Dev", score: 92, status: "shortlisted" },
    { id: "2", name: "Sarah Jenkins", role: "UX Designer", score: 88, status: "interview" },
    { id: "3", name: "Michael Chen", role: "Backend Engineer", score: 75, status: "applied" },
    { id: "4", name: "Emily Rod", role: "Product Manager", score: 96, status: "offer" },
    { id: "5", name: "David Kim", role: "Frontend Dev", score: 82, status: "screened" },
    { id: "6", name: "Alice Wang", role: "Data Scientist", score: 85, status: "applied" },
    { id: "7", name: "Bob Smith", role: "DevOps", score: 79, status: "screened" },
]

export function KanbanBoard() {
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
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null)
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        setCandidates((candidates) => {
            const activeIndex = candidates.findIndex((c) => c.id === activeId)
            const overIndex = candidates.findIndex((c) => c.id === overId)

            if (overIndex !== -1 && candidates[activeIndex].status === candidates[overIndex].status) {
                return arrayMove(candidates, activeIndex, overIndex)
            }
            return candidates
        })
    }
}
