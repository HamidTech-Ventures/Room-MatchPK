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

export function MessForm({ 
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
  onSubmit = () => {}
}: MessFormProps) {
  
  // Debug logging
  React.useEffect(() => {
    console.log('=== MESS FORM DATA ===')
    console.log('messType:', formData.messType)
    console.log('timings:', formData.timings)
    console.log('propertyName:', formData.propertyName)
    console.log('Full formData:', formData)
  }, [formData.messType, formData.timings, formData.propertyName])

  // Force re-render when messType changes to ensure Select updates
  React.useEffect(() => {
    console.log('MessType changed to:', formData.messType)
  }, [formData.messType])
  




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
    const requiredFields = ['propertyName', 'messType', 'genderPreference', 'pricePerBed', 'totalRooms', 'availableRooms', 'city', 'area', 'address']
    return requiredFields.every(field => {
      const value = formData[field]
      if (!value) return false
      if (field === 'propertyName' && value.length < 3) return false
      if (field === 'address' && value.length < 5) return false
      if (field === 'area' && value.length < 2) return false
      if (['pricePerBed', 'totalRooms'].includes(field) && Number(value) < 1) return false
      if (field === 'availableRooms' && (Number(value) < 0 || Number(value) > Number(formData.totalRooms || 0))) return false
      return true
    })
  }

  const validateStep2 = () => {
    // Step 2 has mostly optional fields, just ensure at least description has some content
    return formData.description && formData.description.length >= 10
  }

  const validateStep3 = () => {
    // Step 3 validation - mostly optional fields
    return true // Menu and payment options are mostly optional
  }

  const validateStep4 = () => {
    // Step 4 validation - images are required
    return uploadedImages && uploadedImages.length >= 3
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return validateStep1()
      case 2: return validateStep2()
      case 3: return validateStep3()
      case 4: return validateStep4()
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (isStepValid(4)) {
      onSubmit()
    }
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step < currentStep ? 'bg-emerald-600 text-white' :
              step === currentStep ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600' :
              'bg-slate-200 text-slate-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Step {currentStep} of 4
        </h2>
        <p className="text-sm text-slate-600">
          {currentStep === 1 && "Basic Details & Location"}
          {currentStep === 2 && "Rules, Nearby Places & Food Info"}
          {currentStep === 3 && "Menu, Quality & Payment"}
          {currentStep === 4 && "Images & Final Details"}
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city || ''}
                onValueChange={(value) => {
                  handleInputChange("city", value)
                  setTouched(prev => ({ ...prev, city: true }))
                }}
              >
                <SelectTrigger className={`h-12 ${touched.city && !formData.city ? 'border-red-500 focus:border-red-500' : 'border-slate-300'}`}>
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
              <div className="text-xs">
                <span className={`${formData.city ? 'text-green-600' : 'text-red-500'}`}>
                  {touched.city ? (formData.city ? '✓ City selected' : 'Please select city') : 'Required field'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Area/Locality <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Gulberg, DHA, Johar Town"
                value={formData.area || ''}
                onChange={(e) => handleInputChange("area", e.target.value)}
                className={getFieldClass("area", "h-12", 2)}
                onBlur={() => setTouched(prev => ({ ...prev, area: true }))}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={`${isFieldValid('area', 2) ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.area ? `${formData.area.length}/2 characters` : '0/2 characters'}
                </span>
                <span className={`${isFieldValid('area', 2) ? 'text-green-600' : 'text-red-500'}`}>
                  {touched.area ? getValidationMessage('area', 2, 0, 'Area') : 'Minimum 2 characters required'}
                </span>
              </div>
            </div>
          </div>

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
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
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
        </CardContent>
      </Card>

      {/* Food Information & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Food Information & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meals Offered with Timings & Pricing */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">Meals Offered with Details</Label>
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

          {/* Food Types */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">Food Types Available</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="veg-option"
                  checked={formData.foodOptions?.veg || false}
                  onCheckedChange={(checked) => updateFoodOption('veg', checked as boolean)}
                />
                <Label htmlFor="veg-option" className="text-sm">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="non-veg-option"
                  checked={formData.foodOptions?.nonVeg || false}
                  onCheckedChange={(checked) => updateFoodOption('nonVeg', checked as boolean)}
                />
                <Label htmlFor="non-veg-option" className="text-sm">Non-Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="halal-option"
                  checked={formData.foodOptions?.halal || false}
                  onCheckedChange={(checked) => updateFoodOption('halal', checked as boolean)}
                />
                <Label htmlFor="halal-option" className="text-sm">Halal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-diet-option"
                  checked={formData.foodOptions?.customDiet || false}
                  onCheckedChange={(checked) => updateFoodOption('customDiet', checked as boolean)}
                />
                <Label htmlFor="custom-diet-option" className="text-sm">Custom Diet</Label>
              </div>
            </div>
          </div>




        </CardContent>
      </Card>

      {/* Menu & Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Menu & Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Sample Menu Description <span className="text-red-500">*</span>
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
                {touched.description ? getValidationMessage('description', 10, 0, 'Description') : 'Minimum 10 characters required'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Hygiene Certification
              </Label>
              <Input
                placeholder="Food safety certificate details"
                value={formData.foodHygiene}
                onChange={(e) => handleInputChange("foodHygiene", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Kitchen Staff Details
              </Label>
              <Input
                placeholder="Number of staff, experience etc."
                value={formData.foodStaff}
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
              value={formData.foodSpecialRequirements}
              onChange={(e) => handleInputChange("foodSpecialRequirements", e.target.value)}
              className="min-h-[100px]"
            />
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
    </div>
  )
}