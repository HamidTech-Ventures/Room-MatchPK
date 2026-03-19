import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getMobileSecret } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
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
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is an OAuth user (has provider field)
    if (user.provider !== 'google' && user.provider !== 'both') {
      return NextResponse.json(
        { success: false, error: 'This endpoint is only for OAuth users' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role },
      getMobileSecret(),
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Prepare response
    return NextResponse.json({
      success: true,
      message: 'Token generated successfully',
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || '',
          role: user.role || 'student',
        },
      },
    });
  } catch (error: any) {
    console.error('OAuth token generation error:', error.message, error.stack);
    return NextResponse.json(
      { success: false, error: 'Token generation failed', details: error.message },
      { status: 500 }
    );
  }
}