"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react"

// Sample student data
const studentData = {
  id: 1,
  name: "Ali Hassan",
  email: "ali.hassan@email.com",
  phone: "+92 300 1234567",
  avatar: null,
  status: "active",
  joinDate: "2024-01-15",
  lastActive: "2024-03-20",
  university: "University of Engineering & Technology",
  studentId: "2021-CS-123",
  semester: "6th Semester",
  course: "Computer Science",
  address: "123 Model Town, Lahore, Punjab",
  emergencyContact: {
    name: "Muhammad Hassan (Father)",
    phone: "+92 300 7654321",
    relation: "Father",
  },
  bookingHistory: [
    {
      id: 1,
      propertyName: "Elite Student Residency",
      location: "DHA Phase 5, Lahore",
      startDate: "2024-01-20",
      endDate: "2024-06-20",
      status: "active",
      pricePerBed: 25000,
      rating: 5,
      review: "Excellent facility with great amenities.",
    },
    {
      id: 2,
      propertyName: "Green Valley Hostel",
      location: "Johar Town, Lahore",
      startDate: "2023-08-15",
      endDate: "2023-12-15",
      status: "completed",
      pricePerBed: 18000,
      rating: 4,
      review: "Good place but could improve food quality.",
    },
  ],
  queries: [
    {
      id: 1,
      subject: "Room Change Request",
      message: "I would like to change my room due to noise issues.",
      date: "2024-03-15",
      status: "resolved",
      priority: "medium",
    },
    {
      id: 2,
      subject: "Payment Issue",
      message: "Having trouble with online payment gateway.",
      date: "2024-03-10",
      status: "pending",
      priority: "high",
    },
  ],
  preferences: {
    propertyType: "Hostel",
    genderPreference: "Boys",
    budgetRange: "20000-30000",
    preferredAreas: ["DHA", "Johar Town", "Model Town"],
    amenities: ["Wi-Fi", "AC", "Food", "Parking"],
  },
}

export default function StudentDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 text-slate-600 hover:text-emerald-600" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Student Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{studentData.name}</h2>
                  <Badge className={getStatusColor(studentData.status)}>{studentData.status}</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm break-all">{studentData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">{studentData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">{studentData.university}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">Joined {studentData.joinDate}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">Last active {studentData.lastActive}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Account
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                    <XCircle className="w-4 h-4 mr-2" />
                    Suspend Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white shadow-lg rounded-xl p-2">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs sm:text-sm">
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="queries" className="text-xs sm:text-sm">
                  Queries
                </TabsTrigger>
                <TabsTrigger value="preferences" className="text-xs sm:text-sm">
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Academic Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Student ID</label>
                        <p className="text-slate-800">{studentData.studentId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Course</label>
                        <p className="text-slate-800">{studentData.course}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Semester</label>
                        <p className="text-slate-800">{studentData.semester}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">University</label>
                        <p className="text-slate-800">{studentData.university}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Address</label>
                      <p className="text-slate-800">{studentData.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Emergency Contact</label>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="font-medium text-slate-800">{studentData.emergencyContact.name}</p>
                        <p className="text-sm text-slate-600">{studentData.emergencyContact.phone}</p>
                        <p className="text-sm text-slate-600">{studentData.emergencyContact.relation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Booking History</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentData.bookingHistory.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{booking.propertyName}</h4>
                            <div className="flex items-center text-slate-600 text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {booking.location}
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                          <div>
                            <span className="font-medium">Duration:</span> {booking.startDate} to {booking.endDate}
                          </div>
                          <div>
                            <span className="font-medium">Price per Bed:</span> ₨{booking.pricePerBed.toLocaleString()}
                          </div>
                        </div>

                        {booking.rating && (
                          <div className="border-t border-slate-200 pt-3">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium text-slate-600 mr-2">Rating:</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < booking.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-slate-600">({booking.rating}/5)</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{booking.review}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Queries Tab */}
              <TabsContent value="queries" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Support Queries</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentData.queries.map((query) => (
                      <div key={query.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{query.subject}</h4>
                            <p className="text-sm text-slate-600 mt-1">{query.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(query.priority)}>{query.priority}</Badge>
                            <Badge className={getStatusColor(query.status)}>{query.status}</Badge>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{query.message}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            Reply
                          </Button>
                          {query.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Search Preferences</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Property Type</label>
                        <p className="text-slate-800">{studentData.preferences.propertyType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Gender Preference</label>
                        <p className="text-slate-800">{studentData.preferences.genderPreference}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Budget Range</label>
                        <p className="text-slate-800">₨{studentData.preferences.budgetRange}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Preferred Areas</label>
                      <div className="flex flex-wrap gap-2">
                        {studentData.preferences.preferredAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="bg-slate-50">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">Required Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {studentData.preferences.amenities.map((amenity, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
