import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

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

    // Verify password
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

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' } // Token expires in 1 day
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