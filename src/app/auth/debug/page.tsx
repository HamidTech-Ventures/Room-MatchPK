"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Suspense } from "react"

function AuthDebugContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Auth Debug Page</h1>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Session Status</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>User:</strong> {session?.user ? 'Authenticated' : 'Not authenticated'}</p>
              {session?.user && (
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p><strong>Name:</strong> {session.user.name}</p>
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>Role:</strong> {session.user.role}</p>
                  <p><strong>Image:</strong> {session.user.image || 'None'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">URL Parameters</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Intent:</strong> {searchParams.get('intent') || 'None'}</p>
              <p><strong>Error:</strong> {searchParams.get('error') || 'None'}</p>
              <p><strong>Callback URL:</strong> {searchParams.get('callbackUrl') || 'None'}</p>
              <p><strong>All Params:</strong></p>
              <div className="bg-slate-100 p-4 rounded-lg">
                <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Expected Behavior</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ Google Signup (from /signup)</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Should create new account with student role</li>
                  <li>• Should redirect to /find-rooms</li>
                  <li>• Intent parameter should be 'signup'</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔐 Google Login (from /auth/login)</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Should only work for existing Google users</li>
                  <li>• Should redirect based on user role</li>
                  <li>• Intent parameter should be 'login'</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">📝 Manual Signup</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Should create account and auto-login</li>
                  <li>• Should NOT trigger Google button</li>
                  <li>• Should redirect to /auth/callback</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">🔑 Manual Login</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Should authenticate existing users</li>
                  <li>• Should NOT trigger Google button</li>
                  <li>• Should redirect to /auth/callback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthDebugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Loading debug information...</p>
      </div>
    </div>}>
      <AuthDebugContent />
    </Suspense>
  )
}