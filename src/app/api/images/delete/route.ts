import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';
import { getDatabase } from '@/lib/mongodb';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { url, publicId } = await request.json();

    if (!url && !publicId) {
      return NextResponse.json(
        { success: false, error: 'Image URL or public_id is required' },
        { status: 400 }
      );
    }

    let imagePublicId = publicId;
    
    // Extract public_id from URL if not provided
    if (!imagePublicId && url) {
      imagePublicId = extractPublicId(url);
    }

    if (!imagePublicId) {
      return NextResponse.json(
        { success: false, error: 'Could not determine image public_id' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();

    // Check if user owns this image or is admin
    const imageRecord = await db.collection('images').findOne({
      $or: [
        { url: url },
        { publicId: imagePublicId }
      ]
    });

    if (imageRecord && imageRecord.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this image' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    const cloudinaryDeleted = await deleteFromCloudinary(imagePublicId);

    if (!cloudinaryDeleted) {
      console.warn('Failed to delete from Cloudinary, but proceeding with database deletion');
    }

    // Mark as deleted in database (soft delete)
    await db.collection('images').updateMany(
      {
        $or: [
          { url: url },
          { publicId: imagePublicId }
        ]
      },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: session.user.id
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      cloudinaryDeleted
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// POST - Batch delete multiple images
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Images array is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const deletionResults = [];

    for (const image of images) {
      try {
        const { url, publicId } = image;
        let imagePublicId = publicId;
        
        // Extract public_id from URL if not provided
        if (!imagePublicId && url) {
          imagePublicId = extractPublicId(url);
        }

        if (!imagePublicId) {
          deletionResults.push({
            url,
            success: false,
            error: 'Could not determine public_id'
          });
          continue;
        }

        // Check ownership
        const imageRecord = await db.collection('images').findOne({
          $or: [
            { url: url },
            { publicId: imagePublicId }
          ]
        });

        if (imageRecord && imageRecord.userId !== session.user.id && session.user.role !== 'admin') {
          deletionResults.push({
            url,
            success: false,
            error: 'Unauthorized'
          });
          continue;
        }

        // Delete from Cloudinary
        const cloudinaryDeleted = await deleteFromCloudinary(imagePublicId);

        // Mark as deleted in database
        await db.collection('images').updateMany(
          {
            $or: [
              { url: url },
              { publicId: imagePublicId }
            ]
          },
          {
            $set: {
              isActive: false,
              deletedAt: new Date(),
              deletedBy: session.user.id
            }
          }
        );

        deletionResults.push({
          url,
          success: true,
          cloudinaryDeleted
        });

      } catch (error) {
        deletionResults.push({
          url: image.url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = deletionResults.filter(result => result.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} out of ${images.length} images deleted successfully`,
      results: deletionResults
    });

  } catch (error) {
    console.error('Error batch deleting images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}