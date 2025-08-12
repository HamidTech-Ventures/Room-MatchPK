"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">RoomMatch PK</span>
                <div className="text-xs text-slate-400 -mt-1">Find Your Home</div>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Pakistan's most trusted platform connecting students with safe, affordable, and comfortable accommodations
              across the country.
            </p>
            <div className="flex space-x-4">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { href: "/find-rooms", label: "Find Rooms" },
                { href: "/list-property", label: "List Property" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/blog", label: "Blog" },
                { href: "/help", label: "Help Center" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Popular Cities</h3>
            <ul className="space-y-4">
              {[
                { href: "/lahore", label: "Lahore" },
                { href: "/karachi", label: "Karachi" },
                { href: "/islamabad", label: "Islamabad" },
                { href: "/faisalabad", label: "Faisalabad" },
                { href: "/multan", label: "Multan" },
                { href: "/peshawar", label: "Peshawar" },
              ].map((city) => (
                <li key={city.href}>
                  <Link href={city.href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-slate-400 mb-4">
              Get the latest properties and exclusive deals delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                Subscribe
              </Button>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-4 h-4" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>info@roommatchpk.com</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Lahore, Pakistan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">© 2025 RoomMatch PK. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
