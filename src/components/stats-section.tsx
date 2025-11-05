"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building, MapPin, Star, TrendingUp, Shield } from "lucide-react"
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/use-scroll-animation"

const stats = [
  {
    icon: Users,
    value: 15000,
    label: "Happy Students",
    suffix: "+",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Building,
    value: 2500,
    label: "Verified Properties",
    suffix: "+",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    icon: MapPin,
    value: 75,
    label: "Cities Covered",
    suffix: "+",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Star,
    value: 4.9,
    label: "Average Rating",
    suffix: "★",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
]

export function StatsSection() {
  const [counters, setCounters] = useState(stats.map(() => 0))
  
  // Animation refs
  const headerRef = useScrollAnimation(0.2);
  const statsRef = useStaggeredAnimation(150);
  const ctaRef = useScrollAnimation(0.1);

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    stats.forEach((stat, index) => {
      let currentStep = 0
      const increment = stat.value / steps

      const timer = setInterval(() => {
        currentStep++
        const currentValue = Math.min(increment * currentStep, stat.value)

        setCounters((prev) => {
          const newCounters = [...prev]
          newCounters[index] = currentValue
          return newCounters
        })

        if (currentStep >= steps) {
          clearInterval(timer)
        }
      }, stepDuration)
    })
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className="text-center mb-16 animate-on-scroll"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Trusted by <span className="text-emerald-400">Thousands</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Join the growing community of students who found their perfect accommodation through our platform
          </p>
          
          {/* Safety Verification Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-4 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full px-8 py-4 smooth-transition hover:scale-105 hover:bg-emerald-500/30">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-emerald-300 font-bold text-xl">100% Safety Verified</div>
                <div className="text-emerald-200 text-base">All properties safety checked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div 
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 smooth-transition group animate-on-scroll hover:scale-105 hover:shadow-glow"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 lg:p-8 text-center">
                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 smooth-transition`}
                >
                  <stat.icon className={`w-7 h-7 lg:w-8 lg:h-8 ${stat.color}`} />
                </div>

                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {stat.value === 4.9 ? counters[index].toFixed(1) : Math.floor(counters[index]).toLocaleString()}
                    <span className="text-emerald-400">{stat.suffix}</span>
                  </div>

                  <div className="text-base lg:text-lg font-semibold text-slate-200">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div 
          ref={ctaRef}
          className="text-center mt-12 animate-on-scroll"
        >
          <div className="inline-flex items-center space-x-3 bg-emerald-500/20 backdrop-blur-sm rounded-full px-6 py-3 text-emerald-300 smooth-transition hover:scale-105 hover:bg-emerald-500/30">
            <TrendingUp className="w-5 h-5" />
            <span className="text-base font-medium">Growing every day with new students and properties</span>
          </div>
        </div>
      </div>
    </section>
  )
}
