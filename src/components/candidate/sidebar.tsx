"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Calendar as CalendarIcon, FileText, Home, LogOut, User } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"

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

export function CandidateSidebarNavItems({
    isMobile = false,
    setOpenMobile
}: {
    isMobile?: boolean,
    setOpenMobile?: (open: boolean) => void
}) {
    const pathname = usePathname()

    return (
        <SidebarMenu>
            {candidateNavItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                            <Link href={item.url} onClick={() => {
                                if (isMobile && setOpenMobile) {
                                    setOpenMobile(false)
                                }
                            }}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            })}
        </SidebarMenu>
    )
}

export function AppCandidateSidebar() {
    return (
        <Sidebar variant="inset" className="border-r hidden md:flex">
            <SidebarHeader className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] shrink-0">
                <Link href="/candidate/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <User className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Recruit Sphere</span>
                </Link>
            </SidebarHeader>
            <SidebarContent className="py-4">
                <CandidateSidebarNavItems />
            </SidebarContent>
            <SidebarFooter className="border-t p-4 shrink-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Logout" className="text-muted-foreground hover:text-destructive transition-colors">
                            <Link href="/login">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
