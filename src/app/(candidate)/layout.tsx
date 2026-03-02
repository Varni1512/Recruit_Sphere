import { AppCandidateSidebar } from "@/components/candidate/sidebar"
import { CandidateHeader } from "@/components/candidate/header"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden w-full bg-background text-foreground">
                <AppCandidateSidebar />
                <div className="flex w-full flex-col flex-1 min-w-0">
                    <CandidateHeader />
                    <main className="flex-1 overflow-hidden bg-muted/30 p-2 sm:p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
