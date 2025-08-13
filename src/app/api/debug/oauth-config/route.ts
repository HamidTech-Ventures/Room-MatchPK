import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    nextAuthUrl: process.env.NEXTAUTH_URL,
    vercelUrl: process.env.VERCEL_URL,
    nodeEnv: process.env.NODE_ENV,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
    expectedRedirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    currentDomain: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'localhost'
  }

  return NextResponse.json({
    message: 'OAuth Configuration Debug Info',
    config,
    instructions: {
      googleCloudConsole: {
        authorizedJavaScriptOrigins: [
          'http://localhost:3000',
          process.env.NEXTAUTH_URL || 'https://hostel-opal.vercel.app'
        ],
        authorizedRedirectUris: [
          'http://localhost:3000/api/auth/callback/google',
          `${process.env.NEXTAUTH_URL || 'https://hostel-opal.vercel.app'}/api/auth/callback/google`
        ]
      }
    }
  })
}
