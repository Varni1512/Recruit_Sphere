'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    // Mock authentication logic
    if (email === 'recruiter@example.com' && password === 'password') {
        (await cookies()).set('role', 'recruiter', { maxAge: 60 * 60 * 24 * 7 }) // 1 week
        redirect('/')
    } else if (email === 'candidate@example.com' && password === 'password') {
        (await cookies()).set('role', 'candidate', { maxAge: 60 * 60 * 24 * 7 }) // 1 week
        redirect('/candidate/dashboard')
    } else {
        return { error: 'Invalid email or password. Try recruiter@example.com or candidate@example.com with password "password"' }
    }
}

export async function logout() {
    (await cookies()).delete('role')
    redirect('/login')
}
