"use client"
import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload"
import { OwnerDetailsForm } from "@/components/forms/owner-details-form"
import { 
  Upload, 
  Building,
  MapPin,
  DollarSign,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Tag,
  X,
  Plus,
  Wifi,
  Car,
  AirVent,
  Shield,
  Monitor,
  Coffee,
  Printer
} from "lucide-react"
import { LocationSelector } from "@/components/ui/location-selector"

interface OfficeFormMultiStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  uploadedImages: string[]
  setUploadedImages: (images: string[]) => void
  touched: { [key: string]: boolean }
  setTouched: (touched: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void
  tagInput?: string
  setTagInput?: (tag: string) => void
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
  currentStep?: number
  setCurrentStep?: (step: number) => void
  onSubmit?: () => void
  // Owner details props
  cnicPicFront?: string
  setCnicPicFront?: (value: string) => void
  cnicPicBack?: string
  setCnicPicBack?: (value: string) => void
  ownerPic?: string
  setOwnerPic?: (value: string) => void
  acceptVerify?: boolean
  setAcceptVerify?: (value: boolean) => void
  acceptTerms?: boolean
  setAcceptTerms?: (value: boolean) => void
  acceptCommission?: boolean
  setAcceptCommission?: (value: boolean) => void
  isSubmitting?: boolean
  editingProperty?: any
}

const officeAmenities = [
  { id: "wifi", label: "High-Speed Wi-Fi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "parking", label: "Parking Space", icon: Car },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "elevator", label: "Elevator Access", icon: Building },
  { id: "conference", label: "Conference Room", icon: Users },
  { id: "reception", label: "Reception Area", icon: Users },
  { id: "pantry", label: "Pantry/Kitchen", icon: Coffee },
  { id: "printer", label: "Printing Facility", icon: Printer },
  { id: "generator", label: "Backup Generator", icon: Building },
  { id: "cctv", label: "CCTV Surveillance", icon: Monitor },
  { id: "cleaning", label: "Cleaning Service", icon: Building },
]

export function OfficeFormMultiStep({
  formData,
  handleInputChange,
  uploadedImages,
  setUploadedImages,
  touched,
  setTouched,
  tagInput = "",
  setTagInput = () => {},
  externalLoader,
  currentStep = 1,
  setCurrentStep = () => {},
  onSubmit = () => {},
  cnicPicFront,
  setCnicPicFront,
  cnicPicBack,
  setCnicPicBack,
  ownerPic,
  setOwnerPic,
  acceptVerify,
  setAcceptVerify,
  acceptTerms,
  setAcceptTerms,
  acceptCommission,
  setAcceptCommission,
  isSubmitting,
  editingProperty
}: OfficeFormMultiStepProps) {

  // Step validation functions
  const validateStep1 = () => {
    const requiredFields = ['officeTitle', 'country', 'province', 'city', 'area', 'address', 'mapLink']
    return requiredFields.every(field => formData[field] && formData[field].trim() !== '')
  }

  const validateStep2 = () => {
    return formData.officeSize && formData.capacity && formData.officeType && formData.furnishingStatus
  }

  const validateStep3 = () => {
    return formData.monthlyRent && formData.securityDeposit
  }

  const validateStep4 = () => {
    return uploadedImages && uploadedImages.length > 0
  }

  const validateStep5 = () => {
    const ownerFieldsValid = formData.ownerName && formData.ownerEmail && formData.ownerPhone && formData.cnicNumber
    const documentsValid = cnicPicFront && cnicPicBack && ownerPic
    const agreementsValid = acceptVerify && acceptTerms && acceptCommission
    return ownerFieldsValid && documentsValid && agreementsValid
  }

  const handleNext = () => {
    let isValid = false
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      case 4:
        isValid = validateStep4()
        break
    }
    
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep5()) {
      onSubmit()
    }
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step < currentStep ? 'bg-purple-600 text-white' :
              step === currentStep ? 'bg-purple-100 text-purple-600 border-2 border-purple-600' :
              'bg-slate-200 text-slate-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-8 h-0.5 mx-1 ${
                step < currentStep ? 'bg-purple-600' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Step {currentStep} of 5
        </h2>
        <p className="text-sm text-slate-600">
          {currentStep === 1 && "Basic Details & Location"}
          {currentStep === 2 && "Office Specifications"}
          {currentStep === 3 && "Pricing & Terms"}
          {currentStep === 4 && "Images & Gallery"}
          {currentStep === 5 && "Owner Details & Submission"}
        </p>
      </div>
    </div>
  )

  // Helper functions
  const addTag = () => {
    if (tagInput && tagInput.trim()) {
      const currentTags = formData.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        handleInputChange("tags", [...currentTags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || []
    handleInputChange("tags", currentTags.filter((tag: string) => tag !== tagToRemove))
  }

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const currentAmenities = formData.amenities || []
    if (checked) {
      if (!currentAmenities.includes(amenityId)) {
        handleInputChange("amenities", [...currentAmenities, amenityId])
      }
    } else {
      handleInputChange("amenities", currentAmenities.filter((id: string) => id !== amenityId))
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator />
      
      {/* Step 1: Basic Details & Location */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Office Details</h3>
            </div>
            
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

            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Location Details</h3>
            </div>
            
            <LocationSelector
              formData={formData}
              handleInputChange={handleInputChange}
              touched={touched}
              setTouched={setTouched}
              getFieldClassName={(field, baseClass) => {
                const invalid = touched[field] && !formData[field]
                return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-purple-500 focus:ring-purple-500'}`
              }}
              getFieldError={(field) => {
                if (!touched[field] || formData[field]) return null
                return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
              }}
            />
            
            <div className="mt-6 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Complete Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Enter complete office address with building name and landmarks"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="resize-none"
                required
              />
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Office Specifications */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Office Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Office Size <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.officeSize} onValueChange={(value) => handleInputChange("officeSize", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select office size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-5 people)</SelectItem>
                    <SelectItem value="medium">Medium (6-15 people)</SelectItem>
                    <SelectItem value="large">Large (16-30 people)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (30+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Seating Capacity <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Number of people"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  className="h-12"
                  required
                />
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
                    <SelectItem value="coworking">Co-working Space</SelectItem>
                    <SelectItem value="private">Private Office</SelectItem>
                    <SelectItem value="shared">Shared Office</SelectItem>
                    <SelectItem value="virtual">Virtual Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Furnishing Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.furnishingStatus} onValueChange={(value) => handleInputChange("furnishingStatus", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select furnishing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Fully Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Floor Level
                </Label>
                <Select value={formData.floor} onValueChange={(value) => handleInputChange("floor", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground">Ground Floor</SelectItem>
                    <SelectItem value="1st">1st Floor</SelectItem>
                    <SelectItem value="2nd">2nd Floor</SelectItem>
                    <SelectItem value="3rd">3rd Floor</SelectItem>
                    <SelectItem value="4th+">4th Floor or Higher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Total Area (sq ft)
                </Label>
                <Input
                  type="number"
                  placeholder="Area in square feet"
                  value={formData.totalArea}
                  onChange={(e) => handleInputChange("totalArea", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Office Features */}
            <div className="mt-8">
              <Label className="text-sm font-semibold text-slate-700 mb-4 block">Office Features</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {officeAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id={amenity.id}
                      checked={(formData.amenities || []).includes(amenity.id)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                    />
                    <Label htmlFor={amenity.id} className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                      <amenity.icon className="w-4 h-4" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Pricing & Terms */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Pricing & Terms</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Monthly Rent <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Amount in PKR"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Security Deposit <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Amount in PKR"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Available From
                </Label>
                <Input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Lease Term
                </Label>
                <Select value={formData.leaseTerm} onValueChange={(value) => handleInputChange("leaseTerm", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select lease term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                    <SelectItem value="2-years">2 Years</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Business Type Preference
                </Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="marketing">Marketing/Advertising</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="any">Any Business Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Meeting Rooms Available
                </Label>
                <Select value={formData.meetingRooms} onValueChange={(value) => handleInputChange("meetingRooms", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1">1 Room</SelectItem>
                    <SelectItem value="2">2 Rooms</SelectItem>
                    <SelectItem value="3+">3+ Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Office Terms */}
            <div className="mt-8 space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Office Terms</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="utilitiesIncluded"
                    checked={formData.utilitiesIncluded || false}
                    onCheckedChange={(checked) => handleInputChange("utilitiesIncluded", checked)}
                  />
                  <Label htmlFor="utilitiesIncluded" className="text-sm text-slate-700">Utilities Included</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internetIncluded"
                    checked={formData.internetIncluded || false}
                    onCheckedChange={(checked) => handleInputChange("internetIncluded", checked)}
                  />
                  <Label htmlFor="internetIncluded" className="text-sm text-slate-700">Internet Included</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flexible24Hours"
                    checked={formData.flexible24Hours || false}
                    onCheckedChange={(checked) => handleInputChange("flexible24Hours", checked)}
                  />
                  <Label htmlFor="flexible24Hours" className="text-sm text-slate-700">24/7 Access Available</Label>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="mt-8 space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (e.g., Near Metro, Modern, Startup Friendly)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="mt-8 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Additional Details</Label>
              <Textarea
                placeholder="Any additional information about the office space..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Images & Gallery */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Office Images</h3>
              <span className="text-red-500 text-sm">*</span>
            </div>
            
            <EnhancedImageUpload
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              maxImages={12}
              externalLoader={externalLoader}
            />
            
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Image Guidelines:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Upload at least 1 image (required)</li>
                <li>• Maximum 12 images allowed</li>
                <li>• Include: entrance, workspace, meeting rooms, facilities</li>
                <li>• Professional images attract quality tenants</li>
              </ul>
            </div>
          </div>
        </div> 
      )}

      {/* Step 5: Owner Details */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <OwnerDetailsForm
            formData={formData}
            handleInputChange={handleInputChange}
            touched={touched}
            setTouched={setTouched}
            cnicPicFront={cnicPicFront || ""}
            setCnicPicFront={setCnicPicFront || (() => {})}
            cnicPicBack={cnicPicBack || ""}
            setCnicPicBack={setCnicPicBack || (() => {})}
            ownerPic={ownerPic || ""}
            setOwnerPic={setOwnerPic || (() => {})}
            acceptVerify={acceptVerify || false}
            setAcceptVerify={setAcceptVerify || (() => {})}
            acceptTerms={acceptTerms || false}
            setAcceptTerms={setAcceptTerms || (() => {})}
            acceptCommission={acceptCommission || false}
            setAcceptCommission={setAcceptCommission || (() => {})}
            isSubmitting={isSubmitting || false}
            onSubmit={handleSubmit}
            editingProperty={editingProperty}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < 5 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !validateStep1()) ||
              (currentStep === 2 && !validateStep2()) ||
              (currentStep === 3 && !validateStep3()) ||
              (currentStep === 4 && !validateStep4())
            }
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!validateStep5() || isSubmitting}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Office
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
