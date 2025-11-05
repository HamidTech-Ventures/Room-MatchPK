"use client"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Car, Utensils, AirVent, Users, Heart, Share2, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"

interface Property {
  _id: string
  title: string
  address: {
    area: string
    city: string
    street: string
  }
  pricing: {
    pricePerBed: number
    securityDeposit?: number
  }
  rating?: number
  totalReviews?: number
  images: Array<{
    url: string
    publicId: string
    isActive: boolean
    uploadedAt: string
  }>
  amenities: string[]
  propertyType: string
  genderPreference: string
  isVerified: boolean
  isActive: boolean
  availableRooms?: number
  totalRooms?: number
}

interface FeaturedPropertiesProps {
  limit?: number
}

export function FeaturedProperties({ limit = 6 }: FeaturedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  
  // Animation refs
  const headerRef = useScrollAnimation(0.2);
  const gridRef = useStaggeredAnimation(100);
  const ctaRef = useScrollAnimation(0.1);

  // Add console log to ensure component is mounting
  useEffect(() => {
    console.log('🏠 FeaturedProperties component mounted!')
  }, [])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        console.log('Fetching featured properties for home page...')
        
        // Use the new featured properties endpoint with relaxed filtering
        const response = await fetch('/api/properties/featured?limit=' + limit)
        console.log('Featured API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Featured API Response data:', data)
          
          if (data.success && Array.isArray(data.properties)) {
            console.log('Found featured properties:', data.properties.length)
            setProperties(data.properties)
            setError(null)
          } else {
            console.warn('Invalid response format or no featured properties:', data)
            
            // Try to get any properties from the regular endpoint as fallback
            console.log('Trying regular properties endpoint as fallback...')
            const fallbackResponse = await fetch('/api/properties?limit=' + limit)
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              console.log('Fallback response:', fallbackData)
              
              if (fallbackData.success && Array.isArray(fallbackData.properties)) {
                setProperties(fallbackData.properties)
                setError(null)
              } else {
                setError('No properties found in database')
              }
            } else {
              setError('Failed to load properties from both endpoints')
            }
          }
        } else {
          console.error('Featured API call failed with status:', response.status)
          setError(`Featured API call failed with status: ${response.status}`)
        }
      } catch (err) {
        console.error('Error fetching featured properties:', err)
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [limit])

  const handleViewAllProperties = () => {
    // Navigate to find-rooms page instead of login
    router.push('/find-rooms')
  }

  const handleViewDetails = (propertyId: string) => {
    // Allow all users to view property details
    router.push(`/property/${propertyId}`)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Properties</h2>
            <p className="text-lg text-slate-600">Loading amazing properties...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                <div className="h-36 bg-slate-200 rounded-t-xl"></div>
                <div className="p-3 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || properties.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">No Properties Available</h2>
            <p className="text-lg text-slate-600 mb-4">
              {error || "No properties found at the moment."}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Debug: Loading state was {loading ? 'true' : 'false'}, 
              Properties count: {properties.length},
              Error: {error || 'none'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/list-property">List Your Property</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div 
            ref={headerRef}
            className="text-center mb-16 animate-on-scroll"
          >
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mb-4 smooth-transition hover:scale-105">🏆 Hand-picked Properties</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Featured <span className="text-emerald-600">Accommodations</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover our premium selection of verified student accommodations across Pakistan's major cities.
          </p>
        </div>

        {/* Properties Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {properties.map((property: Property, index) => (
            <Card
              key={property._id}
              className="group hover:shadow-xl smooth-transition overflow-hidden border-0 bg-white relative animate-on-scroll hover:scale-102"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <Image
                  src={property.images?.[0]?.url || "/placeholder.svg"}
                  alt={property.title || "Property image"}
                  width={300}
                  height={200}
                  className="w-full h-44 object-cover group-hover:scale-110 smooth-transition"
                  priority={false}
                  unoptimized={false}
                />

                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {property.isVerified && (
                    <Badge className="bg-green-500 text-white shadow-lg text-xs px-2 py-1 smooth-transition hover:scale-105">✓ Verified</Badge>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex flex-col space-y-2">
                  <Badge className="bg-blue-500 text-white shadow-lg text-xs px-2 py-1 smooth-transition hover:scale-105">{property.propertyType}</Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 smooth-transition">
                  <Button size="sm" variant="ghost" className="hover:bg-white/20 p-2 h-8 w-8 smooth-transition hover:scale-110">
                    <Heart className="w-4 h-4 text-white hover:text-red-500 transition-colors stroke-2" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white shadow-lg h-8 w-8 p-2 smooth-transition hover:scale-110">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Count */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                    📷 {property.images.length}
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Title and Rating */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 smooth-transition line-clamp-1 flex-1 mr-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-700">{property.rating || 'New'}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-slate-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400 flex-shrink-0" />
                  <span className="text-sm truncate">{property.address.area}, {property.address.city}</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {property.amenities.slice(0, 2).map((amenity: string) => (
                    <Badge key={amenity} variant="outline" className="text-xs bg-slate-50 hover:bg-slate-100 px-2 py-1 h-auto smooth-transition hover:scale-105">
                      {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3 mr-1" />}
                      {amenity.toLowerCase().includes('ac') && <AirVent className="w-3 h-3 mr-1" />}
                      {amenity.toLowerCase().includes('food') && <Utensils className="w-3 h-3 mr-1" />}
                      {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3 mr-1" />}
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 2 && (
                    <Badge variant="outline" className="text-xs bg-slate-50 px-2 py-1 h-auto">
                      +{property.amenities.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Pricing and CTA */}
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-emerald-600">
                        ₨{property.pricing.pricePerBed?.toLocaleString() || 'N/A'}
                      </span>
                      <span className="text-sm text-slate-600">/bed</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg text-sm px-4 py-2 h-8 smooth-transition hover:scale-105 hover:shadow-pop"
                    onClick={() => handleViewDetails(property._id)}
                  >
                    View Details
                  </Button>
                </div>

                {/* Occupancy */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-1 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Available: {property.availableRooms || 0}</span>
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">🔥 Verified</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div 
          ref={ctaRef}
          className="text-center mt-12 animate-on-scroll"
        >
          <Button
            onClick={handleViewAllProperties}
            size="lg"
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-transparent px-8 py-3 text-lg smooth-transition hover:scale-105 hover:shadow-pop"
          >
            View All Properties
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
