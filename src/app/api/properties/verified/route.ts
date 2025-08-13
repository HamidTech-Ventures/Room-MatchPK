import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'

// GET - Fetch verified properties with more relaxed filtering for find rooms page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Filter parameters
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const city = searchParams.get('city')
    const propertyType = searchParams.get('propertyType')
    const genderPreference = searchParams.get('genderPreference')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean)
    const sortBy = searchParams.get('sortBy') || 'createdAt'

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // More relaxed filter - show properties that are:
    // 1. Either approved OR (active and not explicitly rejected)
    // 2. Have basic required data
    const filter: any = {
      $or: [
        { status: 'approved' },
        { 
          $and: [
            { status: { $ne: 'rejected' } },
            { isActive: { $ne: false } },
            { title: { $exists: true, $ne: '' } },
            { 'pricing.pricePerBed': { $exists: true, $gt: 0 } }
          ]
        }
      ]
    }

    // Debug: Log filter and count
    const totalProperties = await collection.countDocuments({})
    const approvedProperties = await collection.countDocuments({ status: 'approved' })
    const pendingProperties = await collection.countDocuments({ status: 'pending' })
    const rejectedProperties = await collection.countDocuments({ status: 'rejected' })
    const activeProperties = await collection.countDocuments({ isActive: true })
    
    console.log('Properties Debug:', {
      total: totalProperties,
      approved: approvedProperties,
      pending: pendingProperties,
      rejected: rejectedProperties,
      active: activeProperties
    })

    // Advanced search (hostel name, city, area)
    if (search) {
      filter.$and = filter.$and || []
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'address.area': { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
          { nearbyUniversity: { $regex: search, $options: 'i' } }
        ]
      })
    }

    // Specific location filter
    if (location) {
      filter['address.city'] = { $regex: location, $options: 'i' }
    } else if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' }
    }

    if (propertyType) {
      filter.propertyType = propertyType
    }

    if (genderPreference) {
      filter.genderPreference = genderPreference
    }

    // Apply price filter only if it's not the default range or very wide range
    const isDefaultRange = (minPrice === '1000' && maxPrice === '50000') ||
                           (minPrice === '0' && maxPrice === '999999');
    if (minPrice && maxPrice && !isDefaultRange) {
      const min = parseInt(minPrice);
      const max = parseInt(maxPrice);
      filter['pricing.pricePerBed'] = { $gte: min, $lte: max };
    }

    if (amenities && amenities.length > 0) {
      filter.amenities = { $in: amenities }
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter)
    
    // Debug: Let's see what the actual filter looks like and what properties match
    console.log('Applied filter:', JSON.stringify(filter, null, 2))
    
    // Debug: Check a few sample properties to see their structure
    const sampleProperties = await collection.find({}).limit(3).toArray()
    console.log('Sample properties structure:', sampleProperties.map(p => ({
      _id: p._id,
      title: p.title,
      status: p.status,
      isActive: p.isActive,
      isVerified: p.isVerified,
      pricing: p.pricing
    })))
    
    // Debug: Check specifically approved properties
    const approvedProps = await collection.find({ status: 'approved' }).toArray()
    console.log('Approved properties details:', approvedProps.map(p => ({
      _id: p._id,
      title: p.title,
      status: p.status,
      isActive: p.isActive,
      isVerified: p.isVerified,
      hasTitle: !!p.title,
      hasPricing: !!p.pricing,
      pricePerBed: p.pricing?.pricePerBed
    })))

    // Handle sorting
    let sortQuery: any = {}
    switch (sortBy) {
      case 'price-low':
        sortQuery = { 'pricing.pricePerBed': 1 }
        break
      case 'price-high':
        sortQuery = { 'pricing.pricePerBed': -1 }
        break
      case 'rating':
        sortQuery = { rating: -1 }
        break
      case 'newest':
        sortQuery = { createdAt: -1 }
        break
      case 'relevance':
      default:
        sortQuery = { createdAt: -1 }
        break
    }

    // Fetch properties with pagination
    let properties = await collection
      .find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Fallback: If no properties found with complex filter, try with just approved status
    if (properties.length === 0 && total === 0) {
      console.log('No properties found with complex filter, trying fallback with just approved status')
      const fallbackFilter = { status: 'approved' as const }
      const fallbackTotal = await collection.countDocuments(fallbackFilter)
      if (fallbackTotal > 0) {
        properties = await collection
          .find(fallbackFilter)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
          .toArray()
        console.log(`Fallback found ${fallbackTotal} approved properties, fetched ${properties.length}`)
      }
    }

    // Debug: Log what we actually fetched
    console.log(`Found ${total} properties matching filter, fetched ${properties.length} properties for this page`)
    console.log('Fetched properties:', properties.map(p => ({
      _id: p._id,
      title: p.title,
      status: p.status,
      isActive: p.isActive,
      isVerified: p.isVerified
    })))

    // Convert ObjectId to string for JSON serialization
    const serializedProperties = properties.map(property => ({
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString()
    }))

    return NextResponse.json({
      success: true,
      properties: serializedProperties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      debug: {
        totalInDb: totalProperties,
        approved: approvedProperties,
        pending: pendingProperties,
        rejected: rejectedProperties,
        active: activeProperties,
        filtered: total
      }
    })

  } catch (error) {
    console.error('Error fetching verified properties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
