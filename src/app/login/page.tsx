"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new auth login page
    router.replace("/auth/login")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-lg animate-spin"></div>
        </div>
        <p className="text-slate-600 font-medium">Redirecting to login...</p>
      </div>
    </div>
  )
}
