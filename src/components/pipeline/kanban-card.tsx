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
            className={`${isOverlay ? "cursor-grabbing rotate-3 scale-105 shadow-2xl z-50" : "cursor-grab"}`}
        >
            <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 bg-card border-border/50">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/40 transition-all duration-200" />
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border/50">
                                {candidate.photoUrl && <AvatarImage src={candidate.photoUrl} alt={candidate.name} />}
                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <h4 className="font-semibold text-[13px] leading-tight text-foreground truncate">{candidate.name}</h4>
                                <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{candidate.role}</p>
                            </div>
                        </div>
                        <div
                            {...attributes}
                            {...listeners}
                            className="text-muted-foreground/40 hover:text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -mr-1"
                        >
                            <GripVertical className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-bold text-primary/80">{candidate.score}</span>
                        </div>
                        
                        <div className="text-[10px] font-medium text-muted-foreground/60 italic">
                            {candidate.status}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
