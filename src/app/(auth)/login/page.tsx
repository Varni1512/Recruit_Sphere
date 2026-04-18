"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogIn, Loader2, ChevronRight } from "lucide-react"

import { loginAction } from "@/app/actions/authActions"
import { setRoleCookie } from "@/app/actions/auth"
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
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function processLoginAndRedirect(user: any) {
        const role = "candidate"
        document.cookie = `role=${role}; path=/; max-age=604800`

        try {
            await setRoleCookie(role)
        } catch (e) {
            console.error("Server action cookie set failed", e)
        }

        try {
            const { getUserProfile, calculateProfileCompletion } = await import('@/lib/profileUtils');
            const cacheKey = `candidateProfile_${user.uid}`;
            const profile = await getUserProfile(user.uid);
            const completion = calculateProfileCompletion(profile);

            if (typeof window !== "undefined" && profile) {
                localStorage.setItem(cacheKey, JSON.stringify({ profile, completion }));
                localStorage.setItem("candidateLastUid", user.uid);
            }
        } catch (e) {
            console.error("Error preloading profile data", e);
        } finally {
            router.replace("/candidate/dashboard");
        }
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        // Mock Recruiter Login
        if (email === "recruiter@example.com" && password === "password") {
            try { await setRoleCookie("recruiter"); } catch (e) { }
            if (typeof window !== "undefined") {
                document.cookie = `role=recruiter; path=/; max-age=604800`;
                const uid = "recruiter_mock_123"
                localStorage.setItem("rs_auth_session_uid_v1", uid)
                window.location.href = "/";
            }
            return
        }

        try {
            const formDataObj = new FormData()
            formDataObj.append("email", email)
            formDataObj.append("password", password)

            const result = await loginAction(formDataObj)

            if (result.error) {
                setError(result.error)
                setIsLoading(false)
                return
            }

            if (result.success && result.user) {
                const uid = result.user.uid
                if (typeof window !== "undefined") {
                    localStorage.setItem("rs_auth_session_uid_v1", uid)
                    const existingUsersRaw = localStorage.getItem("rs_auth_users_v1")
                    let existingUsers = []
                    try { if (existingUsersRaw) existingUsers = JSON.parse(existingUsersRaw) } catch (e) { }
                    if (!existingUsers.find((u: any) => u.uid === uid)) {
                        existingUsers.push(result.user)
                        localStorage.setItem("rs_auth_users_v1", JSON.stringify(existingUsers))
                    }
                }

                await processLoginAndRedirect({ uid, email, displayName: `${result.user.firstName} ${result.user.lastName}` })
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials")
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <div className="mb-4 lg:mb-3 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                    <LogIn className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                    Enter your credentials to access your Recruit Sphere account
                </p>
            </div>

            <Card className="border-border/50 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                
                <CardHeader className="space-y-1 pb-4 lg:pb-3 pt-6 lg:pt-5 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
                    <CardDescription>
                        Use your email and password to log in
                    </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleLogin}>
                    <CardContent className="grid gap-3 lg:gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder="name@example.com" 
                                autoComplete="email" 
                                required 
                                className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-primary hover:underline underline-offset-4"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <PasswordInput 
                                id="password" 
                                name="password" 
                                autoComplete="current-password" 
                                required 
                                className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all " 
                            />
                        </div>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20"
                            >
                                {error}
                            </motion.div>
                        )}
                    </CardContent>
                    
                    <CardFooter className="flex flex-col gap-4 lg:gap-3 pb-6 lg:pb-5 pt-4 lg:pt-4">
                        <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...</>
                            ) : (
                                <span className="flex items-center">
                                    Sign In <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            )}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="font-bold text-primary hover:underline underline-offset-4">
                                Sign up now
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    )
}
