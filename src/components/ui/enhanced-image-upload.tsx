"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useImageLoader, UploadLoader, DeleteLoader } from '@/components/ui/image-loader'
import { cn } from '@/lib/utils'

interface EnhancedImageUploadProps {
  uploadedImages: string[]
  setUploadedImages: (images: string[]) => void
  maxImages?: number
  minImages?: number
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
  folder?: string
  title?: string
  description?: string
  className?: string
  required?: boolean
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
}

export function EnhancedImageUpload({
  uploadedImages,
  setUploadedImages,
  maxImages = 10,
  minImages = 1,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  folder = 'roommatch_images/general',
  title = 'Upload Images',
  description = 'Add high-quality photos',
  className,
  required = false,
  externalLoader
}: EnhancedImageUploadProps) {
  const internalLoader = useImageLoader()
  
  // Use external loader if provided, otherwise use internal loader
  const {
    uploadState,
    deleteState,
    startUpload,
    uploadSuccess,
    uploadError,
    startDelete,
    deleteSuccess,
    deleteError
  } = externalLoader || internalLoader

  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const handleImageUpload = async (files: FileList) => {
    if (uploadedImages.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    // Validate file sizes
    const maxSizeBytes = maxFileSize * 1024 * 1024
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSizeBytes)
    
    if (oversizedFiles.length > 0) {
      alert(`File size must be less than ${maxFileSize}MB`)
      return
    }

    // Validate file types
    const invalidFiles = Array.from(files).filter(file => !acceptedFormats.includes(file.type))
    if (invalidFiles.length > 0) {
      alert('Please select valid image files (JPEG, PNG, WebP)')
      return
    }
    
    startUpload()
    
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('propertyId', 'temp')
      formData.append('folder', folder)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const newImages = data.images.map((img: any) => img.secure_url)
        setUploadedImages([...uploadedImages, ...newImages])
        uploadSuccess()
      } else {
        const errorData = await response.json()
        uploadError()
        console.error('Upload failed:', errorData.error)
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      uploadError()
    }
  }

  const removeImage = async (index: number) => {
    const imageUrl = uploadedImages[index]
    setDeletingIndex(index)
    startDelete()
    
    try {
      const response = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl
        }),
      })

      if (response.ok) {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index))
        deleteSuccess()
      } else {
        // Still remove from UI even if Cloudinary deletion fails
        setUploadedImages(uploadedImages.filter((_, i) => i !== index))
        deleteSuccess()
        console.error('Failed to delete from Cloudinary, but removed from UI')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      deleteError()
    } finally {
      setDeletingIndex(null)
    }
  }

  const formatList = acceptedFormats.map(format => format.split('/')[1].toUpperCase()).join(', ')

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-emerald-600" />
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-lg font-semibold text-slate-700">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
          {required && uploadedImages.length < minImages && (
            <p className="text-sm text-amber-600 font-medium">
              Required: At least {minImages} image{minImages > 1 ? 's' : ''}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Supported formats: {formatList} • Max size: {maxFileSize}MB per image • Max {maxImages} images
          </p>
        </div>

        <input
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
          id="enhanced-image-upload"
          disabled={uploadState.isLoading || uploadedImages.length >= maxImages}
        />
        
        <Button
          type="button"
          onClick={() => document.getElementById('enhanced-image-upload')?.click()}
          disabled={uploadState.isLoading || uploadedImages.length >= maxImages}
          className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadState.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </div>
          ) : uploadedImages.length >= maxImages ? (
            "Maximum Images Reached"
          ) : (
            "Choose Images"
          )}
        </Button>
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-slate-700">
                {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} uploaded
              </p>
              {required && uploadedImages.length < minImages && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  {minImages - uploadedImages.length} more needed
                </Badge>
              )}
              {uploadedImages.length >= minImages && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                  ✓ Requirements met
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {uploadedImages.length}/{maxImages} images
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={deleteState.isLoading && deletingIndex === index}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 disabled:opacity-50"
                    title="Delete image"
                  >
                    {deleteState.isLoading && deletingIndex === index ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </button>

                  {/* Cover Photo Badge */}
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs">
                      Cover Photo
                    </Badge>
                  )}

                  {/* Loading Overlay */}
                  {deleteState.isLoading && deletingIndex === index && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white/95 rounded-lg p-2 shadow-lg border border-slate-200/50">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Loaders - Only show if using internal loader */}
      {!externalLoader && (
        <>
          <UploadLoader {...uploadState} />
          <DeleteLoader {...deleteState} />
        </>
      )}
    </div>
  )
}

export default EnhancedImageUpload