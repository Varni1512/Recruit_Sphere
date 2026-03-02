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

export default function SignupPage() {
    return (
        <>
            <div className="mb-8 flex flex-col items-center justify-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                    <Building2 className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Join Recruit Sphere to manage your hiring workflow
                </p>
            </div>

            <Card className="border-border/50 shadow-xl dark:shadow-2xl backdrop-blur-sm bg-background/95">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign up</CardTitle>
                    <CardDescription>
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" placeholder="Max" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" placeholder="Robinson" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" type="text" placeholder="Acme Inc." required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full">Create account</Button>
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}
