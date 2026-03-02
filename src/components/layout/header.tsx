"use client"

import { Bell, LogOut, Menu, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarNavItems } from "./sidebar"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mt-0 sm:mt-4">
      <Sheet>
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
                RS
              </div>
              Recruit Sphere
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu
            </SheetDescription>
          </SheetHeader>
          <SidebarNavItems isMobile />
          <div className="absolute bottom-6 left-6 right-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 text-red-600 px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-500/20 w-full"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs, candidates..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="sr-only">View notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="flex flex-col gap-1 max-h-[300px] overflow-auto py-2">
            <div className="flex flex-col gap-1 px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer">
              <span className="text-sm font-medium">New application received</span>
              <span className="text-xs text-muted-foreground">Alex Carter applied for Frontend Developer.</span>
              <span className="text-[10px] text-muted-foreground mt-1">10 minutes ago</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer">
              <span className="text-sm font-medium">Interview upcoming</span>
              <span className="text-xs text-muted-foreground">Technical interview with Sarah Jenkins in 30 mins.</span>
              <span className="text-[10px] text-muted-foreground mt-1">2 hours ago</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground">
              <span className="text-sm font-medium">Job closing soon</span>
              <span className="text-xs">Product Manager position closes in 2 days.</span>
              <span className="text-[10px] mt-1">1 day ago</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <Button variant="ghost" className="w-full text-xs" size="sm">Mark all as read</Button>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/profile" className="flex items-center gap-2">
        <Button variant="secondary" size="icon" className="rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="sr-only">View profile</span>
        </Button>
      </Link>
    </header >
  )
}
