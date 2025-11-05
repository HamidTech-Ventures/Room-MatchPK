import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'

// GET - Fetch property counts by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Optional filters that can affect counts
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const city = searchParams.get('city')
    const genderPreference = searchParams.get('genderPreference')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean)

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Base filter - same as the main properties endpoint
    const baseFilter: any = {
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

    // Apply additional filters if provided
    if (search) {
      baseFilter.$and = baseFilter.$and || []
      baseFilter.$and.push({
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

    if (location) {
      baseFilter.$and = baseFilter.$and || []
      baseFilter.$and.push({ 'address.city': { $regex: location, $options: 'i' } })
    } else if (city) {
      baseFilter.$and = baseFilter.$and || []
      baseFilter.$and.push({ 'address.city': { $regex: city, $options: 'i' } })
    }

    if (genderPreference) {
      // Handle both old and new gender preference values for backward compatibility
      const genderMapping: { [key: string]: string[] } = {
        'boys': ['boys', 'male'],
        'girls': ['girls', 'female'],
        'mixed': ['mixed']
      }

      const possibleValues = genderMapping[genderPreference] || [genderPreference]
      baseFilter.$and = baseFilter.$and || []
      baseFilter.$and.push({ genderPreference: { $in: possibleValues } })
    }

    if (minPrice || maxPrice) {
      baseFilter.$and = baseFilter.$and || []
      const priceFilter: any = {}
      if (minPrice) priceFilter.$gte = parseInt(minPrice)
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice)
      baseFilter.$and.push({ 'pricing.pricePerBed': priceFilter })
    }

    if (amenities && amenities.length > 0) {
      baseFilter.$and = baseFilter.$and || []
      baseFilter.$and.push({ amenities: { $in: amenities } })
    }

    // Get total count with all filters applied
    const totalCount = await collection.countDocuments(baseFilter)

    // Get counts by property type
    const propertyTypes = ['hostel', 'apartment', 'house', 'office', 'hostel-mess', 'pg', 'flat']
    const counts: Record<string, number> = { all: totalCount }

    // Use aggregation to get counts by type efficiently
    const typeCountsResult = await collection.aggregate([
      { $match: baseFilter },
      { 
        $group: { 
          _id: '$propertyType', 
          count: { $sum: 1 } 
        } 
      }
    ]).toArray()

    // Initialize all types with 0
    propertyTypes.forEach(type => {
      counts[type] = 0
    })

    // Fill in actual counts
    typeCountsResult.forEach(result => {
      if (result._id && propertyTypes.includes(result._id)) {
        counts[result._id] = result.count
      }
    })

    return NextResponse.json({
      success: true,
      counts,
      total: totalCount
    })

  } catch (error) {
    console.error('Error fetching property counts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property counts' },
      { status: 500 }
    )
  }
}
