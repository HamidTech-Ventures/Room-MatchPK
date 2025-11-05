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
import { useFormValidation, validationSchemas } from "@/lib/form-validation"
import { 
  Upload, 
  ChefHat, 
  Clock, 
  DollarSign, 
  Truck, 
  Shield, 
  X, 
  MapPin,
  Utensils,
  Users,
  FileText,
  Wifi,
  Car,
  AirVent,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import { LocationSelector } from "@/components/ui/location-selector"

interface MessFormProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  uploadedImages: string[]
  setUploadedImages: (images: string[]) => void
  touched: { [key: string]: boolean }
  setTouched: (touched: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void
  updateFoodTiming: (mealType: string, field: string, value: any) => void
  updateFoodOption: (option: string, value: boolean) => void
  updateFoodPricing: (field: string, value: any) => void
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

export function MessFormMultiStep({ 
  formData, 
  handleInputChange, 
  uploadedImages, 
  setUploadedImages,
  touched,
  setTouched,
  updateFoodTiming,
  updateFoodOption,
  updateFoodPricing,
  tagInput = "",
  setTagInput = () => {},
  externalLoader,
  currentStep = 1,
  setCurrentStep = () => {},
  onSubmit = () => {},
  // Owner details props with defaults
  cnicPicFront = "",
  setCnicPicFront = () => {},
  cnicPicBack = "",
  setCnicPicBack = () => {},
  ownerPic = "",
  setOwnerPic = () => {},
  acceptVerify = false,
  setAcceptVerify = () => {},
  acceptTerms = false,
  setAcceptTerms = () => {},
  acceptCommission = false,
  setAcceptCommission = () => {},
  isSubmitting = false,
  editingProperty = null
}: MessFormProps) {
  
  const {
    validateAllFields,
    getFieldError,
    isFieldValid: isFieldValidHook,
    getFieldClassName
  } = useFormValidation(formData, validationSchemas.mess, touched)

  const handleFieldChange = (field: string, value: any) => {
    handleInputChange(field, value)
  }

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }
  


  const getFieldClass = (field: string, baseClass = "", minLength = 0) => {
    const value = formData[field]
    const invalid = touched[field] && (!value || (minLength > 0 && value.length < minLength))
    return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`
  }

  const isFieldValid = (field: string, minLength = 0, minValue = 0) => {
    const value = formData[field]
    if (!value) return false
    if (minLength > 0 && value.length < minLength) return false
    if (minValue > 0 && Number(value) < minValue) return false
    return true
  }

  // Enhanced validation functions for owner details
  const validateName = (name: string) => {
    if (!name || name.trim().length === 0) return { isValid: false, message: "Name is required" }
    if (name.trim().length < 2) return { isValid: false, message: "Name must be at least 2 characters" }
    if (name.trim().length > 50) return { isValid: false, message: "Name must be less than 50 characters" }
    if (!/^[a-zA-Z\s'.,-]*$/.test(name)) return { isValid: false, message: "Invalid characters in name" }
    return { isValid: true, message: "Valid name" }
  }

  const validateEmail = (email: string) => {
    if (!email || email.trim().length === 0) return { isValid: false, message: "Email is required" }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(email)) return { isValid: false, message: "Invalid email format" }
    if (email.length > 254) return { isValid: false, message: "Email too long" }
    return { isValid: true, message: "Valid email" }
  }

  const validatePhone = (phone: string) => {
    if (!phone || phone.trim().length === 0) return { isValid: false, message: "Phone is required" }
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 15) return { isValid: false, message: "Invalid phone length" }
    const pakistaniPatterns = [
      /^(\+92|92|0)?3[0-9]{9}$/, // Mobile numbers
      /^(\+92|92|0)?[2-9][0-9]{7,10}$/, // Landline numbers
    ]
    if (!pakistaniPatterns.some(pattern => pattern.test(cleanPhone))) {
      return { isValid: false, message: "Invalid Pakistani phone number" }
    }
    return { isValid: true, message: "Valid phone" }
  }

  const validateCNIC = (cnic: string) => {
    if (!cnic || cnic.trim().length === 0) return { isValid: false, message: "CNIC is required" }
    return { isValid: true, message: "Valid CNIC" }
  }

  const getValidationMessage = (field: string, minLength = 0, minValue = 0, fieldName = "") => {
    const value = formData[field]
    if (!value) return `${fieldName} is required`
    if (minLength > 0 && value.length < minLength) {
      return `Need ${minLength - value.length} more character(s) (minimum ${minLength})`
    }
    if (minValue > 0 && Number(value) < minValue) {
      return `Must be at least ${minValue}`
    }
    return "Valid"
  }

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', (formData.tags || []).filter((tag: string) => tag !== tagToRemove))
  }

  // Step validation functions
  const validateStep1 = () => {
    const requiredFields = ['propertyName', 'messType', 'genderPreference', 'pricePerBed', 'totalRooms', 'availableRooms', 'country', 'province', 'city', 'area', 'address']
    return requiredFields.every(field => {
      const value = formData[field]
      if (!value || (typeof value === 'string' && value.trim() === '')) return false
      if (field === 'propertyName' && value.length < 3) return false
      if (field === 'address' && value.length < 5) return false
      if (field === 'area' && value.length < 2) return false
      if (['pricePerBed', 'totalRooms'].includes(field) && Number(value) < 1) return false
      if (field === 'availableRooms' && (Number(value) < 0 || Number(value) > Number(formData.totalRooms || 0))) return false
      return true
    })
  }

  const validateStep2 = () => {
    // Step 2 validation - description and at least one meal timing is required
    const descriptionValid = formData.description && formData.description.length >= 10
    const hasEnabledMeal = formData.foodTimings?.breakfast?.enabled ||
                          formData.foodTimings?.lunch?.enabled ||
                          formData.foodTimings?.dinner?.enabled ||
                          formData.foodTimings?.snacks?.enabled
    return descriptionValid && hasEnabledMeal
  }

  const validateStep3 = () => {
    // Step 3 validation - mostly optional fields
    return true // Menu and payment options are mostly optional
  }

  const validateStep4 = () => {
    // Step 4 validation - images are required
    return uploadedImages && uploadedImages.length >= 3
  }

  const validateStep5 = () => {
    // Step 5 validation - owner details and acceptance checkboxes
    const nameValid = !formData.ownerName || validateName(formData.ownerName || '').isValid
    const emailValid = !formData.ownerEmail || validateEmail(formData.ownerEmail || '').isValid
    const phoneValid = !formData.ownerPhone || validatePhone(formData.ownerPhone || '').isValid
    
    const fieldsValid = nameValid && emailValid && phoneValid
    
    // Check if all acceptance checkboxes are checked
    const acceptanceValid = acceptTerms && acceptCommission
    
    // Debug logging
    console.log('Step 5 validation:', {
      fieldsValid: { nameValid, emailValid, phoneValid },
      acceptanceValid: { acceptTerms, acceptCommission }
    })
    
    return fieldsValid && acceptanceValid
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return validateStep1()
      case 2: return validateStep2()
      case 3: return validateStep3()
      case 4: return validateStep4()
      case 5: return validateStep5()
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (isStepValid(5)) {
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
              step < currentStep ? 'bg-emerald-600 text-white' :
              step === currentStep ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600' :
              'bg-slate-200 text-slate-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-8 h-0.5 mx-1 ${
                step < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
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
          {currentStep === 2 && "Rules, Nearby Places & Food Info"}
          {currentStep === 3 && "Menu, Quality & Payment"}
          {currentStep === 4 && "Images & Additional Info"}
          {currentStep === 5 && "Owner Details & Submission"}
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <StepIndicator />
      
      {/* Step 1: Mess Details & Location */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Mess Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                Mess Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Mess Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Al-Rehman Tiffin Service"
                    value={formData.propertyName || ''}
                    onChange={(e) => handleInputChange("propertyName", e.target.value)}
                    className={getFieldClass("propertyName", "h-12", 3)}
                    onBlur={() => setTouched(prev => ({ ...prev, propertyName: true }))}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${isFieldValid('propertyName', 3) ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.propertyName ? `${formData.propertyName.length}/3 characters` : '0/3 characters'}
                    </span>
                    <span className={`${isFieldValid('propertyName', 3) ? 'text-green-600' : 'text-red-500'}`}>
                      {touched.propertyName ? getValidationMessage('propertyName', 3, 0, 'Mess name') : 'Minimum 3 characters required'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Mess Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    key={`mess-type-${formData.messType || 'empty'}`}
                    value={formData.messType || ''}
                    onValueChange={(value) => {
                      handleInputChange("messType", value)
                      setTouched(prev => ({ ...prev, messType: true }))
                    }}
                  >
                    <SelectTrigger className={`h-12 ${touched.messType && !formData.messType ? 'border-red-500 focus:border-red-500' : 'border-slate-300'}`}>
                      <SelectValue placeholder="Select mess type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                      <SelectItem value="both">Both Veg & Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs">
                    <span className={`${formData.messType ? 'text-green-600' : 'text-red-500'}`}>
                      {touched.messType ? (formData.messType ? '✓ Mess type selected' : 'Please select mess type') : 'Required field'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Gender Preference <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.genderPreference || ''}
                    onValueChange={(value) => {
                      handleInputChange("genderPreference", value)
                      setTouched(prev => ({ ...prev, genderPreference: true }))
                    }}
                  >
                    <SelectTrigger className={`h-12 ${touched.genderPreference && !formData.genderPreference ? 'border-red-500 focus:border-red-500' : 'border-slate-300'}`}>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys Only</SelectItem>
                      <SelectItem value="girls">Girls Only</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs">
                    <span className={`${formData.genderPreference ? 'text-green-600' : 'text-red-500'}`}>
                      {touched.genderPreference ? (formData.genderPreference ? '✓ Preference selected' : 'Please select gender preference') : 'Required field'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Monthly Charges (PKR) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 8000"
                    value={formData.pricePerBed || ''}
                    onChange={(e) => handleInputChange("pricePerBed", e.target.value)}
                    className={getFieldClass("pricePerBed", "h-12")}
                    onBlur={() => setTouched(prev => ({ ...prev, pricePerBed: true }))}
                    min="1"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${isFieldValid('pricePerBed', 0, 1) ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.pricePerBed ? `₨${Number(formData.pricePerBed).toLocaleString()}` : 'No amount set'}
                    </span>
                    <span className={`${isFieldValid('pricePerBed', 0, 1) ? 'text-green-600' : 'text-red-500'}`}>
                      {touched.pricePerBed ? (isFieldValid('pricePerBed', 0, 1) ? '✓ Valid price' : 'Must be greater than 0') : 'Required field'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Total Capacity (People) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.totalRooms || ''}
                    onChange={(e) => handleInputChange("totalRooms", e.target.value)}
                    className={getFieldClass("totalRooms", "h-12")}
                    min="1"
                    onBlur={() => setTouched(prev => ({ ...prev, totalRooms: true }))}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${isFieldValid('totalRooms', 0, 1) ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.totalRooms ? `${formData.totalRooms} people capacity` : 'No capacity set'}
                    </span>
                    <span className={`${isFieldValid('totalRooms', 0, 1) ? 'text-green-600' : 'text-red-500'}`}>
                      {touched.totalRooms ? (isFieldValid('totalRooms', 0, 1) ? '✓ Valid capacity' : 'Must be at least 1') : 'Minimum 1 person'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Available Spots <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.availableRooms || ''}
                    onChange={(e) => handleInputChange("availableRooms", e.target.value)}
                    className={getFieldClass("availableRooms", "h-12")}
                    min="0"
                    max={formData.totalRooms || undefined}
                    onBlur={() => setTouched(prev => ({ ...prev, availableRooms: true }))}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${formData.availableRooms !== undefined && Number(formData.availableRooms) >= 0 && Number(formData.availableRooms) <= Number(formData.totalRooms || 0) ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.availableRooms ? `${formData.availableRooms} spots available` : 'No spots set'}
                    </span>
                    <span className={`${formData.availableRooms !== undefined && Number(formData.availableRooms) >= 0 && Number(formData.availableRooms) <= Number(formData.totalRooms || 0) ? 'text-green-600' : 'text-red-500'}`}>
                      {touched.availableRooms ? (
                        formData.availableRooms !== undefined && Number(formData.availableRooms) >= 0 && Number(formData.availableRooms) <= Number(formData.totalRooms || 0) ? 
                        '✓ Valid spots' : 
                        Number(formData.availableRooms || 0) > Number(formData.totalRooms || 0) ? 
                        `Cannot exceed ${formData.totalRooms || 0}` : 
                        'Must be 0 or greater'
                      ) : `Max: ${formData.totalRooms || 0}`}
                    </span>
                  </div>
                </div>
              </div>
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
              <LocationSelector
                formData={formData}
                handleInputChange={handleInputChange}
                touched={touched}
                setTouched={setTouched}
                getFieldClassName={(field, baseClass) => {
                  const invalid = touched[field] && !formData[field]
                  return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`
                }}
                getFieldError={(field) => {
                  if (!touched[field] || formData[field]) return null
                  return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
                }}
              />
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Full Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter complete address with landmarks..."
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={getFieldClass("address", "min-h-[100px]", 5)}
                  onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                />
                <div className="flex justify-between text-xs">
                  <span className={`${isFieldValid('address', 5) ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.address ? `${formData.address.length}/5 characters` : '0/5 characters'}
                  </span>
                  <span className={`${isFieldValid('address', 5) ? 'text-green-600' : 'text-red-500'}`}>
                    {touched.address ? getValidationMessage('address', 5, 0, 'Address') : 'Minimum 5 characters required'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!isStepValid(1)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Rules & Food Info
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Mess Rules, Nearby Places & Food Information */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Mess Rules and Nearby Places */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Mess Rules & Nearby Places
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mess Rules */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">
                  Mess Rules & Policies
                </Label>
                <Textarea
                  placeholder="Enter each rule on a separate line:
• Advance payment required
• No outside food allowed  
• Service timing: 12-3 PM & 7-10 PM
• Monthly payment due by 5th
• 24 hours notice for meal cancellation"
                  value={formData.rules || ''}
                  onChange={(e) => handleInputChange("rules", e.target.value)}
                  className="min-h-[100px] border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500">
                  💡 Tip: Enter each rule on a separate line for better display
                </p>
              </div>

              {/* Nearby University */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Nearby University/Institution
                </Label>
                <Input
                  placeholder="e.g., University of Punjab, LUMS, etc."
                  value={formData.nearbyUniversity || ''}
                  onChange={(e) => handleInputChange("nearbyUniversity", e.target.value)}
                  className="h-12 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tags (e.g., Hygienic, Fast Service, Home Style)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <Button 
                    type="button" 
                    onClick={addTag}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {(formData.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(formData.tags || []).map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-emerald-900"
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

          {/* Food Information & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                Food Information & Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Menu Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Describe your typical menu, dishes offered, variety etc..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={getFieldClass("description", "min-h-[120px]", 10)}
                  onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                />
                <div className="flex justify-between text-xs">
                  <span className={`${isFieldValid('description', 10) ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.description ? `${formData.description.length}/10 characters` : '0/10 characters'}
                  </span>
                  <span className={`${isFieldValid('description', 10) ? 'text-green-600' : 'text-red-500'}`}>
                    {touched.description ? getValidationMessage('description', 10, 0, 'Menu description') : 'Minimum 10 characters required'}
                  </span>
                </div>
              </div>

              {/* Food Types */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Food Types Available</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="veg"
                      checked={formData.foodOptions?.veg || false}
                      onCheckedChange={(checked) => updateFoodOption("veg", checked as boolean)}
                    />
                    <Label htmlFor="veg" className="text-sm">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="non-veg"
                      checked={formData.foodOptions?.nonVeg || false}
                      onCheckedChange={(checked) => updateFoodOption("nonVeg", checked as boolean)}
                    />
                    <Label htmlFor="non-veg" className="text-sm">Non-Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="halal"
                      checked={formData.foodOptions?.halal || false}
                      onCheckedChange={(checked) => updateFoodOption("halal", checked as boolean)}
                    />
                    <Label htmlFor="halal" className="text-sm">Halal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="custom-diet"
                      checked={formData.foodOptions?.customDiet || false}
                      onCheckedChange={(checked) => updateFoodOption("customDiet", checked as boolean)}
                    />
                    <Label htmlFor="custom-diet" className="text-sm">Custom Diet</Label>
                  </div>
                </div>
              </div>

              {/* Meals Offered with Details */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">
                  Meals Offered with Details <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Breakfast */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        Breakfast
                      </Label>
                      <Checkbox
                        checked={formData.foodTimings?.breakfast?.enabled || false}
                        onCheckedChange={(checked) => updateFoodTiming("breakfast", "enabled", checked)}
                      />
                    </div>
                    {formData.foodTimings?.breakfast?.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-slate-600">Start Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.breakfast?.startTime || "07:00"}
                              onChange={(e) => updateFoodTiming("breakfast", "startTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">End Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.breakfast?.endTime || "09:00"}
                              onChange={(e) => updateFoodTiming("breakfast", "endTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Typical Items</Label>
                          <Input
                            placeholder="e.g., Paratha, Tea, Egg, Jam"
                            value={formData.foodTimings?.breakfast?.items || ""}
                            onChange={(e) => updateFoodTiming("breakfast", "items", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Price (PKR)</Label>
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={formData.foodTimings?.breakfast?.price || ""}
                            onChange={(e) => updateFoodTiming("breakfast", "price", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lunch */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        Lunch
                      </Label>
                      <Checkbox
                        checked={formData.foodTimings?.lunch?.enabled || false}
                        onCheckedChange={(checked) => updateFoodTiming("lunch", "enabled", checked)}
                      />
                    </div>
                    {formData.foodTimings?.lunch?.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-slate-600">Start Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.lunch?.startTime || "12:00"}
                              onChange={(e) => updateFoodTiming("lunch", "startTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">End Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.lunch?.endTime || "14:00"}
                              onChange={(e) => updateFoodTiming("lunch", "endTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Typical Items</Label>
                          <Input
                            placeholder="e.g., Rice, Roti, Chicken Curry, Dal"
                            value={formData.foodTimings?.lunch?.items || ""}
                            onChange={(e) => updateFoodTiming("lunch", "items", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Price (PKR)</Label>
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={formData.foodTimings?.lunch?.price || ""}
                            onChange={(e) => updateFoodTiming("lunch", "price", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dinner */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        Dinner
                      </Label>
                      <Checkbox
                        checked={formData.foodTimings?.dinner?.enabled || false}
                        onCheckedChange={(checked) => updateFoodTiming("dinner", "enabled", checked)}
                      />
                    </div>
                    {formData.foodTimings?.dinner?.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-slate-600">Start Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.dinner?.startTime || "19:00"}
                              onChange={(e) => updateFoodTiming("dinner", "startTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">End Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.dinner?.endTime || "21:00"}
                              onChange={(e) => updateFoodTiming("dinner", "endTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Typical Items</Label>
                          <Input
                            placeholder="e.g., Roti, Sabzi, Rice, Chicken"
                            value={formData.foodTimings?.dinner?.items || ""}
                            onChange={(e) => updateFoodTiming("dinner", "items", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Price (PKR)</Label>
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={formData.foodTimings?.dinner?.price || ""}
                            onChange={(e) => updateFoodTiming("dinner", "price", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Snacks */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        Snacks/Tea
                      </Label>
                      <Checkbox
                        checked={formData.foodTimings?.snacks?.enabled || false}
                        onCheckedChange={(checked) => updateFoodTiming("snacks", "enabled", checked)}
                      />
                    </div>
                    {formData.foodTimings?.snacks?.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-slate-600">Start Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.snacks?.startTime || "16:00"}
                              onChange={(e) => updateFoodTiming("snacks", "startTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">End Time</Label>
                            <Input
                              type="time"
                              value={formData.foodTimings?.snacks?.endTime || "17:00"}
                              onChange={(e) => updateFoodTiming("snacks", "endTime", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Typical Items</Label>
                          <Input
                            placeholder="e.g., Tea, Biscuits, Samosa, Pakora"
                            value={formData.foodTimings?.snacks?.items || ""}
                            onChange={(e) => updateFoodTiming("snacks", "items", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Price (PKR)</Label>
                          <Input
                            type="number"
                            placeholder="Optional"
                            value={formData.foodTimings?.snacks?.price || ""}
                            onChange={(e) => updateFoodTiming("snacks", "price", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: Enable the meals you offer and provide timing and typical items for better visibility
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(2)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Menu & Payment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Menu, Quality & Payment */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Menu & Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Menu & Quality Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Hygiene Certification
                  </Label>
                  <Input
                    placeholder="Food safety certificate details"
                    value={formData.foodHygiene || ''}
                    onChange={(e) => handleInputChange("foodHygiene", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Staff Information
                  </Label>
                  <Input
                    placeholder="Number of staff, experience etc."
                    value={formData.foodStaff || ''}
                    onChange={(e) => handleInputChange("foodStaff", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="menu-rotation"
                  checked={formData.foodMenuRotation || false}
                  onCheckedChange={(checked) => handleInputChange("foodMenuRotation", checked)}
                />
                <Label htmlFor="menu-rotation" className="text-sm font-medium">
                  Weekly Menu Rotation Available
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Special Requirements/Notes
                </Label>
                <Textarea
                  placeholder="Any special dietary accommodations, allergies handled, etc."
                  value={formData.foodSpecialRequirements || ''}
                  onChange={(e) => handleInputChange("foodSpecialRequirements", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Individual Meal Timings */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Meals Offered with Details <span className="text-red-500">*</span></Label>
                <p className="text-sm text-slate-600">Enable at least one meal timing for your mess service</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.foodTimings || {}).map(([mealType, timing]: [string, any]) => (
                    <div key={mealType} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          id={`meal-${mealType}`}
                          checked={timing.enabled}
                          onCheckedChange={(checked) => updateFoodTiming(mealType, 'enabled', checked)}
                        />
                        <Label htmlFor={`meal-${mealType}`} className="text-sm font-medium capitalize">
                          {mealType}
                        </Label>
                      </div>

                      {timing.enabled && (
                        <div className="space-y-3 ml-6">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Serving Time Range</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-500">From</Label>
                                <Input
                                  type="time"
                                  value={timing.startTime || ''}
                                  onChange={(e) => updateFoodTiming(mealType, 'startTime', e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-500">To</Label>
                                <Input
                                  type="time"
                                  value={timing.endTime || ''}
                                  onChange={(e) => updateFoodTiming(mealType, 'endTime', e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            {timing.startTime && timing.endTime && (
                              <div className="text-xs text-emerald-600 mt-1">
                                ✓ {timing.startTime} - {timing.endTime}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-600">Individual Price (PKR) - Optional</Label>
                            <Input
                              type="number"
                              placeholder={`${mealType === 'breakfast' ? '80' : mealType === 'lunch' ? '150' : mealType === 'dinner' ? '180' : '50'}`}
                              value={formData.foodPricing?.[mealType] || ''}
                              onChange={(e) => updateFoodPricing(mealType, e.target.value)}
                              className="h-8 text-xs"
                              min="0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  💡 Individual meal prices are optional and separate from your monthly package price
                </p>
              </div>

              {/* General Service Timings */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">General Service Timings (Additional Info)</Label>
                <Input
                  placeholder="e.g., Breakfast: 7-9 AM, Lunch: 12-2 PM, Dinner: 7-9 PM"
                  value={formData.timings || ''}
                  onChange={(e) => handleInputChange("timings", e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-slate-500">This is for additional timing information only</p>
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
                      id="cash"
                      checked={formData.paymentOptions?.cash || false}
                      onCheckedChange={(checked) => handleInputChange("paymentOptions", { ...formData.paymentOptions, cash: checked })}
                    />
                    <Label htmlFor="cash" className="text-sm font-medium">Cash Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jazzcash"
                      checked={formData.paymentOptions?.jazzcash || false}
                      onCheckedChange={(checked) => handleInputChange("paymentOptions", { ...formData.paymentOptions, jazzcash: checked })}
                    />
                    <Label htmlFor="jazzcash" className="text-sm font-medium">JazzCash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="easypaisa"
                      checked={formData.paymentOptions?.easypaisa || false}
                      onCheckedChange={(checked) => handleInputChange("paymentOptions", { ...formData.paymentOptions, easypaisa: checked })}
                    />
                    <Label htmlFor="easypaisa" className="text-sm font-medium">EasyPaisa</Label>
                  </div>
                </div>
              </div>

              {/* Trial and Delivery Options */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trial-available"
                    checked={formData.trialAvailable || false}
                    onCheckedChange={(checked) => handleInputChange("trialAvailable", checked)}
                  />
                  <Label htmlFor="trial-available" className="text-sm font-medium">
                    Trial Available (1-2 days trial service)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delivery-available"
                    checked={formData.deliveryAvailable || false}
                    onCheckedChange={(checked) => handleInputChange("deliveryAvailable", checked)}
                  />
                  <Label htmlFor="delivery-available" className="text-sm font-medium">
                    Home Delivery Available
                  </Label>
                </div>

                {formData.deliveryAvailable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Delivery Charges (PKR)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        value={formData.deliveryCharges || ''}
                        onChange={(e) => handleInputChange("deliveryCharges", e.target.value)}
                        className="h-12"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Coverage Area
                      </Label>
                      <Input
                        placeholder="e.g., 5km radius, specific areas"
                        value={formData.coverageArea || ''}
                        onChange={(e) => handleInputChange("coverageArea", e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rules & Food
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(3)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Images & Final
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Images & Final Details */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Mess Images <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedImageUpload
                uploadedImages={uploadedImages}
                setUploadedImages={setUploadedImages}
                maxImages={10}
                minImages={3}
                maxFileSize={5}
                folder="roommatch_images/mess"
                title="Upload Mess Images"
                description="Add high-quality photos of your kitchen, dining area, and facilities"
                required={true}
                externalLoader={externalLoader}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Food Capacity (Daily)
                </Label>
                <Input
                  placeholder="How many people can you serve daily?"
                  value={formData.foodCapacity || ''}
                  onChange={(e) => handleInputChange("foodCapacity", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Sample Menu Details
                </Label>
                <Textarea
                  placeholder="Describe a typical day's menu in detail..."
                  value={formData.sampleMenu || ''}
                  onChange={(e) => handleInputChange("sampleMenu", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Validation Status */}
          <Card className="border-emerald-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Form Validation Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`flex items-center gap-2 ${isStepValid(1) ? 'text-green-600' : 'text-red-500'}`}>
                    {isStepValid(1) ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span className="text-sm">Step 1: Basic Details & Location</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isStepValid(2) ? 'text-green-600' : 'text-red-500'}`}>
                    {isStepValid(2) ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span className="text-sm">Step 2: Rules & Food Info</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isStepValid(3) ? 'text-green-600' : 'text-red-500'}`}>
                    {isStepValid(3) ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span className="text-sm">Step 3: Menu & Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    {isStepValid(4) ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span className="text-sm">Step 4: Images & Final Details</span>
                  </div>
                </div>
                {!isStepValid(4) && uploadedImages.length < 3 && (
                  <p className="text-sm text-red-500 mt-2">
                    ⚠️ Please upload at least 3 images to complete your listing
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu & Payment
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(4)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Owner Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Owner Details & Submission */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <OwnerDetailsForm
            formData={formData}
            handleInputChange={handleInputChange}
            cnicPicFront={cnicPicFront}
            setCnicPicFront={setCnicPicFront}
            cnicPicBack={cnicPicBack}
            setCnicPicBack={setCnicPicBack}
            ownerPic={ownerPic}
            setOwnerPic={setOwnerPic}
            acceptVerify={acceptVerify}
            setAcceptVerify={setAcceptVerify}
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            acceptCommission={acceptCommission}
            setAcceptCommission={setAcceptCommission}
            isSubmitting={isSubmitting}
            editingProperty={editingProperty}
          />

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Images
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!isStepValid(5) || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Mess Listing
                </>
              )}
            </Button>
            {!isStepValid(5) && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium mb-2">Please complete the following:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {formData.ownerName && !validateName(formData.ownerName || '').isValid && <li>• Valid owner name (2-50 characters)</li>}
                  {formData.ownerEmail && !validateEmail(formData.ownerEmail || '').isValid && <li>• Valid email address</li>}
                  {formData.ownerPhone && !validatePhone(formData.ownerPhone || '').isValid && <li>• Valid Pakistani phone number</li>}

                  {!acceptTerms && <li>• Accept terms of service</li>}
                  {!acceptCommission && <li>• Accept commission structure</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
