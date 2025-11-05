import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { migratePropertyStatus } from '@/lib/migrations/fix-property-status'

// POST - Run property status migration (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('🔧 Admin initiated property status migration')
    
    await migratePropertyStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Property status migration completed successfully'
    })

  } catch (error) {
    console.error('Error running property status migration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run migration' },
      { status: 500 }
    )
  }
}
