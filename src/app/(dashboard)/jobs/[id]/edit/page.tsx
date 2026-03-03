"use client"

import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useState, use } from "react"
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [description, setDescription] = useState("We are looking for an experienced Senior Product Designer to join our dynamic team. You will be responsible for leading the design of our core product features, working closely with engineering and product management to deliver exceptional user experiences.")

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-8 px-1">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/jobs/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
                    <p className="text-muted-foreground">
                        Update the details of the job position.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                        Basic information about the position.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" defaultValue="Senior Product Designer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Select defaultValue="design">
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Employment Type</Label>
                            <Select defaultValue="full-time">
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location-type">Location Type</Label>
                            <Select defaultValue="remote">
                                <SelectTrigger id="location-type">
                                    <SelectValue placeholder="Select location type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="onsite">On-site</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" defaultValue="Remote" />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-2">
                        <Label htmlFor="description">Job Description</Label>
                        <div className="border rounded-md overflow-hidden bg-background">
                            <MDEditor
                                value={description}
                                onChange={(val) => setDescription(val || '')}
                                height={300}
                                preview="edit"
                                hideToolbar={false}
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4 border-t px-6 py-4">
                    <Button variant="outline" asChild>
                        <Link href={`/jobs/${id}`}>Cancel</Link>
                    </Button>
                    <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
