"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Home, Search, Building, User, LogIn } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Determine logo navigation based on current page
  const getLogoHref = () => {
    if (pathname?.startsWith('/admin')) {
      return null // Don't navigate when on admin pages
    } else if (pathname?.startsWith('/find-rooms')) {
      return '/find-rooms'
    } else if (pathname?.startsWith('/list-property')) {
      return '/list-property'
    } else {
      return '/'
    }
  }

  const logoHref = getLogoHref()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/find-rooms", label: "Find Rooms", icon: Search },
    { href: "/list-property", label: "List Property", icon: Building },
    { href: "/about", label: "About", icon: User },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          {logoHref ? (
            <Link href={logoHref} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  RoomMatch PK
                </span>
                <span className="text-xs text-slate-500 -mt-1">Find Your Home</span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-800">
                  RoomMatch PK
                </span>
                <span className="text-xs text-slate-500 -mt-1">Find Your Home</span>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600 transition-colors font-medium group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-slate-700 hover:text-emerald-600" asChild>
              <Link href="/auth/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
              asChild
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-800">RoomMatch PK</span>
                      <span className="text-xs text-slate-500 -mt-1">Find Your Home</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 px-6 py-4">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-4 px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium rounded-xl group"
                      >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-base">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="p-6 border-t border-slate-100 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 bg-transparent border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 font-medium" 
                    asChild
                  >
                    <Link href="/auth/login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg font-medium" 
                    asChild
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

// Export as default as well to maintain compatibility
export default Navbar
