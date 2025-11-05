"use client"

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface CloudinaryImage {
  url: string;
  publicId: string;
  createdAt?: string;
}

export interface UseCloudinaryImagesReturn {
  images: CloudinaryImage[];
  setImages: (images: CloudinaryImage[]) => void;
  isUploading: boolean;
  isDeleting: boolean;
  uploadImages: (files: FileList, folder?: string) => Promise<CloudinaryImage[]>;
  deleteImage: (image: CloudinaryImage) => Promise<boolean>;
  deleteMultipleImages: (images: CloudinaryImage[]) => Promise<boolean>;
  clearImages: () => void;
}

export const useCloudinaryImages = (initialImages: CloudinaryImage[] = []): UseCloudinaryImagesReturn => {
  const [images, setImages] = useState<CloudinaryImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uploadImages = useCallback(async (files: FileList, folder: string = 'roommatch_images'): Promise<CloudinaryImage[]> => {
    if (!files || files.length === 0) {
      toast.error('No files selected');
      return [];
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return [];
    }

    // Validate file sizes (5MB max per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('File size must be less than 5MB');
      return [];
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('propertyId', 'temp');
      formData.append('folder', folder);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const newImages: CloudinaryImage[] = data.images.map((img: any) => ({
        url: img.secure_url,
        publicId: img.public_id,
        createdAt: new Date().toISOString()
      }));

      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
      
      return newImages;

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (image: CloudinaryImage): Promise<boolean> => {
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: image.url,
          publicId: image.publicId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setImages(prev => prev.filter(img => img.url !== image.url && img.publicId !== image.publicId));
      toast.success('Image deleted successfully');
      
      return true;

    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const deleteMultipleImages = useCallback(async (imagesToDelete: CloudinaryImage[]): Promise<boolean> => {
    if (imagesToDelete.length === 0) return true;

    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/images/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imagesToDelete.map(img => ({
            url: img.url,
            publicId: img.publicId
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Batch delete failed');
      }

      const data = await response.json();
      const successfulDeletions = data.results.filter((result: any) => result.success);
      
      // Remove successfully deleted images from state
      setImages(prev => prev.filter(img => 
        !successfulDeletions.some((deleted: any) => 
          deleted.url === img.url || img.publicId === deleted.publicId
        )
      ));

      toast.success(data.message);
      
      return successfulDeletions.length === imagesToDelete.length;

    } catch (error) {
      console.error('Error batch deleting images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete images');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return {
    images,
    setImages,
    isUploading,
    isDeleting,
    uploadImages,
    deleteImage,
    deleteMultipleImages,
    clearImages
  };
};