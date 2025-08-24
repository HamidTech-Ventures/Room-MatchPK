import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { getDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

export async function POST(request: NextRequest) {
  try {
    // Check authentication via JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!decoded?.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const propertyId = formData.get('propertyId') as string || 'temp';
    const folder = formData.get('folder') as string || 'roommatch_images';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file sizes (5MB max per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResults = await uploadMultipleToCloudinary(files, `${folder}/${propertyId}`);

    // Store image URLs and public_ids in database
    const db = await getDatabase();
    
    // Create image records for tracking
    const imageRecords = uploadResults.map(result => ({
      propertyId,
      userId: decoded.id, // Use id from decoded JWT
      url: result.secure_url,
      publicId: result.public_id,
      folder: `${folder}/${propertyId}`,
      createdAt: new Date(),
      isActive: true
    }));

    // Insert into images collection for tracking
    if (imageRecords.length > 0) {
      await db.collection('images').insertMany(imageRecords);
    }

    return NextResponse.json({
      success: true,
      images: uploadResults,
      message: `${uploadResults.length} images uploaded successfully`
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// GET - Get images for a property
export async function GET(request: NextRequest) {
  try {
    // Check authentication via JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!decoded?.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const userId = searchParams.get('userId');

    if (!propertyId && !userId) {
      return NextResponse.json(
        { success: false, error: 'Property ID or User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const query: any = { isActive: true };
    if (propertyId) query.propertyId = propertyId;
    if (userId) query.userId = userId;

    const images = await db.collection('images')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        createdAt: img.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}