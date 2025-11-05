"use client"

import { useState } from "react"
import Image from "next/image"
import { Home } from "lucide-react"

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  textSize?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "white"
}

export function Logo({
  size = 40,
  className = "",
  showText = true,
  textSize = "md",
  variant = "default"
}: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const textSizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }

  const textColor = variant === "white" ? "text-white" : "text-slate-800"
  const subtextColor = variant === "white" ? "text-white/80" : "text-slate-500"

  // Fallback gradient logo
  const FallbackLogo = () => (
    <div
      className={`bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg ${className}`}
      style={{ width: size, height: size }}
    >
      <Home className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  )

  // Use JPG logo as main source
  const logoSources = ['/LOGOs.jpg']
  const currentSource = logoSources[0]

  const handleImageError = () => {
    console.warn(`Logo image failed to load: ${currentSource}`)
    if (retryCount < logoSources.length - 1) {
      setRetryCount(prev => prev + 1)
      setImageLoaded(false)
    } else {
      console.warn('All logo sources failed, using fallback')
      setImageError(true)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="relative" style={{ width: size, height: size }}>
        {!imageError ? (
          <>
            <Image
              src={currentSource}
              alt="RoomMatch PK Logo"
              fill
              className={`object-contain rounded-xl shadow-lg transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${className}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              priority
              sizes={`${size}px`}
              unoptimized={process.env.NODE_ENV === 'production'}
            />
            {!imageLoaded && <FallbackLogo />}
          </>
        ) : (
          <FallbackLogo />
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizes[textSize]} ${textColor} transition-colors`}>
            RoomMatch PK
          </span>
          <span className={`text-xs ${subtextColor} -mt-1`}>
            Find Your Home
          </span>
        </div>
      )}
    </div>
  )
}
