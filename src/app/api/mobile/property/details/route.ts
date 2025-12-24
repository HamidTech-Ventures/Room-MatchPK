import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Property } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get property details by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('id');

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<Property>('properties');

    const property = await collection.findOne({ 
      _id: new ObjectId(propertyId),
      isActive: true,
      status: 'approved'
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const serializedProperty = {
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString(),
    };

    return NextResponse.json({
      success: true,
      property: serializedProperty
    });

  } catch (error) {
    console.error('Error fetching property details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}