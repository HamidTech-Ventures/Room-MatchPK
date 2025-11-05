"use client"

import React, { useState } from "react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/logo"
import {
  Users,
  Building,
  MessageSquare,
  CheckCircle,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  Shield,
  Home,
  LogOut,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuthLoading } from "@/components/auth-loading"
import { AdminChatManagement } from "@/components/admin-chat-management"

// Sample data (same as before)
const dashboardStats = [
  {
    title: "Total Students",
    value: "15,247",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    href: "/admin/students",
  },
  {
    title: "Property Owners",
    value: "2,847",
    change: "+8%",
    icon: Building,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    href: "/admin/owners",
  },
  {
    title: "Listed Hostels",
    value: "3,156",
    change: "+15%",
    icon: Home,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    href: "/admin/properties",
  },
  {
    title: "Total Queries",
    value: "127",
    change: "-5%",
    icon: MessageSquare,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    href: "/admin/queries",
  },
]

const students = [
  {
    id: 1,
    name: "Ali Hassan",
    email: "ali.hassan@email.com",
    phone: "+92 300 1234567",
    university: "University of Engineering & Technology",
    joinDate: "2024-01-15",
    status: "active",
    bookings: 2,
  },
  {
    id: 2,
    name: "Fatima Khan",
    email: "fatima.khan@email.com",
    phone: "+92 301 2345678",
    university: "Lahore University of Management Sciences",
    joinDate: "2024-02-20",
    status: "active",
    bookings: 1,
  },
]




function AdminDashboardContent() {
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [properties, setProperties] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>("all")
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [recentStudents, setRecentStudents] = useState<any[]>([])
  const [pendingProperties, setPendingProperties] = useState<any[]>([])
  const [loadingRecentData, setLoadingRecentData] = useState(true)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showStudentPopup, setShowStudentPopup] = useState(false)
  const [allOwners, setAllOwners] = useState<any[]>([])
  const [loadingOwners, setLoadingOwners] = useState(false)
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [approvingProperty, setApprovingProperty] = useState<string | null>(null)
  const [rejectingProperty, setRejectingProperty] = useState<string | null>(null)

  // Helper function to get image URL from different formats
  const getImageUrl = (image: any): string => {
    if (!image) return "/placeholder.svg"
    
    // If it's a string, return it directly (but check if it's not empty)
    if (typeof image === 'string') {
      return image.trim() || "/placeholder.svg"
    }
    
    // If it's an object with url property
    if (typeof image === 'object' && image.url) {
      return image.url.trim() || "/placeholder.svg"
    }
    
    return "/placeholder.svg"
  }

  const fetchDashboardStats = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setDashboardStats(data.stats)
      } else {
        setDashboardStats(null)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setDashboardStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchRecentData = async () => {
    setLoadingRecentData(true)
    try {
      // Fetch recent students
      const studentsRes = await fetch('/api/admin/recent-students')
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setRecentStudents(studentsData.students || [])
      }

      // Fetch pending properties
      const propertiesRes = await fetch('/api/admin/pending-properties')
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json()
        setPendingProperties(propertiesData.properties || [])
      }
    } catch (error) {
      console.error('Error fetching recent data:', error)
      setRecentStudents([])
      setPendingProperties([])
    } finally {
      setLoadingRecentData(false)
    }
  }

  const fetchAllStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await fetch('/api/admin/students')
      if (res.ok) {
        const data = await res.json()
        setAllStudents(data.students || [])
      } else {
        setAllStudents([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setAllStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchAllOwners = async () => {
    setLoadingOwners(true)
    try {
      const res = await fetch('/api/admin/owners')
      if (res.ok) {
        const data = await res.json()
        setAllOwners(data.owners || [])
      } else {
        setAllOwners([])
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
      setAllOwners([])
    } finally {
      setLoadingOwners(false)
    }
  }

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await fetch('/api/admin/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviewStats(data.stats)
      } else {
        setReviewStats(null)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviewStats(null)
    } finally {
      setLoadingReviews(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
      case "approved":
      case "resolved":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "inactive":
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }


  const fetchProperties = async () => {
    setLoadingProperties(true)
    try {
      let url = "/api/properties/admin"
      if (propertyStatusFilter !== "all") {
        url += `?status=${propertyStatusFilter}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProperties(data.properties || [])
      } else {
        setProperties([])
      }
    } catch (e) {
      setProperties([])
    } finally {
      setLoadingProperties(false)
    }
  }

  // Check admin session and ensure validation is disabled
  const checkAdminSession = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        console.error('Admin session check failed:', res.status)
        if (res.status === 401 || res.status === 403) {
          alert('Admin session expired. Please login again.')
          logout()
        }
      } else {
        // Automatically disable validation when admin dashboard loads
        await ensureValidationDisabled()
      }
    } catch (error) {
      console.error('Error checking admin session:', error)
    }
  }

  // Ensure validation is disabled
  const ensureValidationDisabled = async () => {
    try {
      await fetch('/api/admin/disable-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' })
      })
      console.log('Validation automatically disabled')
    } catch (error) {
      console.error('Error auto-disabling validation:', error)
    }
  }

  React.useEffect(() => {
    checkAdminSession()
    fetchDashboardStats()
    fetchProperties()
    fetchRecentData()
    fetchAllStudents()
    fetchAllOwners()
    fetchReviews()
  }, [propertyStatusFilter])


  // Approve property handler
  const approveProperty = async (id: string) => {
    setApprovingProperty(id)
    try {
      console.log('Approving property with ID:', id)
      const res = await fetch(`/api/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
      
      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)
      
      if (res.ok) {
        alert('Property approved successfully!')
        fetchProperties()
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Unknown error')
        alert('Failed to approve property: ' + errorMsg)
        console.error('Approval failed:', errorMsg)
      }
    } catch (error: any) {
      console.error('Error approving property:', error)
      alert('Failed to approve property: ' + error.message)
    } finally {
      setApprovingProperty(null)
    }
  }

  // Reject property handler
  const rejectProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this property? This action cannot be undone.')) return;
    
    setRejectingProperty(id)
    try {
      const res = await fetch(`/api/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })
      if (res.ok) {
        alert('Property rejected successfully!')
        fetchProperties()
      } else {
        const data = await res.json()
        alert('Failed to reject property: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to reject property. Please try again.')
    } finally {
      setRejectingProperty(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="group hover:scale-105 transition-transform">
              <div className="flex items-center space-x-3">
                <Logo size={40} showText={false} />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    RoomMatch PK
                  </span>
                  <span className="text-xs text-slate-500 -mt-1">Admin Dashboard</span>
                </div>
              </div>
            </Link>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage students, property owners, and platform operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 bg-white shadow-lg rounded-xl p-2">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm">
              Students
            </TabsTrigger>
            <TabsTrigger value="owners" className="text-xs sm:text-sm">
              Owners
            </TabsTrigger>
            <TabsTrigger value="properties" className="text-xs sm:text-sm">
              Properties
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs sm:text-sm">
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loadingStats ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : dashboardStats ? (
                [
                  {
                    title: "Total Students",
                    value: dashboardStats.students?.total?.toLocaleString() || "0",
                    icon: Users,
                    color: "text-blue-600",
                    bgColor: "bg-blue-100",
                    href: "/admin/students",
                  },
                  {
                    title: "Property Owners",
                    value: dashboardStats.owners?.total?.toLocaleString() || "0",
                    icon: Building,
                    color: "text-emerald-600",
                    bgColor: "bg-emerald-100",
                    href: "/admin/owners",
                  },
                  {
                    title: "Listed Properties",
                    value: dashboardStats.properties?.total?.toLocaleString() || "0",
                    icon: Home,
                    color: "text-purple-600",
                    bgColor: "bg-purple-100",
                    href: "/admin/properties",
                  },
                  {
                    title: "Total Bookings",
                    value: dashboardStats.bookings?.total?.toLocaleString() || "0",
                    icon: MessageSquare,
                    color: "text-orange-600",
                    bgColor: "bg-orange-100",
                    href: "/admin/bookings",
                  },
                ].map((stat, index) => (
                <Card
                  key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <Link href={stat.href} className="block">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                      </Link>
                  </CardContent>
                </Card>
                ))
              ) : (
                // Error state
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Failed to load stats</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <Button className="h-16 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("students")}>
                    <Users className="w-5 h-5 mr-2" />
                    Manage Students
                  </Button>
                  <Button className="h-16 bg-emerald-600 hover:bg-emerald-700" onClick={() => setActiveTab("owners")}>
                    <Building className="w-5 h-5 mr-2" />
                    Manage Owners
                  </Button>
                  <Button className="h-16 bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab("properties")}>
                    <Home className="w-5 h-5 mr-2" />
                    Review Properties
                  </Button>
                  <Button className="h-16 bg-orange-600 hover:bg-orange-700" onClick={() => setActiveTab("chat")}>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Manage Chats
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Recent Students</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingRecentData ? (
                    // Loading skeleton for students
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                            <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
                      </div>
                    ))
                  ) : recentStudents.length > 0 ? (
                    recentStudents.slice(0, 3).map((student) => (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">{student.name || 'Unknown Student'}</p>
                            <p className="text-sm text-slate-600">{student.email || 'No email'}</p>
                        </div>
                      </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm">No recent students found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Pending Properties</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingRecentData ? (
                    // Loading skeleton for properties
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                            <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
                      </div>
                    ))
                  ) : pendingProperties.length > 0 ? (
                    pendingProperties.slice(0, 3).map((property) => (
                      <div key={property._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Home className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{property.title || "Unnamed Property"}</p>
                            <p className="text-sm text-slate-600">{property.totalRooms || 0} rooms</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm">No pending properties found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Students Management</h2>
                <p className="text-slate-600">Manage registered students and their accounts</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700">Student</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Contact</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingStudents ? (
                        <tr>
                          <td colSpan={5} className="text-center p-6">
                            <div className="flex items-center justify-center min-h-[200px]">
                              <AuthLoading title="Loading Students" description="Fetching student data..." fullScreen={false} />
                            </div>
                          </td>
                        </tr>
                      ) : allStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-6 text-slate-500">
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        allStudents.map((student) => (
                          <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                  <p className="font-medium text-slate-800">{student.name || 'Unknown Student'}</p>
                                  <p className="text-sm text-slate-600">
                                    Joined: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Unknown'}
                                  </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-slate-600">
                                <Mail className="w-4 h-4 mr-2" />
                                  {student.email || 'No email'}
                              </div>
                              <div className="flex items-center text-sm text-slate-600">
                                <Phone className="w-4 h-4 mr-2" />
                                  {student.phone || 'No phone'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                              <p className="text-sm text-slate-700">{student.address || 'No address'}</p>
                          </td>
                          <td className="p-4">
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </td>
                          <td className="p-4">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-transparent"
                                onClick={() => {
                                  setSelectedStudent(student)
                                  setShowStudentPopup(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </Button>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Owners Tab */}
          <TabsContent value="owners" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Property Owners</h2>
                <p className="text-slate-600">Manage property owners and their verification status</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search owners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700">Owner</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Contact</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Properties</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Total Property Cost</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOwners ? (
                        <tr>
                          <td colSpan={6} className="text-center p-6">
                            <div className="flex items-center justify-center min-h-[200px]">
                              <AuthLoading title="Loading Owners" description="Fetching owner data..." fullScreen={false} />
                            </div>
                          </td>
                        </tr>
                      ) : allOwners.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-6 text-slate-500">
                            No property owners found.
                          </td>
                        </tr>
                      ) : (
                        allOwners.map((owner) => (
                          <tr key={owner._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Building className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                  <p className="font-medium text-slate-800">{owner.name || 'Unknown Owner'}</p>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="text-sm text-slate-600">
                                    {owner.rating ? Number(owner.rating).toFixed(1) : '0.0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-slate-600">
                                <Mail className="w-4 h-4 mr-2" />
                                  {owner.email || 'No email'}
                              </div>
                              <div className="flex items-center text-sm text-slate-600">
                                <Phone className="w-4 h-4 mr-2" />
                                  {owner.phone || 'No phone'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                              <p className="text-sm font-medium text-slate-700">{owner.propertyCount || 0} Properties</p>
                              <p className="text-xs text-slate-500">{owner.approvedProperties || 0} Approved</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm font-medium text-emerald-600">
                                ₨{(owner.totalPropertyCost || 0).toLocaleString()}
                            </p>
                          </td>
                          <td className="p-4">
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" className="bg-transparent" asChild>
                                <Link href={`/admin/owner-detail/${owner._id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Properties Management</h2>
                <p className="text-slate-600">Review and manage property listings</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={propertyStatusFilter} onValueChange={setPropertyStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700">Property</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Owner</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Location</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Price</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingProperties ? (
                        <tr><td colSpan={6} className="text-center p-6">
                          <div className="flex items-center justify-center min-h-[200px]">
                            <AuthLoading title="Loading Properties" description="Fetching property data..." fullScreen={false} />
                          </div>
                        </td></tr>
                      ) : properties.length === 0 ? (
                        <tr><td colSpan={6} className="text-center p-6">No properties found.</td></tr>
                      ) : properties.map((property: any) => {
                        const name = property.title || property.name || "Unnamed Property"
                        const owner = property.ownerName || property.owner || (property.ownerId ? property.ownerId : "Unknown Owner")
                        const location = (() => {
                          // Handle structured address object
                          if (property.address && typeof property.address === 'object') {
                            const area = property.address.area || ''
                            const city = property.address.city || ''
                            if (area && city) return `${area}, ${city}`
                            if (city) return city
                            if (area) return area
                          }
                          // Fallback to individual fields
                          const area = property.area || ''
                          const city = property.city || ''
                          if (area && city) return `${area}, ${city}`
                          if (city) return city
                          if (area) return area
                          // Final fallback
                          return property.location || "Unknown Location"
                        })()
                        const price = property.pricing?.pricePerBed || property.price || 0
                        const rooms = property.totalRooms || property.rooms || 0
                        const status = property.status || (property.isVerified ? "active" : (property.isActive ? "pending" : "rejected"))
                        const id = property._id || property.id
                        const isPending = status === "pending" || property.isVerified === false;
                        return (
                          <tr key={id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                  {(() => {
                                    if (property.images && property.images.length > 0) {
                                      const imageUrl = getImageUrl(property.images[0])
                                      if (imageUrl !== "/placeholder.svg") {
                                        return (
                                          <Image
                                            src={imageUrl}
                                            alt={name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                          />
                                        )
                                      }
                                    }
                                    return (
                                      <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                                        <Home className="w-6 h-6 text-purple-600" />
                                      </div>
                                    )
                                  })()}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">{name}</p>
                                  <p className="text-sm text-slate-600">{rooms} rooms</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-slate-700">{owner}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-start text-sm text-slate-600">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                  <div>{location}</div>
                                  {(() => {
                                    // Show province and country if available
                                    const province = property.address?.province || property.province || ''
                                    const country = property.address?.country || property.country || ''
                                    const details = [province, country].filter(Boolean).join(', ')
                                    return details ? (
                                      <div className="text-xs text-slate-500">{details}</div>
                                    ) : null
                                  })()
                                  }
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium text-slate-700">₨{price.toLocaleString()}</p>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(status)}>{status}</Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="bg-transparent" asChild>
                                  <Link href={`/admin/property-detail/${id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Link>
                                </Button>
                                {status === "pending" && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700" 
                                      onClick={() => approveProperty(id)}
                                      disabled={approvingProperty === id || rejectingProperty === id}
                                    >
                                      {approvingProperty === id ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Approving...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Approve
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-red-600 hover:bg-red-700" 
                                      onClick={() => rejectProperty(id)}
                                      disabled={approvingProperty === id || rejectingProperty === id}
                                    >
                                      {rejectingProperty === id ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Rejecting...
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4 mr-2" />
                                          Reject
                                        </>
                                      )}
                                    </Button>
                                  </>
                                )}
                                {status === "approved" && (
                                  <Button 
                                    size="sm" 
                                    className="bg-red-600 hover:bg-red-700" 
                                    onClick={() => rejectProperty(id)}
                                    disabled={approvingProperty === id || rejectingProperty === id}
                                  >
                                    {rejectingProperty === id ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Rejecting...
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                      </>
                                    )}
                                  </Button>
                                )}
                                {status === "rejected" && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700" 
                                    onClick={() => approveProperty(id)}
                                    disabled={approvingProperty === id || rejectingProperty === id}
                                  >
                                    {approvingProperty === id ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Approving...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Review Management</h2>
                <p className="text-slate-600">Monitor student reviews and property ratings</p>
              </div>
            </div>

            {/* Review Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Total Reviews</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {reviewStats?.totalReviews?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Average Rating</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {reviewStats?.averageRating || "0.0"}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">5-Star Reviews</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {reviewStats?.ratingDistribution?.find((r: any) => r.rating === 5)?.count || "0"}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <Star className="w-6 h-6 text-green-600 fill-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Properties Reviewed</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {reviewStats?.topReviewedProperties?.length || "0"}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <Home className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reviews */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Reviews</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingReviews ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <AuthLoading title="Loading Reviews" description="Fetching review data..." fullScreen={false} />
                  </div>
                ) : reviewStats?.recentReviews?.length > 0 ? (
                  reviewStats.recentReviews.map((review: any) => (
                    <div key={review._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-800">{review.studentName}</span>
                              {review.isVerified && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{review.comment || 'No comment provided.'}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Property: {review.propertyTitle}</span>
                        <Button size="sm" variant="outline" className="bg-transparent" asChild>
                          <Link href={`/admin/property-detail/${review.propertyId}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            View Property
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p>No reviews found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Chat Management</h2>
              <p className="text-slate-600 mb-6">View and respond to conversations with students and property owners</p>
            </div>
            <AdminChatManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Student Details Popup */}
      {showStudentPopup && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Student Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100"
                  onClick={() => {
                    setShowStudentPopup(false)
                    setSelectedStudent(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{selectedStudent.name || 'Unknown Student'}</h4>
                    <p className="text-sm text-slate-600">Student Account</p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Email:</span>
                    <span className="text-sm text-slate-800 font-medium">{selectedStudent.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Phone:</span>
                    <span className="text-sm text-slate-800 font-medium">{selectedStudent.phone || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Address:</span>
                    <span className="text-sm text-slate-800 font-medium">{selectedStudent.address || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Gender:</span>
                    <span className="text-sm text-slate-800 font-medium">{selectedStudent.gender || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Joined Date:</span>
                    <span className="text-sm text-slate-800 font-medium">
                      {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Email Verified:</span>
                    <span className="text-sm text-slate-800 font-medium">
                      {selectedStudent.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Account Status:</span>
                    <span className="text-sm text-slate-800 font-medium">
                      {selectedStudent.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={() => {
                      if (selectedStudent.email) {
                        window.open(`mailto:${selectedStudent.email}`, '_blank')
                      }
                    }}
                    disabled={!selectedStudent.email}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
