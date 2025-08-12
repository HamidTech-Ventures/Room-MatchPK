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

  const getFieldClass = (field: string, baseClass = "") => {
    const invalid = touched[field] && !formData[field]
    return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`
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
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return (
      formData.ownerName &&
      formData.ownerName.length >= 2 &&
      formData.ownerEmail &&
      emailPattern.test(formData.ownerEmail) &&
      formData.ownerPhone &&
      formData.ownerPhone.length >= 10 &&
      formData.cnicNumber &&
      formData.cnicNumber.length >= 13 &&
      acceptVerify &&
      acceptTerms &&
      acceptCommission &&
      cnicPicFront &&
      cnicPicBack &&
      ownerPic
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
                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                className={getFieldClass("ownerName", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, ownerName: true }))}
              />
              <div className="text-xs">
                <span className={`${formData.ownerName && formData.ownerName.length >= 2 ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.ownerName ? `${formData.ownerName.length}/2 characters` : '0/2 characters (minimum)'}
                </span>
                {formData.ownerName && formData.ownerName.length < 2 && (
                  <span className="text-red-500 ml-2">Need {2 - formData.ownerName.length} more character(s)</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                placeholder="e.g., +92 300 1234567 (minimum 10 digits)"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange("ownerPhone", e.target.value)}
                className={getFieldClass("ownerPhone", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, ownerPhone: true }))}
              />
              <div className="text-xs">
                <span className={`${formData.ownerPhone && formData.ownerPhone.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.ownerPhone ? `${formData.ownerPhone.length}/10 characters` : '0/10 characters (minimum)'}
                </span>
                {formData.ownerPhone && formData.ownerPhone.length < 10 && (
                  <span className="text-red-500 ml-2">Need {10 - formData.ownerPhone.length} more character(s)</span>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="your.email@example.com (valid email format required)"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
                className={getFieldClass("ownerEmail", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, ownerEmail: true }))}
              />
              <div className="text-xs">
                {formData.ownerEmail ? (
                  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.ownerEmail) ? (
                    <span className="text-green-600">✓ Valid email format</span>
                  ) : (
                    <span className="text-red-500">✗ Please enter a valid email address</span>
                  )
                ) : (
                  <span className="text-red-500">Email address is required</span>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold text-slate-700">
                CNIC Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g., 12345-1234567-1 (13 digits with dashes)"
                value={formData.cnicNumber || ''}
                onChange={(e) => handleInputChange("cnicNumber", e.target.value)}
                className={getFieldClass("cnicNumber", "h-12")}
                onBlur={() => setTouched(prev => ({ ...prev, cnicNumber: true }))}
              />
              <div className="text-xs">
                {formData.cnicNumber ? (
                  formData.cnicNumber.length >= 13 ? (
                    <span className="text-green-600">✓ CNIC number entered</span>
                  ) : (
                    <span className="text-red-500">✗ Please enter complete CNIC number</span>
                  )
                ) : (
                  <span className="text-red-500">CNIC number is required</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CNIC Front */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              CNIC Front Side <span className="text-red-500">*</span>
            </Label>
            {!cnicPicFront ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Upload CNIC front side</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cnicFront')}
                  className="hidden"
                  id="cnic-front-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cnic-front-upload')?.click()}
                  disabled={cnicFrontLoader.uploadState.isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0"
                >
                  {cnicFrontLoader.uploadState.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    "Choose File"
                  )}
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={cnicPicFront}
                  alt="CNIC Front"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage('cnicFront')}
                  disabled={cnicFrontLoader.deleteState.isLoading}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                >
                  {cnicFrontLoader.deleteState.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* CNIC Back */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              CNIC Back Side <span className="text-red-500">*</span>
            </Label>
            {!cnicPicBack ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Upload CNIC back side</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cnicBack')}
                  className="hidden"
                  id="cnic-back-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cnic-back-upload')?.click()}
                  disabled={cnicBackLoader.uploadState.isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0"
                >
                  {cnicBackLoader.uploadState.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    "Choose File"
                  )}
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={cnicPicBack}
                  alt="CNIC Back"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage('cnicBack')}
                  disabled={cnicBackLoader.deleteState.isLoading}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                >
                  {cnicBackLoader.deleteState.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Owner Photo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Owner Photo <span className="text-red-500">*</span>
            </Label>
            {!ownerPic ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Upload your photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'ownerPic')}
                  className="hidden"
                  id="owner-pic-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('owner-pic-upload')?.click()}
                  disabled={ownerPicLoader.uploadState.isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0"
                >
                  {ownerPicLoader.uploadState.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    "Choose File"
                  )}
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={ownerPic}
                  alt="Owner Photo"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage('ownerPic')}
                  disabled={ownerPicLoader.deleteState.isLoading}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                >
                  {ownerPicLoader.deleteState.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
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
                id="accept-verify"
                checked={acceptVerify}
                onCheckedChange={setAcceptVerify}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="accept-verify" className="text-sm font-medium cursor-pointer">
                  Identity Verification Agreement <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-600">
                  I confirm that all identity documents provided are authentic and belong to me. I understand that providing false information may result in account suspension.
                </p>
              </div>
            </div>

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