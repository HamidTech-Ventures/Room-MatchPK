"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { Menu, Home, Search, Building, User, LogIn, LogOut, Settings, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { signOut } from "next-auth/react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Logout error:', error) 
    }
  }

  // Close user menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: Event) {
      const target = event.target as Node
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    // Only add listeners when menu is open
    if (isUserMenuOpen) {
      // Small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true)
        document.addEventListener('touchstart', handleClickOutside, true)
        document.addEventListener('keydown', handleKeyDown)
      }, 10)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside, true)
        document.removeEventListener('touchstart', handleClickOutside, true)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isUserMenuOpen])

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
            <Link href={logoHref} className="group hover:scale-105 transition-transform">
              <Logo size={40} className="group-hover:scale-105 transition-transform" />
            </Link>
          ) : (
            <Logo size={40} />
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
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
            ) : user ? (
              /* Authenticated User Menu */
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-3 py-2 h-auto hover:bg-slate-100 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-slate-700 font-medium">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </Button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-600 truncate break-all">{user.email}</p>
                      <p className="text-xs text-emerald-600 mt-1 capitalize">{user.role}</p>
                    </div>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    
                    <Link 
                      href="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Buttons */
              <>
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
              </>
            )}
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
                  <Logo size={40} textSize="lg" />
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
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
                    </div>
                  ) : user ? (
                    /* Authenticated User Section */
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-xl">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar || ''} alt={user.name} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          <p className="text-xs text-emerald-600 capitalize">{user.role}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full h-12 bg-transparent border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 font-medium" 
                        asChild
                      >
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full h-12 bg-transparent border-2 border-red-200 hover:border-red-500 hover:text-red-600 font-medium" 
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    /* Unauthenticated Buttons */
                    <>
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
                    </>
                  )}
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
