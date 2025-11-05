import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the current URL from the request
  const url = new URL(request.url)
  const currentOrigin = url.origin

  // Dynamic NEXTAUTH_URL logic (same as in auth-config.ts)
  const getNextAuthUrl = () => {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL
    }
    return 'http://localhost:3000'
  }

  const nextAuthUrl = getNextAuthUrl()

  const config = {
    currentOrigin,
    nextAuthUrl,
    vercelUrl: process.env.VERCEL_URL,
    nodeEnv: process.env.NODE_ENV,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
    expectedRedirectUri: `${nextAuthUrl}/api/auth/callback/google`,
    allHeaders: Object.fromEntries(request.headers.entries())
  }

  return NextResponse.json({
    message: 'OAuth Configuration Debug Info',
    config,
    analysis: {
      redirectUriMismatch: {
        possibleCauses: [
          'NEXTAUTH_URL environment variable mismatch',
          'Google Cloud Console redirect URI not matching exactly',
          'Trailing slashes in URLs',
          'HTTP vs HTTPS mismatch',
          'Vercel preview deployment URL being used instead of production'
        ]
      }
    },
    requiredGoogleCloudConsoleConfig: {
      authorizedJavaScriptOrigins: [
        'http://localhost:3000',
        'https://hostel-opal.vercel.app',
        currentOrigin !== 'http://localhost:3000' && currentOrigin !== 'https://hostel-opal.vercel.app' ? currentOrigin : null
      ].filter(Boolean),
      authorizedRedirectUris: [
        'http://localhost:3000/api/auth/callback/google',
        'https://hostel-opal.vercel.app/api/auth/callback/google',
        currentOrigin !== 'http://localhost:3000' && currentOrigin !== 'https://hostel-opal.vercel.app' ? `${currentOrigin}/api/auth/callback/google` : null
      ].filter(Boolean)
    }
  })
}
