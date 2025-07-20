// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const authToken = request.cookies.get('authToken')?.value;

    // Check if route requires authentication
    const protectedPaths = ['/videos', '/dashboard', '/profile'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath) {
        if (!authToken) {
            // Redirect to login or home page
            return NextResponse.redirect(new URL('/auth/youtube', request.url))
        }

        // Optional: Verify token validity with your auth service
        try {
            const response = await fetch('http://localhost:3006/auth/verify', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                return NextResponse.redirect(new URL('/auth/youtube', request.url))
            }
        } catch (error) {
            return NextResponse.redirect(new URL('/auth/youtube', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
}
