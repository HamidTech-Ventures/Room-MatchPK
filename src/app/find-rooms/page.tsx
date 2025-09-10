"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { useFormLocalStorage } from "@/hooks/use-local-storage"

import { Logo } from "@/components/logo"
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Heart,
  Wifi,
  Car,
  Utensils,
  AirVent,
  Users,
  ArrowUpDown,
  User,
  LogOut,
  MessageCircle,
  Home,
  Building,
  X,
} from "lucide-react"
import { AuthLoading } from "@/components/auth-loading"
import { UnifiedChat } from "@/components/unified-chat"
import { PROPERTY_TYPES } from "@/lib/property-types"

function FindRoomsContent() {
  const { user, logout } = useAuth()
  const { isChatOpen, toggleChat } = useChat()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showProfile, setShowProfile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  // Wishlist functionality
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showWishlist, setShowWishlist] = useState(false)

  // Initial filter values - no default price range to show all properties
  const getInitialFilters = () => {
    return {
      propertyType: searchParams.get("propertyType") || "",
      genderPreference: "",
      priceRange: [0, 999999], // Very wide range to include all properties by default
      amenities: [] as string[],
      sortBy: "relevance",
      searchQuery: searchParams.get("search") || "", // For hostel name, city, area search
    }
  }

  // Use local storage for filter persistence
  const {
    formData: filters,
    updateFormData: updateFilters,
    resetForm: resetFilters,
  } = useFormLocalStorage("room-search-filters", getInitialFilters(), {
    autoSave: true,
    debounceMs: 300, // Quick save for search filters
  })
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug properties state changes
  useEffect(() => {
    console.log("Properties state changed:", properties.length, "properties")
  }, [properties])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 })

  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({})
  const [countsLoading, setCountsLoading] = useState(false)
  const [showCounts] = useState(true) // Show property counts in navigation

  const amenityOptions = [
    { id: "wifi", label: "Wi-Fi", icon: Wifi },
    { id: "ac", label: "AC", icon: AirVent },
    { id: "food", label: "Food", icon: Utensils },
    { id: "parking", label: "Parking", icon: Car },
    { id: "gym", label: "Gym", icon: Users },
    { id: "laundry", label: "Laundry", icon: Users },
    { id: "security", label: "Security", icon: Users },
    { id: "study", label: "Study Room", icon: Users },
  ]

  // Wishlist functionality
  useEffect(() => {
    // Load wishlist from localStorage on component mount
    const savedWishlist = localStorage.getItem("property-wishlist")
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
  }, [])

  const toggleWishlist = (propertyId: string) => {
    setWishlist((prev) => {
      const newWishlist = prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]

      // Save to localStorage
      localStorage.setItem("property-wishlist", JSON.stringify(newWishlist))
      return newWishlist
    })
  }

  const isInWishlist = (propertyId: string) => wishlist.includes(propertyId)

  // Get wishlist properties
  const wishlistProperties = properties.filter((property) => wishlist.includes(property._id))

  // Popular cities and areas for search suggestions
  const popularLocations = [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "DHA Lahore",
    "Gulberg Lahore",
    "Model Town Lahore",
    "Johar Town Lahore",
    "Clifton Karachi",
    "Defence Karachi",
    "Gulshan Karachi",
    "North Nazimabad Karachi",
    "F-6 Islamabad",
    "F-7 Islamabad",
    "F-8 Islamabad",
    "F-10 Islamabad",
    "F-11 Islamabad",
    "Saddar Rawalpindi",
    "Satellite Town Rawalpindi",
    "Bahria Town Rawalpindi",
    "University Town Peshawar",
    "Hayatabad Peshawar",
    "Board Bazaar Peshawar",
    "Cantt Area",
    "Mall Road",
    "Liberty Market",
    "Anarkali Bazaar",
    "Fortress Stadium",
    "Emporium Mall",
    "Packages Mall",
    "Centaurus Mall",
  ]

  useEffect(() => {
    async function fetchProperties(page = 1) {
      setLoading(true)
      setError(null)
      try {
        // Build query parameters from filters
        // For city-based grouping, we need to fetch all properties, not paginated
        const params = new URLSearchParams({
          page: "1",
          limit: "100", // Fetch more properties to ensure proper city grouping
        })

        // Add search query
        if (filters.searchQuery) {
          params.append("search", filters.searchQuery)
        }

        // Add property type filter
        if (filters.propertyType) {
          params.append("propertyType", filters.propertyType)
        }

        // Add gender preference filter
        if (filters.genderPreference) {
          params.append("genderPreference", filters.genderPreference)
        }

        // Add price range filter only if it's different from the very wide default
        const defaultMin = 0
        const defaultMax = 999999
        const currentMin = filters.priceRange?.[0] ?? defaultMin
        const currentMax = filters.priceRange?.[1] ?? defaultMax

        console.log("=== PRICE FILTER FRONTEND DEBUG ===")
        console.log("Current price range state:", filters.priceRange)
        console.log("Current min:", currentMin, "Current max:", currentMax)
        console.log("Default min:", defaultMin, "Default max:", defaultMax)
        console.log("Min changed?", currentMin !== defaultMin)
        console.log("Max changed?", currentMax !== defaultMax)

        // Only add price filters if they're different from the very wide defaults
        if (currentMin !== defaultMin || currentMax !== defaultMax) {
          params.append("minPrice", currentMin.toString())
          params.append("maxPrice", currentMax.toString())
          console.log("=== PRICE FILTER PARAMS ===")
          console.log(`Adding price filters: min=${currentMin}, max=${currentMax}`)
        } else {
          console.log("=== PRICE FILTER SKIPPED ===")
          console.log(`Price range is at defaults: min=${currentMin}, max=${currentMax}`)
        }

        // Add amenities filter
        if (filters.amenities.length > 0) {
          params.append("amenities", filters.amenities.join(","))
        }

        // Add sort by
        if (filters.sortBy) {
          params.append("sortBy", filters.sortBy)
        }

        console.log("=== FRONTEND FILTER DEBUG ===", new Date().toISOString())
        console.log("Current filters:", filters)
        console.log("API URL:", `/api/properties/verified?${params.toString()}`)

        const res = await fetch(`/api/properties/verified?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch properties")
        const data = await res.json()
        console.log("Fetched properties response:", data)
        console.log("Properties array length:", data.properties?.length || 0)
        console.log("Properties data:", data.properties)
        console.log("Debug info:", data.debug)
        // Debug image data structure
        if (data.properties && data.properties.length > 0) {
          console.log("First property images:", data.properties[0].images)
          console.log("Image type:", typeof data.properties[0].images?.[0])
          console.log("Image structure:", data.properties[0].images?.[0])
        }
        console.log("Setting properties:", data.properties?.length || 0, "properties")
        setProperties(data.properties || [])
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 })
      } catch (err: any) {
        setError(err.message || "Error loading properties")
      } finally {
        setLoading(false)
      }
    }
    fetchProperties(pagination.page)
  }, [pagination.page, filters])

  // Fetch property counts when filters change (excluding propertyType and page)
  useEffect(() => {
    fetchPropertyCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchQuery, filters.genderPreference, filters.priceRange, filters.amenities])

  // Initial load of property counts
  useEffect(() => {
    fetchPropertyCounts()
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".search-container")) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSuggestions])

  // Enhanced click-outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Don't close if clicking on the profile button or inside the dropdown
      if (!target.closest(".profile-dropdown-container")) {
        // Add a small delay to prevent immediate reopening
        setTimeout(() => {
          setShowProfile(false)
        }, 10)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      // Use capture phase for more reliable event handling
      document.addEventListener("mousedown", handleClickOutside, true)
      document.addEventListener("keydown", handleKeyDown)

      // Add backdrop to capture clicks
      const backdrop = document.createElement("div")
      backdrop.className = "profile-dropdown-backdrop"
      backdrop.style.cssText =
        "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 40; background: transparent;"
      document.body.appendChild(backdrop)

      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true)
        document.removeEventListener("keydown", handleKeyDown)
        const existingBackdrop = document.querySelector(".profile-dropdown-backdrop")
        if (existingBackdrop) {
          existingBackdrop.remove()
        }
      }
    }
  }, [showProfile])

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages && newPage !== pagination.page) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  // Fetch property counts
  const fetchPropertyCounts = async () => {
    setCountsLoading(true)
    try {
      // Build query parameters from current filters (excluding propertyType)
      const params = new URLSearchParams()

      if (filters.searchQuery) {
        params.append("search", filters.searchQuery)
      }
      if (filters.genderPreference) {
        params.append("genderPreference", filters.genderPreference)
      }
      // Only add price filters if they're different from the very wide defaults
      if (filters.priceRange) {
        const defaultMin = 0
        const defaultMax = 999999
        const currentMin = filters.priceRange[0]
        const currentMax = filters.priceRange[1]

        if (currentMin !== defaultMin || currentMax !== defaultMax) {
          params.append("minPrice", currentMin.toString())
          params.append("maxPrice", currentMax.toString())
        }
      }
      if (filters.amenities && filters.amenities.length > 0) {
        params.append("amenities", filters.amenities.join(","))
      }

      const res = await fetch(`/api/properties/counts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPropertyCounts(data.counts || {})
      }
    } catch (error) {
      console.error("Error fetching property counts:", error)
    } finally {
      setCountsLoading(false)
    }
  }

  // Handler for filter changes - reset to page 1 and update counts
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    console.log("=== FILTER CHANGE ===")
    console.log(`Changing ${key} to:`, value)
    console.log("Current filters before change:", filters)

    // Special logging for price range changes
    if (key === "priceRange") {
      console.log("Price range change details:")
      console.log("  New range:", value)
      console.log("  Old range:", filters.priceRange)
    }

    updateFilters(key, value)
    setPagination((prev) => ({ ...prev, page: 1 }))

    // Log after a short delay to see the updated state
    setTimeout(() => {
      console.log("Filters after change:", filters)
    }, 100)
  }

  // Handler for property type change with smooth transition
  const handlePropertyTypeChange = (type: string) => {
    console.log("Property type change triggered:", type)
    handleFilterChange("propertyType", type)
  }

  // Handler for clear filters
  const handleClearFilters = () => {
    resetFilters()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Handler for search input changes with suggestions
  const handleSearchInputChange = (value: string) => {
    handleFilterChange("searchQuery", value)
    setSelectedSuggestionIndex(-1) // Reset selection when typing

    if (value.length > 0) {
      const filteredSuggestions = popularLocations
        .filter((location) => location.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8) // Limit to 8 suggestions

      setSearchSuggestions(filteredSuggestions)
      setShowSuggestions(filteredSuggestions.length > 0)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handler for selecting a suggestion
  const handleSuggestionSelect = (suggestion: string) => {
    handleFilterChange("searchQuery", suggestion)
    setShowSuggestions(false)
    setSearchSuggestions([])
    setSelectedSuggestionIndex(-1)
  }

  // Handler for keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchSuggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < searchSuggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : searchSuggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(searchSuggestions[selectedSuggestionIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-9 md:pb-0">
      {/* Custom Navbar for Find Rooms - Hidden on mobile */}
      <nav className="bg-[#f7f7f7] border-b-0 shadow-none hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center h-24 gap-6 sm:gap-10">
            {/* Logo with no text */}
            <div className="flex-shrink-0">
              <Logo size={60} showText={false} className="cursor-pointer" />
            </div>

            {/* Property Type Navigation - Center, increased spacing and font size */}
            <div className="flex-1 flex justify-center min-w-0 mx-4 sm:mx-8">
              <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide max-w-full">
                <div className="flex items-center space-x-6 min-w-max px-2">
                  {PROPERTY_TYPES.filter((type) => type.id !== "all").map((type) => {
                    const isActive = filters.propertyType === type.id
                    return (
                      <Button
                        key={type.id}
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => handlePropertyTypeChange(type.id)}
                        className={`group flex items-center px-6 py-3 rounded-xl whitespace-nowrap text-lg font-bold ${isActive ? "bg-emerald-500 text-white" : "text-slate-600 hover:text-emerald-600"}`}
                      >
                        <Image
                          src={type.icon || "/placeholder.svg"}
                          alt={type.label + " icon"}
                          width={28}
                          height={28}
                          className={`rounded object-contain ${isActive ? "" : "opacity-80"}`}
                          style={{ minWidth: 28, minHeight: 28 }}
                        />
                        <span className="ml-0">{type.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* Profile icon only, much larger for better appearance */}
            <div className="flex items-center flex-shrink-0">
              <div className="relative profile-dropdown-container">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center hover:bg-slate-100 px-4 py-4"
                  size="lg"
                >
                  {user ? (
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xl font-semibold">
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-10 h-10 text-emerald-600" />
                    </div>
                  )}
                </Button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-slate-200">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar || ""} alt={user.name} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-600 font-medium">
                                {user.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-800 truncate">{user?.name}</div>
                              <div className="text-sm text-slate-600 truncate break-all">{user?.email}</div>
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs mt-1">{user?.role}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/my-bookings"
                            className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>My Bookings</span>
                          </Link>
                          <button
                            onClick={logout}
                            className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <Link
                          href="/auth/login"
                          className="flex items-center space-x-3 px-4 py-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Login</span>
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center space-x-3 px-4 py-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Sign Up</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Section - Single Clean Design */}
      <div className="md:hidden bg-white">
        {/* Main Search Bar - Reduced Size */}
        <div className="px-4 py-3">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search hostels, cite"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              />
            </div>
            {/* Wishlist Button */}
            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className={`p-2 rounded-lg transition-colors ${
                showWishlist ? "bg-red-500 hover:bg-red-600" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <Heart className={`w-4 h-4 ${showWishlist ? "text-white fill-white" : "text-gray-600"}`} />
            </button>
            {/* Filter Button - Reduced Size */}
            <button
              onClick={() => setShowFilters(true)}
              className="p-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* Wishlist count indicator */}
          {wishlist.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} in wishlist
            </div>
          )}
        </div>

        {/* Category Cards - Reduced Size */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: "hostel", label: "Hostels", icon: "/Hostel.png" },

              { id: "apartment", label: "Apartments", icon: "/apartment.png" },
              { id: "house", label: "Homes", icon: "/house.png" },
              { id: "office", label: "Office", icon: "/office.jpg" },
              { id: "hostel-mess", label: "Mess", icon: "/mess.png" },
            ].map((category) => {
              const isActive = filters.propertyType === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange("propertyType", isActive ? "" : category.id)}
                  className={`flex-shrink-0 min-w-[65px] p-2 rounded-lg border-2 transition-all ${
                    isActive ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 h-6 rounded-md overflow-hidden pointer-events-none">
                      <Image
                        src={category.icon || "/placeholder.svg"}
                        alt={category.label}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? "text-emerald-700" : "text-gray-700"}`}>
                      {category.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Desktop Search Bar Section - Hidden on mobile */}
      <div className="hidden md:block bg-[#f7f7f7] border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-[#f7f7f7] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-none border-0 flex flex-col gap-4">
            <div className="flex justify-center items-center">
              <div className="flex items-center w-full max-w-2xl search-container relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400 z-10" />
                <Input
                  placeholder="Search hostels, cities, areas..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (filters.searchQuery.length > 0 && searchSuggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowSuggestions(false)
                      setSelectedSuggestionIndex(-1)
                    }, 200)
                  }}
                  className="pl-8 sm:pl-10 pr-20 sm:pr-24 h-10 sm:h-12 border-slate-200 text-slate-800 text-sm sm:text-base w-full"
                />

                <button
                  onClick={handleSearch}
                  className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 sm:h-8 w-6 sm:w-8 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 z-10"
                  aria-label="Search"
                >
                  <Search className="w-3 sm:w-4 h-3 sm:h-4" />
                </button>

                <button
                  onClick={() => setShowFilters(true)}
                  className="absolute right-2 sm:right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 sm:h-8 w-6 sm:w-8 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-50 z-10"
                  aria-label="Filters"
                >
                  <SlidersHorizontal className="w-3 sm:w-4 h-3 sm:h-4" />
                </button>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className={`w-full text-left px-3 py-2.5 transition-colors duration-150 flex items-center space-x-3 group ${
                            index === selectedSuggestionIndex
                              ? "bg-emerald-100 text-emerald-700"
                              : "hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <MapPin
                            className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${
                              index === selectedSuggestionIndex
                                ? "text-emerald-500"
                                : "text-slate-400 group-hover:text-emerald-500"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              index === selectedSuggestionIndex
                                ? "text-emerald-700"
                                : "text-slate-700 group-hover:text-emerald-700"
                            }`}
                          >
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
                      <p className="text-xs text-slate-500 flex items-center">
                        <Search className="w-3 h-3 mr-1" />
                        Press Enter to search or click a suggestion
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowWishlist(!showWishlist)}
                className={`flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 border rounded-full transition-colors flex-shrink-0 ${
                  showWishlist
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-slate-300 text-slate-700 hover:border-red-400 hover:text-red-500"
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${showWishlist ? "fill-white" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Slide-out Panel */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-all duration-300 animate-in fade-in"
            onClick={() => setShowFilters(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-slate-500 hover:text-slate-700 p-2 sm:p-1"
                >
                  ✕
                </Button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Budget Range */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700">Budget Range (PKR)</h4>
                  <div className="px-2">
                    <Slider
                      value={[
                        Math.max(1000, Math.min(50000, filters.priceRange[0])),
                        Math.max(1000, Math.min(50000, filters.priceRange[1])),
                      ]}
                      onValueChange={(value: any) => {
                        const [min, max] = value
                        console.log("=== SLIDER VALUE CHANGE ===")
                        console.log("New slider value:", value)
                        console.log("Min:", min, "Max:", max)
                        console.log("Min-Max difference:", max - min)

                        if (max - min < 1000) {
                          console.log("Rejecting change: difference too small")
                          return
                        }

                        console.log("Accepting slider change, calling handleFilterChange")
                        handleFilterChange("priceRange", value)
                      }}
                      max={50000}
                      min={1000}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-2">
                      <span>PKR {Math.max(1000, Math.min(50000, filters.priceRange[0])).toLocaleString()}</span>
                      <span>PKR {Math.max(1000, Math.min(50000, filters.priceRange[1])).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700">Property Type</h4>
                  <Select
                    value={filters.propertyType || "all"}
                    onValueChange={(value) => handleFilterChange("propertyType", value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="hostel-mess">Hostel Mess</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Preference */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700">Gender Preference</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Boys", value: "boys" },
                      { label: "Girls", value: "girls" },
                      { label: "Mixed", value: "mixed" },
                    ].map((gender) => (
                      <div key={gender.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                        <Checkbox
                          id={`filter-${gender.value}`}
                          checked={filters.genderPreference === gender.value}
                          onCheckedChange={(checked) =>
                            handleFilterChange("genderPreference", checked ? gender.value : "")
                          }
                          className="w-5 h-5"
                        />
                        <label
                          htmlFor={`filter-${gender.value}`}
                          className="text-sm text-slate-700 cursor-pointer flex-1 py-1"
                        >
                          {gender.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700">Amenities</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {amenityOptions.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                        <Checkbox
                          id={`filter-${amenity.id}`}
                          checked={filters.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange("amenities", [...filters.amenities, amenity.id])
                            } else {
                              handleFilterChange(
                                "amenities",
                                filters.amenities.filter((a) => a !== amenity.id),
                              )
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <label
                          htmlFor={`filter-${amenity.id}`}
                          className="text-sm text-slate-700 cursor-pointer flex items-center flex-1 py-1"
                        >
                          <amenity.icon className="w-4 h-4 mr-2" />
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700">Sort By</h4>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                    <SelectTrigger className="w-full h-12">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-200 space-y-3">
                <Button variant="outline" onClick={handleClearFilters} className="w-full h-12 text-base bg-transparent">
                  Clear All Filters
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UnifiedChat isOpen={isChatOpen} onToggle={toggleChat} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Results Section - Now full width since sidebar is hidden */}
          <div className="w-full">
            {/* ...existing code... */}

            {/* Properties by City */}
            <div className="space-y-10">
              {/* Wishlist View */}
              {showWishlist && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center space-x-3">
                      <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                      <span>My Wishlist ({wishlist.length})</span>
                    </h2>
                    <button
                      onClick={() => setShowWishlist(false)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center space-x-1 transition-colors hover:bg-emerald-50 px-3 py-2 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                      <span>Close</span>
                    </button>
                  </div>

                  {wishlistProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-dashed border-red-200 p-8">
                      <Heart className="w-16 h-16 text-red-300 mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Your wishlist is empty</h3>
                      <p className="text-slate-600 text-center max-w-md">
                        Start adding properties to your wishlist by clicking the heart icon on property cards.
                      </p>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1">
                        {wishlistProperties.map((property: any) => {
                          const imageUrl = (() => {
                            if (Array.isArray(property.images) && property.images.length > 0) {
                              const firstImage = property.images[0]
                              if (typeof firstImage === "string" && firstImage.trim() !== "") {
                                return firstImage
                              } else if (typeof firstImage === "object" && firstImage !== null) {
                                if (
                                  firstImage.url &&
                                  typeof firstImage.url === "string" &&
                                  firstImage.url.trim() !== ""
                                ) {
                                  return firstImage.url
                                } else if (
                                  firstImage.secure_url &&
                                  typeof firstImage.secure_url === "string" &&
                                  firstImage.secure_url.trim() !== ""
                                ) {
                                  return firstImage.secure_url
                                }
                              }
                            }
                            return "/placeholder.svg"
                          })()
                          const name = property.title || "Unnamed Property"
                          const location = property.address
                            ? `${property.address.area || ""}, ${property.address.city || ""}`
                            : "Unknown Location"
                          const price = property.pricing?.pricePerBed || 0
                          const rating = property.rating || 0

                          return (
                            <div
                              key={property._id}
                              className="transition-all duration-300 flex-shrink-0 w-44 cursor-pointer hover:z-10 pb-2 hover:shadow-lg hover:border hover:border-red-200 rounded-lg"
                              onClick={() => router.push(`/property/${property._id}`)}
                            >
                              <div className="relative w-full h-32 overflow-hidden bg-slate-100 rounded-lg">
                                <div className="absolute top-1.5 right-1.5 z-10">
                                  <button
                                    className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleWishlist(property._id)
                                    }}
                                  >
                                    <Heart className="w-3.5 h-3.5 text-white fill-white" />
                                  </button>
                                </div>
                                <Image
                                  src={imageUrl || "/placeholder.svg"}
                                  alt={name}
                                  fill
                                  className="object-cover md:transition-transform md:duration-300 md:hover:scale-110"
                                />
                              </div>
                              <div className="pt-2 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-sm text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1">
                                    {name}
                                  </h3>
                                  <span className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                    <span className="text-xs font-medium text-slate-700">{rating}</span>
                                  </span>
                                </div>
                                <div className="text-slate-500">
                                  <span className="text-xs line-clamp-1">{location}</span>
                                </div>
                                <div className="flex items-center pt-1">
                                  <span className="text-sm font-bold text-slate-800">₨{price.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loading ? (
                <div className="w-full">
                  <div className="min-h-[400px] w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                    <AuthLoading
                      title="Loading Properties"
                      description={`Fetching ${filters.propertyType ? filters.propertyType : "all"} properties...`}
                      className="min-h-[400px] flex items-center justify-center"
                      fullScreen={false}
                    />
                  </div>
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 animate-fade-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Home className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    No{" "}
                    {filters.propertyType
                      ? filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1)
                      : ""}{" "}
                    Properties Found
                  </h3>
                  <p className="text-slate-600 text-center max-w-md">
                    We couldn't find any {filters.propertyType ? filters.propertyType : ""} properties matching your
                    current filters. Try adjusting your search criteria or check back later for new listings.
                  </p>
                  {filters.propertyType && (
                    <button
                      onClick={() => handleFilterChange("propertyType", "")}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Clear Property Type Filter
                    </button>
                  )}
                </div>
              ) : (
                (() => {
                  // Group properties by city (normalize city names to handle case inconsistencies)
                  const propertiesByCity = properties.reduce(
                    (acc, property) => {
                      const rawCity = property.address?.city || "Unknown City"
                      // Normalize city name: capitalize first letter, lowercase the rest
                      const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase()
                      if (!acc[city]) {
                        acc[city] = []
                      }
                      acc[city].push(property)
                      return acc
                    },
                    {} as Record<string, typeof properties>,
                  )

                  // Define city priority order
                  const cityPriority = ["Lahore", "Islamabad", "Karachi"]

                  // Sort cities: priority cities first, then alphabetical
                  const sortedCities = Object.keys(propertiesByCity).sort((a, b) => {
                    const aIndex = cityPriority.indexOf(a)
                    const bIndex = cityPriority.indexOf(b)

                    // If both cities are in priority list, sort by priority
                    if (aIndex !== -1 && bIndex !== -1) {
                      return aIndex - bIndex
                    }
                    // If only one city is in priority list, prioritize it
                    if (aIndex !== -1) return -1
                    if (bIndex !== -1) return 1
                    // If neither is in priority list, sort alphabetically
                    return a.localeCompare(b)
                  })

                  return sortedCities.map((city) => {
                    const cityProperties = propertiesByCity[city]

                    return (
                      <div key={city} className="space-y-4">
                        {/* City Header - no background, border, shadow, or property count */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                                Properties in {city}
                              </h2>
                            </div>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center space-x-1 transition-colors hover:bg-emerald-50 px-3 py-2 rounded-lg">
                            <span className="hidden sm:inline">View all</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Properties Horizontal Scroll for this city */}
                        <div className="relative group">
                          {/* Left Arrow */}
                          <button
                            className="nav-arrow absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-slate-300"
                            onClick={() => {
                              const container = document.getElementById(`scroll-${city}`)
                              if (container) {
                                container.scrollBy({ left: -180, behavior: "smooth" })
                              }
                            }}
                            aria-label={`Scroll left for ${city} properties`}
                          >
                            <svg
                              className="w-4 h-4 text-slate-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          {/* Right Arrow */}
                          <button
                            className="nav-arrow absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-slate-300"
                            onClick={() => {
                              const container = document.getElementById(`scroll-${city}`)
                              if (container) {
                                container.scrollBy({ left: 180, behavior: "smooth" })
                              }
                            }}
                            aria-label={`Scroll right for ${city} properties`}
                          >
                            <svg
                              className="w-4 h-4 text-slate-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>

                          {/* Scroll container */}
                          <div
                            id={`scroll-${city}`}
                            className="property-scroll-container grid grid-cols-3 md:grid-cols-6 gap-4  px-1"
                          >
                            {cityProperties.slice(0, 6).map((property: any) => {
                              // Extract image URL properly - handle multiple formats
                              const imageUrl = (() => {
                                if (Array.isArray(property.images) && property.images.length > 0) {
                                  const firstImage = property.images[0]

                                  // Handle string URLs
                                  if (typeof firstImage === "string" && firstImage.trim() !== "") {
                                    return firstImage
                                  }
                                  // Handle object with url property
                                  else if (typeof firstImage === "object" && firstImage !== null) {
                                    // Check for url property
                                    if (
                                      firstImage.url &&
                                      typeof firstImage.url === "string" &&
                                      firstImage.url.trim() !== ""
                                    ) {
                                      return firstImage.url
                                    }
                                    // Check for secure_url property (Cloudinary format)
                                    else if (
                                      firstImage.secure_url &&
                                      typeof firstImage.secure_url === "string" &&
                                      firstImage.secure_url.trim() !== ""
                                    ) {
                                      return firstImage.secure_url
                                    }
                                  }
                                }
                                return "/placeholder.svg"
                              })()
                              const name = property.title || "Unnamed Property"
                              const location = property.address
                                ? `${property.address.area || ""}, ${property.address.city || ""}`
                                : "Unknown Location"
                              const price = property.pricing?.pricePerBed || 0
                              const rating = property.rating || 0
                              return (
                                <div
                                  key={property._id}
                                  className="transition-all duration-300 w-full cursor-pointer hover:z-10 pb-2 hover:shadow-lg hover:border hover:border-emerald-200 rounded-lg"
                                  style={{}}
                                  onClick={() => router.push(`/property/${property._id}`)}
                                >
                                  <div className="relative w-full h-28 md:h-32 overflow-hidden bg-slate-100 rounded-lg">
                                    {/* Guest Favorite Badge */}
                                    <div className="absolute top-2 left-2 z-10">
                                      <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm">
                                        Guest favorite
                                      </div>
                                    </div>

                                    {/* Heart Icon - Functional Wishlist */}
                                    <div className="absolute top-2 right-2 z-10">
                                      <button
                                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                          isInWishlist(property._id)
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-white/80 hover:bg-white"
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation() // Prevent card click when clicking heart
                                          toggleWishlist(property._id)
                                        }}
                                      >
                                        <Heart
                                          className={`w-4 h-4 transition-colors ${
                                            isInWishlist(property._id)
                                              ? "text-white fill-white"
                                              : "text-gray-600 hover:text-red-500"
                                          }`}
                                        />
                                      </button>
                                    </div>
                                    {/* Loading indicator */}
                                    {imageLoadingStates[property._id] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                      </div>
                                    )}
                                    <Image
                                      src={imageUrl || "/placeholder.svg"}
                                      alt={name}
                                      fill
                                      className="object-cover md:transition-transform md:duration-300 md:hover:scale-110"
                                      onLoadingComplete={() => {
                                        setImageLoadingStates((prev) => ({ ...prev, [property._id]: false }))
                                      }}
                                      onError={(e) => {
                                        setImageLoadingStates((prev) => ({ ...prev, [property._id]: false }))
                                        // Fallback to placeholder if image fails to load
                                        const target = e.target as HTMLImageElement
                                        if (target.src !== "/placeholder.svg") {
                                          target.src = "/placeholder.svg"
                                        }
                                      }}
                                      onLoadStart={() => {
                                        setImageLoadingStates((prev) => ({ ...prev, [property._id]: true }))
                                      }}
                                    />
                                    {/* Fallback content when no image */}
                                    {imageUrl === "/placeholder.svg" && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                        <div className="text-center text-slate-400">
                                          <Building className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-2" />
                                          <p className="text-xs md:text-sm">No Image</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {/* Content Below Image */}
                                  <div className="pt-2 md:pt-3 space-y-1 md:space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center justify-between w-full">
                                        <h3 className="font-medium text-sm md:text-base text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1">
                                          {name}
                                        </h3>
                                        <span className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm mr-2">
                                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                          <span className="text-xs font-medium text-slate-700">{rating}</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-slate-500">
                                      <span className="text-xs md:text-sm line-clamp-1">{location}</span>
                                    </div>
                                    <div className="flex items-center pt-1">
                                      <div className="flex items-center space-x-2">
                                        <div>
                                          <span className="text-sm md:text-base font-bold text-slate-800">
                                            ₨{price.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()
              )}
            </div>

            {/* Pagination (hidden for city-based grouping) */}
            {false && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 sm:mt-12 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-600 mb-4 sm:mb-0">
                  Page {pagination.page} of {pagination.pages} • {pagination.total.toLocaleString()} total properties
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2"
                  >
                    ← Previous
                  </Button>

                  {/* Page numbers with smart truncation */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pages = []
                      const totalPages = pagination.pages
                      const currentPage = pagination.page

                      // Always show first page
                      if (currentPage > 3) {
                        pages.push(
                          <Button
                            key={1}
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2"
                          >
                            1
                          </Button>,
                        )
                        if (currentPage > 4) {
                          pages.push(
                            <span key="dots1" className="px-2 text-slate-400">
                              ...
                            </span>,
                          )
                        }
                      }

                      // Show pages around current page
                      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
                        pages.push(
                          <Button
                            key={i}
                            size="sm"
                            variant={currentPage === i ? "default" : "outline"}
                            onClick={() => handlePageChange(i)}
                            className="px-3 py-2"
                          >
                            {i}
                          </Button>,
                        )
                      }

                      // Always show last page
                      if (currentPage < totalPages - 2) {
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span key="dots2" className="px-2 text-slate-400">
                              ...
                            </span>,
                          )
                        }
                        pages.push(
                          <Button
                            key={totalPages}
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-2"
                          >
                            {totalPages}
                          </Button>,
                        )
                      }

                      return pages
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only (compact, bottom-aligned) */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 h-9 overflow-hidden bg-white border-t border-slate-200 z-40"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-end justify-between h-full px-2 pb-1">
          {/* Home */}
          <button
            aria-label="Home"
            onClick={() => router.push("/find-rooms")}
            className="w-9 h-9 flex items-center justify-center rounded-md"
            title="Home"
          >
            <Home className="w-5 h-5 text-slate-700" />
            <span className="sr-only">Home</span>
          </button>

          {/* Property Types / Browse */}
          <button
            aria-label="Browse"
            onClick={() => router.push("/find-rooms")}
            className="w-9 h-9 flex items-center justify-center rounded-md"
            title="Browse"
          >
            <Building className="w-5 h-5 text-slate-700" />
            <span className="sr-only">Browse</span>
          </button>

          {/* Chat (toggle unified chat) */}
          <button
            aria-label="Chat"
            onClick={() => toggleChat()}
            className="w-9 h-9 flex items-center justify-center rounded-md"
            title="Chat"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span className="sr-only">Chat</span>
          </button>

      

          {/* Profile */}
          <div className="relative profile-dropdown-container">
            <button
              aria-label="Profile"
              onClick={() => (user ? setShowProfile(!showProfile) : router.push("/auth/login"))}
              className="w-9 h-9 flex items-center justify-center rounded-md"
              title="Profile"
            >
              {user ? (
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.avatar || ""} alt={user.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs font-semibold">
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5 text-slate-700" />
              )}
              <span className="sr-only">Profile</span>
            </button>

            {/* Small profile dropdown for mobile */}
            {showProfile && (
              <div className="absolute bottom-12 right-0 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                {user ? (
                  <>
                    <Link href="/my-bookings" className="block px-4 py-2 text-slate-700 hover:bg-slate-50">
                      My Bookings
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signup" className="block px-4 py-2 text-emerald-600 hover:bg-emerald-50">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile floating login CTA removed per request */}

      <Footer />
    </div>
  )
}

export default function FindRoomsPage() {
  return <FindRoomsContent />
}
