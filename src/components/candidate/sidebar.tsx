"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Calendar as CalendarIcon, FileText, Home, LogOut, User } from "lucide-react"
import { deleteRoleCookie } from "@/app/actions/auth"
import { auth, signOut } from "@/lib/localAuth"

import { cn } from "@/lib/utils"

const candidateNavItems = [
    {
        title: "Dashboard",
        url: "/candidate/dashboard",
        icon: Home,
    },
    {
        title: "Browse Jobs",
        url: "/candidate/jobs",
        icon: Briefcase,
    },
    {
        title: "My Applications",
        url: "/candidate/applications",
        icon: FileText,
    },
    {
        title: "Interview Schedule",
        url: "/candidate/interviews",
        icon: CalendarIcon,
    },
    {
        title: "My Profile",
        url: "/candidate/profile",
        icon: User,
    }
]

export function CandidateSidebarNavItems({ isMobile, onNavClick }: { isMobile?: boolean, onNavClick?: () => void }) {
    const pathname = usePathname()
    return (
        <nav className="grid gap-1 px-4">
            {candidateNavItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/candidate/dashboard" && pathname.startsWith(item.url))
                return (
                    <Link
                        key={item.url}
                        href={item.url}
                        onClick={onNavClick}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-all hover:text-primary",
                            isMobile ? "text-base py-3" : "text-sm",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <item.icon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}

export function AppCandidateSidebar() {
    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
            <div className="flex h-14 items-center border-b px-6">
                <div className="flex items-center gap-2 font-bold tracking-tight text-lg text-primary">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <User className="h-5 w-5" />
                    </div>
                    Recruit Sphere
                </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <CandidateSidebarNavItems />
            </div>

            <div className="mt-auto border-t p-4">
                <nav className="grid gap-1">
                    <button
                        onClick={async () => {
                            await signOut(auth)
                            await deleteRoleCookie()
                            window.location.href = "/login"
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </nav>
            </div>
        </aside>
    )
}
