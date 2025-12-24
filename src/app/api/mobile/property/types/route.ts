import { NextRequest, NextResponse } from 'next/server';

// GET - Get property types and subtypes for mobile forms
export async function GET(request: NextRequest) {
  try {
    const propertyTypes = {
      hostel: {
        label: 'Student Hostel',
        subtypes: [
          { value: 'boys', label: 'Boys Only' },
          { value: 'girls', label: 'Girls Only' },
          { value: 'co-living', label: 'Co-Living' }
        ],
        fields: ['totalRooms', 'availableRooms', 'pricePerBed', 'securityDeposit']
      },
      apartment: {
        label: 'Apartment',
        subtypes: [
          { value: 'studio', label: 'Studio Apartment' },
          { value: '1-bedroom', label: '1 Bedroom' },
          { value: '2-bedroom', label: '2 Bedroom' },
          { value: '3-bedroom', label: '3+ Bedroom' }
        ],
        fields: ['houseSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
      },
      house: {
        label: 'House',
        subtypes: [
          { value: 'family', label: 'Family House' },
          { value: 'bachelor', label: 'Bachelor House' },
          { value: 'couple', label: 'Couple House' }
        ],
        fields: ['houseSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
      },
      office: {
        label: 'Office',
        subtypes: [
          { value: 'coworking', label: 'Co-working Space' },
          { value: 'private', label: 'Private Office' },
          { value: 'shared', label: 'Shared Office' }
        ],
        fields: ['officeSize', 'monthlyRent', 'securityDeposit', 'furnishingStatus']
      },
      'hostel-mess': {
        label: 'Mess Service',
        subtypes: [
          { value: 'veg', label: 'Vegetarian' },
          { value: 'non-veg', label: 'Non-Vegetarian' },
          { value: 'both', label: 'Both Veg & Non-Veg' }
        ],
        fields: ['totalRooms', 'availableRooms', 'pricePerBed', 'messType', 'deliveryAvailable']
      }
    };

    const amenities = [
      { id: 'wifi', label: 'High-Speed Wi-Fi' },
      { id: 'ac', label: 'Air Conditioning' },
      { id: 'food', label: 'Meals Included' },
      { id: 'parking', label: 'Parking Space' },
      { id: 'gym', label: 'Gym/Fitness Center' },
      { id: 'laundry', label: 'Laundry Service' },
      { id: 'security', label: '24/7 Security' },
      { id: 'study', label: 'Study Room' },
      { id: 'cleaning', label: 'Cleaning Service' },
      { id: 'generator', label: 'Backup Generator' },
      { id: 'water', label: 'Water Supply' },
      { id: 'maintenance', label: 'Maintenance' }
    ];

    const houseSizes = [
      { value: '3-marla', label: '3 Marla' },
      { value: '5-marla', label: '5 Marla' },
      { value: '10-marla', label: '10 Marla' },
      { value: '1-kanal', label: '1 Kanal' }
    ];

    const officeSizes = [
      { value: 'small', label: 'Small (1-5 people)' },
      { value: 'medium', label: 'Medium (6-15 people)' },
      { value: 'large', label: 'Large (16+ people)' }
    ];

    const furnishingOptions = [
      { value: 'furnished', label: 'Furnished' },
      { value: 'semi-furnished', label: 'Semi Furnished' },
      { value: 'unfurnished', label: 'Unfurnished' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        propertyTypes,
        amenities,
        houseSizes,
        officeSizes,
        furnishingOptions
      }
    });

  } catch (error) {
    console.error('Error fetching property types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property types' },
      { status: 500 }
    );
  }
}