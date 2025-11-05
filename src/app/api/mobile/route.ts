import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Mobile API is working',
    endpoints: {
      signin: '/api/mobile/auth/signin',
      signup: '/api/mobile/auth/signup'
    }
  })
}

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
