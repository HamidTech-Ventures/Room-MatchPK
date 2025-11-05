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
  Shield
} from "lucide-react"
import { LocationSelector } from "@/components/ui/location-selector"

interface HouseFormMultiStepProps {
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

const houseAmenities = [
  { id: "wifi", label: "High-Speed Wi-Fi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "parking", label: "Parking Space", icon: Car },
  { id: "security", label: "Security System", icon: Shield },
  { id: "garden", label: "Garden/Lawn", icon: Home },
  { id: "terrace", label: "Terrace/Balcony", icon: Home },
  { id: "kitchen", label: "Modular Kitchen", icon: Home },
  { id: "water", label: "24/7 Water Supply", icon: Home },
  { id: "electricity", label: "Backup Generator", icon: Home },
  { id: "maintenance", label: "Maintenance Service", icon: Home },
]

export function HouseFormMultiStep({
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
}: HouseFormMultiStepProps) {

  // Step validation functions
  const validateStep1 = () => {
    const requiredFields = ['houseTitle', 'country', 'province', 'city', 'area', 'address', 'mapLink']
    return requiredFields.every(field => formData[field] && formData[field].trim() !== '')
  }

  const validateStep2 = () => {
    return formData.houseSize && formData.bedrooms && formData.bathrooms && formData.furnishingStatus
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
              step < currentStep ? 'bg-green-600 text-white' :
              step === currentStep ? 'bg-green-100 text-green-600 border-2 border-green-600' :
              'bg-slate-200 text-slate-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-8 h-0.5 mx-1 ${
                step < currentStep ? 'bg-green-600' : 'bg-slate-200'
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
          {currentStep === 2 && "House Specifications"}
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
              <Home className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">House Details</h3>
            </div>
            
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

            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">Location Details</h3>
            </div>
            
            <LocationSelector
              formData={formData}
              handleInputChange={handleInputChange}
              touched={touched}
              setTouched={setTouched}
              getFieldClassName={(field, baseClass) => {
                const invalid = touched[field] && !formData[field]
                return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-green-500 focus:ring-green-500'}`
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
                placeholder="Enter complete address with landmarks"
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

      {/* Step 2: House Specifications */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Bed className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">House Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <SelectItem value="2-kanal">2 Kanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Bedrooms <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Number of bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4 Bedrooms</SelectItem>
                    <SelectItem value="5+">5+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Bathrooms <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Number of bathrooms" />
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
                <Label className="text-sm font-semibold text-slate-700">
                  Furnishing Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.furnishingStatus} onValueChange={(value) => handleInputChange("furnishingStatus", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select furnishing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">House Type</Label>
                <Select value={formData.houseType} onValueChange={(value) => handleInputChange("houseType", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select house type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Floor</Label>
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
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <Label className="text-sm font-semibold text-slate-700 mb-4 block">House Features</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {houseAmenities.map((amenity) => (
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
              <DollarSign className="w-6 h-6 text-green-600" />
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
                  Preferred Tenant
                </Label>
                <Select value={formData.preferredTenant} onValueChange={(value) => handleInputChange("preferredTenant", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="bachelors">Bachelors</SelectItem>
                    <SelectItem value="professionals">Working Professionals</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-8 space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Rental Terms</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petsAllowed"
                    checked={formData.petsAllowed || false}
                    onCheckedChange={(checked) => handleInputChange("petsAllowed", checked)}
                  />
                  <Label htmlFor="petsAllowed" className="text-sm text-slate-700">Pets Allowed</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smokingAllowed"
                    checked={formData.smokingAllowed || false}
                    onCheckedChange={(checked) => handleInputChange("smokingAllowed", checked)}
                  />
                  <Label htmlFor="smokingAllowed" className="text-sm text-slate-700">Smoking Allowed</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="utilitiesIncluded"
                    checked={formData.utilitiesIncluded || false}
                    onCheckedChange={(checked) => handleInputChange("utilitiesIncluded", checked)}
                  />
                  <Label htmlFor="utilitiesIncluded" className="text-sm text-slate-700">Utilities Included in Rent</Label>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="mt-8 space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (e.g., Near School, Peaceful Area)"
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
                placeholder="Any additional information about the house..."
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
              <Upload className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">House Images</h3>
              <span className="text-red-500 text-sm">*</span>
            </div>
            
            <EnhancedImageUpload
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              maxImages={15}
              externalLoader={externalLoader}
            />
            
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Image Guidelines:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Upload at least 1 image (required)</li>
                <li>• Maximum 15 images allowed</li>
                <li>• Include: exterior, living room, bedrooms, kitchen, bathrooms</li>
                <li>• High quality images attract more tenants</li>
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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!validateStep5() || isSubmitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit House
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
