import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function withMobileAuth(handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({
          success: false,
          error: 'Authorization token required'
        }, { status: 401 })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      try {
        const decoded = verifyToken(token)
        return await handler(request, { user: decoded })
      } catch (tokenError) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired token'
        }, { status: 401 })
      }

    } catch (error) {
      console.error('Mobile auth middleware error:', error)
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    }
  }
}
