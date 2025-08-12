import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    mongodb: !!process.env.MONGODB_URI,
    nextauth: !!process.env.NEXTAUTH_SECRET,
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  }

  const isConfigured = config.mongodb && config.nextauth

  return NextResponse.json({
    configured: isConfigured,
    services: config,
    message: isConfigured 
      ? 'Backend is properly configured' 
      : 'Backend configuration incomplete. Please check environment variables.'
  })
}