"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Users, MapPin, Star } from "lucide-react"
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"

export function BannerSection() {
  const router = useRouter()
  
  // Animation refs
  const section1Ref = useScrollAnimation(0.1);
  const section2Ref = useScrollAnimation(0.1);
  const section3Ref = useScrollAnimation(0.1);

  const handleButtonClick = () => {
    // Redirect to login page when any banner button is clicked
    router.push('/auth/login')
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===== SECTION 1: SAFE & VERIFIED HOUSING ===== */}
        <div 
          ref={section1Ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16 animate-on-scroll"
        >
          <div className="space-y-5">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 smooth-transition hover:scale-105">
              🏆 Pakistan's Most Trusted Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Safe & Verified
              <span className="text-emerald-600"> Student Housing</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Every property on our platform goes through rigorous verification. We ensure safety, cleanliness, and
              authenticity so you can focus on your studies with peace of mind.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-pop smooth-transition">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">100% Verified</div>
                  <div className="text-xs text-slate-600">All properties checked</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-pop smooth-transition">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">24/7 Support</div>
                  <div className="text-xs text-slate-600">Always here to help</div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg smooth-transition hover:scale-105 hover:shadow-pop"
            >
              Explore Verified Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="relative animate-on-scroll-right">
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
            <Image
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=300&fit=crop"
              alt="Verified Student Housing"
              width={500}
              height={300}
              className="relative rounded-xl shadow-xl object-cover hover:scale-105 smooth-transition"
            />
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Verified Property</div>
                  <div className="text-xs text-slate-600">Safety Guaranteed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: MODERN FACILITIES & SMART LIVING ===== */}
        <div 
          ref={section2Ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16 animate-on-scroll"
        >
          <div className="relative order-2 lg:order-1 animate-on-scroll-left">
            <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <Image
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop"
              alt="Modern Student Accommodation"
              width={500}
              height={300}
              className="relative rounded-xl shadow-xl object-cover hover:scale-105 smooth-transition"
            />
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">4.9★ Rating</div>
                  <div className="text-xs text-slate-600">Premium Quality</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5 order-1 lg:order-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 smooth-transition hover:scale-105">✨ Premium Experience</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Modern Facilities &<span className="text-purple-600"> Smart Living</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Experience the future of student living with high-speed internet, modern amenities, study spaces, and
              community areas designed for today's students.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-pop smooth-transition">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📶</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">High-Speed Internet</div>
                  <div className="text-xs text-slate-600">Perfect for online classes and streaming</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-pop smooth-transition">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📚</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Study Spaces</div>
                  <div className="text-xs text-slate-600">Quiet zones for focused learning</div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg smooth-transition hover:scale-105 hover:shadow-pop"
            >
              View Premium Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* ===== SECTION 3: NATIONWIDE COVERAGE ===== */}
        <div 
          ref={section3Ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-on-scroll"
        >
          <div className="space-y-5">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 smooth-transition hover:scale-105">🌍 Nationwide Coverage</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Find Your Home in
              <span className="text-blue-600"> 50+ Cities</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              From Lahore to Karachi, Islamabad to Faisalabad - we've got you covered. Discover quality accommodations
              in every major city across Pakistan.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {["Lahore", "Karachi", "Islamabad", "Faisalabad", "Multan", "Peshawar"].map((city, index) => (
                <div
                  key={city}
                  className="text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-pop smooth-transition hover:scale-105 animate-on-scroll"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-slate-800">{city}</div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg smooth-transition hover:scale-105 hover:shadow-pop"
            >
              Explore All Cities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="relative animate-on-scroll-right">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <Image
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop"
              alt="Cities Coverage"
              width={500}
              height={300}
              className="relative rounded-xl shadow-xl object-cover hover:scale-105 smooth-transition"
            />
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">50+ Cities</div>
                  <div className="text-xs text-slate-600">Nationwide Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}