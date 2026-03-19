import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getMobileSecret } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is an OAuth user (no password or special OAuth marker)
    if (!user.password || user.password === 'OAUTH_USER') {
      // OAuth users should use the Google auth endpoint instead
      return NextResponse.json(
        { success: false, error: 'OAuth users should sign in using Google authentication. Use /api/mobile/auth/googleauth endpoint instead.' },
        { status: 401 }
      );
    }

    // Verify password for non-OAuth users
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
      name: user.name || '',
    };

    const jwtSecret = getMobileSecret();
    const token = jwt.sign(
      tokenPayload,
      jwtSecret,
      { expiresIn: '7d' } 
    );

    // Prepare response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || '',
          role: user.role || 'user',
        },
      },
    });
  } catch (error: any) {
    console.error('Token signin error:', error.message, error.stack);
    return NextResponse.json(
      { success: false, error: 'Authentication failed', details: error.message },
      { status: 500 }
    );
  }
}