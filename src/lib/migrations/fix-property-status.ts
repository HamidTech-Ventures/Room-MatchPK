import { getDatabase, isDatabaseConfigured } from '../mongodb'

/**
 * Migration script to fix existing properties that don't have the status field
 * or have incorrect status values
 */
export async function migratePropertyStatus(): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('⚠️ MongoDB not configured. Skipping property status migration.')
    return
  }

  try {
    console.log('🔄 Starting property status migration...')
    
    const db = await getDatabase()
    const collection = db.collection('properties')
    
    // Get all properties that don't have a status field or have inconsistent status
    const propertiesWithoutStatus = await collection.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: '' }
      ]
    }).toArray()
    
    console.log(`📊 Found ${propertiesWithoutStatus.length} properties without proper status`)
    
    if (propertiesWithoutStatus.length === 0) {
      console.log('✅ All properties already have proper status field')
      return
    }
    
    // Update each property based on its current isActive and isVerified values
    for (const property of propertiesWithoutStatus) {
      let newStatus: string
      
      if (property.isVerified && property.isActive) {
        newStatus = 'approved'
      } else if (!property.isVerified && !property.isActive) {
        // For properties that are both not verified and not active,
        // check if they were recently created (within last 30 days) to determine if pending or rejected
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const createdAt = property.createdAt || new Date(0)
        
        if (createdAt > thirtyDaysAgo) {
          newStatus = 'pending' // Recently created, likely pending approval
        } else {
          newStatus = 'rejected' // Older, likely rejected or inactive
        }
      } else {
        newStatus = 'pending' // Default to pending for unclear cases
      }
      
      await collection.updateOne(
        { _id: property._id },
        { 
          $set: { 
            status: newStatus,
            updatedAt: new Date()
          } 
        }
      )
      
      console.log(`✅ Updated property ${property._id} status to: ${newStatus}`)
    }
    
    // Also ensure that all approved properties have the correct flags
    await collection.updateMany(
      { status: 'approved' },
      { 
        $set: { 
          isVerified: true,
          isActive: true,
          updatedAt: new Date()
        } 
      }
    )
    
    // Ensure pending properties have correct flags
    await collection.updateMany(
      { status: 'pending' },
      { 
        $set: { 
          isVerified: false,
          isActive: false,
          updatedAt: new Date()
        } 
      }
    )
    
    // Ensure rejected properties have correct flags
    await collection.updateMany(
      { status: 'rejected' },
      { 
        $set: { 
          isVerified: false,
          isActive: false,
          updatedAt: new Date()
        } 
      }
    )
    
    console.log('🎉 Property status migration completed successfully!')
    
    // Show final counts
    const statusCounts = await collection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    console.log('📈 Final property status counts:')
    statusCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id || 'undefined'}: ${count}`)
    })
    
  } catch (error) {
    console.error('❌ Property status migration failed:', error)
    throw error
  }
}
