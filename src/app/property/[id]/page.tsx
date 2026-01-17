"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AuthLoading } from "@/components/auth-loading"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import {
  MapPin,
  Star,
  Heart,
  Share,
  Share2,
  Phone,
  Mail,
  User,
  Wifi,
  Car,
  Utensils,
  Wind,
  Users,
  ShieldCheck,
  ChevronRight,
  Clock,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
  LayoutGrid,
  Trophy,
  DoorOpen,
  Calendar,
  Flag,
  Zap,
  Droplets,
  Tv
} from "lucide-react"

// --- Map Component (Kept as provided) ---
function PropertyMap({ address, mapLink }: { address: any; mapLink?: string }) {
  let src = '';
  if (mapLink) {
    if (mapLink.includes('google.com/maps')) {
      if (mapLink.includes('/place/') || mapLink.includes('/@')) {
        const embedUrl = mapLink.replace('/maps/', '/maps/embed?pb=').replace('?', '&')
        src = embedUrl
      } else {
        src = mapLink.includes('output=embed') ? mapLink : `${mapLink}&output=embed`
      }
    } else {
      src = mapLink
    }
  } else if (address) {
    const searchQuery = `${address.street || ''} ${address.area || ''} ${address.city || ''} Pakistan`.trim();
    const encodedQuery = encodeURIComponent(searchQuery);
    src = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  }
  
  if (!src) return null;

  return (
    <div 
      className="w-full rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow relative z-0" 
      style={{ height: '400px' }}
      onClick={() => window.open(src, "_blank")}
      title="Click to open in Google Maps"
    >
      <iframe
        title="Property Location Map"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, pointerEvents: 'none' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function PropertyDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const { user } = useAuth()
  const { toggleChat } = useChat()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const propertyId = params?.id

  // Protected contact function
  const handleProtectedContact = (contactAction: () => void) => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    contactAction()
  }

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
      } catch (error) {
        console.error('Property fetch error:', error)
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
        setReviews([])
      }
    }

    if (propertyId) {
      fetchProperty()
      fetchReviews()
    }
  }, [propertyId])

  // Helpers
  const getImageUrl = (image: any) => {
    if (typeof image === 'string') return image
    if (typeof image === 'object' && image.url) return image.url
    return '/placeholder.svg'
  }

  const getImageUrls = () => {
    if (!propertyData?.images) return []
    return propertyData.images.map((img: any) => getImageUrl(img)).filter((url: string) => url && url.trim() !== '')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const openWhatsApp = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
    let whatsappNumber = cleanPhone
    if (!cleanPhone.startsWith('92')) {
      whatsappNumber = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : '92' + cleanPhone
    }
    const message = `Hi! I'm interested in your property "${propertyData?.title}". Can I get more info?`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  const submitReview = async () => {
    if (!session?.user || session.user.role !== 'student') return alert('Only students can submit reviews')
    if (reviewRating === 0 || !reviewComment.trim()) return alert('Please provide a rating and comment')
    
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() })
      })
      if (res.ok) {
        alert('Review submitted successfully!')
        setReviewRating(0)
        setReviewComment("")
        setShowReviewForm(false)
        // Refresh
        const reviewsRes = await fetch(`/api/properties/${propertyId}/reviews`)
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json()
          setReviews(rData.reviews || [])
        }
      } else {
        alert('Failed to submit review')
      }
    } catch (e) {
      alert('Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <AuthLoading title="Loading Property" description="Opening the doors..." fullScreen={true} />
  
  if (!propertyData) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
        <p className="text-gray-600 mb-6">This listing may have been removed or does not exist.</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8">
          <Link href="/find-rooms">Back to Search</Link>
        </Button>
      </div>
      <Footer />
    </div>
  )

  const images = getImageUrls()
  const displayRating = propertyData.rating || "New"
  const displayReviewCount = reviews.length > 0 ? `${reviews.length} reviews` : "No reviews yet"
  const locationString = propertyData.address ? `${propertyData.address.area}, ${propertyData.address.city}` : "Pakistan"

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 capitalize">
              {propertyData.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gray-900 text-gray-900" /> 
                {displayRating}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="underline decoration-gray-400 underline-offset-2 cursor-pointer">{displayReviewCount}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Guest Favorite
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="underline decoration-gray-400 underline-offset-2 capitalize">{locationString}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-200"
            >
              <Share className="w-4 h-4" /> 
              {shareCopied ? "Copied!" : "Share"}
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition border border-gray-200 ${isSaved ? "text-red-500 bg-red-50 border-red-200" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} /> 
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* 2. Premium Image Grid (Masonry Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[500px] mb-12 rounded-3xl overflow-hidden relative shadow-sm">
          {/* Main Large Image (Left) */}
          <div 
            className="md:col-span-2 h-full relative group cursor-pointer"
            onClick={() => setShowAllImages(true)}
          >
            <Image 
              src={images[0] || '/placeholder.svg'} 
              alt="Main View" 
              fill 
              className="object-cover group-hover:brightness-95 transition duration-500"
            />
          </div>

          {/* Middle Column */}
          <div className="hidden md:flex flex-col gap-2 md:col-span-1">
            <div className="h-1/2 relative group cursor-pointer" onClick={() => setShowAllImages(true)}>
              <Image src={images[1] || '/placeholder.svg'} alt="Detail 1" fill className="object-cover group-hover:brightness-95 transition duration-500" />
            </div>
            <div className="h-1/2 relative group cursor-pointer" onClick={() => setShowAllImages(true)}>
              <Image src={images[2] || '/placeholder.svg'} alt="Detail 2" fill className="object-cover group-hover:brightness-95 transition duration-500" />
            </div>
          </div>

          {/* Right Column */}
          <div className="hidden md:flex flex-col gap-2 md:col-span-1 relative">
            <div className="h-1/2 relative group cursor-pointer" onClick={() => setShowAllImages(true)}>
              <Image src={images[3] || '/placeholder.svg'} alt="Detail 3" fill className="object-cover group-hover:brightness-95 transition duration-500" />
            </div>
            <div className="h-1/2 relative group cursor-pointer" onClick={() => setShowAllImages(true)}>
              <Image src={images[4] || '/placeholder.svg'} alt="Detail 4" fill className="object-cover group-hover:brightness-95 transition duration-500" />
              {/* Show All Button Overlay */}
              <div className="absolute bottom-4 right-4 z-10">
                <button className="bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 hover:scale-105 transition">
                  <LayoutGrid className="w-4 h-4" /> Show all photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Host Header */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 capitalize">
                    {propertyData.propertyType} hosted by {propertyData.owner?.name || "Host"}
                  </h2>
                  <div className="flex items-center text-gray-600 text-base flex-wrap gap-2">
                    <span>{propertyData.totalRooms || 1} Guests</span>
                    <span>•</span>
                    <span>{propertyData.propertyType}</span>
                    <span>•</span>
                    <span>{propertyData.genderPreference}</span>
                  </div>
                </div>
                <div className="relative group cursor-pointer">
                  {propertyData.owner?.avatar ? (
                    <Image src={propertyData.owner.avatar} alt="Host" width={64} height={64} className="rounded-full border border-gray-200 object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {propertyData.isVerified && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Guest Favorite Banner */}
              {Number(displayRating) > 4.5 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex items-center gap-4 text-center sm:text-left z-10">
                    <Trophy className="w-10 h-10 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Guest favorite</h3>
                      <p className="text-gray-500 text-sm">One of the most loved homes on RoomMatchPK</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 z-10">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-gray-900">{displayRating}</div>
                      <div className="flex text-emerald-500 justify-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-gray-900">{reviews.length}</div>
                      <div className="text-xs underline text-gray-500 font-medium">Reviews</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <DoorOpen className="w-6 h-6 text-gray-700 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Self check-in</h3>
                    <p className="text-gray-500 text-sm">Check yourself in with the onsite staff.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-gray-700 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Great location</h3>
                    <p className="text-gray-500 text-sm">95% of recent guests gave the location a 5-star rating.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-gray-700 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Free cancellation</h3>
                    <p className="text-gray-500 text-sm">Flexible cancellation policy available.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this place</h2>
              <div className="prose text-gray-600 leading-relaxed max-w-none">
                <p>{propertyData.description || "No description provided."}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {propertyData.amenities?.map((amenity: string, idx: number) => {
                  let Icon = CheckCircle
                  const lower = amenity.toLowerCase()
                  if (lower.includes('wifi')) Icon = Wifi
                  if (lower.includes('ac') || lower.includes('condition')) Icon = Wind
                  if (lower.includes('kitchen') || lower.includes('food')) Icon = Utensils
                  if (lower.includes('park')) Icon = Car
                  if (lower.includes('tv')) Icon = Tv
                  return (
                    <div key={idx} className="flex items-center gap-4 text-gray-700">
                      <Icon className="w-6 h-6 text-gray-600" />
                      <span className="text-base capitalize">{amenity}</span>
                    </div>
                  )
                })}
              </div>
              {propertyData.amenities?.length > 8 && (
                <button className="mt-8 border border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition">
                  Show all amenities
                </button>
              )}
            </div>

            {/* Map Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where you'll be</h2>
              <p className="text-gray-500 mb-6">{locationString}</p>
              <PropertyMap address={propertyData.address} mapLink={propertyData.mapLink} />
            </div>

            {/* Host Section */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                {propertyData.owner?.avatar ? (
                  <Image src={propertyData.owner.avatar} alt="Host" width={64} height={64} className="rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Hosted by {propertyData.owner?.name || "Member"}</h2>
                  <p className="text-gray-500 text-sm">Joined {new Date(propertyData.createdAt).getFullYear()}</p>
                </div>
              </div>
              <div className="flex gap-6 mb-6 text-sm text-gray-600">
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Identity verified</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Superhost</span>
              </div>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg mb-6">
                Response rate: 100% <br />
                Response time: within an hour
              </p>
              <Button 
                onClick={() => handleProtectedContact(() => openWhatsApp(propertyData.contactInfo?.phone))}
                variant="outline" 
                className="border-gray-900 text-gray-900 hover:bg-gray-50"
              >
                Contact Host
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-28">
              <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-gray-200 p-6 ring-1 ring-black/5">
                
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₨{propertyData.pricing?.pricePerBed?.toLocaleString() || propertyData.pricing?.price?.toLocaleString() || "0"}
                    </span>
                    <span className="text-base text-gray-500"> / month</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" /> 
                    {displayRating} 
                    <span className="text-gray-400 font-normal underline ml-1">{reviews.length} reviews</span>
                  </div>
                </div>

                {/* Mock Date Picker UI */}
                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300 hover:bg-gray-50 cursor-pointer">
                      <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">Check-in</label>
                      <div className="text-sm text-gray-600">Add date</div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 cursor-pointer">
                      <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">Check-out</label>
                      <div className="text-sm text-gray-600">Add date</div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">Guests</label>
                      <div className="text-sm text-gray-600">1 guest</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 rotate-90" />
                  </div>
                </div>

                {/* Main Action Button */}
                <Button 
                  onClick={() => handleProtectedContact(() => openWhatsApp(propertyData.contactInfo?.phone))}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 mb-4 active:scale-[0.98]"
                >
                  Reserve
                </Button>

                <div className="text-center mb-6">
                  <span className="text-sm text-gray-500">You won't be charged yet</span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-gray-600 text-sm">
                  <div className="flex justify-between">
                    <span className="underline decoration-gray-300 cursor-help">Monthly Rent</span>
                    <span>₨{propertyData.pricing?.pricePerBed?.toLocaleString() || "0"}</span>
                  </div>
                  {propertyData.pricing?.securityDeposit && (
                    <div className="flex justify-between">
                      <span className="underline decoration-gray-300 cursor-help">Security Deposit</span>
                      <span>₨{propertyData.pricing.securityDeposit.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>₨{((propertyData.pricing?.pricePerBed || 0) + (propertyData.pricing?.securityDeposit || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Report Flag */}
              <div className="mt-6 flex justify-center gap-2 text-gray-500 text-sm items-center cursor-pointer hover:underline">
                <Flag className="w-4 h-4" />
                <span>Report this listing</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Reviews Section (Clean & Simple) */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <Star className="w-6 h-6 fill-gray-900 text-gray-900" />
            <h2 className="text-2xl font-bold text-gray-900">
              {displayRating} · {reviews.length} reviews
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.length > 0 ? reviews.map((review: any, i: number) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.studentName || "Student"}</h4>
                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {review.comment}
                </p>
                {/* Rating Stars for review */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} className={`w-3 h-3 ${starIdx < review.rating ? "fill-gray-900" : "text-gray-300"}`} />
                  ))}
                </div>
              </div>
            )) : (
              <p className="text-gray-500 italic">No reviews yet. Be the first to leave one!</p>
            )}
          </div>
          
          {/* Write Review Button */}
          {session?.user?.role === 'student' && (
            <div className="mt-10">
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="border-gray-900 text-gray-900"
              >
                Write a review
              </Button>
              
              {showReviewForm && (
                <div className="mt-6 max-w-lg p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-bold mb-4">Share your experience</h4>
                  <div className="flex gap-2 mb-4">
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-6 h-6 cursor-pointer ${star <= reviewRating ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>
                  <Textarea 
                    value={reviewComment} 
                    onChange={e => setReviewComment(e.target.value)} 
                    placeholder="Tell us about your stay..." 
                    className="bg-white mb-4"
                  />
                  <Button onClick={submitReview} disabled={submittingReview} className="bg-gray-900 text-white hover:bg-black">
                    {submittingReview ? "Submitting..." : "Post Review"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      <Footer />

      {/* Image Modal */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black z-[100] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button 
              onClick={() => setShowAllImages(false)} 
              className="fixed top-8 left-8 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
              {getImageUrls().map((url, i) => (
                <div key={i} className={`relative ${i % 3 === 0 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                  <Image src={url} alt={`Gallery ${i}`} fill className="object-cover rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}