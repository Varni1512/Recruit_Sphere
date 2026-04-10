"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { UserPlus, Loader2, ChevronRight } from "lucide-react"

import { setRoleCookie } from "@/app/actions/auth"
import { registerCandidate } from "@/app/actions/authActions"
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

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const firstName = formData.get("first-name") as string
        const lastName = formData.get("last-name") as string

        try {
            const formDataObj = new FormData()
            formDataObj.append("first-name", firstName)
            formDataObj.append("last-name", lastName)
            formDataObj.append("email", email)
            formDataObj.append("password", password)

            const result = await registerCandidate(formDataObj)

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
                    existingUsers.push(result.user)
                    localStorage.setItem("rs_auth_users_v1", JSON.stringify(existingUsers))

                    const fakeProfile = { fullName: `${firstName} ${lastName}`, email, experiences: [] }
                    localStorage.setItem(`candidateProfile_${uid}`, JSON.stringify({ profile: fakeProfile, completion: 100 }))
                    localStorage.setItem("candidateLastUid", uid)

                    document.cookie = "role=candidate; path=/; max-age=604800"
                }

                try { await setRoleCookie("candidate") } catch (e) { }
                router.replace("/candidate/dashboard")
            }
        } catch (err: any) {
            setError(err.message || "Failed to create account. Please try again.")
        } finally {
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
                    <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                    Join Recruit Sphere to start your premium hiring experience
                </p>
            </div>

            <Card className="border-border/50 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                
                <CardHeader className="space-y-1 pb-4 lg:pb-3 pt-6 lg:pt-5 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Sign up</CardTitle>
                    <CardDescription>
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleSignup}>
                    <CardContent className="grid gap-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">First name</Label>
                                <Input id="first-name" name="first-name" placeholder="Max" autoComplete="given-name" required className="h-11 bg-muted/30 border-muted-foreground/20 transition-all" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Last name</Label>
                                <Input id="last-name" name="last-name" placeholder="Robinson" autoComplete="family-name" required className="h-11 bg-muted/30 border-muted-foreground/20 transition-all" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required className="h-11 bg-muted/30 border-muted-foreground/20 transition-all" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
                            <PasswordInput id="password" name="password" autoComplete="new-password" required className="h-11 bg-muted/30 border-muted-foreground/20 transition-all" />
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 mt-1"
                            >
                                {error}
                            </motion.div>
                        )}
                    </CardContent>
                    
                    <CardFooter className="flex flex-col gap-4 lg:gap-3 pb-6 lg:pb-5 pt-2 lg:pt-1">
                        <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...</>
                            ) : (
                                <span className="flex items-center">
                                    Create Account <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            )}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    )
}
