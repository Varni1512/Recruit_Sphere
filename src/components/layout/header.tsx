"use client"

import { Bell, Menu, Search, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { auth, type LocalUser } from "@/lib/localAuth"
import { getNotifications, markAllAsRead, markAsRead } from "@/app/actions/notificationActions"

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  const [showNotifications, setShowNotifications] = useState(false)
  const [user, setUser] = useState<LocalUser | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((u) => {
          setUser(u)
      })
      return () => unsubscribe()
  }, [])

  useEffect(() => {
      // Fallback email since layout header hardcodes "recruiter@example.com"
      const userEmail = user?.email || "recruiter@example.com"
      getNotifications(userEmail).then(res => {
          if (res.success) setNotifications(res.notifications)
      })
  }, [user?.email])

  const handleMarkAllAsRead = async () => {
      const userEmail = user?.email || "recruiter@example.com"
      await markAllAsRead(userEmail)
      setNotifications(notifications.map(n => ({...n, read: true})))
      setShowNotifications(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
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
      <div className="relative" ref={notificationRef}>
        <Button variant="outline" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>}
          <span className="sr-only">View notifications</span>
        </Button>
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
            <div className="flex items-center px-4 py-3 border-b bg-muted/20">
              <h4 className="font-semibold text-sm">Notifications</h4>
            </div>
            <div className="flex flex-col max-h-[300px] overflow-auto py-2">
                {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">No notifications</div>
                ) : (
                    notifications.map((notif: any) => (
                        <div key={notif.id} className={`flex flex-col items-start gap-1 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${notif.read ? 'opacity-70' : ''}`} onClick={async () => { await markAsRead(notif.id); setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n)); setShowNotifications(false) }}>
                            <span className="font-medium text-sm capitalize">{notif.type.replace('_', ' ').toLowerCase()}</span>
                            <span className="text-xs text-muted-foreground">{notif.message}</span>
                        </div>
                    ))
                )}
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" className="w-full text-xs" size="sm" onClick={handleMarkAllAsRead}>Mark all as read</Button>
            </div>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/photo.jpg" alt="@admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <span className="sr-only">View profile</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Admin Recruiter</p>
              <p className="text-xs leading-none text-muted-foreground">
                recruiter@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">Profile</Link>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
