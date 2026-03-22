"use client"

import { Bell, Menu, Search, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { CandidateSidebarNavItems } from "@/components/candidate/sidebar"

export function CandidateHeader() {
    const [open, setOpen] = useState(false)
    const [user, setUser] = useState<FirebaseUser | null>(null)

    useEffect(() => {
        return auth.onAuthStateChanged((u) => {
            setUser(u)
        })
    }, [])

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mt-0 sm:mt-4">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                    <SheetHeader className="mb-6 mt-4">
                        <SheetTitle className="flex items-center gap-2 font-bold tracking-tight text-xl text-primary justify-start">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <User className="h-5 w-5" />
                            </div>
                            Recruit Sphere
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            Navigation menu
                        </SheetDescription>
                    </SheetHeader>
                    <CandidateSidebarNavItems isMobile />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search jobs, companies, or keywords..."
                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Alerts</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-auto">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                <span className="font-medium text-sm">Application Update</span>
                                <span className="text-xs text-muted-foreground">Your application for Senior Designer at TechCorp was viewed.</span>
                                <span className="text-[10px] text-muted-foreground mt-1">10 min ago</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                <span className="font-medium text-sm">New Interview Invite</span>
                                <span className="text-xs text-muted-foreground">Stark Industries invited you to schedule a technical screen.</span>
                                <span className="text-[10px] text-muted-foreground mt-1">2 hours ago</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email || 'Candidate'}&background=random`} alt="Candidate Avatar" />
                                <AvatarFallback>CA</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.displayName || "Candidate User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/candidate/profile" className="cursor-pointer">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
