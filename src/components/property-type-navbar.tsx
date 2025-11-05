"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PROPERTY_TYPES, PropertyTypeConfig } from "@/lib/property-types"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface PropertyTypeNavBarProps {
  activeType: string
  onTypeChange: (type: string) => void
  className?: string
  showCounts?: boolean
  propertyCounts?: Record<string, number>
  isLoading?: boolean
}

export function PropertyTypeNavBar({
  activeType,
  onTypeChange,
  className = "",
  showCounts = false,
  propertyCounts = {},
  isLoading = false
}: PropertyTypeNavBarProps) {
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const checkScrollability = () => {
      const container = document.getElementById('property-type-scroll-container')
      if (container) {
        const hasOverflow = container.scrollWidth > container.clientWidth
        setShowScrollButtons(hasOverflow)
        setCanScrollLeft(container.scrollLeft > 0)
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
      }
    }

    checkScrollability()
    window.addEventListener('resize', checkScrollability)
    
    return () => window.removeEventListener('resize', checkScrollability)
  }, [])

  const scrollLeft = () => {
    const container = document.getElementById('property-type-scroll-container')
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' })
      setTimeout(() => {
        setCanScrollLeft(container.scrollLeft > 0)
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
      }, 300)
    }
  }

  const scrollRight = () => {
    const container = document.getElementById('property-type-scroll-container')
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' })
      setTimeout(() => {
        setCanScrollLeft(container.scrollLeft > 0)
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
      }, 300)
    }
  }

  const handleTypeClick = (typeId: string) => {
    // If clicking the same type, toggle to "all"
    if (activeType === typeId && typeId !== "all") {
      onTypeChange("all")
    } else {
      onTypeChange(typeId)
    }
  }

  return (
    <div className={`relative bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center py-4 sm:py-5">
          {/* Left Scroll Button */}
          {showScrollButtons && canScrollLeft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollLeft}
              className="absolute left-2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-slate-50 rounded-full p-2.5 border border-slate-200/80 transition-all duration-300 hover:shadow-xl hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          {/* Property Type Items Container */}
          <div
            id="property-type-scroll-container"
            className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide scroll-smooth px-10 sm:px-14 lg:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PROPERTY_TYPES.map((type: PropertyTypeConfig) => {
              const isActive = activeType === type.id || (activeType === "" && type.id === "all")
              const Icon = type.icon
              const count = propertyCounts[type.id] || 0

              return (
                <Button
                  key={type.id}
                  variant="ghost"
                  onClick={() => handleTypeClick(type.id)}
                  disabled={isLoading}
                  className={`
                    group flex items-center space-x-2 sm:space-x-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all duration-300 text-sm sm:text-base relative overflow-hidden
                    ${isActive
                      ? `${type.bgColor} ${type.color} shadow-lg border-2 border-current/30 scale-105 font-semibold transform hover:scale-110`
                      : `text-slate-600 hover:text-slate-800 bg-slate-50/50 hover:bg-slate-100/80 hover:shadow-md hover:scale-105 border border-transparent hover:border-slate-200/50`
                    }
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Background gradient effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                  )}

                  {/* Icon with enhanced styling */}
                  <div className={`relative flex items-center justify-center ${isActive ? 'animate-pulse' : ''}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'}`} />
                  </div>

                  {/* Label with improved typography */}
                  <span className={`font-medium hidden sm:inline transition-all duration-300 ${isActive ? 'tracking-wide' : ''}`}>
                    {type.label}
                  </span>
                  <span className={`font-medium sm:hidden text-xs transition-all duration-300 ${isActive ? 'tracking-wide' : ''}`}>
                    {type.label.split(' ')[0]}
                  </span>

                  {/* Enhanced count badge */}
                  {showCounts && count > 0 && (
                    <Badge
                      variant="secondary"
                      className={`
                        ml-1.5 text-xs px-2 py-0.5 hidden sm:inline-flex font-semibold transition-all duration-300 rounded-full
                        ${isActive
                          ? 'bg-white/90 text-current shadow-sm border border-current/20'
                          : 'bg-slate-200/80 text-slate-700 group-hover:bg-white/90 group-hover:shadow-sm'
                        }
                      `}
                    >
                      {count}
                    </Badge>
                  )}

                  {/* Loading indicator */}
                  {isLoading && isActive && (
                    <Loader2 className="w-3 h-3 animate-spin ml-1" />
                  )}
                </Button>
              )
            })}
          </div>

          {/* Right Scroll Button */}
          {showScrollButtons && canScrollRight && (
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollRight}
              className="absolute right-2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-slate-50 rounded-full p-2.5 border border-slate-200/80 transition-all duration-300 hover:shadow-xl hover:scale-110"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
