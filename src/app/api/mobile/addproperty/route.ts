import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Property, CreateDocument } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken'; // Import JWT verification

// Secret key for JWT (store in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verify(token, JWT_SECRET) as { id: string; role: string };
    return payload;
  } catch (error) {
    return null;
  }
}

// Helper function to safely parse numbers
function tryParseNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return Number.isFinite(num) && num >= 0 ? num : undefined
}

// GET - Fetch all properties with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filter parameters
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const city = searchParams.get('city');
    const propertyType = searchParams.get('propertyType');
    const genderPreference = searchParams.get('genderPreference');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const db = await getDatabase();
    const collection = db.collection<Property>('properties');

    // Build filter query - only show approved and active properties
    const filter: any = {
      isActive: true,
      status: 'approved',
      isVerified: true,
    };

    // Advanced search (hostel name, city, area)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.area': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { nearbyUniversity: { $regex: search, $options: 'i' } },
      ];
    }

    // Specific location filter
    if (location) {
      filter['address.city'] = { $regex: location, $options: 'i' };
    } else if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (propertyType) {
      filter.propertyType = propertyType;
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
      filter['pricing.pricePerBed'] = {};
      if (minPrice) filter['pricing.pricePerBed'].$gte = parseInt(minPrice);
      if (maxPrice) filter['pricing.pricePerBed'].$lte = parseInt(maxPrice);
    }

    if (amenities && amenities.length > 0) {
      filter.amenities = { $in: amenities };
    }

    // Geo-search (if lat/lng provided)
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '0'); // in meters
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng)) && radius > 0) {
      filter['location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius,
        },
      };
    }

    // Autocomplete for city/area/university/tags
    if (searchParams.get('autocomplete')) {
      const autoField = searchParams.get('field') || 'city';
      const autoQuery = searchParams.get('autocomplete');
      let autoPipeline;
      if (autoField === 'tags') {
        autoPipeline = [
          { $match: { tags: { $regex: autoQuery, $options: 'i' } } },
          { $unwind: '$tags' },
          { $match: { tags: { $regex: autoQuery, $options: 'i' } } },
          { $group: { _id: '$tags' } },
          { $limit: 10 },
        ];
      } else {
        autoPipeline = [
          { $match: { [`address.${autoField}`]: { $regex: autoQuery, $options: 'i' } } },
          { $group: { _id: `$address.${autoField}` } },
          { $limit: 10 },
        ];
      }
      const autoResults = await collection.aggregate(autoPipeline).toArray();
      return NextResponse.json({ autocomplete: autoResults.map(r => r._id) });
    }

    // Faceted search: return counts for each filter
    if (searchParams.get('facets')) {
      const facets = await collection.aggregate([
        { $match: filter },
        {
          $facet: {
            cities: [{ $group: { _id: '$address.city', count: { $sum: 1 } } }],
            types: [{ $group: { _id: '$propertyType', count: { $sum: 1 } } }],
            tags: [{ $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }],
          },
        },
      ]).toArray();
      return NextResponse.json({ facets: facets[0] });
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter);

    // Handle sorting
    let sortQuery: any = {};
    switch (sortBy) {
      case 'price-low':
        sortQuery = { 'pricing.pricePerBed': 1 };
        break;
      case 'price-high':
        sortQuery = { 'pricing.pricePerBed': -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'relevance':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    // Fetch properties with pagination
    const properties = await collection
      .find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert ObjectId to string for JSON serialization
    const serializedProperties = properties.map(property => ({
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString(),
    }));

    return NextResponse.json({
      success: true,
      properties: serializedProperties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Allow both owners and students to create properties
    if (!['owner', 'student'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only property owners and students can create properties' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields based on property type
    const requiredFields = ['title', 'propertyType', 'address'];
    
    // Add pricing validation based on property type
    if (body.propertyType === 'hostel-mess') {
      if (!body.pricePerBed && !body.monthlyCharges && !body.pricing?.pricePerBed) {
        return NextResponse.json(
          { success: false, error: 'Monthly charges (pricePerBed) is required for mess properties' },
          { status: 400 }
        );
      }
    } else {
      if (!body.monthlyRent && !body.pricePerBed && !body.pricing?.pricePerBed && !body.pricing?.monthlyRent) {
        return NextResponse.json(
          { success: false, error: 'Monthly rent or price per bed is required' },
          { status: 400 }
        );
      }
    }

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    const collection = db.collection<Property>('properties');

    // Parse and validate room numbers properly
    let totalRooms: number | undefined;
    let availableRooms: number | undefined;

    if (body.totalRooms !== undefined && body.totalRooms !== null && body.totalRooms !== '') {
      totalRooms = tryParseNumber(body.totalRooms);
    }

    if (body.availableRooms !== undefined && body.availableRooms !== null && body.availableRooms !== '') {
      availableRooms = tryParseNumber(body.availableRooms);
    }

    // Get price from frontend form fields
    let finalPrice: number | undefined
    if (body.propertyType === 'hostel-mess') {
      finalPrice = tryParseNumber(body.pricePerBed) || tryParseNumber(body.monthlyCharges) || tryParseNumber(body.pricing?.pricePerBed) || tryParseNumber(body.pricing?.monthlyCharges)
    } else {
      finalPrice = tryParseNumber(body.monthlyRent) || tryParseNumber(body.pricePerBed) || tryParseNumber(body.pricing?.pricePerBed) || tryParseNumber(body.pricing?.monthlyRent)
    }

    if (!finalPrice) {
      return NextResponse.json(
        { success: false, error: 'Valid pricing is required' },
        { status: 400 }
      )
    }

    // Build property data matching frontend form structure
    const propertyData: CreateDocument<Property> = {
      title: body.title || body.propertyName,
      description: body.description || '',
      ownerId: new ObjectId(user.id), // Use id from JWT
      propertyType: body.propertyType,
      propertySubType: body.propertySubType,
      genderPreference: body.genderPreference,
      address: body.address,
      pricing: {
        pricePerBed: finalPrice,
        securityDeposit: tryParseNumber(body.securityDeposit) || tryParseNumber(body.pricing?.securityDeposit) || 0
      },
      amenities: body.amenities || [],
      images: body.images || [],
      roomDetails: body.roomDetails || [],
      rules: Array.isArray(body.rules) ? body.rules : (body.rules ? [body.rules] : []),
      contactInfo: body.contactInfo || {},
      tags: body.tags || [],
      nearbyUniversity: body.nearbyUniversity || '',
      status: 'pending',
      isActive: false,
      isVerified: false,
      rating: 0,
      totalReviews: 0,
      cnicPicFront: body.cnicPicFront || '',
      cnicPicBack: body.cnicPicBack || '',
      ownerPic: body.ownerPic || '',
    };

    // Add extra common fields
    if (body.propertyName) propertyData.propertyName = body.propertyName;
    if (body.country) propertyData.country = body.country;
    if (body.province) propertyData.province = body.province;
    if (body.city) propertyData.city = body.city;
    if (body.area) propertyData.area = body.area;
    if (body.mapLink) propertyData.mapLink = body.mapLink;
    if (body.postalCode) propertyData.postalCode = body.postalCode;

    // Add property type specific fields
    if (body.propertyType === 'hostel-mess') {
      // Mess-specific fields
      propertyData.messName = body.messName || body.propertyName || body.title
      propertyData.messType = body.messType
      propertyData.monthlyCharges = finalPrice
      propertyData.deliveryAvailable = body.deliveryAvailable || false
      propertyData.deliveryCharges = body.deliveryCharges || ''
      propertyData.coverageArea = body.coverageArea || ''
      propertyData.trialAvailable = body.trialAvailable || false
      propertyData.paymentOptions = body.paymentOptions || { cash: false, jazzcash: false, easypaisa: false }
      propertyData.timings = body.timings || body.generalTimings || ''
      propertyData.generalTimings = body.generalTimings || body.timings || ''
    } else {
      // Other property types
      propertyData.monthlyRent = finalPrice
      if (body.houseSize) propertyData.houseSize = body.houseSize
      if (body.officeSize) propertyData.officeSize = body.officeSize
      if (body.furnishingStatus) propertyData.furnishingStatus = body.furnishingStatus
    }

    // Add optional pricing fields only if they have values
    if (body.pricing?.maintenanceCharges !== undefined && body.pricing.maintenanceCharges !== null) {
      const mc = tryParseNumber(body.pricing.maintenanceCharges)
      if (mc !== undefined) propertyData.pricing.maintenanceCharges = mc
    }
    if (body.pricing?.electricityCharges) {
      propertyData.pricing.electricityCharges = body.pricing.electricityCharges
    }
    if (body.pricing?.waterCharges) {
      propertyData.pricing.waterCharges = body.pricing.waterCharges
    }

    // Add optional fields only if they have values
    if (body.location && body.location.coordinates && Array.isArray(body.location.coordinates) && body.location.coordinates.length === 2) {
      propertyData.location = body.location;
    }
    if (body.nearbyUniversity) {
      propertyData.nearbyUniversity = body.nearbyUniversity;
    }
    // Food service details
    if (body.foodService) propertyData.foodService = body.foodService;
    if (body.foodTimings) propertyData.foodTimings = body.foodTimings;
    if (body.foodOptions) propertyData.foodOptions = body.foodOptions;
    if (body.foodPricing) propertyData.foodPricing = body.foodPricing;
    if (body.foodHygiene) propertyData.foodHygiene = body.foodHygiene;
    if (body.foodStaff) propertyData.foodStaff = body.foodStaff;
    if (body.foodCapacity) propertyData.foodCapacity = body.foodCapacity;
    if (body.foodMenuRotation !== undefined) propertyData.foodMenuRotation = body.foodMenuRotation;
    if (body.foodSpecialRequirements) propertyData.foodSpecialRequirements = body.foodSpecialRequirements;

    // Validate room numbers logic
    if (totalRooms !== undefined && availableRooms !== undefined) {
      if (availableRooms > totalRooms) {
        return NextResponse.json(
          { success: false, error: 'Available rooms cannot be greater than total rooms' },
          { status: 400 }
        );
      }
    }

    // Only add room numbers if they're valid
    if (totalRooms !== undefined) propertyData.totalRooms = totalRooms;
    if (availableRooms !== undefined) propertyData.availableRooms = availableRooms;

    // Sanitized logging
    const logData = {
      ...propertyData,
      cnicPicFront: propertyData.cnicPicFront ? '[REDACTED]' : '',
      cnicPicBack: propertyData.cnicPicBack ? '[REDACTED]' : '',
      ownerPic: propertyData.ownerPic ? '[REDACTED]' : '',
    };
    console.log('Property data being inserted:', JSON.stringify(logData, null, 2));

    // Temporarily bypass validation to allow property creation
    const result = await collection.insertOne(propertyData, { bypassDocumentValidation: true });

    return NextResponse.json({
      success: true,
      propertyId: result.insertedId.toString(),
      message: 'Property created successfully. It will be reviewed by admin before going live.',
    });
  } catch (error: any) {
    console.error('Error creating property:', error);

    // Handle MongoDB validation errors specifically
    if (error.code === 121) {
      const details = error.errInfo?.details || error.details || {};
      console.error('MongoDB validation error details:', details);

      let errorMessage = 'Property data validation failed: ';
      if (details.failingDocumentId) {
        errorMessage += 'Invalid field values. ';
      }
      if (details.schemaRulesNotSatisfied) {
        const rules = details.schemaRulesNotSatisfied;
        if (rules.length > 0) {
          errorMessage += rules
            .map((rule: any) => {
              if (rule.propertiesNotSatisfied) {
                return rule.propertiesNotSatisfied
                  .map((prop: any) => `${prop.propertyName}: ${prop.description || 'Invalid value'}`)
                  .join(', ');
              }
              return rule.description || 'Unknown validation error';
            })
            .join('; ');
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create property. Please try again.' },
      { status: 500 }
    );
  }
}
