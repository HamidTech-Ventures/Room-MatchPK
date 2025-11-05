"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Mail, Phone, Calendar, CheckCircle, MessageSquare, Send, AlertTriangle } from "lucide-react"

// Sample query data
const queryData = {
  id: 1,
  subject: "Property Verification Issue",
  message: `I found some discrepancies in the property listing for Elite Student Residency. The amenities mentioned include a gym and swimming pool, but when I visited the property, these facilities were not available. The photos on the website also seem to be outdated. I would like this to be investigated and corrected.

Additionally, the property owner was not responsive when I tried to contact them about this issue. I had to cancel my booking and look for alternative accommodation.`,
  date: "2024-03-20",
  status: "pending",
  priority: "high",
  student: {
    id: 1,
    name: "Hassan Ali",
    email: "hassan@email.com",
    phone: "+92 300 1234567",
    university: "University of Engineering & Technology",
    joinDate: "2024-01-15",
    totalBookings: 2,
    status: "active",
  },
  property: {
    id: 1,
    name: "Elite Student Residency",
    location: "DHA Phase 5, Lahore",
    owner: "Muhammad Ahmed Hassan",
    status: "approved",
  },
  conversation: [
    {
      id: 1,
      sender: "student",
      message: "I found some discrepancies in the property listing. The amenities mentioned are not available.",
      timestamp: "2024-03-20 10:30 AM",
    },
    {
      id: 2,
      sender: "admin",
      message: "Thank you for bringing this to our attention. We will investigate this matter immediately.",
      timestamp: "2024-03-20 11:15 AM",
    },
    {
      id: 3,
      sender: "student",
      message: "I appreciate your quick response. I had to cancel my booking due to this issue.",
      timestamp: "2024-03-20 11:45 AM",
    },
  ],
}

export default function QueryDetailPage() {
  const [replyMessage, setReplyMessage] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "resolved":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "escalated":
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

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      // Add reply logic here
      console.log("Sending reply:", replyMessage)
      setReplyMessage("")
    }
  }

  const handleMarkResolved = () => {
    // Mark as resolved logic here
    console.log("Marking query as resolved")
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
          {/* Query Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getPriorityColor(queryData.priority)}>{queryData.priority}</Badge>
                    <Badge className={getStatusColor(queryData.status)}>{queryData.status}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">{queryData.subject}</h2>
                  <div className="flex items-center text-slate-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {queryData.date}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Student Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Student Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 text-sm">{queryData.student.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 text-sm break-all">{queryData.student.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 text-sm">{queryData.student.phone}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent" asChild>
                    <Link href={`/admin/student-detail/${queryData.student.id}`}>View Student Profile</Link>
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Property Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Related Property</h3>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="font-medium text-slate-800">{queryData.property.name}</p>
                    <p className="text-sm text-slate-600">{queryData.property.location}</p>
                    <p className="text-sm text-slate-600">Owner: {queryData.property.owner}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent" asChild>
                    <Link href={`/admin/property-detail/${queryData.property.id}`}>View Property Details</Link>
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleMarkResolved}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={queryData.status === "resolved"}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                  <Button variant="outline" className="w-full text-orange-600 hover:text-orange-700 bg-transparent">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate Query
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Original Query */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Original Query</h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{queryData.student.name}</p>
                          <p className="text-xs text-slate-600">{queryData.date}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{queryData.message}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Conversation */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Conversation History</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {queryData.conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md p-3 rounded-lg ${
                            message.sender === "admin" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === "admin" ? "text-emerald-100" : "text-slate-500"
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reply Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Send Reply</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="min-h-32 resize-none"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleSendReply}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        disabled={!replyMessage.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                      <Button variant="outline" className="bg-transparent">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Save as Draft
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="bg-transparent">
                      Contact Property Owner
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      Schedule Property Inspection
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      Request Additional Information
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      Forward to Legal Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
