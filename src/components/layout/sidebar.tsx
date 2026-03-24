"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BarChart3,
    Briefcase,
    CalendarDays,
    LayoutDashboard,
    SplitSquareHorizontal,
    Users,
    LogOut
} from "lucide-react"

import { cn } from "@/lib/utils"
import { deleteRoleCookie } from "@/app/actions/auth"
import { auth, signOut } from "@/lib/localAuth"

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Candidates", href: "/candidates", icon: Users },
    { name: "Hiring Pipeline", href: "/pipeline", icon: SplitSquareHorizontal },
    { name: "Scheduler", href: "/scheduler", icon: CalendarDays },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

export function SidebarNavItems({ isMobile }: { isMobile?: boolean }) {
    const pathname = usePathname()
    return (
        <nav className="grid gap-1 px-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-all hover:text-primary",
                            isMobile ? "text-base py-3" : "text-sm",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <item.icon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )
}

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
            <div className="flex h-14 items-center border-b px-6">
                <div className="flex items-center gap-2 font-bold tracking-tight text-lg text-primary">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        RS
                    </div>
                    Recruit Sphere
                </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <SidebarNavItems />
            </div>

            <div className="mt-auto border-t p-4">
                <nav className="grid gap-1">
                    <button
                        onClick={async () => {
                            await signOut(auth)
                            await deleteRoleCookie()
                            window.location.href = '/login'
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
