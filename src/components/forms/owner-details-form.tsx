"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useImageLoader } from "@/hooks/use-image-loader"
import { ImageLoader } from "@/components/ui/image-loader"
import { 
  Upload, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  X,
  Shield,
  FileText,
  CheckCircle
} from "lucide-react"

interface OwnerDetailsFormProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  touched?: { [key: string]: boolean }
  setTouched?: (touched: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void
  cnicPicFront: string
  setCnicPicFront: (value: string) => void
  cnicPicBack: string
  setCnicPicBack: (value: string) => void
  ownerPic: string
  setOwnerPic: (value: string) => void
  acceptVerify: boolean
  setAcceptVerify: (value: boolean) => void
  acceptTerms: boolean
  setAcceptTerms: (value: boolean) => void
  acceptCommission: boolean
  setAcceptCommission: (value: boolean) => void
  isSubmitting?: boolean
  onSubmit?: () => void
  editingProperty?: any
}

export function OwnerDetailsForm({
  formData,
  handleInputChange,
  touched = {},
  setTouched = () => {},
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
  onSubmit = () => {},
  editingProperty
}: OwnerDetailsFormProps) {
  // Image loader hooks for each upload type
  const cnicFrontLoader = useImageLoader()
  const cnicBackLoader = useImageLoader()
  const ownerPicLoader = useImageLoader()
  
  // Track which image is being deleted
  const [deletingImage, setDeletingImage] = useState<'cnicFront' | 'cnicBack' | 'ownerPic' | null>(null)

  // Enhanced validation functions
  const validateName = (name: string) => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: "Name is required" }
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters long" }
    }
    if (name.trim().length > 50) {
      return { isValid: false, message: "Name must be less than 50 characters" }
    }
    if (!/^[a-zA-Z\s'.,-]*$/.test(name)) {
      return { isValid: false, message: "Name can only contain letters, spaces, and common punctuation" }
    }
    return { isValid: true, message: "Valid name" }
  }

  const validatePhone = (phone: string) => {
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, message: "Phone number is required" }
    }
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '')
    
    if (cleanPhone.length < 10) {
      return { isValid: false, message: "Phone number must be at least 10 digits" }
    }
    if (cleanPhone.length > 15) {
      return { isValid: false, message: "Phone number must be less than 15 digits" }
    }
    
    // Check for Pakistani phone patterns
    const pakistaniPatterns = [
      /^(\+92|92|0)?3[0-9]{9}$/, // Mobile numbers
      /^(\+92|92|0)?[2-9][0-9]{7,10}$/, // Landline numbers
    ]
    
    const isValidPattern = pakistaniPatterns.some(pattern => pattern.test(cleanPhone))
    if (!isValidPattern) {
      return { isValid: false, message: "Please enter a valid Pakistani phone number" }
    }
    
    return { isValid: true, message: "Valid phone number" }
  }

  const validateCNIC = (cnic: string) => {
    if (!cnic || cnic.trim().length === 0) {
      return { isValid: false, message: "CNIC number is required" }
    }
    return { isValid: true, message: "Valid CNIC number" }
  }

  const validateEmail = (email: string) => {
    if (!email || email.trim().length === 0) {
      return { isValid: false, message: "Email address is required" }
    }
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
    
    if (email.length > 254) {
      return { isValid: false, message: "Email address is too long" }
    }
    
    return { isValid: true, message: "Valid email address" }
  }

  // Enhanced field class function with better validation
  const getFieldClass = (field: string, baseClass = "") => {
    let validation = { isValid: true, message: "" }
    
    // Only validate if field has been touched or has content
    if (touched[field] || formData[field]) {
      switch (field) {
        case 'ownerName':
          validation = validateName(formData.ownerName || '')
          break
        case 'ownerPhone':
          validation = validatePhone(formData.ownerPhone || '')
          break
        case 'ownerEmail':
          validation = validateEmail(formData.ownerEmail || '')
          break
        case 'cnicNumber':
          validation = validateCNIC(formData.cnicNumber || '')
          break
        default:
          validation = { isValid: !!formData[field], message: "" }
      }
    }
    
    return `${baseClass} ${!validation.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`
  }

  // Enhanced input change handler with validation
  const handleValidatedInputChange = (field: string, value: string) => {
    let processedValue = value
    
    // Process phone number - allow formatting
    if (field === 'ownerPhone') {
      // Remove all non-digit characters except + and spaces
      processedValue = value.replace(/[^\d+\s-()]/g, '')
    }
    
    // Process CNIC - allow formatting with dashes
    if (field === 'cnicNumber') {
      // Remove all non-digit characters except dashes
      const digitsOnly = value.replace(/\D/g, '')
      // Auto-format CNIC as user types (XXXXX-XXXXXXX-X)
      if (digitsOnly.length <= 5) {
        processedValue = digitsOnly
      } else if (digitsOnly.length <= 12) {
        processedValue = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`
      } else {
        processedValue = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12, 13)}`
      }
    }
    
    // Process name - remove extra spaces and capitalize
    if (field === 'ownerName') {
      processedValue = value.replace(/\s+/g, ' ').replace(/^\s+/, '')
    }
    
    handleInputChange(field, processedValue)
  }

  const handleImageUpload = async (file: File, type: 'cnicFront' | 'cnicBack' | 'ownerPic') => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    // Get the appropriate loader
    const loader = type === 'cnicFront' ? cnicFrontLoader : 
                   type === 'cnicBack' ? cnicBackLoader : ownerPicLoader
    
    loader.startUpload()

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('propertyId', 'temp');
      formData.append('folder', `roommatch_images/owner_documents`);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.images[0].secure_url;
        
        switch (type) {
          case 'cnicFront':
            setCnicPicFront(imageUrl)
            handleInputChange('cnicPicFront', imageUrl)
            break
          case 'cnicBack':
            setCnicPicBack(imageUrl)
            handleInputChange('cnicPicBack', imageUrl)
            break
          case 'ownerPic':
            setOwnerPic(imageUrl)
            handleInputChange('ownerPic', imageUrl)
            break
        }
        loader.uploadSuccess()
      } else {
        const errorData = await response.json();
        loader.uploadError()
        alert(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      loader.uploadError()
      alert('Failed to upload image. Please try again.');
    }
  }

  const removeImage = async (type: 'cnicFront' | 'cnicBack' | 'ownerPic') => {
    let imageUrl = '';
    
    switch (type) {
      case 'cnicFront':
        imageUrl = cnicPicFront;
        break
      case 'cnicBack':
        imageUrl = cnicPicBack;
        break
      case 'ownerPic':
        imageUrl = ownerPic;
        break
    }

    // Get the appropriate loader and start delete
    const loader = type === 'cnicFront' ? cnicFrontLoader : 
                   type === 'cnicBack' ? cnicBackLoader : ownerPicLoader
    
    setDeletingImage(type)
    loader.startDelete()

    // Only attempt to delete from Cloudinary if it's a Cloudinary URL
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      try {
        await fetch('/api/images/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: imageUrl
          }),
        });
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Clear the image from state regardless of Cloudinary deletion result
    switch (type) {
      case 'cnicFront':
        setCnicPicFront('')
        handleInputChange('cnicPicFront', '')
        break
      case 'cnicBack':
        setCnicPicBack('')
        handleInputChange('cnicPicBack', '')
        break
      case 'ownerPic':
        setOwnerPic('')
        handleInputChange('ownerPic', '')
        break
    }
    
    loader.deleteSuccess()
    setDeletingImage(null)
  }

  const isFormValid = () => {
    const nameValidation = validateName(formData.ownerName || '')
    const phoneValidation = validatePhone(formData.ownerPhone || '')
    const emailValidation = validateEmail(formData.ownerEmail || '')
    
    return (
      nameValidation.isValid &&
      phoneValidation.isValid &&
      emailValidation.isValid &&
      acceptTerms &&
      acceptCommission
    )
  }

  return (
    <div className="space-y-8">
      {/* Owner Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Owner Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter your full name (minimum 2 characters)"
                value={formData.ownerName}
                onChange={(e) => handleValidatedInputChange("ownerName", e.target.value)}
                className={getFieldClass("ownerName", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, ownerName: true }))}
              />
              <div className="text-xs">
                {(() => {
                  const validation = validateName(formData.ownerName || '')
                  return (
                    <span className={validation.isValid ? 'text-green-600' : 'text-red-500'}>
                      {validation.isValid ? '✓' : '✗'} {validation.message}
                    </span>
                  )
                })()}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                placeholder="e.g., +92 300 1234567 or 03001234567"
                value={formData.ownerPhone}
                onChange={(e) => handleValidatedInputChange("ownerPhone", e.target.value)}
                className={getFieldClass("ownerPhone", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, ownerPhone: true }))}
              />
              <div className="text-xs">
                {(() => {
                  const validation = validatePhone(formData.ownerPhone || '')
                  return (
                    <span className={validation.isValid ? 'text-green-600' : 'text-red-500'}>
                      {validation.isValid ? '✓' : '✗'} {validation.message}
                    </span>
                  )
                })()}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={formData.ownerEmail}
                onChange={(e) => handleValidatedInputChange("ownerEmail", e.target.value)}
                className={getFieldClass("ownerEmail", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, ownerEmail: true }))}
              />
              <div className="text-xs">
                {(() => {
                  const validation = validateEmail(formData.ownerEmail || '')
                  return (
                    <span className={validation.isValid ? 'text-green-600' : 'text-red-500'}>
                      {validation.isValid ? '✓' : '✗'} {validation.message}
                    </span>
                  )
                })()}
              </div>
            </div>


          </div>
        </CardContent>
      </Card>



      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">


            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="accept-terms" className="text-sm font-medium cursor-pointer">
                  Terms of Service Agreement <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-600">
                  I agree to the platform's terms of service, privacy policy, and community guidelines. I will maintain accurate property information and respond to inquiries promptly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
              <Checkbox
                id="accept-commission"
                checked={acceptCommission}
                onCheckedChange={setAcceptCommission}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="accept-commission" className="text-sm font-medium cursor-pointer">
                  Commission Structure Agreement <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-600">
                  I understand and agree to the platform's commission structure. A service fee will be charged upon successful booking completion as per the current rate structure.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Completion Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-slate-700 font-medium">
              Your property will be reviewed within 24-48 hours
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Loaders */}
      <ImageLoader 
        {...cnicFrontLoader.uploadState} 
        type="upload" 
        message="Uploading CNIC Front..."
      />
      <ImageLoader 
        {...cnicFrontLoader.deleteState} 
        type="delete" 
        message="Deleting CNIC Front..."
      />
      
      <ImageLoader 
        {...cnicBackLoader.uploadState} 
        type="upload" 
        message="Uploading CNIC Back..."
      />
      <ImageLoader 
        {...cnicBackLoader.deleteState} 
        type="delete" 
        message="Deleting CNIC Back..."
      />
      
      <ImageLoader 
        {...ownerPicLoader.uploadState} 
        type="upload" 
        message="Uploading Owner Photo..."
      />
      <ImageLoader 
        {...ownerPicLoader.deleteState} 
        type="delete" 
        message="Deleting Owner Photo..."
      />
    </div>
  )
}