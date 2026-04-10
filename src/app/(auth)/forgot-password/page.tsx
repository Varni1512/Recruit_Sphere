"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle2, ChevronRight, Loader2 } from "lucide-react"

import { sendOTP, verifyOTP, resetPassword } from "@/app/actions/authActions"
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

type Step = "email" | "otp" | "reset" | "success"

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const emailInput = formData.get("email") as string
        
        try {
            const result = await sendOTP(emailInput)
            if (result.error) {
                setError(result.error)
            } else {
                setEmail(emailInput)
                setStep("otp")
            }
        } catch (err: any) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const otpInput = formData.get("otp") as string
        
        try {
            const result = await verifyOTP(email, otpInput)
            if (result.error) {
                setError(result.error)
            } else {
                setOtp(otpInput)
                setStep("reset")
            }
        } catch (err: any) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirm-password") as string

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        const resetData = new FormData()
        resetData.append("email", email)
        resetData.append("otp", otp)
        resetData.append("password", password)

        try {
            const result = await resetPassword(resetData)
            if (result.error) {
                setError(result.error)
            } else {
                setStep("success")
            }
        } catch (err: any) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const containerVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    }

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Link 
                    href="/login" 
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 lg:mb-2 group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to login
                </Link>
            </motion.div>

            <AnimatePresence mode="wait">
                {step === "email" && (
                    <motion.div
                        key="email"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="mb-4 lg:mb-3 flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 shadow-inner">
                                <Mail className="h-7 w-7 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
                            <p className="text-sm text-muted-foreground max-w-[300px]">
                                No worries, we&apos;ll send you a verification code to reset your account.
                            </p>
                        </div>

                        <Card className="border-border/50 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                            <form onSubmit={handleSendOTP}>
                                <CardContent className="grid gap-5 pt-8">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            name="email" 
                                            type="email" 
                                            placeholder="name@example.com" 
                                            required 
                                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all"
                                            autoComplete="email"
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
                                <CardFooter className="pb-6 lg:pb-5 pt-2">
                                    <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending Code...</>
                                        ) : (
                                            <span className="flex items-center">
                                                Send Verification Code <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {step === "otp" && (
                    <motion.div
                        key="otp"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="mb-4 lg:mb-3 flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 shadow-inner">
                                <KeyRound className="h-7 w-7 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                            <p className="text-sm text-muted-foreground max-w-[300px]">
                                We sent a 6-digit code to <span className="font-bold text-foreground underline decoration-primary/30">{email}</span>
                            </p>
                        </div>

                        <Card className="border-border/50 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                            <form onSubmit={handleVerifyOTP}>
                                <CardContent className="grid gap-5 pt-8">
                                    <div className="grid gap-2">
                                        <Label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Verification Code</Label>
                                        <Input 
                                            id="otp" 
                                            name="otp" 
                                            placeholder="000 000" 
                                            required 
                                            maxLength={6}
                                            className="h-14 text-center text-3xl tracking-[0.5em] font-black bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all"
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
                                <CardFooter className="flex flex-col gap-4 lg:gap-3 pb-6 lg:pb-5 pt-2">
                                    <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                                        ) : "Verify Code"}
                                    </Button>
                                    <button 
                                        type="button" 
                                        onClick={() => setStep("email")}
                                        className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-primary/30 transition-all"
                                    >
                                        Didn&apos;t receive code? Resend
                                    </button>
                                </CardFooter>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {step === "reset" && (
                    <motion.div
                        key="reset"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="mb-4 lg:mb-3 flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 shadow-inner">
                                <Lock className="h-7 w-7 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
                            <p className="text-sm text-muted-foreground max-w-[300px]">
                                Your new password must be secure and unique.
                            </p>
                        </div>

                        <Card className="border-border/50 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                            <form onSubmit={handleResetPassword}>
                                <CardContent className="grid gap-5 pt-8">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">New Password</Label>
                                        <PasswordInput id="password" name="password" required className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirm New Password</Label>
                                        <PasswordInput id="confirm-password" name="confirm-password" required className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary/50 transition-all" />
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
                                <CardFooter className="pb-6 lg:pb-5 pt-4 lg:pt-2">
                                    <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Resetting...</>
                                        ) : "Update Password"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {step === "success" && (
                    <motion.div
                        key="success"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center shadow-inner">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                                >
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                </motion.div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">Password reset</h1>
                                <p className="text-sm text-muted-foreground max-w-[300px]">
                                    Your password has been successfully updated. You can now log in with your new credentials.
                                </p>
                            </div>
                        </div>

                        <Card className="border-border/50 shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50" />
                            <CardFooter className="pt-8 pb-8">
                                <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all group" asChild>
                                    <Link href="/login" className="flex items-center">
                                        Continue to Sign In <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
