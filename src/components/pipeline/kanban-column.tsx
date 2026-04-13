"use client"

import { useDroppable } from "@dnd-kit/core"
import { type Column } from "./kanban-board"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
    column: Column
    children: React.ReactNode
    count: number
}

export function KanbanColumn({ column, children, count }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    })

    return (
        <div className="flex h-full w-[310px] min-w-[310px] shrink-0 flex-col rounded-2xl bg-muted/40 border border-border/30 p-4 transition-all duration-300 hover:bg-muted/30 hover:border-border/60">
            <div className="mb-5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-primary/40" />
                    <h3 className="font-bold text-[12px] text-foreground/70 tracking-wider uppercase">{column.title}</h3>
                    <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 min-w-[22px] justify-center flex items-center text-[10px] font-bold bg-background shadow-sm border-border/50 text-foreground/60">
                        {count}
                    </Badge>
                </div>
            </div>
            <div
                ref={setNodeRef}
                className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent"
            >
                {children}
            </div>
        </div>
    )
}
