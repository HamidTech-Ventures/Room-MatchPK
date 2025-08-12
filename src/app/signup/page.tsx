"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Home, ArrowLeft, Sparkles, UserCheck, Building } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useFormLocalStorage } from "@/hooks/use-local-storage"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  
  // Initial form data
  const initialFormData = {
    fullName: "",
    email: "",
    accountType: "student",
    password: "",
    terms: false,
  }
  
  // Use local storage for form persistence (excluding sensitive fields)
  const {
    formData,
    updateFormData,
    resetForm,
    hasUnsavedChanges
  } = useFormLocalStorage('signup-form', initialFormData, {
    autoSave: true,
    excludeFields: ['password'], // Don't save password for security
    debounceMs: 500
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) {
      console.log('Already processing signup, ignoring')
      return
    }
    
    setError("")
    setIsLoading(true)
    console.log('Manual signup form submitted')

    // Validate form
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      toast.error("Full name required", {
        description: "Please enter your full name."
      })
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      toast.error("Email required", {
        description: "Please enter your email address."
      })
      setIsLoading(false)
      return
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      toast.error("Password required", {
        description: "Please enter a password."
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      toast.error("Password too short", {
        description: "Password must be at least 6 characters long."
      })
      setIsLoading(false)
      return
    }

    if (!formData.terms) {
      setError("Please accept the terms and conditions")
      toast.error("Terms required", {
        description: "Please accept the terms and conditions to continue."
      })
      setIsLoading(false)
      return
    }

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.accountType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Account created successfully!", {
          description: "Please sign in with your new account."
        })
        
        // Automatically sign in the user
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (signInResult?.ok) {
          toast.success("Welcome!", {
            description: "You have been automatically signed in."
          })
          // Use our callback page for role-based redirect
          router.push("/auth/callback")
        } else {
          toast.error("Auto-login failed", {
            description: "Please sign in manually with your new account."
          })
          router.push("/auth/login")
        }
      } else {
        // Handle specific errors
        if (response.status === 409) {
          setError("Email already exists")
          toast.error("Email already exists", {
            description: "An account with this email already exists. Please sign in instead."
          })
        } else {
          setError(data.error || "Failed to create account")
          toast.error("Signup failed", {
            description: data.error || "Something went wrong. Please try again."
          })
        }
      }
    } catch (error) {
      setError("Network error. Please try again.")
      toast.error("Network error", {
        description: "Please check your connection and try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) {
      console.log('Already processing, ignoring Google signup click')
      return
    }
    
    try {
      console.log('Google signup button clicked')
      setIsLoading(true)
      
      // Use redirect: true for Google OAuth as it requires a redirect flow
      // Add a parameter to indicate this is a signup attempt
      await signIn('google', {
        redirect: true,
        callbackUrl: '/auth/callback?intent=signup'
      })
    } catch (error) {
      console.error('Google signup error:', error)
      toast.error("Google signup error", {
        description: "Something went wrong with Google authentication."
      })
      setIsLoading(false)
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <Button variant="ghost" className="mb-8 text-slate-600 hover:text-emerald-600" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3 group">
                <div className="w-12 h-12 relative group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo.jpg"
                    alt="RoomMatch PK Logo"
                    fill
                    className="object-contain rounded-xl shadow-lg"
                  />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-slate-800">RoomMatch PK</span>
                  <div className="text-xs text-slate-500 -mt-1">Find Your Home</div>
                </div>
              </Link>
            </div>

            {/* Sign Up Card */}
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
                <p className="text-slate-600">Join thousands of students finding their perfect home</p>
              </CardHeader>

              <CardContent className="space-y-6 p-8">

                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        className="pl-12 h-14 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-slate-800 bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="pl-12 h-14 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-slate-800 bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700">I am a</label>
                    <RadioGroup
                      value={formData.accountType}
                      onValueChange={(value) => updateFormData('accountType', value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="student" id="student" className="peer sr-only" />
                        <Label
                          htmlFor="student"
                          className="flex flex-col items-center justify-center p-4 bg-white/50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 transition-all min-h-[120px]"
                        >
                          <UserCheck className="w-8 h-8 text-purple-600 mb-2" />
                          <span className="font-medium text-slate-800 text-center">Student</span>
                          <span className="text-xs text-slate-600 text-center mt-1">Looking for accommodation</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="owner" id="owner" className="peer sr-only" />
                        <Label
                          htmlFor="owner"
                          className="flex flex-col items-center justify-center p-4 bg-white/50 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 transition-all min-h-[120px]"
                        >
                          <Building className="w-8 h-8 text-purple-600 mb-2" />
                          <span className="font-medium text-slate-800 text-center">Property Owner</span>
                          <span className="text-xs text-slate-600 text-center mt-1">List my property</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="pl-12 pr-12 h-14 border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-slate-800 bg-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => updateFormData('terms', checked as boolean)}
                      className="mt-1 border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Create Account Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create My Account"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">Or sign up with</span>
                  </div>
                </div>

                {/* Google Sign Up Only */}
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-14 bg-white/50 border-2 border-slate-200 hover:border-slate-300 hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <Image
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <span className="text-slate-600">Already have an account? </span>
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign In
                  </Link>
                </div>
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
              <h1 className="text-4xl font-bold mb-4">Join Our Community!</h1>
              <p className="text-xl text-white/90 mb-8">
                Connect with thousands of students and property owners across Pakistan
              </p>
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
