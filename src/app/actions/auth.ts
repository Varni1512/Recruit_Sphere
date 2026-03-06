'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function setRoleCookie(role: string) {
    (await cookies()).set('role', role, { maxAge: 60 * 60 * 24 * 7, path: '/' }) // 1 week
}

export async function deleteRoleCookie() {
    (await cookies()).delete('role')
}

export async function clearAuthAndRedirect() {
    (await cookies()).delete('role')
    redirect('/login')
}

export async function logout() {
    (await cookies()).delete('role')
    redirect('/login')
}
