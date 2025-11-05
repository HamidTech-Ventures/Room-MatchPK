"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthLoading } from "@/components/auth-loading"
import {
  ArrowLeft,
  MapPin,
  Star,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Wifi,
  Car,
  Utensils,
  AirVent,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
  Home,
} from "lucide-react"
import { useParams } from "next/navigation"

export default function PropertyDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingOwnerDetails, setLoadingOwnerDetails] = useState(false)
  const [showImagePopup, setShowImagePopup] = useState(false)
  const [popupImageSrc, setPopupImageSrc] = useState("")
  const [popupImageAlt, setPopupImageAlt] = useState("")
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
          setCurrentImageIndex(0) // Reset image index when property data changes
        } else {
          setPropertyData(null)
        }
      } catch {
        setPropertyData(null)
      } finally {
        setLoading(false)
      }
    }
    if (propertyId) fetchProperty()
  }, [propertyId])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!propertyId) return
      setLoadingReviews(true)
      try {
        const res = await fetch(`/api/properties/${propertyId}/reviews`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [propertyId])

  // Keyboard support for popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImagePopup) {
        closeImagePopup()
      }
    }

    if (showImagePopup) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showImagePopup])

  // Helper function to get image URL from different formats
  const getImageUrl = (image: any): string => {
    if (!image) return "/placeholder.svg"
    
    // If it's a string, return it directly (but check if it's not empty)
    if (typeof image === 'string') {
      return image.trim() || "/placeholder.svg"
    }
    
    // If it's an object with url property
    if (typeof image === 'object' && image.url) {
      return image.url.trim() || "/placeholder.svg"
    }
    
    return "/placeholder.svg"
  }

  // Helper function to get valid images array
  const getValidImages = () => {
    if (!propertyData?.images || !Array.isArray(propertyData.images)) return []
    
    return propertyData.images.filter((image: any) => {
      const url = getImageUrl(image)
      return url !== "/placeholder.svg" && url.length > 0
    })
  }

  const nextImage = () => {
    const validImages = getValidImages()
    if (validImages.length === 0) return
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    const validImages = getValidImages()
    if (validImages.length === 0) return
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  // Popup functions
  const openImagePopup = (imageSrc: string, imageAlt: string) => {
    setPopupImageSrc(imageSrc)
    setPopupImageAlt(imageAlt)
    setShowImagePopup(true)
  }

  const closeImagePopup = () => {
    setShowImagePopup(false)
    setPopupImageSrc("")
    setPopupImageAlt("")
  }

  // Handle tab changes with loading states
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "owner") {
      setLoadingOwnerDetails(true)
      // Simulate loading owner details
      setTimeout(() => {
        setLoadingOwnerDetails(false)
      }, 1000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
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
    const message = `Hi! I'm an admin from RoomMatch PK regarding your property "${propertyData?.title}" at ${propertyData?.address?.area}, ${propertyData?.address?.city}.`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    window.open(whatsappUrl, "_blank")
  }

  const openEmail = (email: string) => {
    const subject = `RoomMatch PK - Property Inquiry: ${propertyData?.title}`
    const body = `Hi,\n\nI'm an admin from RoomMatch PK regarding your property "${propertyData?.title}" at ${propertyData?.address?.area}, ${propertyData?.address?.city}.\n\nPlease contact us for any property-related matters.\n\nBest regards,\nRoomMatch PK Admin Team`
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, "_blank")
  }

  if (loading) {
    return <AuthLoading title="Loading Property" description="Fetching property details..." fullScreen={true} />
  }
  if (!propertyData) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Property not found.</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 text-slate-600 hover:text-emerald-600" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Property Info Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getStatusColor(propertyData.isVerified ? 'approved' : 'pending')}>
                      {propertyData.isVerified ? 'Approved' : 'Pending'}
                    </Badge>
                    <Badge variant="outline">{propertyData.propertyType}</Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{propertyData.title}</h2>
                  <div className="flex items-center text-slate-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {(() => {
                        // Handle structured address object
                        if (propertyData.address && typeof propertyData.address === 'object') {
                          const area = propertyData.address.area || ''
                          const city = propertyData.address.city || ''
                          if (area && city) return `${area}, ${city}`
                          if (city) return city
                          if (area) return area
                        }
                        // Fallback to individual fields
                        const area = propertyData.area || ''
                        const city = propertyData.city || ''
                        if (area && city) return `${area}, ${city}`
                        if (city) return city
                        if (area) return area
                        return 'Unknown Location'
                      })()
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full w-fit">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{propertyData.rating || 0}</span>
                    <span className="text-slate-600">({propertyData.totalReviews || 0} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {propertyData.propertyType === 'hostel-mess' ? 'Monthly Charges:' : 'Monthly Rent:'}
                    </span>
                    <span className="font-semibold text-emerald-600">₨{propertyData.pricing?.pricePerBed ? propertyData.pricing.pricePerBed.toLocaleString() : '0'}</span>
                  </div>
                  {propertyData.propertyType !== 'hostel-mess' && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Security Deposit:</span>
                      <span className="font-semibold">₨{propertyData.pricing?.securityDeposit ? propertyData.pricing.securityDeposit.toLocaleString() : '0'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {propertyData.propertyType === 'hostel-mess' ? 'Capacity:' : 'Occupancy:'}
                    </span>
                    <span className="font-semibold">
                      {propertyData.propertyType === 'hostel-mess' 
                        ? `${(propertyData.totalRooms || 0) - (propertyData.availableRooms || 0)}/${propertyData.totalRooms || 0} people`
                        : `${(propertyData.totalRooms || 0) - (propertyData.availableRooms || 0)}/${propertyData.totalRooms || 0} rooms`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Available:</span>
                    <span className="font-semibold text-green-600">
                      {propertyData.propertyType === 'hostel-mess' 
                        ? `${propertyData.availableRooms || 0} spots`
                        : `${propertyData.availableRooms || 0} rooms`
                      }
                    </span>
                  </div>
                  {propertyData.propertyType === 'hostel-mess' && propertyData.messType && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mess Type:</span>
                      <span className="font-semibold capitalize">{propertyData.messType}</span>
                    </div>
                  )}
                  {propertyData.propertyType === 'hostel-mess' && propertyData.deliveryAvailable && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery:</span>
                      <span className="font-semibold text-green-600">Available</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Admin Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700 text-sm">Admin Actions</h4>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Property
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Property
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Flag for Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white shadow-lg rounded-xl p-2">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="images" className="text-xs sm:text-sm">
                  Images
                </TabsTrigger>
                <TabsTrigger value="owner" className="text-xs sm:text-sm">
                  Owner
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs sm:text-sm">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs sm:text-sm">
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Property Description</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">{propertyData.description || 'No description available.'}</p>
                  </CardContent>
                </Card>

                {/* Amenities - Hide for mess properties */}
                {propertyData.propertyType !== 'hostel-mess' && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Amenities</h3>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(propertyData.amenities) && propertyData.amenities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {propertyData.amenities.map((amenity: string, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-slate-600">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No amenities listed.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">
                      {propertyData.propertyType === 'hostel-mess' ? 'Mess Rules' : 'House Rules'}
                    </h3>
                  </CardHeader>
                  <CardContent>
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
                        <ul className="space-y-2">
                          {rulesArray.map((rule: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-600 leading-relaxed">{rule.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 text-sm">
                          {propertyData.propertyType === 'hostel-mess' ? 'No mess rules listed.' : 'No house rules listed.'}
                        </p>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Mess-specific details */}
                {propertyData.propertyType === 'hostel-mess' && (
                  <>
                    {/* Service Timings */}
                    {propertyData.timings && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Service Timings</h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600 capitalize">
                            {propertyData.timings.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Food Timings */}
                    {propertyData.foodTimings && Object.entries(propertyData.foodTimings).some(([_, timing]: [string, any]) => timing.enabled) && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Meal Timings</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(propertyData.foodTimings).map(([mealType, timing]: [string, any]) => (
                              timing.enabled && (
                                <div key={mealType} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="font-medium capitalize">{mealType}</span>
                                  <span className="text-slate-600">{timing.startTime} - {timing.endTime}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Food Pricing */}
                    {propertyData.foodPricing && (propertyData.foodPricing.monthlyPrice || propertyData.foodPricing.perMealPrice) && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Food Pricing</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {propertyData.foodPricing.included && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-slate-600">Food included in accommodation</span>
                              </div>
                            )}
                            {propertyData.foodPricing.monthlyPrice && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Monthly Food Price:</span>
                                <span className="font-semibold text-emerald-600">PKR {Number(propertyData.foodPricing.monthlyPrice).toLocaleString()}</span>
                              </div>
                            )}
                            {propertyData.foodPricing.perMealPrice && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Per Meal Price:</span>
                                <span className="font-semibold text-emerald-600">PKR {Number(propertyData.foodPricing.perMealPrice).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Food Options */}
                    {propertyData.foodOptions && (propertyData.foodOptions.veg || propertyData.foodOptions.nonVeg || propertyData.foodOptions.halal || propertyData.foodOptions.customDiet) && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Food Options</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {propertyData.foodOptions.veg && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">Vegetarian</Badge>
                            )}
                            {propertyData.foodOptions.nonVeg && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">Non-Vegetarian</Badge>
                            )}
                            {propertyData.foodOptions.halal && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Halal</Badge>
                            )}
                            {propertyData.foodOptions.customDiet && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">Custom Diet</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Delivery Information */}
                    {propertyData.deliveryAvailable && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Delivery Information</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Delivery Available:</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">Yes</Badge>
                            </div>
                            {propertyData.deliveryCharges && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Delivery Charges:</span>
                                <span className="font-medium">PKR {propertyData.deliveryCharges}</span>
                              </div>
                            )}
                            {propertyData.coverageArea && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Coverage Area:</span>
                                <span className="font-medium">{propertyData.coverageArea}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Payment Options */}
                    {propertyData.paymentOptions && (propertyData.paymentOptions.cash || propertyData.paymentOptions.jazzcash || propertyData.paymentOptions.easypaisa) && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Payment Options</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {propertyData.paymentOptions.cash && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cash</Badge>
                            )}
                            {propertyData.paymentOptions.jazzcash && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">JazzCash</Badge>
                            )}
                            {propertyData.paymentOptions.easypaisa && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">Easypaisa</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Nearby Places - Show for all property types */}
                {propertyData.nearbyUniversity && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Nearby Places</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-slate-600">{propertyData.nearbyUniversity}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    {(() => {
                      const validImages = getValidImages()
                      
                      if (validImages.length > 0) {
                        const currentImageUrl = getImageUrl(validImages[currentImageIndex])
                        
                        return (
                          <>
                            <div className="relative h-96">
                              <Image
                                src={currentImageUrl}
                                alt={propertyData.title || 'Property image'}
                                fill
                                className="object-cover rounded-t-lg"
                              />

                              {validImages.length > 1 && (
                                <>
                                  <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </button>

                                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                                    {currentImageIndex + 1} / {validImages.length}
                                  </div>
                                </>
                              )}
                            </div>

                            {validImages.length > 1 && (
                              <div className="p-4">
                                <div className="grid grid-cols-4 gap-2">
                                  {validImages.map((image: any, index: number) => {
                                    const imageUrl = getImageUrl(image)
                                    return (
                                      <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                          index === currentImageIndex ? "border-emerald-500" : "border-slate-200"
                                        }`}
                                      >
                                        <Image
                                          src={imageUrl}
                                          alt={`Property image ${index + 1}`}
                                          width={100}
                                          height={100}
                                          className="w-full h-full object-cover"
                                        />
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )
                      } else {
                        return (
                          <div className="p-8 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                              <Home className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600 mb-2">No Images Available</h3>
                            <p className="text-slate-500">This property doesn't have any images uploaded yet.</p>
                          </div>
                        )
                      }
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Owner Tab */}
              <TabsContent value="owner" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Property Owner Details</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loadingOwnerDetails ? (
                      <AuthLoading 
                        title="Loading Owner Details" 
                        description="Fetching owner information..." 
                        className="py-12"
                      />
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">Property Owner</h4>
                            <div className="flex items-center space-x-1 text-sm">
                              <Star className="w-5 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{propertyData.rating || '-'}</span>
                              <span className="text-slate-600">• Verified Property</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            {propertyData.contactInfo?.email && (
                              <Button 
                                variant="outline" 
                                className="w-full justify-start bg-transparent hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                onClick={() => openEmail(propertyData.contactInfo.email)}
                              >
                                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="truncate">{propertyData.contactInfo.email}</span>
                              </Button>
                            )}
                            {propertyData.contactInfo?.phone && (
                              <Button 
                                variant="outline" 
                                className="w-full justify-start bg-transparent hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                onClick={() => openWhatsApp(propertyData.contactInfo.phone)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                <span className="truncate">{propertyData.contactInfo.phone}</span>
                              </Button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-slate-400" />
                              <span className="text-slate-600 text-sm truncate">Property ID: {propertyData._id}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-slate-600">Owner ID:</span>
                              <span className="text-slate-800 ml-2 text-sm">{propertyData.ownerId}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Quick Actions */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-slate-700">Quick Actions</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {propertyData.contactInfo?.phone && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                onClick={() => openWhatsApp(propertyData.contactInfo.phone)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp Owner
                              </Button>
                            )}
                            {propertyData.contactInfo?.email && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                onClick={() => openEmail(propertyData.contactInfo.email)}
                              >
                                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                Email Owner
                              </Button>
                            )}
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/owner-detail/${propertyData.ownerId}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recent Reviews</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingReviews ? (
                      <div className="text-slate-500 text-sm">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review: any) => (
                        <div key={review._id} className="border-b border-slate-200 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
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
                                      ✓ Verified
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
                          <p className="text-slate-600 text-sm">{review.comment || 'No comment provided.'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-sm">No reviews yet.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Verification Status</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* CNIC Front Picture */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-800">CNIC Front Picture</h4>
                        <Badge className={propertyData.cnicPicFront ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {propertyData.cnicPicFront ? "Uploaded" : "Missing"}
                        </Badge>
                      </div>
                      <div className="w-80 h-48 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                        {propertyData.cnicPicFront ? (
                          <div 
                            className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImagePopup(getImageUrl(propertyData.cnicPicFront), "CNIC Front")}
                          >
                            <Image
                              src={getImageUrl(propertyData.cnicPicFront)}
                              alt="CNIC Front"
                              width={320}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <X className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">No CNIC front picture uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CNIC Back Picture */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-800">CNIC Back Picture</h4>
                        <Badge className={propertyData.cnicPicBack ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {propertyData.cnicPicBack ? "Uploaded" : "Missing"}
                        </Badge>
                      </div>
                      <div className="w-80 h-48 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                        {propertyData.cnicPicBack ? (
                          <div 
                            className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImagePopup(getImageUrl(propertyData.cnicPicBack), "CNIC Back")}
                          >
                            <Image
                              src={getImageUrl(propertyData.cnicPicBack)}
                              alt="CNIC Back"
                              width={320}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <X className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">No CNIC back picture uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Owner Picture */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-800">Owner Picture</h4>
                        <Badge className={propertyData.ownerPic ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {propertyData.ownerPic ? "Uploaded" : "Missing"}
                        </Badge>
                      </div>
                      <div className="w-80 h-48 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                        {propertyData.ownerPic ? (
                          <div 
                            className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openImagePopup(getImageUrl(propertyData.ownerPic), "Owner Picture")}
                          >
                            <Image
                              src={getImageUrl(propertyData.ownerPic)}
                              alt="Owner Picture"
                              width={320}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <X className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">No owner picture uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Enhanced Image Popup Modal */}
      {showImagePopup && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={closeImagePopup}
        >
          <div className="relative max-w-5xl max-h-[95vh] w-full animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={closeImagePopup}
              className="absolute -top-3 -right-3 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white hover:scale-110 transition-all duration-200 z-20 group"
            >
              <X className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
            </button>
            
            {/* Image Container */}
            <div 
              className="relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative">
                <Image
                  src={popupImageSrc}
                  alt={popupImageAlt}
                  width={1200}
                  height={800}
                  className="w-full max-h-[85vh] object-contain"
                  priority
                />
                
                {/* Gradient Overlay for Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6">
                  <div className="text-white">
                    <h3 className="text-lg font-semibold mb-1">{popupImageAlt}</h3>
                    <p className="text-white/80 text-sm">Click outside to close</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Hint */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center">
              <p>Press ESC or click outside to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
