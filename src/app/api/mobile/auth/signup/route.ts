import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'student' } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email, password, and name are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid email address'
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['student', 'owner']
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role. Must be either student or owner'
      }, { status: 400 })
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      password: password,
      name: name.trim(),
      role: role,
      provider: 'credentials' as const,
      emailVerified: false
    }

    const newUser = await createUser(userData)

    if (!newUser) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user account'
      }, { status: 500 })
    }

    // Generate JWT token
    const token = generateToken(newUser)

    // Return format that matches Flutter AuthResponse model
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        token: token,
        user: {
          id: newUser._id?.toString() || newUser.id?.toString() || '',
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar || null
        }
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Mobile signup error:', error)
    
    // Handle specific errors
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return NextResponse.json({
        success: false,
        error: 'An account with this email already exists'
      }, { status: 409 })
    }

    if (error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({
        success: false,
        error: 'Registration service temporarily unavailable'
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create account'
    }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
