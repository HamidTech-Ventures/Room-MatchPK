import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'

// GET - Fetch featured properties with relaxed filtering for home page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Get total count of all properties
    const totalProperties = await collection.countDocuments({})
    console.log(`Total properties in database: ${totalProperties}`)

    // More relaxed filter for home page - just show any properties that have basic data
    const filter: any = {
      title: { $exists: true, $ne: '' },
      'pricing.pricePerBed': { $exists: true, $gt: 0 }
    }

    // Try to prefer active properties if they exist
    const activeCount = await collection.countDocuments({ isActive: true, ...filter })
    if (activeCount > 0) {
      filter.isActive = true
    }

    // Try to prefer approved properties if they exist
    const approvedCount = await collection.countDocuments({ status: 'approved', ...filter })
    if (approvedCount > 0) {
      filter.status = 'approved'
    }

    console.log('Featured properties filter:', JSON.stringify(filter, null, 2))

    // Fetch properties
    const properties = await collection
      .find(filter)
      .sort({ createdAt: -1 }) // Show newest first
      .limit(limit)
      .toArray()

    console.log(`Found ${properties.length} featured properties`)

    // If still no properties, try with even more basic filter
    if (properties.length === 0) {
      console.log('No properties found with basic filter, trying minimal filter...')
      const minimalFilter = { title: { $exists: true, $ne: '' } } as any
      const minimalProperties = await collection
        .find(minimalFilter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()
      
      console.log(`Found ${minimalProperties.length} properties with minimal filter`)
      
      if (minimalProperties.length > 0) {
        // Convert ObjectId to string for JSON serialization
        const serializedProperties = minimalProperties.map(property => ({
          ...property,
          _id: property._id?.toString(),
          ownerId: property.ownerId?.toString()
        }))

        return NextResponse.json({
          success: true,
          properties: serializedProperties,
          message: 'Showing available properties (minimal criteria)',
          total: minimalProperties.length
        })
      }
    }

    // Convert ObjectId to string for JSON serialization
    const serializedProperties = properties.map(property => ({
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString()
    }))

    return NextResponse.json({
      success: true,
      properties: serializedProperties,
      total: properties.length,
      message: properties.length > 0 ? 'Featured properties loaded' : 'No featured properties available'
    })

  } catch (error) {
    console.error('Error fetching featured properties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
