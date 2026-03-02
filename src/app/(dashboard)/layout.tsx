import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-muted/40 text-foreground transition-colors duration-300">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <Header />
                <main className="flex flex-col flex-1 overflow-hidden p-4 sm:px-6 sm:pb-6 relative z-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
