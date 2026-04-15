"use client"

import { AlertCircle, Calendar, FileText, MapPin, MoreHorizontal, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateApplicationStatusAction } from "@/app/actions/applicationActions"

interface ApplicationListProps {
    initialApplications: any[]
}

export function ApplicationList({ initialApplications }: ApplicationListProps) {
    const [myApplications, setMyApplications] = useState(initialApplications)

    const handleWithdraw = async (appId: string) => {
        const confirmed = window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")
        if (confirmed) {
            const res = await updateApplicationStatusAction(appId, "Withdrawn")
            if (res.success) {
                setMyApplications(prev => prev.filter(a => a.id !== appId))
            } else {
                alert("Failed to withdraw application.")
            }
        }
    }

    if (myApplications.length === 0) {
        return (
            <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-muted/10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/30 mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    You haven't applied to any jobs yet. Start exploring opportunities to build your career.
                </p>
                <Button asChild>
                    <Link href="/candidate/jobs">Explore Jobs</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 pb-10">
            {myApplications.map((app) => (
                <Card key={app.id} className="relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${app.status === 'Rejected' ? 'bg-destructive' :
                        app.status === 'Applied' ? 'bg-muted' :
                            'bg-primary'
                        }`} />

                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row shadow-sm">
                            <div className="p-6 flex-1 flex flex-col gap-4 border-b md:border-b-0 md:border-r">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">{app.role}</h3>
                                        <p className="text-muted-foreground font-medium mt-1">{app.company}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            app.status === 'Hire' || app.status === 'Offer' ? 'default' :
                                            app.status === 'Rejected' ? 'destructive' :
                                            app.status === 'Applied' ? 'outline' : 'secondary'
                                        }
                                        className={`uppercase px-2 ${app.status === 'Hire' || app.status === 'Offer' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                    >
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 shrink-0" /> {app.location}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 shrink-0" /> Applied: {app.appliedDate}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center justify-center bg-primary/10 text-primary h-5 w-5 rounded-full font-bold text-[10px]">
                                            {app.resumeScore}
                                        </div>
                                        Resume Score
                                    </div>
                                </div>

                                {app.status === 'Rejected' && (
                                    <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/10 relative overflow-hidden group/feedback transition-all hover:bg-destructive/[0.08]">
                                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/feedback:opacity-40 transition-opacity">
                                            <XCircle className="h-10 w-10 text-destructive" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                                <h4 className="text-xs font-bold text-destructive uppercase tracking-widest">Status: Not Selected</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {app.rejectionReason || "Thank you for your application. We have decided not to move forward at this time."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 md:w-80 shrink-0 bg-muted/5 flex flex-col justify-between">
                                <div className="mb-4">
                                    <h4 className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-wider">Current Stage</h4>
                                    <div className="text-sm font-medium p-2 bg-background border rounded-lg text-center">
                                        {app.status}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-auto">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                                        <Link href={`/candidate/jobs/${app.jobId}`}>View Job</Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem 
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                onClick={() => handleWithdraw(app.id)}
                                            >
                                                Withdraw Application
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
