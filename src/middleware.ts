import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // Redirect root to find-rooms for better UX
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/find-rooms', req.url))
    }
    
    // Add security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow public routes
        const publicRoutes = [
          '/find-rooms',
          '/about',
          '/login',
          '/signup',
          '/auth',
          '/api/auth',
          '/api/properties/verified',
          '/api/properties/counts'
        ]
        
        // Allow public access to individual property pages
        const isPropertyDetailRoute = pathname.match(/^\/api\/properties\/[a-f0-9]{24}$/)
        if (isPropertyDetailRoute) return true
        
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route)
        )
        
        if (isPublicRoute) return true
        
        // Protected routes that require authentication
        const protectedRoutes = [
          '/list-property',
          '/admin',
          '/api/properties/create',
          '/api/users'
        ]
        
        const isProtectedRoute = protectedRoutes.some(route => 
          pathname.startsWith(route)
        )
        
        if (isProtectedRoute && !token) {
          return false // This will redirect to login
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ]
}