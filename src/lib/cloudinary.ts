import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'roommatch_images'
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id
            });
          } else {
            reject(new Error('Upload failed - no result'));
          }
        }
      ).end(bytes);
    });
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (public_id: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (
  files: File[],
  folder: string = 'roommatch_images'
): Promise<Array<{ secure_url: string; public_id: string }>> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

// Extract public_id from Cloudinary URL
export const extractPublicId = (url: string): string => {
  try {
    // Handle different Cloudinary URL formats
    // Format 1: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg
    // Format 2: https://res.cloudinary.com/cloud-name/image/upload/folder/image.jpg (without version)
    
    if (!url || !url.includes('res.cloudinary.com')) {
      console.warn('Invalid Cloudinary URL:', url);
      return '';
    }
    
    // Try the standard format with version number
    let matches = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // Try format without version number
    matches = url.match(/\/upload\/(.+)\.[^.]+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // Try to extract from the path after /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const afterUpload = url.substring(uploadIndex + 8);
      const lastDotIndex = afterUpload.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        return afterUpload.substring(0, lastDotIndex);
      }
    }
    
    console.warn('Could not extract public_id from URL:', url);
    return '';
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return '';
  }
};

export default cloudinary;