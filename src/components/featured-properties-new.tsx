"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Car, Utensils, AirVent, Users, Heart, Share2, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

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
  images: string[]
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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/properties/verified')
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.properties)) {
            // Filter for active and verified properties, limit the results
            const activeProperties = data.properties
              .filter((p: Property) => p.isActive && p.isVerified)
              .slice(0, limit)
            setProperties(activeProperties)
          } else {
            console.warn('Invalid response format:', data)
            setProperties([])
          }
        } else {
          console.error('Failed to fetch properties:', response.status)
          setError('Failed to load properties')
        }
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError('Failed to load properties')
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
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
            <p className="text-lg text-slate-600 mb-8">
              {error || "No verified properties found at the moment. Check back soon!"}
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/list-property">List Your Property</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mb-4">🏆 Hand-picked Properties</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Featured <span className="text-emerald-600">Accommodations</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover our premium selection of verified student accommodations with the best amenities, locations, and
            value for money across Pakistan.
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: Property) => (
            <Card
              key={property._id}
              className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white relative"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <Image
                  src={property.images?.[0] || "/placeholder.svg"}
                  alt={property.title}
                  width={500}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {property.isVerified && (
                    <Badge className="bg-green-500 text-white shadow-lg">✓ Verified</Badge>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <Badge className="bg-blue-500 text-white shadow-lg">{property.propertyType}</Badge>
                  <Badge className="bg-purple-500 text-white shadow-lg">{property.genderPreference}</Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" variant="ghost" className="hover:bg-transparent p-1">
                    <Heart className="w-4 h-4 text-white hover:text-red-500 transition-colors stroke-2" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white shadow-lg">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Count */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                    📷 {property.images.length} photos
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                {/* Title and Rating */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-700">{property.rating || 'New'}</span>
                    {property.totalReviews && property.totalReviews > 0 && (
                      <span className="text-xs text-yellow-600">({property.totalReviews})</span>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="text-sm">{property.address.area}, {property.address.city}</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 4).map((amenity: string) => (
                    <Badge key={amenity} variant="outline" className="text-xs bg-slate-50 hover:bg-slate-100">
                      {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3 mr-1" />}
                      {amenity.toLowerCase().includes('ac') && <AirVent className="w-3 h-3 mr-1" />}
                      {amenity.toLowerCase().includes('food') && <Utensils className="w-3 h-3 mr-1" />}
                      {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3 mr-1" />}
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      +{property.amenities.length - 4} more
                    </Badge>
                  )}
                </div>

                {/* Pricing and CTA */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        ₨{property.pricing.pricePerBed?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">per bed</span>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                    onClick={() => handleViewDetails(property._id)}
                  >
                    View Details
                  </Button>
                </div>

                {/* Occupancy */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Available: {property.availableRooms || 0}</span>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">🔥 Verified</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            onClick={handleViewAllProperties}
            size="lg"
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-transparent"
          >
            View All Properties
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
