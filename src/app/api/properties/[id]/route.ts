import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary'

function extractIdFromUrl(url: string): string | null {
  // /api/properties/{id}
  const match = url.match(/\/api\/properties\/([^/]+)/)
  return match ? match[1] : null
}

// GET - Fetch a single property by ID
export async function GET(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const db = await getDatabase()
    const collection = db.collection<Property>('properties')
    const property = await collection.findOne({ _id: new ObjectId(id) })
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({
      success: true,
      property: {
        ...property,
        _id: property._id?.toString(),
        ownerId: property.ownerId?.toString()
      }
    })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PUT - Update a property by ID (owner only)
export async function PUT(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const session = await (await import('next-auth')).getServerSession((await import('@/lib/auth-config')).authOptions)
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only property owners can update properties' },
        { status: 403 }
      )
    }
    const body = await request.json()
    
    // Validate room numbers logic
    if (body.totalRooms !== undefined && body.availableRooms !== undefined) {
      const totalRooms = parseInt(String(body.totalRooms))
      const availableRooms = parseInt(String(body.availableRooms))
      
      if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
        return NextResponse.json(
          { success: false, error: 'Available rooms cannot be greater than total rooms' },
          { status: 400 }
        )
      }
    }
    
    const db = await getDatabase()
    const collection = db.collection<Property>('properties')
    // Verify ownership
    const property = await collection.findOne({ _id: new ObjectId(id), ownerId: new ObjectId(session.user.id) })
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      )
    }
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date(), status: 'pending', isVerified: false, isActive: false } }
    )
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made' },
        { status: 400 }
      )
    }
    return NextResponse.json({
      success: true,
      message: 'Property updated successfully. It will be reviewed again by admin.'
    })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a property by ID (owner only)
export async function DELETE(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const session = await (await import('next-auth')).getServerSession((await import('@/lib/auth-config')).authOptions)
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only property owners can delete properties' },
        { status: 403 }
      )
    }
    const db = await getDatabase()
    const collection = db.collection<Property>('properties')
    // Verify ownership
    const property = await collection.findOne({ _id: new ObjectId(id), ownerId: new ObjectId(session.user.id) })
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      )
    }
    
    // Delete all images from Cloudinary before deleting the property
    const imagesToDelete: string[] = []
    
    // Collect property images
    if (property.images && Array.isArray(property.images)) {
      property.images.forEach((image: any) => {
        const url = typeof image === 'string' ? image : image?.url
        if (url && typeof url === 'string') {
          const publicId = extractPublicId(url)
          if (publicId) {
            imagesToDelete.push(publicId)
          }
        }
      })
    }
    
    // Collect owner document images
    const ownerImageFields = ['cnicPicFront', 'cnicPicBack', 'ownerPic']
    ownerImageFields.forEach(field => {
      const imageUrl = property[field as keyof Property] as string | undefined
      if (imageUrl && typeof imageUrl === 'string') {
        const publicId = extractPublicId(imageUrl)
        if (publicId) {
          console.log(`Found owner image to delete - ${field}: ${publicId}`)
          imagesToDelete.push(publicId)
        }
      }
    })
    

    
    // Delete images from Cloudinary
    console.log(`Deleting ${imagesToDelete.length} images from Cloudinary for property ${id}`)
    const deletePromises = imagesToDelete.map(async (publicId) => {
      try {
        const success = await deleteFromCloudinary(publicId)
        if (success) {
          console.log(`Successfully deleted image: ${publicId}`)
        } else {
          console.warn(`Failed to delete image: ${publicId}`)
        }
        return success
      } catch (error) {
        console.error(`Error deleting image ${publicId}:`, error)
        return false
      }
    })
    
    // Wait for all image deletions to complete (don't fail if some images can't be deleted)
    try {
      await Promise.allSettled(deletePromises)
    } catch (error) {
      console.warn('Some images may not have been deleted from Cloudinary:', error)
    }
    
    // Delete all associated data from related collections
    console.log(`Cleaning up all related data for property ${id}`)
    
    // Delete all reviews associated with this property
    const reviewsCollection = db.collection('reviews')
    const reviewDeleteResult = await reviewsCollection.deleteMany({ propertyId: new ObjectId(id) })
    const deletedReviewsCount = reviewDeleteResult.deletedCount || 0
    console.log(`Deleted ${deletedReviewsCount} reviews for property ${id}`)
    
    // Delete all bookings associated with this property
    const bookingsCollection = db.collection('bookings')
    const bookingDeleteResult = await bookingsCollection.deleteMany({ propertyId: new ObjectId(id) })
    const deletedBookingsCount = bookingDeleteResult.deletedCount || 0
    console.log(`Deleted ${deletedBookingsCount} bookings for property ${id}`)
    
    // Delete all maintenance requests associated with this property
    const maintenanceCollection = db.collection('maintenanceRequests')
    const maintenanceDeleteResult = await maintenanceCollection.deleteMany({ propertyId: new ObjectId(id) })
    const deletedMaintenanceCount = maintenanceDeleteResult.deletedCount || 0
    console.log(`Deleted ${deletedMaintenanceCount} maintenance requests for property ${id}`)
    
    // Delete all image tracking records associated with this property
    const imagesCollection = db.collection('images')
    const imageRecordDeleteResult = await imagesCollection.deleteMany({ propertyId: new ObjectId(id) })
    const deletedImageRecordsCount = imageRecordDeleteResult.deletedCount || 0
    console.log(`Deleted ${deletedImageRecordsCount} image tracking records for property ${id}`)
    
    // Delete the property from database
    await collection.deleteOne({ _id: new ObjectId(id) })
    
    const totalDeletedItems = imagesToDelete.length + deletedReviewsCount + deletedBookingsCount + deletedMaintenanceCount + deletedImageRecordsCount
    
    return NextResponse.json({
      success: true,
      message: `Property and all related records deleted successfully.`,
      deletedCounts: {
        property: 1,
        images: imagesToDelete.length,
        reviews: deletedReviewsCount,
        bookings: deletedBookingsCount,
        maintenanceRequests: deletedMaintenanceCount,
        imageRecords: deletedImageRecordsCount,
        total: totalDeletedItems + 1
      }
    })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    )
  }
} 