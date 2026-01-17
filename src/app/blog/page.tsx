"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock,
  User 
} from "lucide-react"

// Import your existing Footer
import { Footer } from "@/components/footer"

// Data for Blog Posts
const blogPosts = [
  {
    id: 1,
    title: "Hidden Gems: The Most Scenic Stays in Northern Pakistan",
    excerpt: "From Hunza to Swat, we've curated a list of breathtaking properties that offer more than just a place to sleep—they offer an experience of a lifetime.",
    category: "Travel Tips",
    author: "Zahra Malik",
    date: "March 15, 2023",
    readTime: "5 min read",
    image: "/images/blog/northern-areas.jpg", // Replace with your image paths
  },
  {
    id: 2,
    title: "The Host's Playbook: How to Get Your First 5-Star Review",
    excerpt: "Everything from professional photography tips to small gestures that make your guests feel truly at home in your space.",
    category: "Hosting Guide",
    author: "Ahmed Khan",
    date: "Feb 28, 2023",
    readTime: "12 min read",
    image: "/images/blog/hosting.jpg",
  },
  {
    id: 3,
    title: "Rise of the Nomad: Coworking Spaces and Rental Trends",
    excerpt: "Why properties with high-speed internet and dedicated workspaces are seeing a 40% increase in bookings this year.",
    category: "Property Trends",
    author: "Sami Ullah",
    date: "Jan 15, 2023",
    readTime: "6 min read",
    image: "/images/blog/coworking.jpg",
  },
  {
    id: 4,
    title: "Sustainability in Stays: Going Green without Sacrificing Luxury",
    excerpt: "Practical steps for hosts to implement eco-friendly practices while maintaining the high standards guests expect.",
    category: "Hosting Guide",
    author: "Zahra Malik",
    date: "Dec 05, 2022",
    readTime: "4 min read",
    image: "/images/blog/eco-friendly.jpg",
  },
  {
    id: 5,
    title: "Safety First: Our Top Tips for Solo Travelers in Pakistan",
    excerpt: "A comprehensive guide on navigation, cultural etiquette, and choosing verified properties for a worry-free solo trip.",
    category: "Travel Tips",
    author: "Sami Ullah",
    date: "Nov 22, 2022",
    readTime: "9 min read",
    image: "/images/blog/solo-travel.jpg",
  },
  {
    id: 6,
    title: "The Interior Aesthetic: Design Trends Guests are Loving in 2023",
    excerpt: "How minimalist architecture and local artisanal decor are transforming the rental landscape in Bahria and DHA.",
    category: "Property Trends",
    author: "Ahmed Khan",
    date: "Oct 18, 2022",
    readTime: "7 min read",
    image: "/images/blog/interior.jpg",
  },
]

const categories = ["All Posts", "Travel Tips", "Hosting Guide", "Property Trends", "Guest Safety"]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All Posts")

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar should be included automatically via layout.tsx or added here if needed */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            The RoomMatchPK Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover travel tips, hosting guides, and the latest property trends in Pakistan's premium rental market.
          </p>
        </div>

        {/* Featured Insight Section */}
        <section className="mb-20">
          <div className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gray-900 shadow-2xl transition-all duration-500">
            <div className="aspect-[21/9] w-full overflow-hidden relative">
              {/* Replace src with your actual featured image */}
              <Image 
                src="/images/blog/featured.jpg" 
                alt="Featured property scene" 
                fill
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              {/* Fallback overlay if no image */}
              <div className="absolute inset-0 bg-gray-800 opacity-60"></div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
              <div className="max-w-3xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-semibold mb-6">
                  Featured Insight
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Mastering Modern Living: Why Luxury Rentals are the Future of Karachi's Real Estate
                </h2>
                <p className="text-lg text-gray-200 mb-8 line-clamp-2 md:line-clamp-none">
                  Exploring the shifting paradigms of urban housing and how premium short-term rentals are providing sustainable alternatives for modern professionals.
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden">
                     {/* Author Avatar */}
                     <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                        <User className="w-6 h-6" />
                     </div>
                  </div>
                  <div className="text-white">
                    <p className="font-semibold">Ahmed Khan</p>
                    <p className="text-sm text-gray-300">Nov 12, 2023 • 8 min read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-gray-100 pb-8">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition outline-none"
            />
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <article key={post.id} className="group cursor-pointer flex flex-col h-full">
              {/* Image Card */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-gray-100">
                {/* Use Next/Image here. Using a placeholder div for structure if images missing */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-500">
                   {/* Replace with <Image /> when you have assets */}
                   <span className="text-4xl">🖼️</span> 
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-emerald-600">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                       <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {post.author}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-20 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm shadow-md">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition text-sm text-gray-600">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition text-sm text-gray-600">3</button>
            <span className="px-2 text-gray-400">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition text-sm text-gray-600">8</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>

      </main>

      <Footer />
    </div>
  )
}