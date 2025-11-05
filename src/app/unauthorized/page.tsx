"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()

  const handleGoBack = () => {
    window.history.back()
  }

  const handleLogoutAndLogin = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600">You don't have permission to access this page.</p>
          {user && (
            <p className="text-sm text-slate-500">
              Logged in as: <strong>{user.role}</strong>
            </p>
          )}
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoBack} className="bg-emerald-600 hover:bg-emerald-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button variant="outline" onClick={handleLogoutAndLogin}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Logout & Login as Different User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
