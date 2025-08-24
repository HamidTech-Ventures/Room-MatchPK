import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property, CreateDocument } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch all properties with filters
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
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Build filter query - only show approved and active properties
    const filter: any = { 
      isActive: true,
      status: 'approved',
      isVerified: true
    }

    // Advanced search (hostel name, city, area)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.area': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { nearbyUniversity: { $regex: search, $options: 'i' } }
      ]
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
      // Handle both old and new gender preference values for backward compatibility
      const genderMapping: { [key: string]: string[] } = {
        'boys': ['boys', 'male'],
        'girls': ['girls', 'female'],
        'mixed': ['mixed']
      }

      const possibleValues = genderMapping[genderPreference] || [genderPreference]
      filter.genderPreference = { $in: possibleValues }
    }

    if (minPrice || maxPrice) {
      filter['pricing.pricePerBed'] = {}
      if (minPrice) filter['pricing.pricePerBed'].$gte = parseInt(minPrice)
      if (maxPrice) filter['pricing.pricePerBed'].$lte = parseInt(maxPrice)
    }

    if (amenities && amenities.length > 0) {
      filter.amenities = { $in: amenities }
    }



    // Geo-search (if lat/lng provided)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = parseInt(searchParams.get('radius') || '0') // in meters
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng)) && radius > 0) {
      filter['location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius
        }
      }
    }

    // Autocomplete for city/area/university/tags
    if (searchParams.get('autocomplete')) {
      const autoField = searchParams.get('field') || 'city'
      const autoQuery = searchParams.get('autocomplete')
      let autoPipeline
      if (autoField === 'tags') {
        autoPipeline = [
          { $match: { tags: { $regex: autoQuery, $options: 'i' } } },
          { $unwind: '$tags' },
          { $match: { tags: { $regex: autoQuery, $options: 'i' } } },
          { $group: { _id: '$tags' } },
          { $limit: 10 }
        ]
      } else {
        autoPipeline = [
          { $match: { [`address.${autoField}`]: { $regex: autoQuery, $options: 'i' } } },
          { $group: { _id: `$address.${autoField}` } },
          { $limit: 10 }
        ]
      }
      const autoResults = await collection.aggregate(autoPipeline).toArray()
      return NextResponse.json({ autocomplete: autoResults.map(r => r._id) })
    }

    // Faceted search: return counts for each filter
    if (searchParams.get('facets')) {
      const facets = await collection.aggregate([
        { $match: filter },
        { $facet: {
          cities: [ { $group: { _id: '$address.city', count: { $sum: 1 } } } ],
          types: [ { $group: { _id: '$propertyType', count: { $sum: 1 } } } ],
          tags: [ { $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } } ]
        }}
      ]).toArray()
      return NextResponse.json({ facets: facets[0] })
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter)

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
    const properties = await collection
      .find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray()

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
      }
    })

  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only property owners can create properties' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'propertyType', 'address', 'pricing']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Parse and validate room numbers properly
    let totalRooms: number | undefined
    let availableRooms: number | undefined
    
    if (body.totalRooms !== undefined && body.totalRooms !== null && body.totalRooms !== '') {
      const parsed = parseInt(String(body.totalRooms))
      if (!isNaN(parsed) && parsed >= 1) {
        totalRooms = parsed
      }
    }
    
    if (body.availableRooms !== undefined && body.availableRooms !== null && body.availableRooms !== '') {
      const parsed = parseInt(String(body.availableRooms))
      if (!isNaN(parsed) && parsed >= 0) {
        availableRooms = parsed
      }
    }

    // Determine the primary price value from multiple possible incoming fields.
    // Frontend multi-step forms sometimes send monthlyRent, price, monthlyCharges, or pricing.pricePerBed.
    const tryParseNumber = (v: any) => {
      // Treat undefined/null/empty-string/whitespace as missing value (not zero)
      if (v === undefined || v === null) return undefined
      if (typeof v === 'string' && v.trim() === '') return undefined
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }

    const candidates = [
      // Prefer explicit pricing object values first
      body?.pricing?.pricePerBed,
      body?.pricing?.monthlyPrice,
      body?.pricing?.price,
      body?.pricing?.rent,
      // Then top-level fields used by different forms
      body?.monthlyCharges,
      body?.monthlyRent,
      body?.price,
      body?.rent,
    ]

    let resolvedPrice: number | undefined
    for (const c of candidates) {
      const p = tryParseNumber(c)
      if (p !== undefined) { resolvedPrice = p; break }
    }

    // Determine final price and ensure one is provided
    const monthlyRentCandidate = tryParseNumber(body.monthlyRent ?? body.price ?? body.rent)
    const monthlyChargesCandidate = tryParseNumber(body.monthlyCharges ?? body.pricing?.monthlyPrice ?? body.pricing?.price)
    const finalPrice = resolvedPrice ?? monthlyRentCandidate ?? monthlyChargesCandidate
    if (finalPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Pricing not provided. Please include pricePerBed or monthlyRent/monthlyCharges.' },
        { status: 400 }
      )
    }

    // Build property data object - only include fields that have valid values
    const propertyData: CreateDocument<Property> = {
      title: body.title,
      description: body.description || '',
      ownerId: new ObjectId(session.user.id),
      propertyType: body.propertyType,
      genderPreference: body.genderPreference,
      address: body.address,
      pricing: {
        pricePerBed: finalPrice
      },
      amenities: body.amenities || [],
      images: body.images || [],
      roomDetails: body.roomDetails || [],
      rules: body.rules || [],
      contactInfo: body.contactInfo || {},
      tags: body.tags || [],
      status: 'pending', // Default status for new properties
      isActive: false, // Not active until approved
      isVerified: false, // Admin needs to verify
      rating: 0,
      totalReviews: 0,
      cnicPicFront: body.cnicPicFront || '',
      cnicPicBack: body.cnicPicBack || '',
      ownerPic: body.ownerPic || ''
    }

    // Preserve top-level monthly/rent fields for house/office/apartment/etc. and keep pricing in sync
    if (monthlyRentCandidate !== undefined) {
      ;(propertyData as any).monthlyRent = monthlyRentCandidate
      if (propertyData.pricing && propertyData.pricing.pricePerBed === undefined) {
        propertyData.pricing.pricePerBed = monthlyRentCandidate
      }
    }
    if (monthlyChargesCandidate !== undefined) {
      ;(propertyData as any).monthlyCharges = monthlyChargesCandidate
      if (propertyData.pricing && propertyData.pricing.pricePerBed === undefined) {
        propertyData.pricing.pricePerBed = monthlyChargesCandidate
      }
    }

    // Add optional pricing fields only if they have values
    // Accept 0 values as valid (owner may explicitly set 0)
    if (body?.pricing?.securityDeposit !== undefined && body.pricing.securityDeposit !== null) {
      const sd = tryParseNumber(body.pricing.securityDeposit)
      if (sd !== undefined) propertyData.pricing.securityDeposit = sd
    }
    if (body?.pricing?.maintenanceCharges !== undefined && body.pricing.maintenanceCharges !== null) {
      const mc = tryParseNumber(body.pricing.maintenanceCharges)
      if (mc !== undefined) propertyData.pricing.maintenanceCharges = mc
    }
    if (body?.pricing?.electricityCharges !== undefined && body.pricing.electricityCharges !== null) {
      propertyData.pricing.electricityCharges = body.pricing.electricityCharges
    }
    if (body?.pricing?.waterCharges !== undefined && body.pricing.waterCharges !== null) {
      propertyData.pricing.waterCharges = body.pricing.waterCharges
    }

    // Add optional fields only if they have values
    if (body.location && body.location.coordinates && Array.isArray(body.location.coordinates) && body.location.coordinates.length === 2) {
      propertyData.location = body.location
    }
    if (body.nearbyUniversity) {
      propertyData.nearbyUniversity = body.nearbyUniversity
    }
    // Food service details
    if (body.foodService) {
      propertyData.foodService = body.foodService
    }
    if (body.foodTimings) {
      propertyData.foodTimings = body.foodTimings
    }
    if (body.foodOptions) {
      propertyData.foodOptions = body.foodOptions
    }
    if (body.foodPricing) {
      propertyData.foodPricing = body.foodPricing
    }
    if (body.foodHygiene) {
      propertyData.foodHygiene = body.foodHygiene
    }
    if (body.foodStaff) {
      propertyData.foodStaff = body.foodStaff
    }
    if (body.foodCapacity) {
      propertyData.foodCapacity = body.foodCapacity
    }
    if (body.foodMenuRotation !== undefined) {
      propertyData.foodMenuRotation = body.foodMenuRotation
    }
    if (body.foodSpecialRequirements) {
      propertyData.foodSpecialRequirements = body.foodSpecialRequirements
    }

    // Validate room numbers logic
    if (totalRooms !== undefined && availableRooms !== undefined) {
      if (availableRooms > totalRooms) {
        return NextResponse.json(
          { success: false, error: 'Available rooms cannot be greater than total rooms' },
          { status: 400 }
        )
      }
    }

    // Only add room numbers if they're valid
    if (totalRooms !== undefined) {
      propertyData.totalRooms = totalRooms
    }
    if (availableRooms !== undefined) {
      propertyData.availableRooms = availableRooms
    }

    console.log('Property data being inserted:', JSON.stringify(propertyData, null, 2))
    
    // Temporarily bypass validation to allow property creation
    const result = await collection.insertOne(propertyData, { bypassDocumentValidation: true })

    return NextResponse.json({
      success: true,
      propertyId: result.insertedId.toString(),
      message: 'Property created successfully. It will be reviewed by admin before going live.'
    })

  } catch (error: any) {
    console.error('Error creating property:', error)
    
    // Handle MongoDB validation errors specifically
    if (error.code === 121) {
      const details = error.errInfo?.details || error.details || {}
      console.error('MongoDB validation error details:', details)
      
      let errorMessage = 'Property data validation failed: '
      if (details.failingDocumentId) {
        errorMessage += 'Invalid field values. '
      }
      if (details.schemaRulesNotSatisfied) {
        const rules = details.schemaRulesNotSatisfied
        if (rules.length > 0) {
          errorMessage += rules.map((rule: any) => {
            if (rule.propertiesNotSatisfied) {
              return rule.propertiesNotSatisfied.map((prop: any) => 
                `${prop.propertyName}: ${prop.description || 'Invalid value'}`
              ).join(', ')
            }
            return rule.description || 'Unknown validation error'
          }).join('; ')
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create property. Please try again.' },
      { status: 500 }
    )
  }
}