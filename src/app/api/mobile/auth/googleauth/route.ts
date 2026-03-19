import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { findUserByEmail, createUser, getMobileSecret } from "@/lib/auth"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Helper function to find or create user for Google OAuth
async function findOrCreateUser(email: string, name: string | undefined, intent: string, picture?: string) {
  console.log("🔍 Finding or creating user:", { email, name, intent, picture: picture || 'No picture provided' });

  // First, try to find existing user
  let user = await findUserByEmail(email)

  if (user) {
    console.log("✅ User found:", { id: user._id || user.id, email: user.email, role: user.role });
    // User exists, update their Google info if needed
    return {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    }
  }

  console.log("➕ Creating new user...");
  // User doesn't exist, create new user
  // Default role based on intent or default to 'student'
  const defaultRole = intent === 'owner' ? 'owner' : 'student'

  const newUserData: any = {
    email: email.toLowerCase(),
    name: name || 'Google User',
    password: `GOOGLE_OAUTH_${Date.now()}`, // Unique placeholder for OAuth users
    role: defaultRole,
    provider: 'google',
    emailVerified: true
  }

  // Only add avatar if it exists  
  if (picture) {
    newUserData.avatar = picture
  }

  console.log("📝 User data to create:", newUserData);

  const newUser = await createUser(newUserData)

  if (!newUser) {
    throw new Error('Failed to create user')
  }

  console.log("✅ User created successfully:", { id: newUser._id || newUser.id, email: newUser.email, role: newUser.role });
  return {
    id: newUser._id || newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    avatar: newUser.avatar

  }
}

export async function POST(req: Request) {
  console.log("🚀 GoogleAuth API was called");
  try {
    const body = await req.json()
    const { token, intent } = body

    console.log("📋 Request body:", { intent, tokenExists: !!token });

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    console.log("👤 Google payload:", {
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture || 'No picture provided',
      email_verified: payload?.email_verified
    });

    if (!payload?.email) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check user in DB
    let user = await findOrCreateUser(payload.email, payload.name, intent, payload.picture)
    // Generate JWT for Flutter using consistent secret
    const jwtSecret = getMobileSecret()
    const appToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    )

    return NextResponse.json({ success: true, token: appToken, user })
  } catch (err: any) {
    console.error("❌ GoogleAuth Error:", err)

    // Handle MongoDB validation errors specifically
    if (err.code === 121) {
      console.error("📋 MongoDB Validation Error Details:", {
        message: err.message,
        errInfo: err.errInfo,
        failingDocumentId: err.errInfo?.failingDocumentId,
        schemaRulesNotSatisfied: err.errInfo?.details?.schemaRulesNotSatisfied
      });

      // Log the detailed validation errors
      if (err.errInfo?.details?.schemaRulesNotSatisfied) {
        console.error("🔍 Schema validation details:", JSON.stringify(err.errInfo.details.schemaRulesNotSatisfied, null, 2));
      }

      return NextResponse.json({
        success: false,
        error: "User data validation failed. Please check your profile information.",
        details: err.errInfo
      }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
