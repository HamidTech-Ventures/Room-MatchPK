"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building, MapPin, Star, TrendingUp, Shield } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: 15000,
    label: "Happy Students",
    suffix: "+",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Students found their perfect home",
  },
  {
    icon: Building,
    value: 2500,
    label: "Verified Properties",
    suffix: "+",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    description: "Quality accommodations available",
  },
  {
    icon: MapPin,
    value: 75,
    label: "Cities Covered",
    suffix: "+",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Across Pakistan",
  },
  {
    icon: Star,
    value: 4.9,
    label: "Average Rating",
    suffix: "★",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Customer satisfaction score",
  },
  {
    icon: TrendingUp,
    value: 95,
    label: "Success Rate",
    suffix: "%",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Students find accommodation",
  },
  {
    icon: Shield,
    value: 100,
    label: "Safety Verified",
    suffix: "%",
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "All properties safety checked",
  },
]

export function StatsSection() {
  const [counters, setCounters] = useState(stats.map(() => 0))

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
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by <span className="text-emerald-400">Thousands</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Join the growing community of students who have found their perfect accommodation through RoomMatch PK
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>

                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-white">
                    {stat.value === 4.9 ? counters[index].toFixed(1) : Math.floor(counters[index]).toLocaleString()}
                    <span className="text-emerald-400">{stat.suffix}</span>
                  </div>

                  <div className="text-xl font-semibold text-slate-200">{stat.label}</div>

                  <div className="text-sm text-slate-400">{stat.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 backdrop-blur-sm rounded-full px-6 py-3 text-emerald-300">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Growing every day with new students and properties</span>
          </div>
        </div>
      </div>
    </section>
  )
}
