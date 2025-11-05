"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, Shield, ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login - in real app, validate credentials
    if (formData.email && formData.password) {
      // Redirect to admin dashboard
      window.location.href = "/admin"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6 sm:mb-8 text-white hover:text-emerald-400" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          {/* Admin Login Card */}
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                <Shield className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Admin Login</h1>
              <p className="text-slate-600 text-sm sm:text-base">Access the admin dashboard</p>
            </CardHeader>

            <CardContent className="space-y-6 p-6 sm:p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Admin Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type="email"
                      placeholder="admin@roommatchpk.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 sm:h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-slate-800 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 pr-12 h-12 sm:h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-slate-800 bg-white/50"
                      required
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

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-slate-800 to-emerald-800 hover:from-slate-900 hover:to-emerald-900 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Access Admin Dashboard
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2 text-sm">Demo Credentials:</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Email: admin@roommatchpk.com</div>
                  <div>Password: admin123</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
