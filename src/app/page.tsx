"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { BannerSection } from "@/components/banner-section"
import { FeaturedProperties } from "@/components/featured-properties"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"
import { ClientOnly } from "@/components/client-only"

const featuredHostels = [
  {
    id: 1,
    name: "University Heights Hostel",
    location: "Lahore, Pakistan",
    price: 15000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
    amenities: ["Wi-Fi", "AC", "Food", "Parking"],
    type: "Boys",
    badge: "Featured",
  },
  {
    id: 2,
    name: "Green Valley Girls Hostel",
    location: "Karachi, Pakistan",
    price: 12000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    amenities: ["Wi-Fi", "Laundry", "Security", "Study Room"],
    type: "Girls",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Metro Student Lodge",
    location: "Islamabad, Pakistan",
    price: 18000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    amenities: ["Wi-Fi", "AC", "Gym", "Food"],
    type: "Mixed",
    badge: "Premium",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <ClientOnly>
        <Navbar />
        <HeroSection />
        <BannerSection />
        <FeaturedProperties hostels={featuredHostels} />
        <StatsSection />
        <Footer />
      </ClientOnly>
    </div>
  )
}
