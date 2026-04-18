import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const roleCookie = request.cookies.get('role')?.value
    const profileCompletionCookie = request.cookies.get('profileCompletion')?.value
    const profileCompletion = parseInt(profileCompletionCookie || '0', 10)
    const path = request.nextUrl.pathname

    const isAuthRoute = path === '/login' || path === '/signup' || path === '/forgot-password'
    const isPublicPage = path === '/' || path === '/terms' || path === '/privacy'
    const isCandidateRoute = path === '/candidate' || path.startsWith('/candidate/')

    // Ignore static files, api routes, Next.js internal paths
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.includes('.')
    ) {
        return NextResponse.next()
    }

    if (isPublicPage) {
        return NextResponse.next()
    }

    // Role redirection logic
    if (isAuthRoute && roleCookie) {
        if (roleCookie === 'recruiter') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else if (roleCookie === 'candidate') {
            if (profileCompletion >= 80) {
                return NextResponse.redirect(new URL('/candidate/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/candidate/profile', request.url))
            }
        }
    }

    if (!isAuthRoute && !roleCookie) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!isAuthRoute && roleCookie) {
        if (roleCookie === 'candidate') {
            if (profileCompletion < 80 && path !== '/candidate/profile') {
                return NextResponse.redirect(new URL('/candidate/profile', request.url))
            }
            if (profileCompletion >= 80 && !isCandidateRoute) {
                return NextResponse.redirect(new URL('/candidate/dashboard', request.url))
            }
        }
        if (roleCookie === 'recruiter' && isCandidateRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
