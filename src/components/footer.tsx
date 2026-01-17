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
  {/* Facebook */}
  <a 
    href="https://www.facebook.com/profile.php?id=61586260544500" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Button
      size="sm"
      variant="outline"
      className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-transparent bg-transparent p-2 h-8 w-8 transition-colors"
    >
      <Facebook className="w-3 h-3" />
    </Button>
  </a>

  {/* Twitter / X */}
  <a 
    href="https://x.com/sami_noor7743" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Button
      size="sm"
      variant="outline"
      className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-transparent bg-transparent p-2 h-8 w-8 transition-colors"
    >
      <Twitter className="w-3 h-3" />
    </Button>
  </a>

  {/* Instagram */}
  <a 
    href="https://www.instagram.com/roommatch07?igsh=ZDh6em1ubXN5eXV0&utm_source=ig_contact_invite" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Button
      size="sm"
      variant="outline"
      className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-transparent bg-transparent p-2 h-8 w-8 transition-colors"
    >
      <Instagram className="w-3 h-3" />
    </Button>
  </a>

  {/* LinkedIn */}
  <a 
    href="https://www.linkedin.com/in/sami-ullah-noor-67131b255?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Button
      size="sm"
      variant="outline"
      className="border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-transparent bg-transparent p-2 h-8 w-8 transition-colors"
    >
      <Linkedin className="w-3 h-3" />
    </Button>
  </a>
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
                  { href: "https://www.codeenvisiontechnologies.com/", label: "Developed By Code Envision Technologies" },
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
                  { href: "/properties/lahore", label: "Lahore" },
                  { href: "/properties/karachi", label: "Karachi" },
                  { href: "/properties/islamabad", label: "Islamabad" },
                  { href: "/properties/faisalabad", label: "Faisalabad" },
                  { href: "/properties/multan", label: "Multan" },
                  { href: "/properties/peshawar", label: "Peshawar" },
                  { href: "/properties/sialkot", label: "Sialkot" },
                ].map((city) => (
                  <li key={city.href}>
                    <Link 
                      href={city.href} 
                      className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                    >
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
                <span>+92 300 1827620</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail className="w-3 h-3" />
                <span>info.roommatchpk@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <MapPin className="w-3 h-3" />
                <span>Lahore, Pakistan</span>
              </div>
            </div>
            {/* Trust & Security Badge Section */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Trusted Platform
              </h4>
              <div className="flex items-center gap-4">
                {/* SSL Secure Badge */}
                <div className="flex flex-col items-center group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-slate-400 group-hover:text-emerald-400"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">SSL Secure</span>
                </div>

                {/* Verified Listings Badge */}
                <div className="flex flex-col items-center group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-slate-400 group-hover:text-emerald-400"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">Verified</span>
                </div>

                {/* 24/7 Support Badge */}
                <div className="flex flex-col items-center group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-slate-400 group-hover:text-emerald-400"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">Support</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-3 italic">
                Your security is our top priority.
              </p>
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
              <Link href="/privacy-policy" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-services" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
