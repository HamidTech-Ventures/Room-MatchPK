"use client"

import { useState, useEffect } from "react"
import { getProviders, signIn } from "next-auth/react"

export default function OAuthURLDebugPage() {
  const [providers, setProviders] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [currentUrl, setCurrentUrl] = useState<string>("")

  useEffect(() => {
    // Get current URL
    setCurrentUrl(window.location.origin)
    
    // Get providers
    getProviders().then(setProviders)
    
    // Get debug info
    fetch('/api/debug/oauth-config')
      .then(res => res.json())
      .then(setDebugInfo)
      .catch(console.error)
  }, [])

  const handleGoogleSignIn = () => {
    // This will show us the exact URL being generated
    console.log('Initiating Google OAuth...')
    console.log('Current origin:', window.location.origin)
    console.log('Expected redirect URI:', `${window.location.origin}/api/auth/callback/google`)
    
    signIn('google', {
      redirect: true,
      callbackUrl: '/auth/callback'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">OAuth URL Debug</h1>
        
        <div className="grid gap-6">
          {/* Current Environment */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Environment</h2>
            <div className="space-y-2 text-sm font-mono">
              <p><strong>Current URL:</strong> {currentUrl}</p>
              <p><strong>Expected Redirect:</strong> {currentUrl}/api/auth/callback/google</p>
            </div>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Server Configuration</h2>
              <pre className="text-xs overflow-auto bg-white p-4 rounded border">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Google Cloud Console Requirements */}
          {debugInfo && (
            <div className="bg-yellow-50 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Required Google Cloud Console Config</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Authorized JavaScript Origins:</h3>
                  <ul className="list-disc list-inside text-sm font-mono ml-4">
                    {debugInfo.requiredGoogleCloudConsoleConfig?.authorizedJavaScriptOrigins?.map((origin: string, i: number) => (
                      <li key={i}>{origin}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Authorized Redirect URIs:</h3>
                  <ul className="list-disc list-inside text-sm font-mono ml-4">
                    {debugInfo.requiredGoogleCloudConsoleConfig?.authorizedRedirectUris?.map((uri: string, i: number) => (
                      <li key={i}>{uri}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Test Button */}
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-4">Test OAuth Flow</h2>
            <p className="text-sm text-gray-600 mb-4">
              Click the button below and check the browser console for the exact URLs being used.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Test Google OAuth (Check Console)
            </button>
          </div>

          {/* Manual URL Construction */}
          <div className="bg-green-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Manual URL Check</h2>
            <p className="text-sm mb-4">
              The OAuth redirect URI should be exactly:
            </p>
            <code className="block bg-white p-3 rounded border text-sm">
              {currentUrl}/api/auth/callback/google
            </code>
            <p className="text-xs text-gray-600 mt-2">
              This must match exactly (including case, trailing slashes, etc.) in your Google Cloud Console.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
