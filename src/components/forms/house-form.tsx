"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload"
import { Upload, X, Camera, DollarSign } from "lucide-react"

interface HouseFormProps {
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

export function HouseForm({
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
}: HouseFormProps) {
  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">House/Apartment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold text-slate-700">
              House Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., 3 Marla Furnished House near GCUF (minimum 3 characters)"
              value={formData.houseTitle || formData.propertyName}
              onChange={(e) => handleInputChange("houseTitle", e.target.value)}
              className="h-12"
              required
            />
            <div className="text-xs">
              <span className={`${(formData.houseTitle || formData.propertyName) && (formData.houseTitle || formData.propertyName).length >= 3 ? 'text-green-600' : 'text-red-500'}`}>
                {(formData.houseTitle || formData.propertyName) ? `${(formData.houseTitle || formData.propertyName).length}/3 characters` : '0/3 characters (minimum)'}
              </span>
              {(formData.houseTitle || formData.propertyName) && (formData.houseTitle || formData.propertyName).length < 3 && (
                <span className="text-red-500 ml-2">Need {3 - (formData.houseTitle || formData.propertyName).length} more character(s)</span>
              )}
            </div>
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
              House Size <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.houseSize} onValueChange={(value) => handleInputChange("houseSize", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select house size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-marla">3 Marla</SelectItem>
                <SelectItem value="5-marla">5 Marla</SelectItem>
                <SelectItem value="10-marla">10 Marla</SelectItem>
                <SelectItem value="1-kanal">1 Kanal</SelectItem>
                <SelectItem value="500-sqft">500 Sq. ft</SelectItem>
                <SelectItem value="1000-sqft">1000 Sq. ft</SelectItem>
                <SelectItem value="1500-sqft">1500 Sq. ft</SelectItem>
                <SelectItem value="2000-sqft">2000 Sq. ft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Total Rooms <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="Bedroom + Living"
              value={formData.totalRooms}
              onChange={(e) => handleInputChange("totalRooms", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Bathrooms <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="Number of bathrooms"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange("bathrooms", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Furnished <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.furnished} onValueChange={(value) => handleInputChange("furnished", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select furnishing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Fully Furnished</SelectItem>
                <SelectItem value="semi">Semi Furnished</SelectItem>
                <SelectItem value="no">No - Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Monthly Rent (PKR) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 50000"
              value={formData.monthlyRent || formData.pricePerBed}
              onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Advance Security (PKR) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 2 months advance"
              value={formData.advanceSecurity || formData.securityDeposit}
              onChange={(e) => handleInputChange("advanceSecurity", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Parking <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.parking} onValueChange={(value) => handleInputChange("parking", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select parking option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-house">In-house Parking</SelectItem>
                <SelectItem value="yes">Yes - Available</SelectItem>
                <SelectItem value="no">No Parking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Floor Level <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.floorLevel} onValueChange={(value) => handleInputChange("floorLevel", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select floor level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ground">Ground Floor</SelectItem>
                <SelectItem value="1st">1st Floor</SelectItem>
                <SelectItem value="2nd">2nd Floor</SelectItem>
                <SelectItem value="3rd">3rd Floor</SelectItem>
                <SelectItem value="4th">4th Floor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Available From <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.availableFrom}
              onChange={(e) => handleInputChange("availableFrom", e.target.value)}
              className="h-12"
              required
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
              placeholder="Enter complete address with landmarks"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="min-h-20"
              required
            />
          </div>
        </div>
      </div>

      {/* Tenant Preference */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Tenant Preference</h3>
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-700">
            Preferred Tenant <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.preferredTenant} 
            onValueChange={(value) => handleInputChange("preferredTenant", value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="students" id="students" />
              <Label htmlFor="students">Students</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="families" id="families" />
              <Label htmlFor="families">Families</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="anyone" id="anyone" />
              <Label htmlFor="anyone">Anyone</Label>
            </div>
          </RadioGroup>
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
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Property Images</h3>
        <EnhancedImageUpload
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
          maxImages={8}
          minImages={2}
          maxFileSize={5}
          folder="roommatch_images/houses"
          title="Upload House Images"
          description="Add photos of front, rooms, washrooms, etc."
          required={true}
        />
      </div>
    </div>
  )
}