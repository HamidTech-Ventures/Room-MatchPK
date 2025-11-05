"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo"
import { Eye, EyeOff, Mail, Lock, Home, ArrowLeft, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useFormLocalStorage } from "@/hooks/use-local-storage"
import { useFormValidation, validationSchemas } from "@/lib/form-validation"
import { HydrationBoundary } from "@/components/hydration-boundary"

export default function AuthLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  
  // Initial form data
  const initialFormData = {
    email: "",
    password: "",
    remember: false,
  }
  
  // Use local storage for form persistence (excluding password for security)
  const {
    formData,
    updateFormData,
    resetForm,
    hasUnsavedChanges
  } = useFormLocalStorage('login-form', initialFormData, {
    autoSave: true,
    excludeFields: ['password'], // Don't save password for security
    debounceMs: 500
  })
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    validateAllFields,
    getFieldError,
    isFieldValid,
    getFieldClassName
  } = useFormValidation(formData, validationSchemas.login, touchedFields)

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    updateFormData(field, value)
  }

  const handleFieldBlur = (field: keyof typeof formData) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get('error')
    const callbackUrl = searchParams.get('callbackUrl')
    
    if (error) {
      console.log('Auth error detected:', error)
      
      switch (error) {
        case 'use_google_signup':
          toast.error("Please use Google Sign Up/Login", {
            description: "This email is registered with Google. Please use Google authentication."
          })
          break
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
          toast.error("Google Authentication Error", {
            description: "There was a problem with Google sign-in. Please try again."
          })
          break
        case 'AccessDenied':
          toast.error("Access Denied", {
            description: "You don't have permission to access this resource."
          })
          break
        case 'Configuration':
          toast.error("Configuration Error", {
            description: "Authentication is not properly configured. Please contact support."
          })
          break
        default:
          toast.error("Authentication Error", {
            description: "An error occurred during authentication. Please try again."
          })
      }
    }
    
    // Handle successful callback
    if (callbackUrl && !error) {
      console.log('Successful auth callback, redirecting to:', callbackUrl)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading || isGoogleLoading) {
      console.log('Already processing login, ignoring')
      return
    }

    // Mark all fields as touched for validation display
    setTouchedFields({
      email: true,
      password: true
    })

    // Validate all fields
    const validationResult = validateAllFields()
    if (!validationResult.isValid) {
      toast.error("Please fix the validation errors", {
        description: "Check your email and password and try again."
      })
      return
    }
    
    setError("")
    setIsLoading(true)
    console.log('Manual login form submitted')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.ok) {
        toast.success("Login successful!", {
          description: "Welcome back! Redirecting..."
        })
        
        // Handle return URL or redirect to callback
        const returnUrl = searchParams.get('returnUrl')
        const action = searchParams.get('action')
        
        if (returnUrl) {
          // Decode and validate the return URL
          try {
            const decodedUrl = decodeURIComponent(returnUrl)
            // Ensure it's a relative URL for security
            if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
              // Show success message with context
              if (action) {
                toast.success(`Login successful! You can now ${action.replace('-', ' ')}.`, {
                  description: "Redirecting you back..."
                })
              }
              router.push(decodedUrl)
              return
            }
          } catch (error) {
            console.error('Invalid return URL:', error)
          }
        }
        
        router.push("/auth/callback")
      } else {
        // Handle specific error messages
        const errorMessage = result?.error || 'LOGIN_FAILED'
        
        switch (errorMessage) {
          case 'EMAIL_NOT_FOUND':
            setError("Email not found. Please check your email or sign up.")
            toast.error("Email not found", {
              description: "Please check your email address or create a new account."
            })
            break
          case 'WRONG_PASSWORD':
            setError("Incorrect password. Please try again.")
            toast.error("Wrong password", {
              description: "Please check your password and try again."
            })
            break
          case 'GOOGLE_ONLY_ACCOUNT':
            setError("This account uses Google authentication.")
            toast.error("Use Google Login", {
              description: "This email is registered with Google. Please use Google Sign In."
            })
            break
          default:
            setError("Invalid email or password. Please try again.")
            toast.error("Login failed", {
              description: "Please check your credentials and try again."
            })
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      toast.error("Login error", {
        description: "Something went wrong. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading || isGoogleLoading) {
      console.log('Already processing, ignoring Google login click')
      return
    }
    
    try {
      console.log('Google login button clicked')
      setIsGoogleLoading(true)
      
      // Build callback URL with return URL
      const returnUrl = searchParams.get('returnUrl')
      let callbackUrl = '/auth/callback?intent=login'
      if (returnUrl) {
        callbackUrl += `&returnUrl=${encodeURIComponent(returnUrl)}`
      }
      
      // Use NextAuth signIn with Google provider for existing users
      await signIn('google', {
        redirect: true,
        callbackUrl: callbackUrl
      })
    } catch (error) {
      console.error('Google login error:', error)
      toast.error("Google login error", {
        description: "Something went wrong with Google authentication."
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23059669' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <Button variant="ghost" className="mb-6 text-slate-600 hover:text-emerald-600" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            {/* Logo */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block group hover:scale-105 transition-transform">
                <Logo size={40} textSize="md" />
              </Link>
            </div>

            {/* Login Card */}
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 relative">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h1>
                <p className="text-slate-600 text-sm">Sign in to continue your journey</p>
              </CardHeader>

              <CardContent className="space-y-4 p-3 sm:p-4">
                <HydrationBoundary fallback={
                  <div className="space-y-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-12 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-12 bg-slate-200 rounded"></div>
                      <div className="h-12 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                }>
                  <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        className={getFieldClassName('email', "pl-10 h-10 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-slate-800 bg-white/50")}
                        required
                      />
                    </div>
                    {getFieldError('email') && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <span className="text-red-500">●</span>
                        {getFieldError('email')}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                        className={getFieldClassName('password', "pl-10 pr-10 h-10 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-slate-800 bg-white/50")}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getFieldError('password') && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <span className="text-red-500">●</span>
                        {getFieldError('password')}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.remember}
                        onCheckedChange={(checked) => handleFieldChange('remember', checked as boolean)}
                        className="border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      "Sign In to Your Account"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">Or sign in with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                  variant="outline"
                  className="w-full h-10 bg-white/50 border-2 border-slate-200 hover:border-slate-300 hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <Image
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        width={20}
                        height={20}
                        className="mr-3"
                      />
                      Continue with Google
                    </>
                  )}
                </Button>



                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <span className="text-slate-600">Don't have an account? </span>
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Create Account
                  </Link>
                </div>
                </HydrationBoundary>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=1000&fit=crop"
            alt="Student Community"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-emerald-600/80"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-xl text-white/90 mb-8">Continue your journey to find the perfect accommodation</p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold mb-1">🏠</div>
                  <div className="font-semibold">Safe Housing</div>
                  <div className="text-white/80">Verified properties</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold mb-1">🤝</div>
                  <div className="font-semibold">Trusted Community</div>
                  <div className="text-white/80">Real reviews</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold mb-1">💰</div>
                  <div className="font-semibold">Best Prices</div>
                  <div className="text-white/80">No hidden fees</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold mb-1">📞</div>
                  <div className="font-semibold">24/7 Support</div>
                  <div className="text-white/80">Always here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
