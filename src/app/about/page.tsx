"use client"

import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  MapPin,
  Star,
  Heart,
  Target,
  Eye,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Linkedin,
} from "lucide-react"

const teamMembers = [
  {
    name: "Ahmed Hassan",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "10+ years in real estate and student housing",
    linkedin: "#",
  },
  {
    name: "Fatima Khan",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop",
    bio: "Expert in property verification and safety",
    linkedin: "#",
  },
  {
    name: "Ali Raza",
    role: "Tech Lead",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    bio: "Building the future of student housing tech",
    linkedin: "#",
  },
  {
    name: "Sara Ahmed",
    role: "Customer Success",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    bio: "Ensuring every student finds their perfect home",
    linkedin: "#",
  },
]

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every property is thoroughly verified for safety and security standards",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    icon: Heart,
    title: "Student-Centric",
    description: "We understand student needs and prioritize their comfort and convenience",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    icon: CheckCircle,
    title: "Transparency",
    description: "No hidden fees, honest reviews, and clear communication always",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a supportive community of students and property owners",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

const achievements = [
  { number: "15,000+", label: "Students Helped", icon: Users },
  { number: "2,500+", label: "Properties Listed", icon: MapPin },
  { number: "75+", label: "Cities Covered", icon: MapPin },
  { number: "4.9★", label: "Average Rating", icon: Star },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-white/20 text-white hover:bg-white/30 mb-6">🏠 About RoomMatch PK</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connecting Students with
              <span className="text-emerald-200"> Safe Homes</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              We're on a mission to make student housing accessible, safe, and affordable across Pakistan. Every student
              deserves a place they can call home while pursuing their dreams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
                Our Story
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 mb-4">Our Story</Badge>
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                Born from a Student's
                <span className="text-emerald-600"> Struggle</span>
              </h2>
              <div className="space-y-4 text-lg text-slate-600">
                <p>
                  RoomMatch PK was founded in 2020 when our CEO, Ahmed Hassan, experienced firsthand the challenges of
                  finding safe and affordable student housing in Lahore. After visiting dozens of properties and facing
                  countless disappointments, he realized there had to be a better way.
                </p>
                <p>
                  What started as a simple idea to help fellow students has grown into Pakistan's most trusted student
                  housing platform. We've helped over 15,000 students find their perfect home and continue to expand our
                  reach across the country.
                </p>
                <p>
                  Today, we're proud to be the bridge between students seeking quality accommodation and property owners
                  who want to provide safe, comfortable living spaces.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Our Story"
                width={600}
                height={400}
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Our <span className="text-emerald-600">Mission & Vision</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Driven by purpose, guided by values, and focused on making a difference in students' lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-emerald-600 mr-3" />
                <h3 className="text-2xl font-bold text-slate-800">Our Mission</h3>
              </div>
              <p className="text-lg text-slate-600">
                To revolutionize student housing in Pakistan by providing a transparent, safe, and efficient platform
                that connects students with verified accommodations, ensuring every student has access to quality
                housing that supports their academic journey.
              </p>
            </Card>

            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-2xl font-bold text-slate-800">Our Vision</h3>
              </div>
              <p className="text-lg text-slate-600">
                To become the leading student housing platform across South Asia, where every student can easily find
                safe, affordable, and comfortable accommodation, enabling them to focus on their education and personal
                growth.
              </p>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Our Core Values</h3>
            <p className="text-lg text-slate-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h4>
                <p className="text-slate-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="text-emerald-400">Achievements</span>
            </h2>
            <p className="text-xl text-slate-300">Numbers that reflect our commitment to students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 p-8 text-center">
                <achievement.icon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{achievement.number}</div>
                <div className="text-slate-300">{achievement.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Meet Our Team</Badge>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              The People Behind
              <span className="text-emerald-600"> RoomMatch PK</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A passionate team dedicated to solving student housing challenges across Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                <div className="relative">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button size="sm" variant="secondary" className="w-full bg-white/90">
                        <Linkedin className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{member.name}</h3>
                  <p className="text-emerald-600 font-medium mb-3">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join Our Mission?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Whether you're a student looking for accommodation or a property owner wanting to help students, we'd love
            to have you as part of our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
