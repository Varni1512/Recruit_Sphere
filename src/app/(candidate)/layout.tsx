import { AppCandidateSidebar } from "@/components/candidate/sidebar"
import { CandidateHeader } from "@/components/candidate/header"

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-muted/40 text-foreground transition-colors duration-300">
            <AppCandidateSidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <CandidateHeader />
                <main className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-4 sm:px-6 sm:pb-6 relative z-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
