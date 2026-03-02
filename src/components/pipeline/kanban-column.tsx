"use client"

import { useDroppable } from "@dnd-kit/core"
import { type Column } from "./kanban-board"

interface KanbanColumnProps {
    column: Column
    children: React.ReactNode
}

export function KanbanColumn({ column, children }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    })

    return (
        <div className="flex h-full w-[300px] min-w-[300px] shrink-0 flex-col rounded-xl bg-muted/40 p-3">
            <div className="mb-4 flex items-center justify-between px-2">
                <h3 className="font-semibold">{column.title}</h3>
                {/* Count badge could go here */}
            </div>
            <div
                ref={setNodeRef}
                className="flex flex-1 flex-col gap-3 overflow-y-auto"
            >
                {children}
            </div>
        </div>
    )
}
