"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, ChevronLeft, ChevronRight, Play } from "lucide-react"

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&h=800&fit=crop",
    title: "Find Your Perfect Student Home",
    subtitle: "Discover safe, affordable, and comfortable accommodations across Pakistan",
    cta: "Start Your Search",
  },
  {
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=800&fit=crop",
    title: "Premium Living Spaces",
    subtitle: "Modern facilities, high-speed internet, and study-friendly environments",
    cta: "Explore Properties",
  },
  {
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&h=800&fit=crop",
    title: "Verified & Secure",
    subtitle: "All properties verified for safety with 24/7 security and support",
    cta: "View Listings",
  },
]

export function HeroSection() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    budget: "",
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isClient])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const handleSearch = () => {
    // Redirect to login page when search is clicked
    router.push('/auth/login')
  }

  const handleCTAClick = () => {
    // Redirect to login page when CTA buttons are clicked
    router.push('/auth/login')
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl">
            <div className="mb-4 sm:mb-6">
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full text-emerald-300 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                🏠 Pakistan&apos;s #1 Student Housing Platform
              </span>
            </div>

            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-tight">
                <span className="block break-words">{heroSlides[currentSlide].title}</span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* Search Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                    <Input
                      placeholder="Enter city (Lahore, Karachi...)"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      className="pl-8 sm:pl-10 h-10 sm:h-12 border-slate-200 text-slate-800 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Select
                  value={searchData.propertyType}
                  onValueChange={(value) => setSearchData({ ...searchData, propertyType: value })}
                >
                  <SelectTrigger className="h-10 sm:h-12 border-slate-200 text-sm sm:text-base">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="hostel-mess">Hostel Mess</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSearch}
                  className="h-10 sm:h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg text-sm sm:text-base"
                >
                  <Search className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-slate-600">
                  <span>
                    🔥 <strong>2,847</strong> properties
                  </span>
                  <span>
                    ⭐ <strong>4.8/5</strong> rating
                  </span>
                  <span>
                    🛡️ <strong>100%</strong> verified
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleCTAClick}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg text-sm sm:text-base h-12 sm:h-14"
              >
                {heroSlides[currentSlide].cta}
              </Button>
              <Button
                onClick={handleCTAClick}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-sm sm:text-base h-12 sm:h-14"
              >
                <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all group"
      >
        <ChevronLeft className="w-4 sm:w-6 h-4 sm:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all group"
      >
        <ChevronRight className="w-4 sm:w-6 h-4 sm:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  )
}