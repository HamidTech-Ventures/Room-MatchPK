"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AuthLoading } from "@/components/auth-loading"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Logo } from "@/components/logo"
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Phone,
  Mail,
  User,
  Wifi,
  Car,
  Utensils,
  AirVent,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
  Camera,
  Navigation,
  Send,
  Building,
  LogOut,
  Settings,
  Home,
  MessageSquare,
  DollarSign,
} from "lucide-react"

export default function PropertyDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const { user, logout } = useAuth()
  const { toggleChat } = useChat()
  const [showProfile, setShowProfile] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const params = useParams()
  const propertyId = params?.id

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/properties/${propertyId}`)
        if (res.ok) {
          const data = await res.json()
          setPropertyData(data.property)
        } else {
          setPropertyData(null)
        }
      } catch {
        setPropertyData(null)
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/properties/${propertyId}/reviews`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      }
    }

    if (propertyId) {
      fetchProperty()
      fetchReviews()
    }
  }, [propertyId])

  // Helper function to get image URL from image object or string
  const getImageUrl = (image: any) => {
    if (typeof image === 'string') return image
    if (typeof image === 'object' && image.url) return image.url
    return '/placeholder.svg'
  }

  // Helper function to get images array with proper URLs
  const getImageUrls = () => {
    if (!propertyData?.images) return []
    return propertyData.images.map((img: any) => getImageUrl(img)).filter((url: string) => url && url.trim() !== '')
  }

  const nextImage = () => {
    const images = getImageUrls()
    if (images.length === 0) return
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = getImageUrls()
    if (images.length === 0) return
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openInMaps = () => {
    // Create a search query from the property address
    const address = propertyData?.address
    if (!address) return
    
    const searchQuery = `${address.street || ''} ${address.area || ''} ${address.city || ''} Pakistan`
    const encodedQuery = encodeURIComponent(searchQuery.trim())
    const url = `https://www.google.com/maps/search/${encodedQuery}`
    window.open(url, "_blank")
  }

  const openWhatsApp = (phoneNumber: string) => {
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
    
    // Add Pakistan country code if not present
    let whatsappNumber = cleanPhone
    if (!cleanPhone.startsWith('92')) {
      if (cleanPhone.startsWith('0')) {
        whatsappNumber = '92' + cleanPhone.substring(1)
      } else {
        whatsappNumber = '92' + cleanPhone
      }
    }
    
    // Create WhatsApp URL with a default message
    const message = `Hi! I'm interested in your property "${propertyData?.title}" at ${propertyData?.address?.area}, ${propertyData?.address?.city}. Can you provide more details?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    window.open(whatsappUrl, "_blank")
  }

  const openEmail = (email: string) => {
    const subject = `Inquiry about ${propertyData?.title}`
    const body = `Hi,

I'm interested in your property "${propertyData?.title}" at ${propertyData?.address?.area}, ${propertyData?.address?.city}.

Can you provide more details about:
- Availability
- Viewing schedule
- Any additional information

Thank you!`

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, "_blank")
  }

  const submitReview = async () => {
    if (!session?.user || session.user.role !== 'student') {
      alert('Only students can submit reviews')
      return
    }
    
    if (reviewRating === 0) {
      alert('Please select a rating')
      return
    }
    
    if (!reviewComment.trim()) {
      alert('Please write a review comment')
      return
    }
    
    setSubmittingReview(true)
    try {
      console.log('Submitting review:', {
        propertyId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        user: session?.user
      })
      
      const res = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim()
        })
      })
      
      console.log('Review submission response status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Review submission success:', data)
        alert('Review submitted successfully!')
        setReviewRating(0)
        setReviewComment("")
        setShowReviewForm(false)
        
        // Refresh reviews
        const reviewsRes = await fetch(`/api/properties/${propertyId}/reviews`)
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData.reviews || [])
        }
        
        // Refresh property data to update rating
        const propertyRes = await fetch(`/api/properties/${propertyId}`)
        if (propertyRes.ok) {
          const propertyData = await propertyRes.json()
          setPropertyData(propertyData.property)
        }
      } else {
        const error = await res.json()
        console.error('Review submission error response:', error)
        alert('Failed to submit review: ' + (error.error || `HTTP ${res.status}: ${res.statusText}`))
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please check your connection and try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <AuthLoading title="Loading Property" description="Fetching property details..." fullScreen={true} />
  }
  if (!propertyData) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Property not found.</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Role-specific Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="cursor-default select-none">
              <div className="flex items-center space-x-3">
                <Logo size={40} showText={false} />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800 transition-colors">
                    RoomMatch PK
                  </span>
                  <span className="text-xs text-slate-500 -mt-1">
                    {user?.role === 'admin' ? 'Admin Dashboard' :
                     user?.role === 'owner' ? 'Property Owner' :
                     'Find Your Home'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {user?.role === 'student' && (
                <Link href="/find-rooms" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Find Rooms
                </Link>
              )}
              {user?.role === 'owner' && (
                <>
                  <Link href="/list-property" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                    Add Property
                  </Link>
                  <Link href="/list-property?tab=my-properties" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                    My Properties
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Chat and User Profile */}
            <div className="flex items-center space-x-3">
              {/* Chat Button */}
              <Button
                variant="ghost"
                onClick={toggleChat}
                className="flex items-center space-x-2 hover:bg-emerald-50 text-emerald-600 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium">
                  {user?.role === 'owner' ? 'Chat with Students' : 'Chat Support'}
                </span>
              </Button>

              {/* User Profile */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-3 hover:bg-slate-100 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
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
                      {user?.role === 'student' && (
                        <Link
                          href="/my-bookings"
                          className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>My Bookings</span>
                        </Link>
                      )}
                      {user?.role === 'owner' && (
                        <Link
                          href="/list-property?tab=my-properties"
                          className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Building className="w-4 h-4" />
                          <span>My Properties</span>
                        </Link>
                      )}
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

      {/* Main Content Container with improved spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-8 text-slate-600 hover:text-emerald-600 cursor-pointer"
          onClick={() => window.history.length > 1 ? window.history.back() : null}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        {/* New Airbnb-style Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 h-96 rounded-xl overflow-hidden">
            {(() => {
              const images = getImageUrls()
              const mainImage = images[0] || '/placeholder.svg'
              const sideImages = images.slice(1, 5) // Show up to 4 additional images

              return (
                <>
                  {/* Main large image - takes 2 columns */}
                  <div className="col-span-2 relative group cursor-pointer" onClick={() => setShowAllImages(true)}>
                    <Image
                      src={mainImage}
                      alt={propertyData.title || 'Property image'}
                      fill
                      className="object-cover group-hover:brightness-90 transition-all duration-300"
                    />
                    {/* Badges on main image */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      <Badge className="bg-emerald-600 text-white">{propertyData.propertyType}</Badge>
                      {propertyData.isVerified && <Badge className="bg-green-500 text-white">✓ Verified</Badge>}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-100 text-blue-700">{propertyData.genderPreference}</Badge>
                    </div>
                  </div>

                  {/* Side images grid - takes 2 columns */}
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    {sideImages.map((imageUrl: string, index: number) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setShowAllImages(true)}
                      >
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={propertyData.title ? `${propertyData.title} image ${index + 2}` : `Property image ${index + 2}`}
                          fill
                          className="object-cover group-hover:brightness-90 transition-all duration-300"
                        />
                        {/* Show "View all photos" on last image if there are more */}
                        {index === 3 && images.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-center">
                              <Camera className="w-6 h-6 mx-auto mb-1" />
                              <span className="text-sm font-medium">+{images.length - 5} more</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Fill empty slots if less than 4 side images */}
                    {Array.from({ length: Math.max(0, 4 - sideImages.length) }).map((_, index) => (
                      <div key={`empty-${index}`} className="bg-slate-100 rounded-lg"></div>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>

          {/* View all photos button */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAllImages(true)}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Camera className="w-4 h-4 mr-2" />
              Show all {getImageUrls().length} photos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Property Header Information */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{propertyData.title}</h1>
                  <div className="flex items-center flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-black text-black" />
                      <span className="font-semibold">{propertyData.rating || 'New'}</span>
                      {propertyData.totalReviews > 0 && (
                        <>
                          <span>·</span>
                          <button className="underline hover:no-underline">
                            {propertyData.totalReviews} review{propertyData.totalReviews !== 1 ? 's' : ''}
                          </button>
                        </>
                      )}
                    </div>
                    <span>·</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <button className="underline hover:no-underline">
                        {propertyData.address ? `${propertyData.address.area || ''}, ${propertyData.address.city || ''}` : 'Unknown Location'}
                      </button>
                    </div>
                  </div>
                  {propertyData.nearbyUniversity && (
                    <div className="text-emerald-600 font-medium mt-2">📍 Near {propertyData.nearbyUniversity}</div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Property Type and Availability Info */}
              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-6">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {propertyData.propertyType}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {propertyData.genderPreference}
                </Badge>
                {propertyData.isVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ Verified
                  </Badge>
                )}
                <span>
                  {propertyData.propertyType === "hostel-mess" ?
                    `🍽️ ${propertyData.availableRooms || 0} of ${propertyData.totalRooms || 0} spots available` :
                    `🏠 ${propertyData.availableRooms || 0} of ${propertyData.totalRooms || 0} rooms available`
                  }
                </span>
              </div>
            </div>

            {/* Property Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">About this place</h2>
              <p className="text-slate-600 leading-relaxed">{propertyData.description || 'No description available.'}</p>
            </div>

            {/* What this place offers - Amenities */}
            {Array.isArray(propertyData.amenities) && propertyData.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyData.amenities.map((amenity: string, index: number) => {
                    // Map amenities to appropriate icons
                    const getAmenityIcon = (amenityName: string) => {
                      const name = amenityName.toLowerCase()
                      if (name.includes('wifi') || name.includes('internet')) return <Wifi className="w-6 h-6" />
                      if (name.includes('parking') || name.includes('car')) return <Car className="w-6 h-6" />
                      if (name.includes('food') || name.includes('meal') || name.includes('kitchen')) return <Utensils className="w-6 h-6" />
                      if (name.includes('ac') || name.includes('air') || name.includes('cooling')) return <AirVent className="w-6 h-6" />
                      if (name.includes('security') || name.includes('guard')) return <Shield className="w-6 h-6" />
                      if (name.includes('laundry') || name.includes('washing')) return <Home className="w-6 h-6" />
                      return <CheckCircle className="w-6 h-6" />
                    }

                    return (
                      <div key={index} className="flex items-center space-x-4 py-3">
                        <div className="text-slate-600 flex-shrink-0">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-slate-700 font-medium">{amenity}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Show all amenities button if there are many */}
                {propertyData.amenities.length > 10 && (
                  <div className="mt-6">
                    <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                      Show all {propertyData.amenities.length} amenities
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Where you'll sleep - Room Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Where you'll sleep</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Room/Bed Information */}
                <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-slate-100 rounded-lg mb-4 relative overflow-hidden">
                    {(() => {
                      const images = getImageUrls()
                      const roomImage = images.find((img: string) => img) || '/placeholder.svg'
                      return (
                        <Image
                          src={roomImage}
                          alt="Bedroom"
                          fill
                          className="object-cover"
                        />
                      )
                    })()}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {propertyData.propertyType === "hostel-mess" ? "Mess Hall" : "Bedroom"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {propertyData.propertyType === "hostel-mess"
                      ? `Dining space for ${propertyData.totalRooms || 0} people`
                      : `${propertyData.totalRooms || 0} beds available`
                    }
                  </p>
                </div>

                {/* Additional room info if available */}
                {propertyData.propertyType !== "hostel-mess" && propertyData.totalRooms > 1 && (
                  <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Shared Rooms</h3>
                    <p className="text-sm text-slate-600">
                      Multiple occupancy rooms available
                    </p>
                  </div>
                )}

                {/* Common area if applicable */}
                {propertyData.amenities?.some((amenity: string) =>
                  amenity.toLowerCase().includes('common') ||
                  amenity.toLowerCase().includes('lounge') ||
                  amenity.toLowerCase().includes('tv')
                ) && (
                  <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                      <Home className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Common Area</h3>
                    <p className="text-sm text-slate-600">
                      Shared living space with amenities
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Host Information Section */}
            {propertyData.contactInfo && (
              <div className="mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Hosted by Property Owner</h2>
                      <p className="text-slate-600">
                        {propertyData.isVerified ? 'Verified host' : 'Host'} •
                        {propertyData.totalReviews > 0 ? ` ${propertyData.totalReviews} reviews` : ' New host'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {propertyData.contactInfo.phone && (
                      <Button
                        variant="outline"
                        onClick={() => openWhatsApp(propertyData.contactInfo.phone)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact host
                      </Button>
                    )}
                  </div>
                </div>

                {/* Host details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      {propertyData.rating ? `${propertyData.rating} rating` : 'No ratings yet'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      {propertyData.isVerified ? 'Identity verified' : 'Verification pending'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Trusted by RoomMatch PK</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mess Specific Details */}
            {propertyData.propertyType === "hostel-mess" && (
              <Card className="border-0 shadow-lg mb-8">
                <CardContent className="p-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Utensils className="w-6 h-6 mr-2 text-emerald-600" />
                      Mess Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Mess Type */}
                      {propertyData.messType && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <h4 className="font-semibold text-emerald-700 mb-2">Mess Type</h4>
                          <span className="capitalize text-slate-700">{propertyData.messType}</span>
                        </div>
                      )}

                      {/* Service Timings */}
                      {(propertyData.generalTimings || propertyData.timings) && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-700 mb-2">Service Timings</h4>
                          <span className="text-slate-700">{propertyData.generalTimings || propertyData.timings}</span>
                        </div>
                      )}

                      {/* Total Capacity */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-700 mb-2">Serving Capacity</h4>
                        <span className="text-slate-700">{propertyData.totalRooms || 0} people</span>
                      </div>

                      {/* Available Spots */}
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-700 mb-2">Available Spots</h4>
                        <span className="text-slate-700">{propertyData.availableRooms || 0} spots available</span>
                      </div>
                    </div>

                    {/* Food & Meal Information */}
                    {(propertyData.foodOptions || propertyData.foodTimings || propertyData.foodPricing) && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                          <Utensils className="w-5 h-5 mr-2 text-emerald-600" />
                          Food & Meal Information
                        </h4>
                        <p className="text-slate-600">Food options and pricing information available.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Food Service Details */}
            {(propertyData.propertyType === "hostel") && propertyData.foodService && (
              <Card className="border-0 shadow-lg mb-8">
                <CardContent className="p-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Utensils className="w-6 h-6 mr-2 text-emerald-600" />
                      Food Service Details
                    </h3>
                    
                    {/* Food Service Status */}
                    <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">
                          {propertyData.foodService === "yes" ? "Food Service Available" : "Self-Cooking Only"}
                        </span>
                      </div>
                    </div>

                    {/* Food Service Details - Only show if food service is available */}
                    {propertyData.foodService === "yes" && (
                      <div className="space-y-6">
                        {/* Meal Timings */}
                        {propertyData.foodTimings && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-3">Meal Timings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(propertyData.foodTimings)
                                .filter(([_, timing]: [string, any]) => timing.enabled)
                                .map(([mealType, timing]: [string, any]) => (
                                  <div key={mealType} className="p-3 border border-slate-200 rounded-lg bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium capitalize text-slate-800">{mealType}</span>
                                      <Badge className="bg-green-100 text-green-700">Available</Badge>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {timing.startTime} - {timing.endTime}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Food Options */}
                        {propertyData.foodOptions && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-3">Food Options</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(propertyData.foodOptions)
                                .filter(([_, enabled]) => enabled)
                                .map(([option]) => (
                                  <div key={option} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm capitalize">
                                      {option === 'veg' ? 'Vegetarian' : 
                                        option === 'nonVeg' ? 'Non-Vegetarian' :
                                        option === 'halal' ? 'Halal' :
                                        option === 'customDiet' ? 'Custom Diet' : option}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Food Pricing */}
                        {propertyData.foodPricing && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-3">Food Pricing</h4>
                            <div className="p-4 bg-slate-50 rounded-lg">
                              {propertyData.foodPricing.included ? (
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  <span className="font-semibold text-emerald-700">Food Included in Rent</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {propertyData.foodPricing.monthlyPrice && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Monthly Food Price:</span>
                                      <span className="font-semibold">₨{propertyData.foodPricing.monthlyPrice}</span>
                                    </div>
                                  )}
                                  {propertyData.foodPricing.perMealPrice && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Per Meal Price:</span>
                                      <span className="font-semibold">₨{propertyData.foodPricing.perMealPrice}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Additional Food Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {propertyData.foodHygiene && (
                            <div>
                              <h4 className="text-md font-semibold text-slate-700 mb-2">Hygiene Standards</h4>
                              <p className="text-slate-600 text-sm">{propertyData.foodHygiene}</p>
                            </div>
                          )}
                          
                          {propertyData.foodStaff && (
                            <div>
                              <h4 className="text-md font-semibold text-slate-700 mb-2">Staff Details</h4>
                              <p className="text-slate-600 text-sm">{propertyData.foodStaff}</p>
                            </div>
                          )}
                          
                          {propertyData.foodCapacity && (
                            <div>
                              <h4 className="text-md font-semibold text-slate-700 mb-2">Dining Capacity</h4>
                              <p className="text-slate-600 text-sm">{propertyData.foodCapacity} people</p>
                            </div>
                          )}
                          
                          {propertyData.foodMenuRotation && (
                            <div>
                              <h4 className="text-md font-semibold text-slate-700 mb-2">Menu Rotation</h4>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-600 text-sm">Weekly menu rotation available</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Special Requirements */}
                        {propertyData.foodSpecialRequirements && (
                          <div>
                            <h4 className="text-md font-semibold text-slate-700 mb-2">Special Food Requirements</h4>
                            <p className="text-slate-600 text-sm">{propertyData.foodSpecialRequirements}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Pricing Information */}
            {(propertyData.pricing?.maintenanceCharges || propertyData.pricing?.electricityCharges || propertyData.pricing?.waterCharges) && (
              <Card className="border-0 shadow-lg mb-8">
                <CardContent className="p-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Additional Charges</h3>
                    <div className="space-y-3">
                      {propertyData.pricing?.maintenanceCharges && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Maintenance Charges:</span>
                          <span className="font-semibold">₨{propertyData.pricing.maintenanceCharges.toLocaleString()}/month</span>
                        </div>
                      )}
                      {propertyData.pricing?.electricityCharges && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Electricity Charges:</span>
                          <span className="font-semibold">{propertyData.pricing.electricityCharges}</span>
                        </div>
                      )}
                      {propertyData.pricing?.waterCharges && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Water Charges:</span>
                          <span className="font-semibold">{propertyData.pricing.waterCharges}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* House Rules and Nearby Places */}
            <Card className="border-0 shadow-lg mb-8">
              <CardContent className="p-8">
                {/* House Rules */}
                {(() => {
                  // Handle rules - can be array or string
                  let rulesArray = [];
                  if (Array.isArray(propertyData.rules) && propertyData.rules.length > 0) {
                    // If it's an array, split each element by line breaks
                    rulesArray = propertyData.rules.flatMap((rule: string) => 
                      rule.split('\n').filter((line: string) => line.trim())
                    );
                  } else if (typeof propertyData.rules === 'string' && propertyData.rules.trim()) {
                    // If it's a string, split by line breaks
                    rulesArray = propertyData.rules.split('\n').filter((line: string) => line.trim());
                  }
                  
                  return rulesArray.length > 0 ? (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">House Rules</h3>
                        <ul className="space-y-2">
                          {rulesArray.map((rule: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-600 leading-relaxed">{rule.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator className="my-6" />
                    </>
                  ) : null;
                })()}

                {/* Nearby Places */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Nearby Places</h3>
                  {propertyData.nearbyUniversity ? (
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-slate-600">{propertyData.nearbyUniversity}</span>
                        </li>
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm">No nearby places listed.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-slate-800">Student Reviews</h3>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </Badge>
                  </div>
                  {session?.user?.role === 'student' && (
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      variant="outline"
                      className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    >
                      {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </Button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && session?.user?.role === 'student' && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Share Your Experience</h4>
                    
                    {/* Rating Stars */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300 hover:text-yellow-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {reviewRating === 0 && "Click to rate"}
                        {reviewRating === 1 && "Poor"}
                        {reviewRating === 2 && "Fair"}
                        {reviewRating === 3 && "Good"}
                        {reviewRating === 4 && "Very Good"}
                        {reviewRating === 5 && "Excellent"}
                      </p>
                    </div>
                    
                    {/* Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this property..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {reviewComment.length}/500 characters
                      </p>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewRating(0)
                          setReviewComment("")
                        }}
                        disabled={submittingReview}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={submitReview}
                        disabled={submittingReview || reviewRating === 0 || !reviewComment.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      >
                        {submittingReview ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {Array.isArray(reviews) && reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div key={review._id} className="border-b border-slate-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-800">{review.studentName || 'Anonymous Student'}</span>
                                {review.isVerified && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                  >
                                    ✓ Verified Student
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span>•</span>
                                <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{review.comment || 'No comment provided.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-sm">No reviews yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Booking Card */}
            <Card className="border border-slate-200 shadow-lg sticky top-8 rounded-xl">
              <CardContent className="p-6">
                {/* Pricing Header */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-1 mb-1">
                    <span className="text-2xl font-semibold text-slate-900">
                      ₨{propertyData.pricing?.pricePerBed ? propertyData.pricing.pricePerBed.toLocaleString() : '0'}
                    </span>
                    <span className="text-slate-600">
                      {propertyData.propertyType === "hostel-mess" ? "/ month" : "/ bed"}
                    </span>
                  </div>
                  {propertyData.totalReviews > 0 && (
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="w-4 h-4 fill-black text-black" />
                      <span className="font-medium">{propertyData.rating || 'New'}</span>
                      <span className="text-slate-600">·</span>
                      <button className="text-slate-600 underline hover:no-underline">
                        {propertyData.totalReviews} review{propertyData.totalReviews !== 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                  {propertyData.pricing?.securityDeposit && (
                    <div className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Security Deposit:</span> ₨{propertyData.pricing.securityDeposit.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  {/* Primary Contact Button */}
                  {propertyData.contactInfo?.phone ? (
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold cursor-pointer rounded-lg"
                      onClick={() => openWhatsApp(propertyData.contactInfo.phone)}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Host
                    </Button>
                  ) : (
                    <div className="w-full h-12 flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50">
                      <span className="text-slate-500 text-sm">Contact info not available</span>
                    </div>
                  )}

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={openInMaps}
                      className="h-11 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Map
                    </Button>
                    {propertyData.contactInfo?.email && (
                      <Button
                        variant="outline"
                        className="h-11 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        onClick={() => openEmail(propertyData.contactInfo.email)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-center text-sm text-slate-600">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>🔥 {propertyData.availableRooms || 0} rooms left</span>
                  </div>
                  <span>Free cancellation within 24 hours</span>
                </div>
              </CardContent>
            </Card>



            {/* Safety Features */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-emerald-600 mr-2" />
                  Safety & Security
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Property verified by RoomMatch PK</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Owner identity verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
