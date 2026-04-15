"use client"

import { useEffect } from "react"
import { auth } from "@/lib/localAuth"
import { syncCookiesAction } from "@/app/actions/authActions"

export function AuthProviderSync() {
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Determine role (mocked logic or fetched from profile)
                // In this app, we can check localStorage or profile
                const role = localStorage.getItem('userRole') || 'candidate'
                await syncCookiesAction(user.uid, role)
            }
        })
        return () => unsubscribe()
    }, [])

    return null
}
