import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const roleCookie = request.cookies.get('role')?.value
    const path = request.nextUrl.pathname

    const isPublicRoute = path === '/login' || path === '/signup'
    const isCandidateRoute = path.startsWith('/candidate')

    // Ignore static files, api routes, Next.js internal paths
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.includes('.')
    ) {
        return NextResponse.next()
    }

    // Role redirection logic
    if (isPublicRoute && roleCookie) {
        if (roleCookie === 'recruiter') {
            return NextResponse.redirect(new URL('/', request.url))
        } else if (roleCookie === 'candidate') {
            return NextResponse.redirect(new URL('/candidate/dashboard', request.url))
        }
    }

    if (!isPublicRoute && !roleCookie) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!isPublicRoute && roleCookie) {
        if (roleCookie === 'candidate' && !isCandidateRoute) {
            return NextResponse.redirect(new URL('/candidate/dashboard', request.url))
        }
        if (roleCookie === 'recruiter' && isCandidateRoute) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
