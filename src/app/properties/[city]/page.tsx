"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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
  X
} from "lucide-react"

// --- Import your custom components here ---
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { Logo } from "@/components/logo"
import { AuthLoading } from "@/components/auth-loading"
import { UnifiedChat } from "@/components/unified-chat"

export default function CityPropertiesPage() {
  // 1. Core Hooks
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const { isChatOpen, toggleChat } = useChat()
  const { requireAuth } = useAuthGuard()

  // 2. City Logic
  const rawCity = params?.city ? (params.city as string) : ""
  const city = decodeURIComponent(rawCity)
  const displayCity = city ? city.charAt(0).toUpperCase() + city.slice(1) : "All Locations"

  // 3. UI State
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileProfileSheet, setShowMobileProfileSheet] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // 4. Data State
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showWishlist, setShowWishlist] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 })
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({})

  // 5. Filters State
  const [filters, setFilters] = useState({
    propertyType: searchParams.get("propertyType") || "",
    genderPreference: "",
    priceRange: [0, 999999], 
    amenities: [] as string[],
    sortBy: "relevance",
    searchQuery: "", 
  })

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

  // --- Helpers ---
  const isInWishlist = (propertyId: string) => wishlist.includes(propertyId)

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePropertyTypeChange = (type: string) => {
    handleFilterChange("propertyType", type)
  }

  const handleClearFilters = () => {
    setFilters({
      propertyType: "",
      genderPreference: "",
      priceRange: [0, 999999],
      amenities: [],
      sortBy: "relevance",
      searchQuery: "",
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const toggleWishlist = (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!requireAuth('wishlist', `/properties/${city}`)) return

    setWishlist((prev) => {
      if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId)
      return [...prev, propertyId]
    })
  }

  // --- Fetch Logic ---
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true)
      try {
        const apiParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: "50",
        })

        const effectiveSearch = filters.searchQuery 
          ? `${city} ${filters.searchQuery}` 
          : city
        
        apiParams.append("search", effectiveSearch)

        if (filters.propertyType) apiParams.append("propertyType", filters.propertyType)
        if (filters.genderPreference) apiParams.append("genderPreference", filters.genderPreference)
        
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) {
          apiParams.append("minPrice", filters.priceRange[0].toString())
          apiParams.append("maxPrice", filters.priceRange[1].toString())
        }

        if (filters.amenities.length > 0) {
          apiParams.append("amenities", filters.amenities.join(","))
        }
        if (filters.sortBy) {
          apiParams.append("sortBy", filters.sortBy)
        }

        const res = await fetch(`/api/properties/verified?${apiParams.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch")
        
        const data = await res.json()
        
        let finalProperties = data.properties || []
        
        if (filters.searchQuery === "" && city !== "All Locations") {
           finalProperties = finalProperties.filter((p: any) => 
             p.address?.city?.toLowerCase().includes(city.toLowerCase()) || 
             p.city?.toLowerCase().includes(city.toLowerCase())
           )
        }

        setProperties(finalProperties)
        setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 1 })

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (city) {
      fetchProperties()
    }
  }, [pagination.page, filters, city])

  const wishlistProperties = properties.filter((property) => wishlist.includes(property._id))

  return (
    <div className="min-h-screen bg-white pb-9 md:pb-0">
      
      {/* 1. DESKTOP NAVBAR */}
      <div className="hidden md:block sticky top-0 z-50 bg-gray-50 backdrop-blur-md border-b border-emerald-100/50 shadow-sm transition-all duration-300">
        <nav>
          <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <div className="flex-shrink-0 mt-15">
                <Link href="/">
                   <Logo size={65} showText={true} textSize="md" className="cursor-pointer" />
                </Link>
              </div>

              {/* Center: Property Type Pills */}
              <div className="flex items-center space-x-1.5 bg-gray-200 rounded-lg p-1">
                {[
                  { id: "hostel", label: "Hostels", icon: "/Hostel.png" },
                  { id: "apartment", label: "Apartments", icon: "/apartment.png" },
                  { id: "house", label: "Homes", icon: "/house.png" },
                  { id: "office", label: "Office", icon: "/office.jpg" },
                  { id: "hostel-mess", label: "Mess", icon: "/mess.png" },
                ].map((type) => {
                  const isActive = filters.propertyType === type.id
                  return (
                    <Button
                      key={type.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => handlePropertyTypeChange(isActive ? "" : type.id)}
                      className={`group relative flex items-center space-x-1 h-7 px-2.5 rounded-md whitespace-nowrap text-xs font-medium transition-all duration-200 ${isActive ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-emerald-600 hover:bg-white/60"}`}
                    >
                      <Image src={type.icon || "/placeholder.svg"} alt={type.label} width={12} height={12} className={`rounded object-contain ${isActive ? "" : "opacity-75"}`} />
                      <span className="relative">
                        {type.label}
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-200 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                      </span>
                    </Button>
                  )
                })}
              </div>

              {/* Right: Host CTA + Profile */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link href="/list-property" className="text-slate-700 hover:text-emerald-600 font-medium flex items-center space-x-1 transition-all duration-200 text-xs px-2.5 py-1.5 rounded-lg hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200">
                  <Building className="w-3.5 h-3.5" />
                  <span>Become a Host</span>
                </Link>

                <div className="relative profile-dropdown-container">
                  <Button variant="ghost" onClick={() => setShowProfile(!showProfile)} className="px-2 py-1.5 h-7 rounded-lg hover:bg-emerald-50/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-emerald-200">
                    {user ? (
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </Button>
                  
                  {/* Desktop Profile Dropdown */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-slate-200">
                            <p className="font-medium text-slate-800">{user.name}</p>
                            <p className="text-sm text-slate-600 truncate">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <button onClick={() => { setShowWishlist(true); setShowProfile(false); }} className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 w-full text-left">
                              <Heart className="w-4 h-4" /> <span>My Wishlist</span>
                            </button>
                            <button onClick={logout} className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left">
                              <LogOut className="w-4 h-4" /> <span>Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 space-y-2">
                          <Link href="/auth/login" className="block w-full px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700">Sign In</Link>
                          <Link href="/signup" className="block w-full px-4 py-2 border border-emerald-600 text-emerald-600 text-center rounded-lg hover:bg-emerald-50">Create Account</Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop Search Bar (Sub-header) */}
        <div className="border-b border-emerald-100/30 bg-gray-50">
          <div className="flex justify-center py-2">
            <div className="bg-gray-200 rounded-lg p-1.5 shadow-sm flex items-center gap-2 w-fit">
              <div className="relative flex items-center">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 z-10" />
                <Input
                  placeholder={`Search in ${displayCity}...`}
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                  className="pl-8 pr-14 h-8 border-emerald-100 text-slate-800 text-sm w-80 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-300"
                />
                <button onClick={() => setPagination(prev => ({...prev, page: 1}))} className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-white z-10 transition-all duration-200 shadow-sm">
                  <Search className="w-2.5 h-2.5" />
                </button>
                <button onClick={() => setShowFilters(true)} className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 border border-emerald-200 rounded-full text-slate-600 hover:bg-emerald-50 z-10">
                  <SlidersHorizontal className="w-2.5 h-2.5" />
                </button>
              </div>
              <button onClick={() => setShowWishlist(!showWishlist)} className={`flex items-center justify-center h-8 w-8 border rounded-full transition-all duration-200 ${showWishlist ? "border-red-500 bg-red-500 text-white" : "border-emerald-200 text-slate-600 hover:text-red-500"}`}>
                <Heart className={`w-3.5 h-3.5 ${showWishlist ? "fill-white" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MOBILE HEADER & SEARCH */}
      <div className="md:hidden bg-white sticky top-0 z-50 pb-2">
        {/* Main Search Bar - Pill Shape */}
        <div className="px-4 pt-4 pb-2 bg-white">
          <div className="relative flex items-center w-full h-12 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-gray-100 px-4 transition-all active:scale-[0.98]">
            <div className="flex-shrink-0 mr-3">
              <Search className="w-5 h-5 text-gray-800 stroke-[2.5]" />
            </div>
            <input
              type="text"
              placeholder={`Search in ${displayCity}`}
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              className="flex-1 w-full bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-800 placeholder:font-semibold h-full"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowFilters(true)
              }}
              className="flex-shrink-0 ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="p-1.5 border border-gray-300 rounded-full">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-800 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>
         
        {/* Mobile Categories - Clean & Green Underline */}
        <div className="px-4 pb-2">
          <div className="flex justify-between items-start gap-2 overflow-x-auto scrollbar-hide py-2">
            {[
              { id: "house", label: "Home", icon: "/home (2).png" },
              { id: "hostel", label: "Hostel", icon: "/hostel.png" },
              { id: "apartment", label: "Apartment", icon: "/aparment.png" }, 
              { id: "office", label: "Office", icon: "/office.png" },
              { id: "hostel-mess", label: "Mess", icon: "/food 2.png" },
            ].map((category) => {
              const isActive = filters.propertyType === category.id
              
              return (
                <button
                  key={category.id}
                  onClick={() => handlePropertyTypeChange(isActive ? "" : category.id)}
                  className="group flex flex-col items-center gap-1 min-w-[64px] focus:outline-none"
                >
                  <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    <div className="relative w-10 h-10">
                      <Image
                        src={category.icon}
                        alt={category.label}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full">
                    <span className={`text-xs font-medium transition-colors duration-200 ${isActive ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"}`}>
                      {category.label}
                    </span>
                    <span className={`h-[3px] rounded-full bg-emerald-500 transition-all duration-300 mt-1 ${isActive ? "w-8 opacity-100" : "w-0 opacity-0"}`}></span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. FILTER SHEET (Desktop & Mobile) */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center"><SlidersHorizontal className="w-5 h-5 mr-2" /> Filters</h2>
                <Button variant="ghost" onClick={() => setShowFilters(false)}>✕</Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Budget */}
                <div className="space-y-4">
                  <h4 className="font-medium">Budget (PKR)</h4>
                  <Slider
                    value={[Math.max(1000, filters.priceRange[0]), Math.min(100000, filters.priceRange[1])]}
                    onValueChange={(val) => handleFilterChange("priceRange", val)}
                    max={100000} min={1000} step={500}
                  />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{filters.priceRange[0]}</span><span>{filters.priceRange[1]}</span>
                  </div>
                </div>
                {/* Gender */}
                <div className="space-y-3">
                  <h4 className="font-medium">Gender</h4>
                  {[{l:"Boys",v:"boys"},{l:"Girls",v:"girls"},{l:"Mixed",v:"mixed"}].map(g => (
                    <div key={g.v} className="flex items-center space-x-3"><Checkbox checked={filters.genderPreference === g.v} onCheckedChange={(c) => handleFilterChange("genderPreference", c ? g.v : "")} /><label>{g.l}</label></div>
                  ))}
                </div>
                {/* Amenities */}
                <div className="space-y-3">
                  <h4 className="font-medium">Amenities</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {amenityOptions.map(a => (
                      <div key={a.id} className="flex items-center space-x-3">
                        <Checkbox checked={filters.amenities.includes(a.id)} onCheckedChange={(c) => {
                          const newAm = c ? [...filters.amenities, a.id] : filters.amenities.filter(x => x !== a.id)
                          handleFilterChange("amenities", newAm)
                        }} />
                        <label className="flex items-center text-sm"><a.icon className="w-4 h-4 mr-2"/>{a.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t space-y-3">
                <Button variant="outline" className="w-full" onClick={handleClearFilters}>Clear All</Button>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowFilters(false)}>Show Results</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-emerald-600 hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/find-rooms" className="hover:text-emerald-600 hover:underline">Properties</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium capitalize">{displayCity}</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 capitalize">
              {showWishlist ? `My Wishlist in ${displayCity}` : `Properties in ${displayCity}`}
            </h1>
            <p className="text-sm text-gray-600">
              {loading ? "Loading..." : `Showing ${showWishlist ? wishlistProperties.length : properties.length} properties`}
            </p>
          </div>
        </div>

        {/* Loading Grid */}
        {loading && (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-8">
             {[1,2,3,4,5,6].map((i) => (
               <div key={i} className="flex flex-col gap-3">
                 <div className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
               </div>
             ))}
           </div>
        )}

        {/* Empty State */}
        {!loading && (showWishlist ? wishlistProperties : properties).length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {showWishlist ? "Your wishlist is empty" : `No properties found in ${displayCity}`}
            </h3>
            {!showWishlist && (
              <Button variant="link" onClick={handleClearFilters} className="text-emerald-600">Clear filters</Button>
            )}
          </div>
        )}

        {/* PROPERTIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-10">
          {!loading && (showWishlist ? wishlistProperties : properties).map((property) => {
            const imageUrl = property.images?.[0]?.url || property.images?.[0] || "/placeholder.svg"
            const type = property.type || "Apartment"
            const price = property.pricing?.pricePerBed || property.price || 0
            const location = property.address ? `${property.address.area}, ${property.address.city}` : property.city
            
            return (
              <Link 
                href={`/property/${property._id}`} 
                key={property._id}
                className="group flex flex-col gap-3 cursor-pointer"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
                  <Image 
                    src={imageUrl} 
                    alt={property.title || "Property Image"}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 16vw"
                  />
                  
                  {type === 'Hostel' && (
                    <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                      HOSTEL
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => toggleWishlist(e, property._id)}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition shadow-sm z-10 backdrop-blur-sm ${
                      isInWishlist(property._id) 
                        ? "bg-red-500 text-white" 
                        : "bg-white/70 text-gray-600 hover:bg-white hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(property._id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate capitalize">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700 shrink-0">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 
                      {property.rating || "4.0"}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate capitalize">
                      {location}
                  </p>

                  <div className="mt-1 flex items-baseline gap-1 text-gray-900">
                    <span className="text-sm font-bold">Rs{price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 font-normal">/month</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </main>

      <UnifiedChat isOpen={isChatOpen} onToggle={toggleChat} />
      
      {/* 5. FOOTER */}
      <Footer />

      {/* 6. MOBILE BOTTOM NAV - Updated Layout */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[65px] bg-white border-t border-gray-200 z-50 px-6 pb-safe" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-between h-full w-full">
          {/* Home */}
          <Link href="/find-rooms" className="flex flex-col items-center justify-center gap-1 w-12 text-gray-400 hover:text-emerald-600 transition-colors">
            <Home className="w-6 h-6" />
          </Link>

          {/* Wishlist - ELEVATED ICON */}
          <div className="relative">
            <button
              aria-label="Wishlist"
              onClick={() => {
                if (!requireAuth('wishlist', `/properties/${city}`)) return
                setShowWishlist(!showWishlist)
              }}
              className={`
                w-9 h-9 flex items-center justify-center rounded-md
                ${showWishlist ? "bg-emerald-600 text-white" : "bg-white text-gray-400 hover:text-emerald-600"}
              `}
            >
              <Heart 
                            className={`w-5 h-5 transition-colors ${
                              showWishlist 
                                ? "fill-emerald-600 text-emerald-600" 
                                : "text-slate-700"
                            }`} 
                          />
            </button>
            
          </div>

          {/* Chat */}
          <button
            onClick={toggleChat}
            className="flex flex-col items-center justify-center gap-1 w-12 text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Profile */}
          <div className="relative w-12 flex justify-center">
             <button 
                onClick={() => setShowMobileProfileSheet(true)}
                className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors"
             >
                {user ? (
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 text-[10px]">
                      {user.name?.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="w-6 h-6" />
                )}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Profile Sheet */}
      <Sheet open={showMobileProfileSheet} onOpenChange={setShowMobileProfileSheet}>
        <SheetContent side="right"> 
           <SheetTitle>Profile</SheetTitle>
           <div className="p-4">
             {user ? <Button onClick={logout} className="w-full" variant="destructive">Logout</Button> : <Link href="/auth/login"><Button className="w-full">Login</Button></Link>}
           </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}