"use client"

import { useState } from "react"
import { Camera, Mail, MapPin, Building2, Phone } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
    const [isUploading, setIsUploading] = useState(false)

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Profile Sidebar Info */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto relative w-24 h-24 mb-4">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm"
                            >
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">Upload avatar</span>
                            </Button>
                        </div>
                        <CardTitle className="text-xl">John Doe</CardTitle>
                        <CardDescription className="pt-1">Senior HR Manager</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Separator className="mb-4" />
                        <div className="space-y-3 text-sm text-muted-foreground flex flex-col">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-primary/70" />
                                <span>john.doe@recruitsphere.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-primary/70" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-primary/70" />
                                <span>Acme Corp</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-primary/70" />
                                <span>San Francisco, CA</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Settings Tabs */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-start grid w-full grid-cols-3 rounded-xl">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        Update your personal details and how others see you on the platform.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First name</Label>
                                            <Input id="firstName" defaultValue="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last name</Label>
                                            <Input id="lastName" defaultValue="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input id="email" type="email" defaultValue="john.doe@recruitsphere.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Job title</Label>
                                        <Input id="role" defaultValue="Senior HR Manager" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Write a few sentences about yourself."
                                            defaultValue="Passionate about finding the best talent and building high-performing teams."
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end border-t px-6 py-4">
                                    <Button>Save Changes</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Update your password to keep your account secure.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current password</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">New password</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirm new password</Label>
                                        <Input id="confirm" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end border-t px-6 py-4">
                                    <Button>Update Password</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Notifications</CardTitle>
                                    <CardDescription>
                                        Choose what updates you want to receive via email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">New Applications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive an email when a candidate applies to your jobs.
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Interview Reminders</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive a reminder 30 minutes before an interview.
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Weekly Digest</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive a weekly summary of your hiring pipeline.
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>
            </div>
        </div>
    )
}
