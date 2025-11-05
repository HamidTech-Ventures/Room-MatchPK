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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload"
import { OwnerDetailsForm } from "@/components/forms/owner-details-form"
import { 
  Upload, 
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
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
  Building
} from "lucide-react"

interface ApartmentFormMultiStepProps {
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

const apartmentAmenities = [
  { id: "wifi", label: "High-Speed Wi-Fi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "parking", label: "Covered Parking", icon: Car },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "elevator", label: "Elevator Access", icon: Building },
  { id: "balcony", label: "Balcony/Terrace", icon: Home },
  { id: "gym", label: "Gym/Fitness Center", icon: Home },
  { id: "pool", label: "Swimming Pool", icon: Home },
  { id: "generator", label: "Backup Generator", icon: Home },
  { id: "maintenance", label: "Maintenance Service", icon: Home },
  { id: "water", label: "24/7 Water Supply", icon: Home },
  { id: "kitchen", label: "Modular Kitchen", icon: Home },
]

export function ApartmentFormMultiStep({
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
  isSubmitting = false,
  editingProperty
}: ApartmentFormMultiStepProps) {

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const currentTags = formData.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        handleInputChange("tags", [...currentTags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = formData.tags || []
    handleInputChange("tags", currentTags.filter((tag: string) => tag !== tagToRemove))
  }

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const currentAmenities = formData.amenities || []
    if (checked) {
      handleInputChange("amenities", [...currentAmenities, amenityId])
    } else {
      handleInputChange("amenities", currentAmenities.filter((id: string) => id !== amenityId))
    }
  }

  // Step validation functions
  const validateStep1 = () => {
    return formData.propertyName && formData.address && formData.city && formData.price
  }

  const validateStep2 = () => {
    return formData.bedrooms && formData.bathrooms && formData.area
  }

  const validateStep3 = () => {
    return formData.description
  }

  const validateStep4 = () => {
    return uploadedImages && uploadedImages.length > 0
  }

  const validateStep5 = (): boolean => {
    return !!(acceptTerms && acceptCommission && acceptVerify)
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
      case 5:
        isValid = validateStep5()
        break
    }

    if (isValid) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1)
      } else {
        onSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step Indicator Component
  const StepIndicator = ({ step, title, isActive, isCompleted }: { step: number; title: string; isActive: boolean; isCompleted: boolean }) => (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isCompleted ? 'bg-orange-600 text-white' : 
        isActive ? 'bg-orange-600 text-white' : 
        'bg-gray-200 text-gray-400'
      }`}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`ml-2 text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <StepIndicator 
            step={1} 
            title="Basic Details" 
            isActive={currentStep === 1} 
            isCompleted={currentStep > 1} 
          />
          <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          <StepIndicator 
            step={2} 
            title="Specifications" 
            isActive={currentStep === 2} 
            isCompleted={currentStep > 2} 
          />
          <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          <StepIndicator 
            step={3} 
            title="Features & Pricing" 
            isActive={currentStep === 3} 
            isCompleted={currentStep > 3} 
          />
          <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          <StepIndicator 
            step={4} 
            title="Images" 
            isActive={currentStep === 4} 
            isCompleted={currentStep > 4} 
          />
          <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          <StepIndicator 
            step={5} 
            title="Owner Details" 
            isActive={currentStep === 5} 
            isCompleted={false} 
          />
        </div>
      </div>

      {/* Step 1: Basic Details & Location */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Home className="w-5 h-5" />
              Basic Details & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Name */}
            <div className="space-y-2">
              <Label htmlFor="propertyName">Apartment Name *</Label>
              <Input
                id="propertyName"
                value={formData.propertyName || ""}
                onChange={(e) => handleInputChange("propertyName", e.target.value)}
                onBlur={() => markTouched("propertyName")}
                placeholder="Enter apartment name"
                className={touched.propertyName && !formData.propertyName ? "border-red-500" : ""}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                onBlur={() => markTouched("address")}
                placeholder="Enter complete address including building name, floor number, etc."
                className={touched.address && !formData.address ? "border-red-500" : ""}
                rows={3}
              />
            </div>

            {/* City & Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city || ""} onValueChange={(value) => handleInputChange("city", value)}>
                  <SelectTrigger className={touched.city && !formData.city ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lahore">Lahore</SelectItem>
                    <SelectItem value="karachi">Karachi</SelectItem>
                    <SelectItem value="islamabad">Islamabad</SelectItem>
                    <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                    <SelectItem value="faisalabad">Faisalabad</SelectItem>
                    <SelectItem value="multan">Multan</SelectItem>
                    <SelectItem value="gujranwala">Gujranwala</SelectItem>
                    <SelectItem value="peshawar">Peshawar</SelectItem>
                    <SelectItem value="quetta">Quetta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area/Locality</Label>
                <Input
                  id="area"
                  value={formData.area || ""}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  placeholder="e.g., DHA Phase 5, Gulberg"
                />
              </div>
            </div>

            {/* Building Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildingName">Building/Complex Name</Label>
                <Input
                  id="buildingName"
                  value={formData.buildingName || ""}
                  onChange={(e) => handleInputChange("buildingName", e.target.value)}
                  placeholder="Enter building/complex name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorNumber">Floor Number</Label>
                <Select value={formData.floorNumber || ""} onValueChange={(value) => handleInputChange("floorNumber", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground">Ground Floor</SelectItem>
                    <SelectItem value="1st">1st Floor</SelectItem>
                    <SelectItem value="2nd">2nd Floor</SelectItem>
                    <SelectItem value="3rd">3rd Floor</SelectItem>
                    <SelectItem value="4th">4th Floor</SelectItem>
                    <SelectItem value="5th">5th Floor</SelectItem>
                    <SelectItem value="6th">6th Floor</SelectItem>
                    <SelectItem value="7th">7th Floor</SelectItem>
                    <SelectItem value="8th">8th Floor</SelectItem>
                    <SelectItem value="9th">9th Floor</SelectItem>
                    <SelectItem value="10th+">10th Floor or Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Monthly Rent (PKR) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => handleInputChange("price", e.target.value)}
                onBlur={() => markTouched("price")}
                placeholder="Enter monthly rent amount"
                className={touched.price && !formData.price ? "border-red-500" : ""}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Specifications */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Building className="w-5 h-5" />
              Apartment Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Select value={formData.bedrooms || ""} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                  <SelectTrigger className={touched.bedrooms && !formData.bedrooms ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4 Bedrooms</SelectItem>
                    <SelectItem value="5+">5+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Select value={formData.bathrooms || ""} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                  <SelectTrigger className={touched.bathrooms && !formData.bathrooms ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bathroom</SelectItem>
                    <SelectItem value="2">2 Bathrooms</SelectItem>
                    <SelectItem value="3">3 Bathrooms</SelectItem>
                    <SelectItem value="4">4 Bathrooms</SelectItem>
                    <SelectItem value="5+">5+ Bathrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft) *</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area || ""}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  onBlur={() => markTouched("area")}
                  placeholder="Enter area in sq ft"
                  className={touched.area && !formData.area ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label>Apartment Type</Label>
              <RadioGroup 
                value={formData.apartmentType || ""} 
                onValueChange={(value) => handleInputChange("apartmentType", value)}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="residential" id="residential" />
                  <Label htmlFor="residential">Residential</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serviced" id="serviced" />
                  <Label htmlFor="serviced">Serviced Apartment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="luxury" id="luxury" />
                  <Label htmlFor="luxury">Luxury</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Furnished Status */}
            <div className="space-y-2">
              <Label>Furnished Status</Label>
              <RadioGroup 
                value={formData.furnished || ""} 
                onValueChange={(value) => handleInputChange("furnished", value)}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="furnished" id="furnished" />
                  <Label htmlFor="furnished">Fully Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semi-furnished" id="semi-furnished" />
                  <Label htmlFor="semi-furnished">Semi Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unfurnished" id="unfurnished" />
                  <Label htmlFor="unfurnished">Unfurnished</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability">Available From</Label>
              <Input
                id="availability"
                type="date"
                value={formData.availability || ""}
                onChange={(e) => handleInputChange("availability", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Features & Pricing */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <DollarSign className="w-5 h-5" />
              Features, Amenities & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Property Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                onBlur={() => markTouched("description")}
                placeholder="Describe your apartment, its features, nearby facilities, and what makes it special..."
                className={touched.description && !formData.description ? "border-red-500" : ""}
                rows={4}
              />
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities & Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {apartmentAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.id}
                      checked={formData.amenities?.includes(amenity.id) || false}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                    />
                    <Label htmlFor={amenity.id} className="text-sm flex items-center gap-2">
                      <amenity.icon className="w-4 h-4 text-orange-600" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Costs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit (PKR)</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  value={formData.securityDeposit || ""}
                  onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                  placeholder="Enter security deposit amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceCharges">Monthly Maintenance (PKR)</Label>
                <Input
                  id="maintenanceCharges"
                  type="number"
                  value={formData.maintenanceCharges || ""}
                  onChange={(e) => handleInputChange("maintenanceCharges", e.target.value)}
                  placeholder="Enter monthly maintenance charges"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="Add tags and press Enter (e.g., Near Metro, Quiet, Family-friendly)"
              />
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Images */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Upload className="w-5 h-5" />
              Property Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload high-quality images of your apartment. The first image will be used as the main display image.
              </p>
              <EnhancedImageUpload
                uploadedImages={uploadedImages}
                setUploadedImages={setUploadedImages}
                maxImages={10}
                externalLoader={externalLoader}
              />
              {touched.images && (!uploadedImages || uploadedImages.length === 0) && (
                <p className="text-sm text-red-500">At least one image is required</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Owner Details */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <CheckCircle className="w-5 h-5" />
              Owner Verification & Final Details
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          Step {currentStep} of 5
        </div>

        <Button
          onClick={handleNext}
          disabled={
            isSubmitting ||
            (currentStep === 1 && !validateStep1()) ||
            (currentStep === 2 && !validateStep2()) ||
            (currentStep === 3 && !validateStep3()) ||
            (currentStep === 4 && !validateStep4()) ||
            (currentStep === 5 && !validateStep5())
          }
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {currentStep === 5 ? "Submitting..." : "Processing..."}
            </>
          ) : currentStep === 5 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              {editingProperty ? "Update Apartment" : "List Apartment"}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
