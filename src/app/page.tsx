"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { BannerSection } from "@/components/banner-section"
import { FeaturedProperties } from "@/components/featured-properties"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"
import { ClientOnly } from "@/components/client-only"
import { AnimationInitializer } from "@/components/animation-initializer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <ClientOnly>
        <AnimationInitializer />
        <Navbar />
        <HeroSection />
        <BannerSection />
        <FeaturedProperties limit={8} />
        <StatsSection />
        <Footer />
      </ClientOnly>
    </div>
  )
}
