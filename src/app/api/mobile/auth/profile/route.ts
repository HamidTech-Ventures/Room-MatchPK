import { NextRequest, NextResponse } from 'next/server'
import { withMobileAuth } from '../../middleware'
import { findUserByEmail } from '@/lib/auth'

async function profileHandler(request: NextRequest, context: { user: any }) {
  try {
    const { user: tokenUser } = context
    
    // Get fresh user data from database
    const currentUser = await findUserByEmail(tokenUser.email)
    
    if (!currentUser) {
      return NextResponse.json({
        success: false, 
        error: 'User not found'
      }, { status: 404 })
      
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: currentUser._id?.toString() || currentUser.id?.toString() || '',
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          avatar: currentUser.avatar || null,
          emailVerified: currentUser.emailVerified || false,
          createdAt: currentUser.createdAt,
          updatedAt: currentUser.updatedAt
        }
      }
    })

  } catch (error: any) {
    console.error('Mobile profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 })
  }
}

export const GET = withMobileAuth(profileHandler)

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
