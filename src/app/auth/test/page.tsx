"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthLoading } from "@/components/auth-loading"

export default function AuthTestPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <AuthLoading title="Loading Authentication" description="Checking your session..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-emerald-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>NextAuth Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Authenticated</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {session.user?.name}</p>
                    <p><strong>Email:</strong> {session.user?.email}</p>
                    <p><strong>Role:</strong> {session.user?.role}</p>
                    <p><strong>ID:</strong> {session.user?.id}</p>
                  </div>
                </div>
                <Button onClick={() => signOut()} variant="outline">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Not Authenticated</h3>
                  <p className="text-sm text-yellow-700">Please sign in to test the authentication.</p>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={() => signIn('google')} 
                    className="w-full"
                  >
                    Sign in with Google
                  </Button>
                  <Button 
                    onClick={() => signIn('credentials')} 
                    variant="outline"
                    className="w-full"
                  >
                    Sign in with Credentials
                  </Button>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Configuration Info</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>NextAuth URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}</p>
                <p><strong>Google Client ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}</p>
                <p><strong>Expected Callback URL:</strong> http://localhost:3000/api/auth/callback/google</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🎯 Role-Based Redirects</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Student:</strong> /find-rooms</p>
                <p><strong>Owner:</strong> /list-property</p>
                <p><strong>Admin:</strong> /admin</p>
                <p><strong>Default (Google):</strong> student → /find-rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}