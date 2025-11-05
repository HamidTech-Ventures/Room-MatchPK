"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Building,
  Eye,
} from "lucide-react"
import { AuthLoading } from "@/components/auth-loading"

export default function OwnerDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [ownerData, setOwnerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const ownerId = params?.id

  useEffect(() => {
    const fetchOwnerData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/owners/${ownerId}`)
        if (res.ok) {
          const data = await res.json()
          setOwnerData(data.owner)
        } else {
          setOwnerData(null)
        }
      } catch (error) {
        console.error('Error fetching owner data:', error)
        setOwnerData(null)
      } finally {
        setLoading(false)
      }
    }

    if (ownerId) {
      fetchOwnerData()
    }
  }, [ownerId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  if (loading) {
    return (
      <AuthLoading 
        title="Loading Owner Details" 
        description="Fetching owner information and properties..." 
        fullScreen={true}
      />
    )
  }

  if (!ownerData) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Owner not found.</div>
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
          {/* Owner Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{ownerData.name || 'Unknown Owner'}</h2>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm break-all">{ownerData.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">{ownerData.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">{ownerData.totalProperties || 0} Properties</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-slate-600 text-sm">
                      {ownerData.rating ? `${Number(ownerData.rating).toFixed(1)} Rating` : '0.0 Rating (No reviews yet)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">
                      Joined {ownerData.createdAt ? new Date(ownerData.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      ₨{(ownerData.totalPropertyCost || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Total Property Cost</div>
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
                <TabsTrigger value="properties" className="text-xs sm:text-sm">
                  Properties
                </TabsTrigger>
                <TabsTrigger value="financials" className="text-xs sm:text-sm">
                  Financials
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs sm:text-sm">
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Full Name</label>
                        <p className="text-slate-800">{ownerData.name || 'Unknown Owner'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">CNIC Number</label>
                        <p className="text-slate-800">{ownerData.cnic || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Email Address</label>
                        <p className="text-slate-800 break-all">{ownerData.email || 'No email'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Phone Number</label>
                        <p className="text-slate-800">{ownerData.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Address</label>
                      <p className="text-slate-800">{ownerData.address || 'No address'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Account Statistics</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{ownerData.totalProperties || 0}</div>
                        <div className="text-sm text-slate-600">Total Properties</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {ownerData.rating ? Number(ownerData.rating).toFixed(1) : '0.0'}
                        </div>
                        <div className="text-sm text-slate-600">
                          Average Rating {ownerData.totalReviews ? `(${ownerData.totalReviews} reviews)` : '(No reviews)'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{ownerData.approvedProperties || 0}</div>
                        <div className="text-sm text-slate-600">Approved Properties</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Properties Tab */}
              <TabsContent value="properties" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Owned Properties</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ownerData.properties && ownerData.properties.length > 0 ? (
                      ownerData.properties.map((property: any) => (
                        <div
                          key={property._id}
                          className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{property.title || property.name || 'Unnamed Property'}</h4>
                              <div className="flex items-center text-slate-600 text-sm mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {property.address && property.address.area && property.address.city
                                  ? `${property.address.area}, ${property.address.city}`
                                  : property.location || 'Unknown Location'}
                              </div>
                            </div>
                            <Badge className={property.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                              {property.isVerified ? "Approved" : "Pending"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                            <div>
                              <span className="font-medium">Price:</span> ₨{(property.pricing?.pricePerBed || property.price || 0).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Rooms:</span> {property.totalRooms || property.rooms || 0}
                            </div>
                            <div>
                              <span className="font-medium">Available:</span> {property.availableRooms || 0}/{property.totalRooms || property.rooms || 0}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {property.propertyType || 'Hostel'}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/property-detail/${property._id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            {!property.isVerified && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No properties found for this owner.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600">
                          ₨{(ownerData.totalPropertyCost || 0).toLocaleString()}
                        </div>
                        <div className="text-slate-600">Total Property Cost</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          ₨{(ownerData.properties?.reduce((sum: number, p: any) => sum + (p.pricing?.pricePerBed || 0), 0) || 0).toLocaleString()}
                        </div>
                        <div className="text-slate-600">Total Monthly Rent</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8 text-slate-500">
                      No recent transactions available.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Verification Documents</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8 text-slate-500">
                      No verification documents available.
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
