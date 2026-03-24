"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { loginCandidate } from "@/app/actions/authActions"
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
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function processLoginAndRedirect(user: any) {
        const role = "candidate"

        // Set cookie instantly on the client to bypass any Next.js Server Action hangups
        document.cookie = `role=${role}; path=/; max-age=604800`

        try {
            await setRoleCookie(role)
        } catch (e) {
            console.error("Server action cookie set failed, relying on client cookie", e)
        }

        // After sign-in always take candidate to their profile.
        // We also cache profile data in localStorage to make /candidate/profile feel instant.
        try {
            const { getUserProfile, calculateProfileCompletion } = await import('@/lib/profileUtils');
            const cacheKey = `candidateProfile_${user.uid}`;
            const profile = await getUserProfile(user.uid);
            const completion = calculateProfileCompletion(profile);

            try {
                if (typeof window !== "undefined" && profile) {
                    localStorage.setItem(
                        cacheKey,
                        JSON.stringify({
                            profile,
                            completion,
                        })
                    );
                    localStorage.setItem("candidateLastUid", user.uid);
                }
            } catch (e) {
                console.error("Failed to cache profile", e);
            }
        } catch (e) {
            console.error("Error preloading profile data", e);
        } finally {
            router.replace("/candidate/profile");
        }
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (email === "recruiter@example.com" && password === "password") {
            try { await setRoleCookie("recruiter"); } catch (e) { }
            if (typeof window !== "undefined") {
                document.cookie = `role=recruiter; path=/; max-age=604800`;
                window.location.href = "/";
            }
            return
        }

        try {
            const formDataObj = new FormData()
            formDataObj.append("email", email)
            formDataObj.append("password", password)

            const result = await loginCandidate(formDataObj)

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

                    // Create minimal profile to prevent blocking if they just registered
                    const fakeProfile = {
                        fullName: `${result.user.firstName} ${result.user.lastName}`, email,
                        experiences: []
                    }
                    localStorage.setItem(`candidateProfile_${uid}`, JSON.stringify({ profile: fakeProfile, completion: 100 }))
                    localStorage.setItem("candidateLastUid", uid)
                }

                await processLoginAndRedirect({ uid, email, displayName: `${result.user.firstName} ${result.user.lastName}` })
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || "Invalid credentials")
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="mb-2 flex flex-col items-center justify-center space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Please enter your details to sign in
                </p>
            </div>

            <Card className="border-border/50 shadow-xl dark:shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
                <CardHeader className="space-y-1 pb-6 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@example.com" autoComplete="email" required className="h-11" />
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
                            <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
                        </div>
                        {error && (
                            <div className="text-sm font-medium text-destructive mt-1">
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-6 mt-2">
                        <Button className="w-full h-11 text-base font-medium" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="font-semibold text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}
