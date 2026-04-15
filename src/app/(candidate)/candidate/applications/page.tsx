import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getCandidateApplications } from "@/app/actions/jobActions"
import { ApplicationList } from "@/features/candidate/components/ApplicationList"

export default async function CandidateApplicationsPage() {
    const cookieStore = cookies()
    const uid = cookieStore.get('uid')?.value

    if (!uid) {
        redirect("/login")
    }

    const res = await getCandidateApplications(uid)
    const myApplications = res.success ? res.applications : []

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Track the status and progress of all your job applications.
                    </p>
                </div>
                <div className="flex gap-4 text-xs sm:text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Active
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive" /> Closed
                    </div>
                </div>
            </div>

            <div className="rounded-xl mt-4">
                <ApplicationList initialApplications={myApplications} />
            </div>
        </div>
    )
}
