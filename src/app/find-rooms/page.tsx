"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { useFormLocalStorage } from "@/hooks/use-local-storage"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { Logo } from "@/components/logo"
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Heart,
  Share2,
  Wifi,
  Car,
  Utensils,
  AirVent,
  Users,
  Grid3X3,
  List,
  ArrowUpDown,
  User,
  LogOut,
  Settings,
  MessageCircle,
  Home,
  Building,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthLoading } from "@/components/auth-loading"
import { UnifiedChat } from "@/components/unified-chat"
import { PROPERTY_TYPES } from "@/lib/property-types"
import { Loader2 } from "lucide-react"

function FindRoomsContent() {
  const { user, logout } = useAuth()
  const { isChatOpen, toggleChat } = useChat()
  const { preferences, toggleViewMode } = useUserPreferences()
  const [showProfile, setShowProfile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const router = useRouter()
  
  // Initial filter values - no default price range to show all properties
  const initialFilters = {
    propertyType: "",
    genderPreference: "",
    priceRange: [0, 999999], // Very wide range to include all properties by default
    amenities: [] as string[],
    sortBy: "relevance",
    searchQuery: "", // For hostel name, city, area search
  }
  
  // Use local storage for filter persistence
  const {
    formData: filters,
    updateFormData: updateFilters,
    resetForm: resetFilters
  } = useFormLocalStorage('room-search-filters', initialFilters, {
    autoSave: true,
    debounceMs: 300 // Quick save for search filters
  })
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 })
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({})
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

  // Popular cities and areas for search suggestions
  const popularLocations = [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
    "DHA Lahore", "Gulberg Lahore", "Model Town Lahore", "Johar Town Lahore",
    "Clifton Karachi", "Defence Karachi", "Gulshan Karachi", "North Nazimabad Karachi",
    "F-6 Islamabad", "F-7 Islamabad", "F-8 Islamabad", "F-10 Islamabad", "F-11 Islamabad",
    "Saddar Rawalpindi", "Satellite Town Rawalpindi", "Bahria Town Rawalpindi",
    "University Town Peshawar", "Hayatabad Peshawar", "Board Bazaar Peshawar",
    "Cantt Area", "Mall Road", "Liberty Market", "Anarkali Bazaar",
    "Fortress Stadium", "Emporium Mall", "Packages Mall", "Centaurus Mall"
  ]

  useEffect(() => {
    async function fetchProperties(page = 1) {
      setLoading(true)
      setError(null)
      try {
        // Build query parameters from filters
        // For city-based grouping, we need to fetch all properties, not paginated
        const params = new URLSearchParams({
          page: '1',
          limit: '100', // Fetch more properties to ensure proper city grouping
        })

        // Add search query
        if (filters.searchQuery) {
          params.append('search', filters.searchQuery)
        }

        // Add property type filter
        if (filters.propertyType) {
          params.append('propertyType', filters.propertyType)
        }

        // Add gender preference filter
        if (filters.genderPreference) {
          params.append('genderPreference', filters.genderPreference)
        }

        // Add price range filter only if it's different from the very wide default
        const defaultMin = 0;
        const defaultMax = 999999;
        const currentMin = filters.priceRange?.[0] ?? defaultMin;
        const currentMax = filters.priceRange?.[1] ?? defaultMax;

        // Only add price filters if they're different from the very wide defaults
        if (currentMin !== defaultMin || currentMax !== defaultMax) {
          params.append('minPrice', currentMin.toString())
          params.append('maxPrice', currentMax.toString())
        }

        // Add amenities filter
        if (filters.amenities.length > 0) {
          params.append('amenities', filters.amenities.join(','))
        }

        // Add sort by
        if (filters.sortBy) {
          params.append('sortBy', filters.sortBy)
        }

        const res = await fetch(`/api/properties/verified?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch properties")
        const data = await res.json()
        console.log('Fetched properties response:', data)
        console.log('Properties array length:', data.properties?.length || 0)
        console.log('Properties data:', data.properties)
        console.log('Debug info:', data.debug)
        // Debug image data structure
        if (data.properties && data.properties.length > 0) {
          console.log('First property images:', data.properties[0].images)
          console.log('Image type:', typeof data.properties[0].images?.[0])
          console.log('Image structure:', data.properties[0].images?.[0])
        }
        setProperties(data.properties || [])
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 })
        setDebugInfo(data.debug || null)
      } catch (err: any) {
        setError(err.message || "Error loading properties")
      } finally {
        setLoading(false)
      }
    }
    fetchProperties(pagination.page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!target.closest('.search-container')) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

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
        params.append('search', filters.searchQuery)
      }
      if (filters.genderPreference) {
        params.append('genderPreference', filters.genderPreference)
      }
      // Only add price filters if they're different from the very wide defaults
      if (filters.priceRange) {
        const defaultMin = 0;
        const defaultMax = 999999;
        const currentMin = filters.priceRange[0];
        const currentMax = filters.priceRange[1];

        if (currentMin !== defaultMin || currentMax !== defaultMax) {
          params.append('minPrice', currentMin.toString())
          params.append('maxPrice', currentMax.toString())
        }
      }
      if (filters.amenities && filters.amenities.length > 0) {
        params.append('amenities', filters.amenities.join(','))
      }

      const res = await fetch(`/api/properties/counts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPropertyCounts(data.counts || {})
      }
    } catch (error) {
      console.error('Error fetching property counts:', error)
    } finally {
      setCountsLoading(false)
    }
  }

  // Handler for filter changes - reset to page 1 and update counts
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    updateFilters(key, value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handler for property type change with smooth transition
  const handlePropertyTypeChange = (type: string) => {
    handleFilterChange('propertyType', type)
  }

  // Handler for clear filters
  const handleClearFilters = () => {
    resetFilters()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handler for search input changes with suggestions
  const handleSearchInputChange = (value: string) => {
    handleFilterChange('searchQuery', value)
    setSelectedSuggestionIndex(-1) // Reset selection when typing

    if (value.length > 0) {
      const filteredSuggestions = popularLocations
        .filter(location =>
          location.toLowerCase().includes(value.toLowerCase())
        )
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
    handleFilterChange('searchQuery', suggestion)
    setShowSuggestions(false)
    setSearchSuggestions([])
    setSelectedSuggestionIndex(-1)
  }

  // Handler for keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(searchSuggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Navbar with Property Type Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Single Row - Logo, Property Types, and User Controls */}
          <div className="flex items-center h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <div className="cursor-default select-none flex-shrink-0 min-w-0">
              <Logo size={36} textSize="md" className="flex-shrink-0" />
            </div>

            {/* Property Type Navigation - Center */}
            <div className="flex-1 flex justify-center min-w-0 mx-0.5 sm:mx-1">
              <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide max-w-full">
                <div className="flex items-center space-x-0.5 sm:space-x-1 min-w-max px-0.5">
                  {PROPERTY_TYPES.map((type) => {
                    const isActive = type.id === 'all' ? !filters.propertyType || filters.propertyType === '' : filters.propertyType === type.id
                    const Icon = type.icon
                    const count = type.id === 'all' ? Object.values(propertyCounts).reduce((sum, count) => sum + count, 0) : (propertyCounts[type.id] || 0)

                    return (
                      <Button
                        key={type.id}
                        variant="ghost"
                        onClick={() => handlePropertyTypeChange(type.id === 'all' ? '' : type.id)}
                        disabled={countsLoading}
                        className={`
                          group flex items-center space-x-0.5 sm:space-x-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md whitespace-nowrap transition-all duration-300 text-xs relative overflow-hidden
                          ${isActive
                            ? `${type.bgColor} shadow-sm border-2 border-current/30 font-semibold`
                            : `text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 hover:shadow-sm border border-slate-200/50 hover:border-slate-300/50`
                          }
                          ${countsLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {/* Icon */}
                        <Icon className={`w-3 h-3 flex-shrink-0 transition-all duration-300 ${type.color} ${isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'}`} />

                        {/* Label */}
                        <span className={`font-medium transition-all duration-300 ${isActive ? `tracking-wide ${type.color}` : 'text-slate-600'} hidden md:block text-xs`}>
                          {type.label}
                        </span>
                        <span className={`font-medium transition-all duration-300 ${isActive ? `tracking-wide ${type.color}` : 'text-slate-600'} md:hidden text-xs`}>
                          {type.id === 'all' ? 'All' : type.label}
                        </span>

                        {/* Count Badge */}
                        {showCounts && count > 0 && (
                          <Badge
                            variant="secondary"
                            className={`
                              ml-0.5 text-xs px-0.5 py-0 min-w-[14px] h-3.5 flex items-center justify-center transition-all duration-300 text-xs
                              ${isActive
                                ? 'bg-white/20 text-current border-current/30'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                              }
                              ${countsLoading ? 'animate-pulse' : ''}
                            `}
                          >
                            {countsLoading ? (
                              <Loader2 className="w-2 h-2 animate-spin" />
                            ) : (
                              count > 99 ? '99+' : count
                            )}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Chat Support Button and User Profile - Right */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
              {/* Chat Button */}
              <Button
                variant="ghost"
                onClick={toggleChat}
                className="flex items-center hover:bg-emerald-50 text-emerald-600 px-1 sm:px-1.5 py-1"
                size="sm"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden md:block text-xs font-medium ml-1">Chat Support</span>
              </Button>

              {/* User Profile */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center hover:bg-slate-100 px-1 sm:px-1.5 py-1"
                  size="sm"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                  <div className="hidden lg:block text-left ml-1">
                    <div className="text-xs font-medium text-slate-800 truncate max-w-16">{user?.name}</div>
                    <div className="text-xs text-slate-500 capitalize truncate">{user?.role}</div>
                  </div>
                </Button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{user?.name}</div>
                        <div className="text-sm text-slate-600">{user?.email}</div>
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
                </div>
              )}
              </div>
            </div>
          </div>


        </div>
      </nav>



      {/* Search Bar Section */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Search Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 relative">
            {/* Filter Button - Top Right */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white hover:bg-slate-50 border-slate-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Filters</span>
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pr-16 sm:pr-20">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="relative search-container">
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
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => {
                        setShowSuggestions(false)
                        setSelectedSuggestionIndex(-1)
                      }, 200)
                    }}
                    className="pl-8 sm:pl-10 h-10 sm:h-12 border-slate-200 text-slate-800 text-sm sm:text-base"
                  />

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
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <MapPin className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${
                              index === selectedSuggestionIndex
                                ? 'text-emerald-500'
                                : 'text-slate-400 group-hover:text-emerald-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                              index === selectedSuggestionIndex
                                ? 'text-emerald-700'
                                : 'text-slate-700 group-hover:text-emerald-700'
                            }`}>
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
              </div>

              <Select
                value={filters.propertyType}
                onValueChange={(value) => handleFilterChange('propertyType', value)}
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
                onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
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
                  🔥 <strong>{pagination.total.toLocaleString()}</strong> properties
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
                        Math.max(1000, Math.min(50000, filters.priceRange[1]))
                      ]}
                      onValueChange={(value:any) => {
                        const [min, max] = value
                        if (max - min < 1000) return
                        handleFilterChange('priceRange', value)
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
                    onValueChange={(value) => handleFilterChange('propertyType', value === "all" ? "" : value)}
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
                      { label: "Mixed", value: "mixed" }
                    ].map((gender) => (
                      <div key={gender.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                        <Checkbox
                          id={`filter-${gender.value}`}
                          checked={filters.genderPreference === gender.value}
                          onCheckedChange={(checked) =>
                            handleFilterChange('genderPreference', checked ? gender.value : "")
                          }
                          className="w-5 h-5"
                        />
                        <label htmlFor={`filter-${gender.value}`} className="text-sm text-slate-700 cursor-pointer flex-1 py-1">
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
                              handleFilterChange('amenities', [...filters.amenities, amenity.id])
                            } else {
                              handleFilterChange('amenities', filters.amenities.filter((a) => a !== amenity.id))
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <label htmlFor={`filter-${amenity.id}`} className="text-sm text-slate-700 cursor-pointer flex items-center flex-1 py-1">
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
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
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
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full h-12 text-base"
                >
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
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Available Properties</h2>
                <p className="text-slate-600">
                  {loading ? "Fetching properties..." :
                    properties.length === 0 ? "No properties found" :
                    `Found ${properties.length.toLocaleString()} properties organized by city`
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {debugInfo && (
                  <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded border">
                    Total: {debugInfo.totalInDb} | Approved: {debugInfo.approved} | Pending: {debugInfo.pending}
                  </div>
                )}
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="w-full sm:w-48">
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

                <div className="flex border border-slate-200 rounded-lg">
                  <Button
                    variant={preferences.viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={toggleViewMode}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={preferences.viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={toggleViewMode}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>




            {/* Properties by City */}
            <div className="space-y-10">
              {loading ? (
                <div className="w-full">
                  <div className="min-h-[400px] w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                    <AuthLoading
                      title="Loading Properties"
                      description={`Fetching ${filters.propertyType ? filters.propertyType : 'all'} properties...`}
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
                    No {filters.propertyType ? filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1) : ''} Properties Found
                  </h3>
                  <p className="text-slate-600 text-center max-w-md">
                    We couldn't find any {filters.propertyType ? filters.propertyType : ''} properties matching your current filters. Try adjusting your search criteria or check back later for new listings.
                  </p>
                  {filters.propertyType && (
                    <button
                      onClick={() => handleFilterChange('propertyType', '')}
                      className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Clear Property Type Filter
                    </button>
                  )}
                </div>
              ) : (
                (() => {
                  // Group properties by city (normalize city names to handle case inconsistencies)
                  const propertiesByCity = properties.reduce((acc, property) => {
                    const rawCity = property.address?.city || 'Unknown City';
                    // Normalize city name: capitalize first letter, lowercase the rest
                    const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase();
                    if (!acc[city]) {
                      acc[city] = [];
                    }
                    acc[city].push(property);
                    return acc;
                  }, {} as Record<string, typeof properties>);

                  // Define city priority order
                  const cityPriority = ['Lahore', 'Islamabad', 'Karachi'];

                  // Sort cities: priority cities first, then alphabetical
                  const sortedCities = Object.keys(propertiesByCity).sort((a, b) => {
                    const aIndex = cityPriority.indexOf(a);
                    const bIndex = cityPriority.indexOf(b);

                    // If both cities are in priority list, sort by priority
                    if (aIndex !== -1 && bIndex !== -1) {
                      return aIndex - bIndex;
                    }
                    // If only one city is in priority list, prioritize it
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    // If neither is in priority list, sort alphabetically
                    return a.localeCompare(b);
                  });

                  return sortedCities.map((city) => {
                    const cityProperties = propertiesByCity[city];

                    return (
                      <div key={city} className="space-y-6">
                        {/* City Header */}
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                                  Popular homes in {city}
                                </h2>
                                <p className="text-sm text-slate-600">
                                  {cityProperties.length} {cityProperties.length === 1 ? 'property' : 'properties'} available
                                </p>
                              </div>
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
                            const container = document.getElementById(`scroll-${city}`);
                            if (container) {
                              container.scrollBy({ left: -200, behavior: 'smooth' });
                            }
                          }}
                          aria-label={`Scroll left for ${city} properties`}
                        >
                          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Right Arrow */}
                        <button
                          className="nav-arrow absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:border-slate-300"
                          onClick={() => {
                            const container = document.getElementById(`scroll-${city}`);
                            if (container) {
                              container.scrollBy({ left: 200, behavior: 'smooth' });
                            }
                          }}
                          aria-label={`Scroll right for ${city} properties`}
                        >
                          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Scroll container */}
                        <div
                          id={`scroll-${city}`}
                          className="property-scroll-container flex gap-3 overflow-x-auto scrollbar-hide pb-4 px-1"
                        >
                        {cityProperties.map((property: any) => {
                  // Extract image URL properly - handle multiple formats
                  const imageUrl = (() => {
                    if (Array.isArray(property.images) && property.images.length > 0) {
                      const firstImage = property.images[0]
                      
                      // Handle string URLs
                      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
                        return firstImage
                      } 
                      // Handle object with url property
                      else if (typeof firstImage === 'object' && firstImage !== null) {
                        // Check for url property
                        if (firstImage.url && typeof firstImage.url === 'string' && firstImage.url.trim() !== '') {
                          return firstImage.url
                        }
                        // Check for secure_url property (Cloudinary format)
                        else if (firstImage.secure_url && typeof firstImage.secure_url === 'string' && firstImage.secure_url.trim() !== '') {
                          return firstImage.secure_url
                        }
                      }
                    }
                    return '/placeholder.svg'
                  })()
                  const name = property.title || "Unnamed Property";
                  const location = property.address ? `${property.address.area || ''}, ${property.address.city || ''}` : "Unknown Location";
                  const price = property.pricing?.pricePerBed || 0;
                  const rating = property.rating || 0;
                  return (
                    <Card
                      key={property._id}
                      className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-60 bg-white rounded-xl border border-slate-200 cursor-pointer"
                      onClick={() => router.push(`/property/${property._id}`)}
                    >
                        {/* Image */}
                        <div className="relative w-full h-32 overflow-hidden bg-slate-100 rounded-t-xl">
                          {/* Guest Favorite Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm">
                              Guest favorite
                            </div>
                          </div>

                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 z-10">
                            <button className="w-7 h-7 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                              <Heart className="w-3.5 h-3.5 text-slate-600 hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                          {/* Loading indicator */}
                          {imageLoadingStates[property._id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                          )}
                          
                          <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onLoadingComplete={() => {
                              setImageLoadingStates(prev => ({ ...prev, [property._id]: false }))
                            }}
                            onError={(e) => {
                              setImageLoadingStates(prev => ({ ...prev, [property._id]: false }))
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement
                              if (target.src !== '/placeholder.svg') {
                                target.src = '/placeholder.svg'
                              }
                            }}
                            onLoadStart={() => {
                              setImageLoadingStates(prev => ({ ...prev, [property._id]: true }))
                            }}
                          />
                          
                          {/* Fallback content when no image */}
                          {imageUrl === '/placeholder.svg' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                              <div className="text-center text-slate-400">
                                <Building className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-sm">No Image</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <CardContent className="p-3">
                          <div className="space-y-1.5">
                            <h3 className="font-medium text-sm text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                              {name}
                            </h3>
                            <div className="flex items-center text-slate-500">
                              <span className="text-xs line-clamp-1">{location}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <span className="text-sm font-bold text-slate-800">
                                  ₨{price.toLocaleString()}
                                </span>
                                <span className="text-xs text-slate-500 ml-1">for 2 nights</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium text-slate-700">{rating}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                    </Card>
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
                          </Button>
                        )
                        if (currentPage > 4) {
                          pages.push(
                            <span key="dots1" className="px-2 text-slate-400">...</span>
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
                          </Button>
                        )
                      }
                      
                      // Always show last page
                      if (currentPage < totalPages - 2) {
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span key="dots2" className="px-2 text-slate-400">...</span>
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
                          </Button>
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

      <Footer />
    </div>
  )
}

export default function FindRoomsPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <FindRoomsContent />
    </ProtectedRoute>
  )
}
