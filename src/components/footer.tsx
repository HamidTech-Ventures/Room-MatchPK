"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/">
              <Logo size={35} variant="white" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pakistan's trusted platform connecting students with safe, affordable accommodations.
            </p>
            <div className="flex space-x-3">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent p-2 h-8 w-8"
              >
                <Facebook className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent p-2 h-8 w-8"
              >
                <Twitter className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent p-2 h-8 w-8"
              >
                <Instagram className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 bg-transparent p-2 h-8 w-8"
              >
                <Linkedin className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Quick Links & Cities Combined */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { href: "/find-rooms", label: "Find Rooms" },
                  { href: "/list-property", label: "List Property" },
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/blog", label: "Blog" },
                  { href: "/help", label: "Help Center" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4">Popular Cities</h3>
              <ul className="space-y-2">
                {[
                  { href: "/lahore", label: "Lahore" },
                  { href: "/karachi", label: "Karachi" },
                  { href: "/islamabad", label: "Islamabad" },
                  { href: "/faisalabad", label: "Faisalabad" },
                  { href: "/multan", label: "Multan" },
                  { href: "/peshawar", label: "Peshawar" },
                ].map((city) => (
                  <li key={city.href}>
                    <Link href={city.href} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                      {city.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Newsletter Combined */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Get in Touch</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Phone className="w-3 h-3" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail className="w-3 h-3" />
                <span>info@roommatchpk.com</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <MapPin className="w-3 h-3" />
                <span>Lahore, Pakistan</span>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
              />
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 h-9 text-sm"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-slate-400 text-xs">© 2025 RoomMatch PK. All rights reserved.</p>
            <div className="flex space-x-4 text-xs">
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
