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
import { Logo } from "@/components/logo"
import { Eye, EyeOff, Mail, Lock, User, Home, ArrowLeft, Sparkles, UserCheck, Building } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useFormLocalStorage } from "@/hooks/use-local-storage"
import { useFormValidation, validationSchemas, checkPasswordStrength } from "@/lib/form-validation"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isStrong: boolean }>({ score: 0, feedback: [], isStrong: false })
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  
  const initialFormData = {
    fullName: "",
    email: "",
    phone: "",
    accountType: "student",
    password: "",
    terms: false,
  }
  
  const {
    formData,
    updateFormData,
    resetForm,
    hasUnsavedChanges
  } = useFormLocalStorage('signup-form', initialFormData, {
    autoSave: true,
    excludeFields: ['password'],
    debounceMs: 500
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  
  const {
    validateAllFields,
    getFieldError,
    isFieldValid,
    getFieldClassName
  } = useFormValidation(formData, validationSchemas.signUp, touchedFields)

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    updateFormData(field, value)
    
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const handleFieldBlur = (field: keyof typeof formData) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoading) return
    setError("")
    setIsLoading(true)
    
    const validation = validateAllFields()
    if (!validation.isValid) {
      setIsLoading(false)
      setError("Please fix the errors above.")
      setTouchedFields(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return
    }
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.accountType,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Account created successfully!", { description: "Please sign in with your new account." })
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })
        if (signInResult?.ok) {
          toast.success("Welcome!", { description: "You have been automatically signed in." })
          router.push("/auth/callback")
        } else {
          toast.error("Auto-login failed", { description: "Please sign in manually with your new account." })
          router.push("/auth/login")
        }
      } else {
        if (response.status === 409) {
          setError("Email already exists")
          toast.error("Email already exists", { description: "An account with this email already exists. Please sign in instead." })
        } else {
          setError(data.error || "Failed to create account")
          toast.error("Signup failed", { description: data.error || "Something went wrong. Please try again." })
        }
      }
    } catch (error) {
      setError("Network error. Please try again.")
      toast.error("Network error", { description: "Please check your connection and try again." })
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
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23059669' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex overflow-x-hidden">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Button variant="ghost" className="mb-6 text-slate-600 hover:text-emerald-600" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <div className="text-center mb-6">
              <Link href="/" className="inline-block group hover:scale-105 transition-transform">
                <Logo size={40} textSize="md" />
              </Link>
            </div>

            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 relative">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h1>
                <p className="text-slate-600 text-sm">Join thousands finding their perfect home</p>
              </CardHeader>

              <CardContent className="space-y-4 p-3 sm:p-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        onBlur={() => handleFieldBlur('fullName')}
                        className={getFieldClassName('fullName', 'pl-10 h-10 border-2 rounded-lg text-slate-800 bg-white/50')}
                        autoComplete="name"
                        aria-invalid={!isFieldValid('fullName')}
                      />
                    </div>
                    {getFieldError('fullName') && <p className="text-xs text-red-600 mt-1">{getFieldError('fullName')}</p>}
                  </div>
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
                        className={getFieldClassName('email', 'pl-10 h-10 border-2 rounded-lg text-slate-800 bg-white/50')}
                        autoComplete="email"
                        aria-invalid={!isFieldValid('email')}
                      />
                    </div>
                    {getFieldError('email') && <p className="text-xs text-red-600 mt-1">{getFieldError('email')}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <div className="relative group">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type="tel"
                        placeholder="03XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d]/g, '').slice(0, 11)
                          handleFieldChange('phone', val)
                        }}
                        onBlur={() => handleFieldBlur('phone')}
                        className={getFieldClassName('phone', 'pl-10 h-10 border-2 rounded-lg text-slate-800 bg-white/50')}
                        autoComplete="tel"
                        aria-invalid={!isFieldValid('phone')}
                        inputMode="numeric"
                        maxLength={11}
                      />
                    </div>
                    {getFieldError('phone') && <p className="text-xs text-red-600 mt-1">{getFieldError('phone')}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">I am a</label>
                    <RadioGroup
                      value={formData.accountType}
                      onValueChange={(value) => updateFormData('accountType', value)}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="relative">
                        <RadioGroupItem value="student" id="student" className="peer sr-only" />
                        <Label
                          htmlFor="student"
                          className="flex flex-col items-center justify-center p-3 bg-white/50 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 transition-all min-h-[90px]"
                        >
                          <UserCheck className="w-6 h-6 text-purple-600 mb-1" />
                          <span className="font-medium text-slate-800 text-center text-sm">Student</span>
                          <span className="text-xs text-slate-600 text-center mt-1">Looking for accommodation</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="owner" id="owner" className="peer sr-only" />
                        <Label
                          htmlFor="owner"
                          className="flex flex-col items-center justify-center p-3 bg-white/50 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 transition-all min-h-[90px]"
                        >
                          <Building className="w-6 h-6 text-purple-600 mb-1" />
                          <span className="font-medium text-slate-800 text-center text-sm">Property Owner</span>
                          <span className="text-xs text-slate-600 text-center mt-1">List my property</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                        className={getFieldClassName('password', 'pl-10 pr-10 h-10 border-2 rounded-lg text-slate-800 bg-white/50')}
                        autoComplete="new-password"
                        aria-invalid={!isFieldValid('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getFieldError('password') && <p className="text-xs text-red-600 mt-1">{getFieldError('password')}</p>}
                    {formData.password && (
                      <div className="mt-2 p-3 bg-slate-50/80 rounded-lg border border-slate-200 mx-0">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-slate-600 font-medium">Password strength:</span>
                          <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                            passwordStrength.score >= 3 
                              ? 'text-green-700 bg-green-100' 
                              : passwordStrength.score >= 2 
                              ? 'text-yellow-700 bg-yellow-100' 
                              : 'text-red-700 bg-red-100'
                          }`}>
                            {passwordStrength.score >= 3 ? 'Strong' : passwordStrength.score >= 2 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              passwordStrength.score >= 3 
                                ? 'bg-gradient-to-r from-green-400 to-green-500' 
                                : passwordStrength.score >= 2 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                                : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${Math.max(8, (passwordStrength.score / 4) * 100)}%` }}
                          />
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-slate-600 space-y-1 max-w-full">
                            {passwordStrength.feedback.slice(0, 2).map((feedback, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5">•</span>
                                <span className="flex-1 break-words leading-relaxed">{feedback}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => handleFieldChange('terms', checked as boolean)}
                      onBlur={() => handleFieldBlur('terms')}
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
                  {getFieldError('terms') && <p className="text-xs text-red-600 mt-1">{getFieldError('terms')}</p>}
                  <Button
                    type="submit"
                    disabled={isLoading || !validateAllFields().isValid}
                    className="w-full h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                  className="w-full h-10 bg-white/50 border-2 border-slate-200 hover:border-slate-300 hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <Image
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <div className="text-center pt-3">
                  <span className="text-slate-600 text-sm">Already have an account? </span>
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
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
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Join Our Community!</h1>
              <p className="text-lg text-white/90 mb-6">
                Connect with thousands of students and property owners
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="text-xl font-bold mb-1">🏠</div>
                  <div className="font-semibold">Safe Housing</div>
                  <div className="text-white/80 text-xs">Verified properties</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="text-xl font-bold mb-1">🤝</div>
                  <div className="font-semibold">Trusted Community</div>
                  <div className="text-white/80 text-xs">Real reviews</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="text-xl font-bold mb-1">💰</div>
                  <div className="font-semibold">Best Prices</div>
                  <div className="text-white/80 text-xs">No hidden fees</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="text-xl font-bold mb-1">📞</div>
                  <div className="font-semibold">24/7 Support</div>
                  <div className="text-white/80 text-xs">Always here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
