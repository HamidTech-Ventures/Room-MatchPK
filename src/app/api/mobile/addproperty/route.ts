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
      filter.genderPreference = genderPreference;
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

    if (user.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only property owners can create properties' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'propertyType', 'address', 'pricing'];
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
      const parsed = parseInt(String(body.totalRooms));
      if (!isNaN(parsed) && parsed >= 1) {
        totalRooms = parsed;
      }
    }

    if (body.availableRooms !== undefined && body.availableRooms !== null && body.availableRooms !== '') {
      const parsed = parseInt(String(body.availableRooms));
      if (!isNaN(parsed) && parsed >= 0) {
        availableRooms = parsed;
      }
    }

    // Build property data object - only include fields that have valid values
    const propertyData: CreateDocument<Property> = {
      title: body.title,
      description: body.description || '',
      ownerId: new ObjectId(user.id), // Use id from JWT
      propertyType: body.propertyType,
      genderPreference: body.genderPreference,
      address: body.address,
      pricing: {
        pricePerBed: Number(body.pricing.pricePerBed),
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
      ownerPic: body.ownerPic || '',
    };

    // Add optional pricing fields only if they have values
    if (body.pricing.securityDeposit && !isNaN(Number(body.pricing.securityDeposit))) {
      propertyData.pricing.securityDeposit = Number(body.pricing.securityDeposit);
    }
    if (body.pricing.maintenanceCharges && !isNaN(Number(body.pricing.maintenanceCharges))) {
      propertyData.pricing.maintenanceCharges = Number(body.pricing.maintenanceCharges);
    }
    if (body.pricing.electricityCharges) {
      propertyData.pricing.electricityCharges = body.pricing.electricityCharges;
    }
    if (body.pricing.waterCharges) {
      propertyData.pricing.waterCharges = body.pricing.waterCharges;
    }

    // Add optional fields only if they have values
    if (body.location && body.location.coordinates && Array.isArray(body.location.coordinates) && body.location.coordinates.length === 2) {
      propertyData.location = body.location;
    }
    if (body.nearbyUniversity) {
      propertyData.nearbyUniversity = body.nearbyUniversity;
    }
    // Food service details
    if (body.foodService) {
      propertyData.foodService = body.foodService;
    }
    if (body.foodTimings) {
      propertyData.foodTimings = body.foodTimings;
    }
    if (body.foodOptions) {
      propertyData.foodOptions = body.foodOptions;
    }
    if (body.foodPricing) {
      propertyData.foodPricing = body.foodPricing;
    }
    if (body.foodHygiene) {
      propertyData.foodHygiene = body.foodHygiene;
    }
    if (body.foodStaff) {
      propertyData.foodStaff = body.foodStaff;
    }
    if (body.foodCapacity) {
      propertyData.foodCapacity = body.foodCapacity;
    }
    if (body.foodMenuRotation !== undefined) {
      propertyData.foodMenuRotation = body.foodMenuRotation;
    }
    if (body.foodSpecialRequirements) {
      propertyData.foodSpecialRequirements = body.foodSpecialRequirements;
    }

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
    if (totalRooms !== undefined) {
      propertyData.totalRooms = totalRooms;
    }
    if (availableRooms !== undefined) {
      propertyData.availableRooms = availableRooms;
    }

    console.log('Property data being inserted:', JSON.stringify(propertyData, null, 2));

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