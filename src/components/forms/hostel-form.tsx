"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload"
import { 
  Upload, 
  Users, 
  Wifi, 
  Car, 
  Utensils, 
  AirVent, 
  Shield, 
  Plus, 
  X, 
  Tag,
  MapPin,
  Home,
  Building,
  DollarSign
} from "lucide-react"

const amenityOptions = [
  { id: "wifi", label: "High-Speed Wi-Fi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "food", label: "Meals Included", icon: Utensils },
  { id: "parking", label: "Parking Space", icon: Car },
  { id: "gym", label: "Gym/Fitness Center", icon: Users },
  { id: "laundry", label: "Laundry Service", icon: Users },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "study", label: "Study Room", icon: Users },
  { id: "cleaning", label: "Cleaning Service", icon: Users },
  { id: "generator", label: "Backup Generator", icon: Users },
  { id: "water", label: "Water Supply", icon: Users },
  { id: "maintenance", label: "Maintenance", icon: Users },
]

interface HostelFormProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  uploadedImages: string[]
  setUploadedImages: (images: string[]) => void
  tagInput: string
  setTagInput: (value: string) => void
  touched: { [key: string]: boolean }
  setTouched: (touched: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void
  propertySubType: string
  setPropertySubType: (type: string) => void
  externalLoader?: {
    uploadState: { isLoading: boolean; success: boolean; error: boolean }
    deleteState: { isLoading: boolean; success: boolean; error: boolean }
    startUpload: () => void
    uploadSuccess: () => void
    uploadError: () => void
    startDelete: () => void
    deleteSuccess: () => void
    deleteError: () => void
  }
}

export function HostelForm({ 
  formData, 
  handleInputChange, 
  uploadedImages, 
  setUploadedImages,
  tagInput,
  setTagInput,
  touched,
  setTouched,
  propertySubType,
  setPropertySubType,
  externalLoader
}: HostelFormProps) {
  
  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      handleInputChange('amenities', [...formData.amenities, amenityId])
    } else {
      handleInputChange('amenities', formData.amenities.filter((id: string) => id !== amenityId))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter((tag: string) => tag !== tagToRemove))
  }



  const getFieldClass = (field: string, baseClass = "") => {
    const invalid = touched[field] && !formData[field]
    return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`
  }

  return (
    <div className="space-y-8">
      {/* Property Sub-type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Sub-type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Property Sub-type <span className="text-red-500">*</span>
            </Label>
            <Select value={propertySubType} onValueChange={setPropertySubType}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select property sub-type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {propertySubType === 'house' ? 'House Title' : 
                 propertySubType === 'office' ? 'Office Title' : 
                 'Property Name'} <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={
                  propertySubType === 'house' ? "e.g., 3 Marla Furnished House near GCUF (min 3 chars)" :
                  propertySubType === 'office' ? "e.g., Startup Space - Main Gulberg (min 3 chars)" :
                  "e.g., Green Valley Student Hostel (min 3 chars)"
                }
                value={formData.propertyName}
                onChange={(e) => handleInputChange("propertyName", e.target.value)}
                className={getFieldClass("propertyName", "h-12")}
                onBlur={() => setTouched({ ...touched, propertyName: true })}
              />
              <div className="text-xs">
                <span className={`${formData.propertyName && formData.propertyName.length >= 3 ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.propertyName ? `${formData.propertyName.length}/3 characters` : '0/3 characters (minimum)'}
                </span>
                {formData.propertyName && formData.propertyName.length < 3 && (
                  <span className="text-red-500 ml-2">Need {3 - formData.propertyName.length} more character(s)</span>
                )}
              </div>
            </div>

            {/* Gender Preference */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {propertySubType === 'house' ? 'Preferred Tenant' : 'Gender Preference'} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.genderPreference}
                onValueChange={(value) => handleInputChange("genderPreference", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={
                    propertySubType === 'house' ? "Select preferred tenant" : "Select gender preference"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {propertySubType === 'house' ? (
                    <>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="families">Families</SelectItem>
                      <SelectItem value="anyone">Anyone</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="male">Male Only</SelectItem>
                      <SelectItem value="female">Female Only</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Total Rooms */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {propertySubType === 'house' ? 'Total Rooms (Bedroom + Living)' : 
                 propertySubType === 'office' ? 'Area (Sq. ft)' : 
                 'Total Rooms'} <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder={
                  propertySubType === 'office' ? "e.g., 500 (minimum 1)" : "e.g., 10 (minimum 1)"
                }
                value={formData.totalRooms}
                onChange={(e) => handleInputChange("totalRooms", e.target.value)}
                className={getFieldClass("totalRooms", "h-12")}
                min="1"
              />
              <div className="text-xs">
                {formData.totalRooms ? (
                  Number(formData.totalRooms) >= 1 ? (
                    <span className="text-green-600">✓ Valid number</span>
                  ) : (
                    <span className="text-red-500">✗ Must be at least 1</span>
                  )
                ) : (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
            </div>

            {/* Available Rooms / Bathrooms */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {propertySubType === 'house' ? 'Bathrooms' : 'Available Rooms'} <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder={propertySubType === 'house' ? "e.g., 2 (0 or more)" : "e.g., 5 (must be ≤ total rooms)"}
                value={formData.availableRooms}
                onChange={(e) => handleInputChange("availableRooms", e.target.value)}
                className={getFieldClass("availableRooms", "h-12")}
                min="0"
              />
              <div className="text-xs">
                {formData.availableRooms ? (
                  Number(formData.availableRooms) >= 0 && Number(formData.availableRooms) <= Number(formData.totalRooms || 0) ? (
                    <span className="text-green-600">✓ Valid number</span>
                  ) : Number(formData.availableRooms) > Number(formData.totalRooms || 0) ? (
                    <span className="text-red-500">✗ Cannot exceed total rooms ({formData.totalRooms || 0})</span>
                  ) : (
                    <span className="text-red-500">✗ Must be 0 or greater</span>
                  )
                ) : (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {propertySubType === 'house' ? 'Monthly Rent (PKR)' : 
                 propertySubType === 'office' ? 'Monthly Rent (PKR)' : 
                 'Price Per Bed (PKR)'} <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g., 15000 (must be greater than 0)"
                value={formData.pricePerBed}
                onChange={(e) => handleInputChange("pricePerBed", e.target.value)}
                className={getFieldClass("pricePerBed", "h-12")}
                min="1"
              />
              <div className="text-xs">
                {formData.pricePerBed ? (
                  Number(formData.pricePerBed) > 0 ? (
                    <span className="text-green-600">✓ Valid price</span>
                  ) : (
                    <span className="text-red-500">✗ Price must be greater than 0</span>
                  )
                ) : (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
            </div>

            {/* Security Deposit */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {propertySubType === 'house' ? 'Advance Security (months)' : 'Security Deposit (PKR)'}
              </Label>
              <Input
                type="number"
                placeholder={propertySubType === 'house' ? "e.g., 2" : "e.g., 5000"}
                value={formData.securityDeposit}
                onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                className="h-12"
                min="0"
              />
            </div>
          </div>

          {/* House/Office specific fields */}
          {(propertySubType === 'house' || propertySubType === 'office') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {propertySubType === 'house' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">House Size</Label>
                    <Select
                      value={formData.houseSize || ''}
                      onValueChange={(value) => handleInputChange("houseSize", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select house size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-marla">3 Marla</SelectItem>
                        <SelectItem value="5-marla">5 Marla</SelectItem>
                        <SelectItem value="10-marla">10 Marla</SelectItem>
                        <SelectItem value="1-kanal">1 Kanal</SelectItem>
                        <SelectItem value="custom">Custom Sq. ft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Furnished</Label>
                    <Select
                      value={formData.furnished || ''}
                      onValueChange={(value) => handleInputChange("furnished", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select furnished status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="semi">Semi-Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Parking</Label>
                    <Select
                      value={formData.parking || ''}
                      onValueChange={(value) => handleInputChange("parking", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select parking option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-house">In-house</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Floor Level</Label>
                    <Select
                      value={formData.floorLevel || ''}
                      onValueChange={(value) => handleInputChange("floorLevel", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select floor level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ground">Ground</SelectItem>
                        <SelectItem value="1st">1st Floor</SelectItem>
                        <SelectItem value="2nd">2nd Floor</SelectItem>
                        <SelectItem value="3rd">3rd Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {propertySubType === 'office' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Office Type</Label>
                    <Select
                      value={formData.officeType || ''}
                      onValueChange={(value) => handleInputChange("officeType", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select office type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="co-working">Co-working</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Furnished</Label>
                    <Select
                      value={formData.furnished || ''}
                      onValueChange={(value) => handleInputChange("furnished", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select furnished status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Working Hours</Label>
                    <Input
                      placeholder="e.g., 9 AM - 6 PM"
                      value={formData.workingHours || ''}
                      onChange={(e) => handleInputChange("workingHours", e.target.value)}
                      className="h-12"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleInputChange("city", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lahore">Lahore</SelectItem>
                  <SelectItem value="karachi">Karachi</SelectItem>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="multan">Multan</SelectItem>
                  <SelectItem value="faisalabad">Faisalabad</SelectItem>
                  <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Area/Locality <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Gulberg, DHA, Johar Town (minimum 2 characters)"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                className={getFieldClass("area", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, area: true }))}
              />
              <div className="text-xs">
                <span className={`${formData.area && formData.area.length >= 2 ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.area ? `${formData.area.length}/2 characters` : '0/2 characters (minimum)'}
                </span>
                {formData.area && formData.area.length < 2 && (
                  <span className="text-red-500 ml-2">Need {2 - formData.area.length} more character(s)</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Full Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Enter complete address with landmarks (minimum 5 characters)"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={getFieldClass("address", "min-h-[100px]")}
              onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
            />
            <div className="flex justify-between text-xs">
              <span className={`${formData.address && formData.address.length >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                {formData.address ? `${formData.address.length}/5 characters` : '0/5 characters (minimum)'}
              </span>
              {formData.address && formData.address.length < 5 && (
                <span className="text-red-500">Need {5 - formData.address.length} more characters</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Nearby University/Institution
            </Label>
            <Input
              placeholder="e.g., University of Punjab, LUMS"
              value={formData.nearbyUniversity}
              onChange={(e) => handleInputChange("nearbyUniversity", e.target.value)}
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description & Features */}
      <Card>
        <CardHeader>
          <CardTitle>Description & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Property Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Describe your property, its features, and what makes it special (minimum 10 characters)..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={getFieldClass("description", "min-h-[120px]")}
              onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
            />
            <div className="flex justify-between text-xs">
              <span className={`${formData.description && formData.description.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                {formData.description ? `${formData.description.length}/10 characters` : '0/10 characters (minimum)'}
              </span>
              {formData.description && formData.description.length < 10 && (
                <span className="text-red-500">Need {10 - formData.description.length} more characters</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Rules & Regulations</Label>
            <Textarea
              placeholder="Enter each rule on a separate line:
• No smoking inside rooms
• Visitors allowed until 8 PM
• Monthly rent due by 5th of each month
• No loud music after 10 PM"
              value={formData.rules}
              onChange={(e) => handleInputChange("rules", e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-slate-500">
              💡 Tip: Enter each rule on a separate line for better display
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (e.g., near metro, furnished, etc.)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="h-10"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities & Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenityOptions.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                <Checkbox
                  id={amenity.id}
                  checked={formData.amenities.includes(amenity.id)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <amenity.icon className="w-4 h-4 text-emerald-600" />
                  <Label htmlFor={amenity.id} className="text-sm font-medium cursor-pointer">
                    {amenity.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">Accepted Payment Methods</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash-payment"
                  checked={formData.paymentOptions?.cash || false}
                  onCheckedChange={(checked) => handleInputChange("paymentOptions", {
                    ...formData.paymentOptions,
                    cash: checked
                  })}
                />
                <Label htmlFor="cash-payment" className="text-sm font-medium">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jazzcash-payment"
                  checked={formData.paymentOptions?.jazzcash || false}
                  onCheckedChange={(checked) => handleInputChange("paymentOptions", {
                    ...formData.paymentOptions,
                    jazzcash: checked
                  })}
                />
                <Label htmlFor="jazzcash-payment" className="text-sm font-medium">JazzCash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="easypaisa-payment"
                  checked={formData.paymentOptions?.easypaisa || false}
                  onCheckedChange={(checked) => handleInputChange("paymentOptions", {
                    ...formData.paymentOptions,
                    easypaisa: checked
                  })}
                />
                <Label htmlFor="easypaisa-payment" className="text-sm font-medium">Easypaisa</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            Property Images <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedImageUpload
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            maxImages={8}
            minImages={2}
            maxFileSize={5}
            folder="roommatch_images/hostels"
            title="Upload Property Images"
            description="Add high-quality photos of your rooms, common areas, and facilities"
            required={true}
            externalLoader={externalLoader}
          />
        </CardContent>
      </Card>
    </div>
  )
}