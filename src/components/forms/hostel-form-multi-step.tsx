"use client"
import React, { useEffect} from "react"
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
import { useFormValidation, validationSchemas } from "@/lib/form-validation"
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
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import { LocationSelector } from "@/components/ui/location-selector"

interface HostelFormMultiStepProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  uploadedImages: string[]
  setUploadedImages: (images: string[]) => void
  touched: { [key: string]: boolean }
  setTouched: (touched: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void
  tagInput?: string
  setTagInput?: (tag: string) => void
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

export function HostelFormMultiStep({
  formData,
  handleInputChange,
  uploadedImages,
  setUploadedImages,
  touched,
  setTouched,
  tagInput = "",
  setTagInput = () => {},
  propertySubType,
  setPropertySubType,
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
}: HostelFormMultiStepProps) {

  // Mark the relevant fields as touched after a step change
useEffect(() => {
  if (currentStep === 1) {
    setTouched(prev => ({
      ...prev,
      propertyName: true,
      propertyType: true,
      address: true,
      city: true,
      area: true,
    }));
  } else if (currentStep === 2) {
    const fields = propertySubType === 'hostel' 
      ? ['totalRooms', 'availableRooms', 'pricePerBed']
      : propertySubType === 'house' 
        ? ['houseSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
        : propertySubType === 'office' 
          ? ['officeSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
          : ['houseSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus'];
    setTouched(prev => ({ ...prev, ...Object.fromEntries(fields.map(f => [f, true])) }));
  } else if (currentStep === 3) {
    setTouched(prev => ({ ...prev, description: true }));
  } else if (currentStep === 5) {
    setTouched(prev => ({
      ...prev,
      ownerName: true,
      ownerEmail: true,
      ownerPhone: true,
      cnicNumber: true,
    }));
  }
}, [currentStep, propertySubType, setTouched]);


  const {
    validateAllFields,
    getFieldError,
    isFieldValid,
    getFieldClassName
  } = useFormValidation(formData, validationSchemas.property, touched)

  const handleFieldChange = (field: string, value: any) => {
    handleInputChange(field, value)
  }

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // returns true if every field in fields[] has no error
  const checkFieldsValid = (fields: string[]) => {
    const { errors } = validateAllFields();
    return fields.every(f => !errors[f]);
  };


  // Step validation functions
  const validateStep1 = () => {
  const fields = ['propertyName','propertyType','address','country','province','city','area'];
  return checkFieldsValid(fields);
};

const validateStep2 = () => {
  const fields =
    propertySubType === 'hostel' 
      ? ['totalRooms', 'availableRooms', 'pricePerBed']
      : propertySubType === 'house' 
        ? ['houseSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
        : propertySubType === 'office' 
          ? ['officeSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
          : ['houseSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus'];
  return checkFieldsValid(fields);
};

const validateStep3 = () => checkFieldsValid(['description']);

const validateStep4 = () =>
  Boolean(uploadedImages && uploadedImages.length > 0);

const validateStep5 = () => {
  const ownerFields = ['ownerName','ownerEmail','ownerPhone'];
  const ownerValid = checkFieldsValid(ownerFields);
  const agreementsValid = acceptTerms && acceptCommission;
  
  // Debug logging
  console.log('Hostel Step 5 validation:', {
    ownerValid,
    agreementsValid: { acceptTerms, acceptCommission },
    formFields: ownerFields.map(field => ({ [field]: !!formData[field] }))
  });
  
  return ownerValid && agreementsValid;
};


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
              step < currentStep ? 'bg-blue-600 text-white' :
              step === currentStep ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
              'bg-slate-200 text-slate-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-8 h-0.5 mx-1 ${
                step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
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
          {currentStep === 2 && "Property Specifications & Pricing"}
          {currentStep === 3 && "Amenities & Features"}
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
              <Home className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Basic Property Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Sub-Type Selection */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Property Type <span className="text-red-500">*</span>
                </Label>
                <Select value={propertySubType} onValueChange={setPropertySubType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Student Hostel</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Name */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">
                  {propertySubType === 'house' ? 'House Title' :
                   propertySubType === 'office' ? 'Office Title' :
                   propertySubType === 'apartment' ? 'Apartment Title' :
                   'Hostel Name'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder={
                    propertySubType === 'house' ? "e.g., 3 Marla Furnished House near GCUF (min 3 chars)" :
                    propertySubType === 'office' ? "e.g., Startup Space - Main Gulberg (min 3 chars)" :
                    propertySubType === 'apartment' ? "e.g., 2 Bedroom Apartment near University (min 3 chars)" :
                    "e.g., Al-Rehman Boys Hostel (minimum 3 characters)"
                  }
                  value={formData.propertyName}
                  onChange={(e) => handleFieldChange("propertyName", e.target.value)}
                  onBlur={() => handleFieldBlur("propertyName")}
                  className={getFieldClassName("propertyName", "h-12")}
                  required
                />
                {getFieldError('propertyName') && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-red-500">●</span>
                    {getFieldError('propertyName')}
                  </p>
                )}
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleFieldChange("propertyType", value)}>
                  <SelectTrigger className={getFieldClassName("propertyType", "h-12")}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertySubType === 'hostel' && (
                      <>
                        <SelectItem value="boys">Boys Only</SelectItem>
                        <SelectItem value="girls">Girls Only</SelectItem>
                        <SelectItem value="co-living">Co-Living</SelectItem>
                      </>
                    )}
                    {propertySubType === 'house' && (
                      <>
                        <SelectItem value="family">Family House</SelectItem>
                        <SelectItem value="bachelor">Bachelor House</SelectItem>
                        <SelectItem value="couple">Couple House</SelectItem>
                      </>
                    )}
                    {propertySubType === 'office' && (
                      <>
                        <SelectItem value="coworking">Co-working Space</SelectItem>
                        <SelectItem value="private">Private Office</SelectItem>
                        <SelectItem value="shared">Shared Office</SelectItem>
                      </>
                    )}
                    {propertySubType === 'apartment' && (
                      <>
                        <SelectItem value="studio">Studio Apartment</SelectItem>
                        <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                        <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                        <SelectItem value="3-bedroom">3+ Bedroom</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>


            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Location Details</h3>
            </div>
            
            <LocationSelector
              formData={formData}
              handleInputChange={handleInputChange}
              touched={touched}
              setTouched={setTouched}
              getFieldClassName={getFieldClassName}
              getFieldError={getFieldError}
            />
            
            <div className="mt-6 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Complete Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Enter complete address with landmarks"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                onBlur={() => handleFieldBlur("address")}
                rows={3}
                className={getFieldClassName("address", "resize-none")}
                required
              />
              {getFieldError('address') && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="text-red-500">●</span>
                  {getFieldError('address')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Property Specifications & Pricing */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Property Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {propertySubType === 'hostel' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Total Rooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter total rooms"
                      value={formData.totalRooms}
                      onChange={(e) => handleInputChange("totalRooms", e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Available Rooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Currently available"
                      value={formData.availableRooms}
                      onChange={(e) => handleInputChange("availableRooms", e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Price per Bed (Monthly) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="Amount in PKR"
                      value={formData.pricePerBed}
                      onChange={(e) => handleInputChange("pricePerBed", e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </>
              )}

              {(propertySubType === 'house' || propertySubType === 'office' || propertySubType === 'apartment') && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      {propertySubType === 'house' ? 'House Size' :
                       propertySubType === 'apartment' ? 'Apartment Size' :
                       'Office Size'} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={propertySubType === 'house' ? formData.houseSize :
                             propertySubType === 'apartment' ? formData.houseSize :
                             formData.officeSize}
                      onValueChange={(value) => handleInputChange(
                        propertySubType === 'house' ? "houseSize" :
                        propertySubType === 'apartment' ? "houseSize" :
                        "officeSize", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={`Select ${propertySubType} size`} />
                      </SelectTrigger>
                      <SelectContent>
                        {propertySubType === 'house' ? (
                          <>
                            <SelectItem value="3-marla">3 Marla</SelectItem>
                            <SelectItem value="5-marla">5 Marla</SelectItem>
                            <SelectItem value="10-marla">10 Marla</SelectItem>
                            <SelectItem value="1-kanal">1 Kanal</SelectItem>
                          </>
                        ) : propertySubType === 'apartment' ? (
                          <>
                            <SelectItem value="studio">Studio (1 room)</SelectItem>
                            <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                            <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                            <SelectItem value="3-bedroom">3+ Bedroom</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="small">Small (1-5 people)</SelectItem>
                            <SelectItem value="medium">Medium (6-15 people)</SelectItem>
                            <SelectItem value="large">Large (16+ people)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

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
                </>
              )}

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
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Amenities & Features */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Amenities & Features</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenityOptions.map((amenity) => (
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

            {/* Tags Section */}
            <div className="mt-8 space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (e.g., Near University, Peaceful)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') addTag() }}
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
                placeholder="Any additional information about the property..."
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
              <Upload className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Property Images</h3>
              <span className="text-red-500 text-sm">*</span>
            </div>
            
            <EnhancedImageUpload
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              maxImages={10}
              externalLoader={externalLoader}
            />
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Image Guidelines:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload at least 1 image (required)</li>
                <li>• Maximum 10 images allowed</li>
                <li>• Recommended: exterior, interior, and facility photos</li>
                <li>• High quality images get more responses</li>
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
          className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!validateStep5() || isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Property
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
            {!validateStep5() && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium mb-2">Please complete the following:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {!checkFieldsValid(['ownerName']) && <li>• Valid owner name</li>}
                  {!checkFieldsValid(['ownerEmail']) && <li>• Valid email address</li>}
                  {!checkFieldsValid(['ownerPhone']) && <li>• Valid phone number</li>}
                  {!acceptTerms && <li>• Accept terms of service</li>}
                  {!acceptCommission && <li>• Accept commission structure</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
