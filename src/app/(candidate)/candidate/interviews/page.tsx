"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Video } from "lucide-react"
import { format, addDays, subDays, isSameDay } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Generate a few dynamic dates relative to today so the calendar always shows relevant mock data
const today = new Date()
const tomorrow = addDays(today, 1)
const inThreeDays = addDays(today, 3)

const upcomingInterviews = [
    {
        id: "1",
        company: "Stark Industries",
        role: "Frontend Engineer",
        date: tomorrow,
        time: "10:00 AM - 11:00 AM",
        interviewer: "Tony S. & Pepper P.",
        type: "Technical Assessment",
        location: "Google Meet",
        status: "Confirmed",
        link: "https://meet.google.com/abc-defg-hij"
    },
    {
        id: "2",
        company: "Wayne Enterprises",
        role: "React Developer",
        date: inThreeDays,
        time: "2:30 PM - 3:15 PM",
        interviewer: "Bruce W.",
        type: "Culture Fit",
        location: "Zoom",
        status: "Pending Details",
        link: null
    }
]

export default function CandidateInterviewsPage() {
    const [date, setDate] = useState<Date | undefined>(today)

    // Filter interviews specifically by chosen date
    const selectedDateInterviews = upcomingInterviews.filter(interview =>
        date && isSameDay(interview.date, date)
    )

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Schedule</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your upcoming technical rounds and team calls.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 flex-1 min-h-0">

                {/* Left side: Calendar Selection & All Upcoming List */}
                <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-6 overflow-auto pr-2 pb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center p-0 pb-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="border-none"
                            />
                        </CardContent>
                    </Card>

                    <Card className="flex-1 min-h-0 bg-muted/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">All Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 px-4">
                            {upcomingInterviews.map(interview => (
                                <div
                                    key={interview.id}
                                    className={`p-3 rounded-lg border text-sm transition-colors cursor-pointer ${date && isSameDay(date, interview.date) ? 'bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20' : 'bg-card hover:bg-muted/50'}`}
                                    onClick={() => setDate(interview.date)}
                                >
                                    <div className="font-semibold">{interview.company}</div>
                                    <div className="text-muted-foreground text-xs mt-0.5">{interview.role}</div>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                                        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                                        {format(interview.date, "MMM dd")} • {interview.time.split(" - ")[0]}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right side: Detailed View based on selection */}
                <div className="lg:col-span-4 xl:col-span-5 flex flex-col gap-4 overflow-auto pb-6">
                    <div className="flex items-center justify-between sticky top-0 bg-transparent py-1 backdrop-blur-sm z-10 shrink-0">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
                        </h2>
                        <div className="flex gap-1 hidden sm:flex">
                            <Button variant="outline" size="icon" onClick={() => setDate(date ? subDays(date, 1) : today)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="w-16" onClick={() => setDate(today)}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setDate(date ? addDays(date, 1) : today)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1">
                        {selectedDateInterviews.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {selectedDateInterviews.map((interview) => (
                                    <Card key={interview.id} className="border-l-4 border-l-primary overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Details */}
                                                <div className="p-6 md:p-8 flex-1 flex flex-col gap-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">{interview.type}</div>
                                                            <h3 className="text-2xl font-bold">{interview.company}</h3>
                                                            <p className="text-lg text-muted-foreground font-medium">{interview.role}</p>
                                                        </div>
                                                        <Badge variant={interview.status === "Confirmed" ? "default" : "secondary"} className="h-6">
                                                            {interview.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-2 p-4 bg-muted/20 rounded-lg">
                                                        <div className="flex items-start gap-3">
                                                            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">Time</div>
                                                                <div className="text-sm text-muted-foreground">{interview.time}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-foreground">Location</div>
                                                                <div className="text-sm text-muted-foreground">{interview.location}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2">
                                                        <h4 className="text-sm font-semibold mb-2">Interviewers</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex -space-x-2">
                                                                <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">T</div>
                                                                <div className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-bold">P</div>
                                                            </div>
                                                            <span className="text-sm text-muted-foreground ml-2">{interview.interviewer}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="p-6 md:w-64 bg-muted/10 border-t md:border-t-0 md:border-l flex flex-col justify-center items-center gap-4">
                                                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                                                        <Video className="h-8 w-8" />
                                                    </div>

                                                    {interview.link ? (
                                                        <Button className="w-full shadow-sm" onClick={() => window.open(interview.link, '_blank')}>
                                                            Join Meeting
                                                        </Button>
                                                    ) : (
                                                        <Button className="w-full" disabled>
                                                            Link Pending
                                                        </Button>
                                                    )}

                                                    <div className="flex gap-2 w-full mt-2">
                                                        <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                                                            <Link href={`/candidate/jobs/${interview.id}`}>Job info</Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="flex-1 text-xs">Reschedule</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/10 text-center px-4">
                                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No interviews scheduled</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    You don't have any interviews scheduled for {date ? format(date, "MMMM do") : "this date"}. Enjoy your day!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
