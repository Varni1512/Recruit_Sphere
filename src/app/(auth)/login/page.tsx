import Link from "next/link"
import { Building2 } from "lucide-react"

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

export default function LoginPage() {
    return (
        <>
            <div className="mb-8 flex flex-col items-center justify-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                    <Building2 className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Recruit Sphere</h1>
                <p className="text-sm text-muted-foreground">
                    Smart Hiring Workflow Platform
                </p>
            </div>

            <Card className="border-border/50 shadow-xl dark:shadow-2xl backdrop-blur-sm bg-background/95">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-6 relative">
                        <Button variant="outline">
                            Google
                        </Button>
                        <Button variant="outline">
                            Microsoft
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input id="password" type="password" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full">Sign In</Button>
                    <div className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}
