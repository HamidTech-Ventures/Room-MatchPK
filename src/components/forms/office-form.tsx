"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload"
import { Upload, X, Camera, DollarSign } from "lucide-react"

interface OfficeFormProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  touched: { [key: string]: boolean }
  setTouched: (value: any) => void
  isFieldInvalid: (field: string, step: number) => boolean
  getFieldClass: (field: string, step: number, baseClass?: string) => string
  uploadedImages: string[]
  setUploadedImages: (value: any) => void
  handleImageUpload: (files: FileList) => void
  removeImage: (index: number) => void
  isUploading: boolean
}

export function OfficeForm({
  formData,
  handleInputChange,
  touched,
  setTouched,
  isFieldInvalid,
  getFieldClass,
  uploadedImages,
  setUploadedImages,
  handleImageUpload,
  removeImage,
  isUploading
}: OfficeFormProps) {
  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Office Space Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold text-slate-700">
              Office Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Startup Space - Main Gulberg (minimum 3 characters)"
              value={formData.officeTitle || formData.propertyName}
              onChange={(e) => handleInputChange("officeTitle", e.target.value)}
              className="h-12"
              required
            />
            <div className="text-xs">
              <span className={`${(formData.officeTitle || formData.propertyName) && (formData.officeTitle || formData.propertyName).length >= 3 ? 'text-green-600' : 'text-red-500'}`}>
                {(formData.officeTitle || formData.propertyName) ? `${(formData.officeTitle || formData.propertyName).length}/3 characters` : '0/3 characters (minimum)'}
              </span>
              {(formData.officeTitle || formData.propertyName) && (formData.officeTitle || formData.propertyName).length < 3 && (
                <span className="text-red-500 ml-2">Need {3 - (formData.officeTitle || formData.propertyName).length} more character(s)</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Office Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.officeType} onValueChange={(value) => handleInputChange("officeType", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select office type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared Office</SelectItem>
                <SelectItem value="private">Private Office</SelectItem>
                <SelectItem value="co-working">Co-working Space</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              City <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lahore">Lahore</SelectItem>
                <SelectItem value="karachi">Karachi</SelectItem>
                <SelectItem value="islamabad">Islamabad</SelectItem>
                <SelectItem value="faisalabad">Faisalabad</SelectItem>
                <SelectItem value="multan">Multan</SelectItem>
                <SelectItem value="peshawar">Peshawar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Monthly Rent (PKR) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 25000"
              value={formData.monthlyRent || formData.pricePerBed}
              onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Area (Sq. ft) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 500 sq. ft"
              value={formData.officeArea}
              onChange={(e) => handleInputChange("officeArea", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Furnished</Label>
            <Select value={formData.furnished} onValueChange={(value) => handleInputChange("furnished", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select furnishing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Fully Furnished</SelectItem>
                <SelectItem value="no">No - Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Washroom</Label>
            <Select value={formData.washroom} onValueChange={(value) => handleInputChange("washroom", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select washroom type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Working Hours</Label>
            <Input
              placeholder="e.g., 9 AM - 6 PM"
              value={formData.workingHours}
              onChange={(e) => handleInputChange("workingHours", e.target.value)}
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Location Details</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Complete Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Enter precise location with landmarks"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="min-h-20"
              required
            />
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Office Facilities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="meetingRoom"
              checked={formData.meetingRoom || false}
              onCheckedChange={(checked) => handleInputChange("meetingRoom", checked)}
            />
            <Label htmlFor="meetingRoom" className="text-sm font-medium cursor-pointer">
              Meeting Room Access
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="internet"
              checked={formData.internet || false}
              onCheckedChange={(checked) => handleInputChange("internet", checked)}
            />
            <Label htmlFor="internet" className="text-sm font-medium cursor-pointer">
              High-Speed Internet
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="powerBackup"
              checked={formData.powerBackup || false}
              onCheckedChange={(checked) => handleInputChange("powerBackup", checked)}
            />
            <Label htmlFor="powerBackup" className="text-sm font-medium cursor-pointer">
              Power Backup
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="parking"
              checked={formData.parking || false}
              onCheckedChange={(checked) => handleInputChange("parking", checked)}
            />
            <Label htmlFor="parking" className="text-sm font-medium cursor-pointer">
              Parking Available
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="security"
              checked={formData.security || false}
              onCheckedChange={(checked) => handleInputChange("security", checked)}
            />
            <Label htmlFor="security" className="text-sm font-medium cursor-pointer">
              24/7 Security
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="airConditioning"
              checked={formData.airConditioning || false}
              onCheckedChange={(checked) => handleInputChange("airConditioning", checked)}
            />
            <Label htmlFor="airConditioning" className="text-sm font-medium cursor-pointer">
              Air Conditioning
            </Label>
          </div>
        </div>
      </div>

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

      {/* Images Upload */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Office Images</h3>
        <EnhancedImageUpload
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
          maxImages={8}
          minImages={2}
          maxFileSize={5}
          folder="roommatch_images/offices"
          title="Upload Office Images"
          description="Add photos of work desks, meeting room, etc."
          required={true}
        />
      </div>
    </div>
  )
}