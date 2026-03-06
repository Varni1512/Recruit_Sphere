"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"
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
        // Since Firebase Auth is now Candidate-only (recruiter uses hardcoded bypass),
        // we completely skip awaiting Firestore getDoc which was hanging the UI.
        const role = "candidate"

        // Set cookie instantly on the client to bypass any Next.js Server Action hangups
        document.cookie = `role=${role}; path=/; max-age=604800`

        try {
            await setRoleCookie(role)
        } catch (e) {
            console.error("Server action cookie set failed, relying on client cookie", e)
        }

        window.location.href = "/candidate/dashboard"
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        // Hardcoded Recruiter Access Bypass
        if (email === "recruiter@example.com" && password === "password") {
            await setRoleCookie("recruiter")
            window.location.href = "/"
            return
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            await processLoginAndRedirect(userCredential.user)
        } catch (err: any) {
            console.error("Firebase Auth Error:", err);
            if (err.code === "auth/operation-not-allowed") {
                setError("Email/Password is not enabled. Please enable it in your Firebase Console.");
            } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                setError("Invalid email or password.");
            } else {
                setError(err.message || "Invalid credentials")
            }
            setIsLoading(false)
        }
    }

    async function handleProviderLogin(providerName: "google" | "github") {
        setIsLoading(true)
        setError(null)
        try {
            const provider = providerName === "google" ? new GoogleAuthProvider() : new GithubAuthProvider()
            const userCredential = await signInWithPopup(auth, provider)
            await processLoginAndRedirect(userCredential.user)
        } catch (err: any) {
            console.error("Firebase Auth Error:", err);
            if (err.code === "auth/operation-not-allowed") {
                setError(`${providerName === "google" ? "Google" : "GitHub"} Sign-in is not enabled. Please enable it in your Firebase Console.`);
            } else {
                setError(err.message || `Failed to sign in with ${providerName}`)
            }
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
                        <div className="grid grid-cols-2 gap-6 relative">
                            <Button variant="outline" type="button" onClick={() => handleProviderLogin("google")} disabled={isLoading}>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" type="button" onClick={() => handleProviderLogin("github")} disabled={isLoading}>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                GitHub
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
