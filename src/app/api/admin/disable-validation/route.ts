import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { ensureValidationDisabled } from '@/lib/validation-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body || { action: 'disable' }
    
    const db = await getDatabase()
    
    if (action === 'enable') {
      // Enable validation (for future use)
      try {
        await db.command({
          collMod: 'properties',
          validationLevel: 'strict',
          validator: {
            $jsonSchema: {
              bsonType: "object",
              required: ["title", "propertyType", "pricing"],
              properties: {
                title: { bsonType: "string", minLength: 1 },
                propertyType: { bsonType: "string" },
                pricing: {
                  bsonType: "object",
                  required: ["pricePerBed"],
                  properties: {
                    pricePerBed: { bsonType: "number", minimum: 0 }
                  }
                }
              }
            }
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Validation enabled with basic schema'
        })
      } catch (error: any) {
        console.error('Error enabling validation:', error)
        throw error
      }
    } else {
      // Disable validation (default)
      const result = await ensureValidationDisabled()
      
      return NextResponse.json({
        success: result,
        message: result ? 'Validation disabled successfully' : 'Failed to disable validation'
      })
    }

  } catch (error: any) {
    console.error('Error in validation management:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage validation', details: error.message },
      { status: 500 }
    )
  }
}

// Export the function so it can be used by other parts of the app
