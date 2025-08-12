"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Car, Utensils, AirVent, Users, Heart, Share2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface Hostel {
  id: number
  name: string
  location: string
  price: number
  originalPrice?: number
  rating: number
  reviews?: number
  image: string
  images?: number
  amenities: string[]
  type: string
  badge: string
  discount?: string
  verified?: boolean
  featured?: boolean
}

interface FeaturedPropertiesProps {
  hostels?: Hostel[]
}

const featuredProperties = [
  {
    id: 1,
    name: "Elite Student Residency",
    location: "DHA Phase 5, Lahore",
    price: 25000,
    originalPrice: 30000,
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=300&fit=crop",
    images: 12,
    amenities: ["Wi-Fi", "AC", "Food", "Parking", "Gym", "Laundry"],
    type: "Boys",
    badge: "Premium",
    discount: "17% OFF",
    verified: true,
    featured: true,
  },
  {
    id: 2,
    name: "Green Valley Girls Hostel",
    location: "Gulshan-e-Iqbal, Karachi",
    price: 18000,
    originalPrice: 22000,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
    images: 8,
    amenities: ["Wi-Fi", "Security", "Study Room", "Laundry"],
    type: "Girls",
    badge: "Popular",
    discount: "18% OFF",
    verified: true,
    featured: false,
  },
  {
    id: 3,
    name: "Metro Student Lodge",
    location: "F-7 Markaz, Islamabad",
    price: 32000,
    originalPrice: 35000,
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
    images: 15,
    amenities: ["Wi-Fi", "AC", "Gym", "Food", "Pool"],
    type: "Mixed",
    badge: "Luxury",
    discount: "9% OFF",
    verified: true,
    featured: true,
  },
  {
    id: 4,
    name: "University Heights",
    location: "Johar Town, Lahore",
    price: 15000,
    originalPrice: 18000,
    rating: 4.6,
    reviews: 73,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop",
    images: 6,
    amenities: ["Wi-Fi", "Food", "Security", "Study Room"],
    type: "Boys",
    badge: "Budget",
    discount: "17% OFF",
    verified: true,
    featured: false,
  },
  {
    id: 5,
    name: "Royal Girls Residence",
    location: "Model Town, Lahore",
    price: 28000,
    originalPrice: 32000,
    rating: 4.9,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
    images: 10,
    amenities: ["Wi-Fi", "AC", "Food", "Gym", "Beauty Salon"],
    type: "Girls",
    badge: "Premium",
    discount: "13% OFF",
    verified: true,
    featured: true,
  },
  {
    id: 6,
    name: "Tech Hub Co-Living",
    location: "Clifton, Karachi",
    price: 35000,
    originalPrice: 40000,
    rating: 4.8,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
    images: 18,
    amenities: ["Wi-Fi", "AC", "Coworking", "Gym", "Rooftop"],
    type: "Mixed",
    badge: "Luxury",
    discount: "13% OFF",
    verified: true,
    featured: false,
  },
]

export function FeaturedProperties({ hostels }: FeaturedPropertiesProps) {
  const router = useRouter()
  const { user } = useAuth()
  // Use passed hostels or fall back to default data
  const properties = hostels || featuredProperties

  const handleViewAllProperties = () => {
    // Redirect to login page when "View All Properties" is clicked
    router.push('/auth/login')
  }

  const handleViewDetails = (propertyId: number) => {
    if (!user) {
      router.push("/auth/login")
    } else {
      router.push(`/property/${propertyId}`)
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Premium":
        return "bg-gradient-to-r from-purple-500 to-purple-600"
      case "Luxury":
        return "bg-gradient-to-r from-amber-500 to-amber-600"
      case "Popular":
        return "bg-gradient-to-r from-blue-500 to-blue-600"
      case "Budget":
        return "bg-gradient-to-r from-green-500 to-green-600"
      default:
        return "bg-gradient-to-r from-slate-500 to-slate-600"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Boys":
        return "bg-blue-100 text-blue-700"
      case "Girls":
        return "bg-pink-100 text-pink-700"
      case "Mixed":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
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
          {properties.map((property) => (
            <Card
              key={property.id}
              className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white relative"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  width={500}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <Badge className={`${getBadgeColor(property.badge)} text-white shadow-lg`}>{property.badge}</Badge>
                  {property.discount && <Badge className="bg-red-500 text-white shadow-lg">{property.discount}</Badge>}
                  {property.featured && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <Badge className={`${getTypeColor(property.type)} shadow-lg`}>{property.type}</Badge>
                  {property.verified && <Badge className="bg-green-500 text-white shadow-lg">✓ Verified</Badge>}
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white shadow-lg">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white shadow-lg">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Count */}
                {property.images && (
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                    📷 {property.images} photos
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                {/* Title and Rating */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {property.name}
                  </h3>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-700">{property.rating}</span>
                    {property.reviews && <span className="text-xs text-yellow-600">({property.reviews})</span>}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 4).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs bg-slate-50 hover:bg-slate-100">
                      {amenity === "Wi-Fi" && <Wifi className="w-3 h-3 mr-1" />}
                      {amenity === "AC" && <AirVent className="w-3 h-3 mr-1" />}
                      {amenity === "Food" && <Utensils className="w-3 h-3 mr-1" />}
                      {amenity === "Parking" && <Car className="w-3 h-3 mr-1" />}
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
                      <span className="text-2xl font-bold text-emerald-600">₨{property.price.toLocaleString()}</span>
                      {property.originalPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          ₨{property.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-600">per bed</span>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                    onClick={() => handleViewDetails(property.id)}
                  >
                    View Details
                  </Button>
                </div>

                {/* Occupancy */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Available rooms: 3</span>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">🔥 Booking fast</div>
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
