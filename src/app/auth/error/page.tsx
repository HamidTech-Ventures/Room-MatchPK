"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AlertCircle, Home, ArrowLeft, RefreshCw } from "lucide-react"
import { AuthLoading } from "@/components/auth-loading"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const errorParam = searchParams.get('error')
    setError(errorParam || 'unknown')
  }, [searchParams])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Configuration':
        return {
          title: "Configuration Error",
          description: "There's an issue with the authentication configuration. Please contact support.",
          action: "Contact Support"
        }
      case 'AccessDenied':
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
          action: "Try Again"
        }
      case 'Verification':
        return {
          title: "Verification Required",
          description: "Please verify your email address before signing in.",
          action: "Resend Verification"
        }
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return {
          title: "Authentication Error",
          description: "There was a problem with Google authentication. Please try again.",
          action: "Try Again"
        }
      case 'OAuthAccountNotLinked':
        return {
          title: "Account Not Linked",
          description: "This email is already associated with another account. Please sign in with your original method.",
          action: "Sign In"
        }
      case 'EmailSignin':
        return {
          title: "Email Sign-in Error",
          description: "Unable to send sign-in email. Please try again.",
          action: "Try Again"
        }
      case 'CredentialsSignin':
        return {
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect.",
          action: "Try Again"
        }
      case 'SessionRequired':
        return {
          title: "Session Required",
          description: "You need to be signed in to access this page.",
          action: "Sign In"
        }
      default:
        return {
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication. Please try again.",
          action: "Try Again"
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  const handleRetry = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6 sm:mb-8 text-slate-600 hover:text-emerald-600" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          {/* Error Card */}
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{errorInfo.title}</h1>
              <p className="text-slate-600 text-sm sm:text-base">{errorInfo.description}</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6 sm:p-8">
              {/* Error Details */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">
                    <strong>Error Code:</strong> {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {errorInfo.action}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 sm:h-14 bg-white/50 border-2 border-slate-200 hover:border-slate-300 hover:bg-white/70 transition-all"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-5 h-5 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center pt-4">
                <p className="text-slate-600 text-sm">
                  Still having trouble?{" "}
                  <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthLoading title="Loading Error Page" description="Please wait..." />}>
      <AuthErrorContent />
    </Suspense>
  )
}