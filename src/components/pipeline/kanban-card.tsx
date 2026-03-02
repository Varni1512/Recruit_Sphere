"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Candidate } from "./kanban-board"

interface KanbanCardProps {
    candidate: Candidate
    isOverlay?: boolean
}

export function KanbanCard({ candidate, isOverlay }: KanbanCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: candidate.id,
        data: {
            type: "Candidate",
            candidate,
        },
    })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 ring-2 ring-primary bg-background/50 rounded-lg min-h-[120px]"
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${isOverlay ? "cursor-grabbing rotate-2 shadow-xl" : "cursor-grab"}`}
        >
            <Card className="hover:ring-1 hover:ring-primary/50 transition-all bg-background/95 backdrop-blur shadow-sm">
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${candidate.id}.png`} alt={candidate.name} />
                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm leading-none">{candidate.name}</span>
                                <span className="text-xs text-muted-foreground mt-1">{candidate.role}</span>
                            </div>
                        </div>
                        <div
                            {...attributes}
                            {...listeners}
                            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 -mr-2"
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-muted/50 w-fit px-2 py-0.5 rounded-full mt-2">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{candidate.score}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
