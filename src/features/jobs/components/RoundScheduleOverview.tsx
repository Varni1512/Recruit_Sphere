"use client"

import { useState, useTransition } from "react"
import { Calendar, Save, Edit, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateJobSchedule } from "@/app/actions/jobActions"
import { Badge } from "@/components/ui/badge"

interface ScheduleItem {
    id: string; // added for dnd-kit
    roundName: string;
    date: string | null;
}

interface RoundScheduleOverviewProps {
    jobId: string;
    initialSchedule: ScheduleItem[];
    applicationCloseDate: string | null;
}

export function RoundScheduleOverview({ jobId, initialSchedule, applicationCloseDate }: RoundScheduleOverviewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [schedule, setSchedule] = useState<ScheduleItem[]>(() => 
        (initialSchedule || []).map((s, idx) => ({ ...s, id: s.roundName + idx }))
    )
    const [isPending, startTransition] = useTransition()

    // Formatting helper
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "TBD"
        try {
            return format(new Date(dateString), "MMM d, yyyy")
        } catch (e) {
            return "Invalid Date"
        }
    }

    const handleDateChange = (id: string, newDateStr: string) => {
        setSchedule(schedule.map(s => 
            s.id === id ? { ...s, date: new Date(newDateStr).toISOString() } : s
        ))
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSchedule((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);

                // Preserve the exact chronological timeline of dates
                const originalDates = items.map(item => item.date);

                // Reorder just the items
                const reorderedItems = arrayMove(items, oldIndex, newIndex);

                // Reapply the original sequential dates
                return reorderedItems.map((item, index) => ({
                    ...item,
                    date: originalDates[index]
                }));
            });
        }
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateJobSchedule(jobId, schedule.map(s => ({
                roundName: s.roundName,
                date: s.date || new Date().toISOString()
            })))

            if (result.success) {
                setIsEditing(false)
                alert("The interview pipeline timeline has been successfully updated.")
            } else {
                alert("Update failed: " + (result.error || "Something went wrong."))
            }
        })
    }

    if (!schedule || schedule.length === 0) {
        return null // Don't show if there's no pipeline scheduled
    }

    return (
        <Card className="mt-6 border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-muted/10">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> 
                        Interview Pipeline Plan
                    </CardTitle>
                    <CardDescription className="mt-1">
                        AI-generated optimal dates based on hiring targets.
                    </CardDescription>
                </div>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Plan
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                            setIsEditing(false)
                            setSchedule((initialSchedule || []).map((s, idx) => ({ ...s, id: s.roundName + idx }))) // Revert
                        }}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {isPending ? "Saving..." : "Save Plan"}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-8 pl-6 md:pl-8 py-2">
                    {applicationCloseDate && (
                        <div className="relative">
                            <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-background border-2 border-muted-foreground/30 h-5 w-5 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-muted-foreground text-sm">Applications Close</span>
                                <span className="text-sm font-semibold">{formatDate(applicationCloseDate)}</span>
                            </div>
                        </div>
                    )}
                    
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={schedule.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {schedule.map((item, index) => (
                                <SortableRoundItem 
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isEditing={isEditing}
                                    handleDateChange={handleDateChange}
                                    formatDate={formatDate}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    
                    <div className="relative">
                        <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-background border-2 border-green-500 h-5 w-5 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 bg-background rounded-full absolute" />
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                            <span className="font-medium text-green-600 dark:text-green-500 text-sm">Hiring Goal Complete</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SortableRoundItem({ item, index, isEditing, handleDateChange, formatDate }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: item.id, disabled: !isEditing});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative z-10 w-[95%] sm:w-full max-w-[100%] overflow-visible">
            <div className="absolute -left-[35px] md:-left-[43px] top-1.5 bg-background border-2 border-primary h-5 w-5 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            
            <div className={`bg-muted/10 border rounded-lg p-3 md:p-4 -mt-3 relative transition-colors ${isEditing ? 'hover:border-primary/50' : 'hover:bg-muted/30'}`}>
                <div className="flex flex-row items-center justify-between gap-2 overflow-hidden w-full">
                    <div className="flex items-center gap-2 truncate">
                        {isEditing && (
                            <div 
                                {...attributes} 
                                {...listeners}
                                className="cursor-grab hover:bg-muted p-1 rounded-md text-muted-foreground active:cursor-grabbing shrink-0"
                            >
                                <GripVertical className="h-4 w-4" />
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 truncate">
                            <span className="font-bold text-foreground text-sm truncate">{item.roundName}</span>
                            <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary shrink-0 py-0">Round {index + 1}</Badge>
                        </div>
                    </div>
                    
                    <div className="flex items-center shrink-0">
                        {!isEditing ? (
                            <div className="flex items-center gap-2 text-xs sm:text-sm bg-background border px-2 sm:px-3 py-1.5 rounded-md font-medium text-foreground w-auto justify-center shadow-sm whitespace-nowrap">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                {formatDate(item.date)}
                            </div>
                        ) : (
                            <Input
                                type="date"
                                className="w-[130px] sm:w-[150px] h-8 text-xs sm:text-sm shrink-0"
                                value={item.date ? new Date(item.date).toISOString().split('T')[0] : ""}
                                onChange={(e) => handleDateChange(item.id, e.target.value)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
