"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

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
            console.error("Auth Error:", err);
            setError(err.message || "Failed to create account. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="mb-2 flex flex-col items-center justify-center space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Join Recruit Sphere to manage your hiring workflow
                </p>
            </div>

            <Card className="border-border/50 shadow-xl dark:shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
                <CardHeader className="space-y-1 pb-6 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Sign up</CardTitle>
                    <CardDescription>
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="grid gap-3">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input id="first-name" name="first-name" placeholder="Max" autoComplete="given-name" required className="h-11" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input id="last-name" name="last-name" placeholder="Robinson" autoComplete="family-name" required className="h-11" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" autoComplete="email" required className="h-11" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" autoComplete="new-password" required className="h-11" />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-destructive mt-1">
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-3 mt-3">
                        <Button className="w-full h-11 text-base font-medium" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}
