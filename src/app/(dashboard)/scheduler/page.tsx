"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, Plus, Users, Video } from "lucide-react"
import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

const scheduledInterviews = [
    {
        id: "1",
        candidate: "Alex Carter",
        role: "Frontend Developer",
        time: "10:00 AM - 11:00 AM",
        type: "Technical Interview",
        interviewer: "Jane Smith",
        date: today.toDateString(),
    },
    {
        id: "2",
        candidate: "Sarah Jenkins",
        role: "UX Designer",
        time: "1:30 PM - 2:30 PM",
        type: "Portfolio Review",
        interviewer: "Mark Johnson",
        date: today.toDateString(),
    },
    {
        id: "3",
        candidate: "David Kim",
        role: "Frontend Developer",
        time: "4:00 PM - 4:30 PM",
        type: "Screening Call",
        interviewer: "Alice Wang",
        date: today.toDateString(),
    },
    {
        id: "4",
        candidate: "Emily Chen",
        role: "Product Manager",
        time: "9:00 AM - 10:00 AM",
        type: "Behavioral / Culture Fit",
        interviewer: "Sam Brooks",
        date: tomorrow.toDateString(),
    },
    {
        id: "5",
        candidate: "Michael Rossi",
        role: "Backend Engineer",
        time: "2:00 PM - 3:30 PM",
        type: "Technical Interview",
        interviewer: "David Lee",
        date: tomorrow.toDateString(),
    },
    {
        id: "6",
        candidate: "Jessica Alba",
        role: "UX Designer",
        time: "11:00 AM - 12:00 PM",
        type: "Portfolio Review",
        interviewer: "Mark Johnson",
        date: yesterday.toDateString(),
    },
]

export default function SchedulerPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())

    const filteredInterviews = scheduledInterviews.filter(
        (interview) => date?.toDateString() === interview.date
    )

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto pb-4 gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Scheduler</h1>
                    <p className="text-muted-foreground">
                        Manage your availability and upcoming interviews.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule Interview
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Schedule Interview</DialogTitle>
                            <DialogDescription>
                                Set up a new interview with a candidate.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="candidate">Candidate</Label>
                                <Select>
                                    <SelectTrigger id="candidate">
                                        <SelectValue placeholder="Select candidate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alex">Alex Carter</SelectItem>
                                        <SelectItem value="sarah">Sarah Jenkins</SelectItem>
                                        <SelectItem value="david">David Kim</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Interview Type</Label>
                                <Select>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="screening">Screening Call</SelectItem>
                                        <SelectItem value="technical">Technical Interview</SelectItem>
                                        <SelectItem value="behavioral">Behavioral / Culture Fit</SelectItem>
                                        <SelectItem value="portfolio">Portfolio Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input type="date" id="date" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Time</Label>
                                    <Input type="time" id="time" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={() => alert("Invite sent!")}>Send Invite</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 flex-1">
                <Card className="col-span-1 border-none shadow-none bg-transparent sm:bg-card sm:border-solid sm:border sm:shadow-sm md:sticky md:top-0 md:self-start md:max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>Select a date to view schedule.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center p-0 sm:p-6 pb-6 pt-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border bg-background"
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3 flex flex-col mb-4">
                    <CardHeader className="border-b bg-muted/20 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} scheduled
                                </CardDescription>
                            </div>
                            <div className="p-2 border rounded-md bg-background shadow-sm flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Sync Calendar</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col h-full divide-y">
                            {filteredInterviews.length > 0 ? (
                                filteredInterviews.map((interview) => (
                                    <div key={interview.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-muted/10 transition-colors">
                                        <div className="flex flex-col gap-1 sm:w-48 shrink-0">
                                            <div className="flex items-center gap-2 text-primary font-medium">
                                                <Clock className="h-4 w-4" />
                                                {interview.time}
                                            </div>
                                            <span className="text-sm text-muted-foreground">45 mins</span>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h4 className="text-lg font-semibold">{interview.type}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">For {interview.role} role</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        <Video className="mr-2 h-4 w-4" />
                                                        Join Call
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 mt-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`https://avatar.vercel.sh/${interview.id}.png`} alt={interview.candidate} />
                                                        <AvatarFallback>{interview.candidate.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">Candidate</span>
                                                        <span className="text-sm font-medium">{interview.candidate}</span>
                                                    </div>
                                                </div>
                                                <div className="h-8 w-px bg-border" />
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`https://avatar.vercel.sh/interviewer-${interview.id}.png`} alt={interview.interviewer} />
                                                        <AvatarFallback>{interview.interviewer.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">Interviewer</span>
                                                        <span className="text-sm font-medium">{interview.interviewer}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-full">
                                    <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium text-foreground">No interviews scheduled</h3>
                                    <p className="mt-1 text-sm">There are no interviews scheduled for this date.</p>
                                    <Button variant="outline" className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Schedule Interview
                                    </Button>
                                </div>
                            )}

                            {filteredInterviews.length > 0 && (
                                <div className="p-6 flex flex-col sm:flex-row gap-6 opacity-50 hover:opacity-100 transition-opacity">
                                    <div className="flex flex-col gap-1 sm:w-48 shrink-0">
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                            <Clock className="h-4 w-4" />
                                            Afternoon
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-center border-[1.5px] border-dashed rounded-lg p-4 justify-center text-muted-foreground hover:bg-muted/20 hover:text-foreground cursor-pointer transition-colors">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add to this slot
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
