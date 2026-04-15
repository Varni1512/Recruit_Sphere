"use client"

import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { useJobForm } from "@/features/jobs/hooks/useJobForm"
import { JobDetailsForm } from "@/features/jobs/components/JobDetailsForm"
import { PipelineConfig } from "@/features/jobs/components/PipelineConfig"
import { ATSConfigModal } from "@/features/jobs/components/ATSConfigModal"

export default function CreateJobPage() {
    const { 
        form, 
        isSaving, 
        showATSModal, 
        setShowATSModal, 
        handlePreSave, 
        onSubmit 
    } = useJobForm()

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-6 px-1">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/jobs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
                    <p className="text-muted-foreground">
                        Fill out the details to create a new job opening.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                        Basic information about the position and recruitment process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-10">
                    <JobDetailsForm form={form} />
                    <PipelineConfig form={form} />
                </CardContent>
                <CardFooter className="flex justify-end gap-4 border-t px-6 py-4">
                    <Button variant="outline" asChild disabled={isSaving}>
                        <Link href="/jobs">Cancel</Link>
                    </Button>
                    <Button onClick={handlePreSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Job"}
                    </Button>
                </CardFooter>
            </Card>

            <ATSConfigModal 
                form={form}
                open={showATSModal}
                onOpenChange={setShowATSModal}
                isSaving={isSaving}
                onConfirm={onSubmit}
            />
        </div>
    )
}
