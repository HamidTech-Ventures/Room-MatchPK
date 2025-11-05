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

    // Debug: Log all received filter parameters
    console.log('=== FILTER DEBUG ===')
    console.log('Received filters:', {
      page,
      limit,
      skip,
      search,
      location,
      city,
      propertyType,
      genderPreference,
      minPrice,
      maxPrice,
      amenities,
      sortBy
    })

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
      // Add both subType and propertyType to the filter
      filter.$or = [
        { propertyType: propertyType.toLowerCase() },
        { subType: propertyType.toLowerCase() }
      ]
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

    // Apply price filter if either min or max price is specified and not at the extremes
    if (minPrice && maxPrice) {
      const min = parseInt(minPrice);
      const max = parseInt(maxPrice);
      
      console.log('=== API PRICE FILTER DEBUG ===');
      console.log('minPrice param:', minPrice);
      console.log('maxPrice param:', maxPrice);
      console.log('Parsed min:', min);
      console.log('Parsed max:', max);
      
      // Only skip filtering if both values are at their absolute extremes (indicating no user selection)
      const isWideOpenRange = (min === 0 && max === 999999);
      console.log('Is wide open range?', isWideOpenRange);
      
      if (!isWideOpenRange) {
        // Filter properties that have a price within the range in any of the price fields
        // Exclude null/undefined/zero values using $nin and $and
        if (!filter.$and) filter.$and = [];
        filter.$and.push({
          $or: [
            { 
              $and: [
                { 'pricing.pricePerBed': { $exists: true } },
                { 'pricing.pricePerBed': { $type: "number" } },
                { 'pricing.pricePerBed': { $nin: [null, 0] } },
                { 'pricing.pricePerBed': { $gte: min, $lte: max } }
              ]
            },
            { 
              $and: [
                { 'pricePerBed': { $exists: true } },
                { 'pricePerBed': { $type: "number" } },
                { 'pricePerBed': { $nin: [null, 0] } },
                { 'pricePerBed': { $gte: min, $lte: max } }
              ]
            },
            { 
              $and: [
                { 'monthlyRent': { $exists: true } },
                { 'monthlyRent': { $type: "number" } },
                { 'monthlyRent': { $nin: [null, 0] } },
                { 'monthlyRent': { $gte: min, $lte: max } }
              ]
            }
          ]
        });
        console.log('Applied robust multi-field numeric price filter with proper exclusions');
      } else {
        console.log('Skipped price filter (wide open range)');
      }
    } else {
      console.log('=== API PRICE FILTER DEBUG ===');
      console.log('No price params provided - minPrice:', minPrice, 'maxPrice:', maxPrice);
    }

    if (amenities && amenities.length > 0) {
      filter.amenities = { $in: amenities }
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter)
    
    // Debug: Data audit - examine price field structures in approved properties
    if (minPrice && maxPrice) {
      const auditMin = parseInt(minPrice);
      const auditMax = parseInt(maxPrice);
      
      // Only run audit if this isn't a wide-open range
      if (!(auditMin === 0 && auditMax === 999999)) {
        console.log('\n=== PRICE DATA AUDIT ===')
        const allApproved = await collection.find({ 
          status: 'approved', 
          isActive: true, 
          isVerified: true 
        }).toArray()
        
        const priceAnalysis = allApproved.map(p => {
          const pAny = p as any; // Type assertion for dynamic field access
          return {
            _id: p._id,
            title: p.title?.substring(0, 30) + '...',
            pricing_pricePerBed: p.pricing?.pricePerBed,
            pricing_pricePerBed_type: typeof p.pricing?.pricePerBed,
            pricePerBed: pAny.pricePerBed,
            pricePerBed_type: typeof pAny.pricePerBed,
            monthlyRent: pAny.monthlyRent,
            monthlyRent_type: typeof pAny.monthlyRent,
            hasAnyPrice: !!(p.pricing?.pricePerBed || pAny.pricePerBed || pAny.monthlyRent)
          }
        })
        
        console.log('Price field analysis for approved properties:')
        priceAnalysis.forEach(p => {
          console.log(`${p.title} - pricing.pricePerBed: ${p.pricing_pricePerBed} (${p.pricing_pricePerBed_type}), pricePerBed: ${p.pricePerBed} (${p.pricePerBed_type}), monthlyRent: ${p.monthlyRent} (${p.monthlyRent_type}), hasAnyPrice: ${p.hasAnyPrice}`)
        })
        
        // Check specifically for problematic records
        const problemRecords = priceAnalysis.filter(p => 
          !p.hasAnyPrice || 
          (p.pricing_pricePerBed_type && p.pricing_pricePerBed_type !== 'number') ||
          (p.pricePerBed_type && p.pricePerBed_type !== 'number') ||
          (p.monthlyRent_type && p.monthlyRent_type !== 'number')
        )
        
        console.log(`Found ${problemRecords.length} potentially problematic price records:`)
        problemRecords.forEach(p => console.log(`- ${p.title}: ${JSON.stringify(p)}`))
        console.log('=== END PRICE AUDIT ===\n')
      }
    }
    
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
      propertyType: p.propertyType,
      genderPreference: p.genderPreference,
      amenities: p.amenities,
      pricing: p.pricing,
      allFields: Object.keys(p) // Show all available fields
    })))

    // Debug: Check specifically approved properties
    const approvedProps = await collection.find({ status: 'approved' }).toArray()
    console.log('Total approved properties:', approvedProps.length)

    // Debug: Check properties matching specific filters
    if (propertyType) {
      const typeMatches = await collection.find({ propertyType: propertyType as any }).toArray()
      console.log(`Properties with type "${propertyType}":`, typeMatches.length)
    }

    if (genderPreference) {
      // Test both old and new values
      const genderMapping: { [key: string]: string[] } = {
        'boys': ['boys', 'male'],
        'girls': ['girls', 'female'],
        'mixed': ['mixed']
      }

      const possibleValues = genderMapping[genderPreference] || [genderPreference]
      console.log(`Testing gender filter for "${genderPreference}" with values:`, possibleValues)

      const genderMatches = await collection.find({ genderPreference: { $in: possibleValues as any } }).toArray()
      console.log(`Properties with gender "${genderPreference}":`, genderMatches.length)

      // Also test individual values
      for (const value of possibleValues) {
        const individualMatches = await collection.find({ genderPreference: value as any }).toArray()
        console.log(`Properties with exact gender "${value}":`, individualMatches.length)
      }
    }
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
    
    console.log('=== QUERY RESULTS DEBUG ===');
    console.log('Total properties found with filter:', total);
    console.log('Properties returned:', properties.length);
    console.log('Applied filter:', JSON.stringify(filter, null, 2));
    console.log('Sample property pricing:', properties.slice(0, 5).map(p => ({
      title: p.title,
      pricePerBed: p.pricing?.pricePerBed,
      rootPricePerBed: (p as any).pricePerBed,
      monthlyRent: (p as any).monthlyRent,
      fullPricing: p.pricing
    })));
    
    // Also check if there are any properties that would match without price filter
    const propertiesWithoutPriceFilter = await collection
      .find({ status: 'approved', isActive: true, isVerified: true })
      .limit(5)
      .toArray();
    console.log('Sample properties WITHOUT price filter:', propertiesWithoutPriceFilter.map(p => ({
      title: p.title,
      pricePerBed: p.pricing?.pricePerBed,
      rootPricePerBed: (p as any).pricePerBed,
      monthlyRent: (p as any).monthlyRent
    })));
    
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
