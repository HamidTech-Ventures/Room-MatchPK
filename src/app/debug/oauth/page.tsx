"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function OAuthDebugPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const testGoogleAuth = async () => {
    try {
      console.log('Testing Google OAuth...')
      setDebugInfo({ status: 'testing', message: 'Initiating Google OAuth...' })
      
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/debug/oauth'
      })
      
      console.log('Google OAuth result:', result)
      setDebugInfo({ status: 'result', data: result })
    } catch (error) {
      console.error('Google OAuth error:', error)
      setDebugInfo({ status: 'error', error: error })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">OAuth Debug Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Session Status</h2>
            <p>Status: {status}</p>
            {session && (
              <div className="mt-2">
                <p>User: {session.user?.name}</p>
                <p>Email: {session.user?.email}</p>
                <p>Role: {session.user?.role}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-semibold mb-2">Environment Check</h2>
            <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
            <p>Expected Redirect: {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/google` : 'Unknown'}</p>
            <div className="mt-2 text-sm">
              <p className="font-medium">Required Google Cloud Console URIs:</p>
              <ul className="list-disc list-inside ml-2">
                <li>https://hostel-opal.vercel.app/api/auth/callback/google</li>
                <li>http://localhost:3000/api/auth/callback/google</li>
              </ul>
            </div>
            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
              <p className="font-medium text-yellow-800">Current Issue:</p>
              <p className="text-yellow-700">Getting OAuthCallback error after Google consent screen</p>
            </div>
          </div>

          <div className="space-y-2">
            {!session ? (
              <>
                <button
                  onClick={testGoogleAuth}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Test Google OAuth
                </button>
                <button
                  onClick={() => signIn('google', { callbackUrl: '/debug/oauth' })}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Sign In with Google (Redirect)
                </button>
              </>
            ) : (
              <button
                onClick={() => signOut()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Sign Out
              </button>
            )}
          </div>

          {debugInfo && (
            <div className="p-4 bg-yellow-100 rounded">
              <h2 className="font-semibold mb-2">Debug Info</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-semibold mb-2">Expected Redirect URIs</h2>
            <div className="text-sm space-y-1">
              <p>Production: https://hostel-opal.vercel.app/api/auth/callback/google</p>
              <p>Development: http://localhost:3000/api/auth/callback/google</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
