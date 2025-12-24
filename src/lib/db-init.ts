import { Db, CreateIndexesOptions, IndexSpecification } from 'mongodb'
import { getDatabase, isDatabaseConfigured } from './mongodb'

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  MAINTENANCE_REQUESTS: 'maintenanceRequests'
} as const

// Interface for collection schema
interface CollectionSchema {
  indexes: Array<{
    key: IndexSpecification
    options?: CreateIndexesOptions
  }>
  validator: any
}

// Database schemas and indexes
const COLLECTION_SCHEMAS: Record<string, CollectionSchema> = {
  users: {
    indexes: [
      { key: { email: 1 }, options: { unique: true } },
      { key: { googleId: 1 }, options: { sparse: true } },
      { key: { role: 1 } },
      { key: { createdAt: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'name', 'role'],
        properties: {
          email: {
            bsonType: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
          },
          name: { bsonType: 'string', minLength: 1 },
          password: { 
            bsonType: 'string',
            description: 'Temporary keeping as required for compatibility'
          },
          role: { 
            bsonType: 'string', 
            enum: ['student', 'owner', 'admin'] 
          },
          avatar: { bsonType: 'string' },
          phone: { bsonType: 'string' },
          address: { bsonType: 'string' },
          dateOfBirth: { bsonType: 'date' },
          gender: { 
            bsonType: 'string', 
            enum: ['male', 'female', 'other'] 
          },
          emergencyContact: {
            bsonType: 'object',
            properties: {
              name: { bsonType: 'string' },
              phone: { bsonType: 'string' },
              relationship: { bsonType: 'string' }
            }
          },
          emailVerified: { bsonType: 'bool' },
          provider: { 
            bsonType: 'string', 
            enum: ['credentials', 'google', 'both'] 
          },
          googleId: { bsonType: 'string' },
          isActive: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },

  properties: {
    indexes: [
      { key: { ownerId: 1 } },
      { key: { location: '2dsphere' } },
      { key: { city: 1, area: 1 } },
      { key: { propertyType: 1 } },
      { key: { status: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: 1 } },
      { key: { 'pricing.pricePerBed': 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'ownerId', 'propertyType', 'address', 'pricing'],
        properties: {
          title: { bsonType: 'string', minLength: 1 },
          description: { bsonType: 'string' },
          ownerId: { bsonType: 'objectId' },
          propertyType: {
            bsonType: 'string',
            enum: ['hostel', 'apartment', 'office', 'pg', 'flat', 'house', 'hostel-mess']
          },
          propertySubType: {
            bsonType: 'string',
            enum: ['boys', 'girls', 'co-living', 'family', 'bachelor', 'couple', 'coworking', 'private', 'shared', 'studio', '1-bedroom', '2-bedroom', '3-bedroom']
          },
          address: {
            bsonType: 'object',
            required: ['street', 'city', 'state', 'country'],
            properties: {
              street: { bsonType: 'string' },
              area: { bsonType: 'string' },
              city: { bsonType: 'string' },
              state: { bsonType: 'string' },
              country: { bsonType: 'string' },
              zipCode: { bsonType: 'string' }
            }
          },
          location: {
            bsonType: 'object',
            properties: {
              type: { bsonType: 'string', enum: ['Point'] },
              coordinates: {
                bsonType: 'array',
                items: { bsonType: 'double' },
                minItems: 2,
                maxItems: 2
              }
            }
          },
          pricing: {
            bsonType: 'object',
            required: ['pricePerBed'],
            properties: {
              pricePerBed: { bsonType: 'number', minimum: 0 },
              securityDeposit: { bsonType: 'number', minimum: 0 },
              maintenanceCharges: { bsonType: 'number', minimum: 0 },
              electricityCharges: { bsonType: 'string' },
              waterCharges: { bsonType: 'string' }
            }
          },
          amenities: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          images: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          totalRooms: { bsonType: 'int', minimum: 1 },
          availableRooms: { bsonType: 'int', minimum: 0 },
          roomDetails: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                roomNumber: { bsonType: 'string' },
                roomType: { bsonType: 'string' },
                capacity: { bsonType: 'int' },
                currentOccupancy: { bsonType: 'int' },
                isAvailable: { bsonType: 'bool' }
              }
            }
          },
          rules: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          contactInfo: {
            bsonType: 'object',
            properties: {
              phone: { bsonType: 'string' },
              email: { bsonType: 'string' },
              whatsapp: { bsonType: 'string' }
            }
          },
          status: { 
            bsonType: 'string', 
            enum: ['pending', 'approved', 'rejected'] 
          },
          isActive: { bsonType: 'bool' },
          isVerified: { bsonType: 'bool' },
          rating: { bsonType: 'number', minimum: 0, maximum: 5 },
          totalReviews: { bsonType: 'int', minimum: 0 },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          cnicPicFront: { bsonType: 'string' },
          cnicPicBack: { bsonType: 'string' },
          ownerPic: { bsonType: 'string' }
        }
      }
    }
  },

  bookings: {
    indexes: [
      { key: { studentId: 1 } },
      { key: { propertyId: 1 } },
      { key: { ownerId: 1 } },
      { key: { status: 1 } },
      { key: { checkInDate: 1 } },
      { key: { createdAt: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['studentId', 'propertyId', 'ownerId', 'checkInDate', 'status'],
        properties: {
          studentId: { bsonType: 'objectId' },
          propertyId: { bsonType: 'objectId' },
          ownerId: { bsonType: 'objectId' },
          roomNumber: { bsonType: 'string' },
          checkInDate: { bsonType: 'date' },
          checkOutDate: { bsonType: 'date' },
          duration: { bsonType: 'int', minimum: 1 },
          totalAmount: { bsonType: 'number', minimum: 0 },
          securityDeposit: { bsonType: 'number', minimum: 0 },
          status: { 
            bsonType: 'string', 
            enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'] 
          },
          paymentStatus: { 
            bsonType: 'string', 
            enum: ['pending', 'partial', 'paid', 'refunded'] 
          },
          specialRequests: { bsonType: 'string' },
          cancellationReason: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },

  reviews: {
    indexes: [
      { key: { propertyId: 1 } },
      { key: { studentId: 1 } },
      { key: { rating: 1 } },
      { key: { createdAt: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['propertyId', 'studentId', 'rating'],
        properties: {
          propertyId: { bsonType: 'objectId' },
          studentId: { bsonType: 'objectId' },
          bookingId: { bsonType: 'objectId' },
          rating: { bsonType: 'int', minimum: 1, maximum: 5 },
          comment: { bsonType: 'string' },
          images: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          isVerified: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },

  payments: {
    indexes: [
      { key: { bookingId: 1 } },
      { key: { studentId: 1 } },
      { key: { ownerId: 1 } },
      { key: { status: 1 } },
      { key: { paymentDate: 1 } },
      { key: { transactionId: 1 }, options: { unique: true, sparse: true } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['bookingId', 'studentId', 'amount', 'paymentType', 'status'],
        properties: {
          bookingId: { bsonType: 'objectId' },
          studentId: { bsonType: 'objectId' },
          ownerId: { bsonType: 'objectId' },
          amount: { bsonType: 'number', minimum: 0 },
          paymentType: { 
            bsonType: 'string', 
            enum: ['rent', 'security_deposit', 'maintenance', 'utility', 'fine'] 
          },
          paymentMethod: { 
            bsonType: 'string', 
            enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque'] 
          },
          transactionId: { bsonType: 'string' },
          status: { 
            bsonType: 'string', 
            enum: ['pending', 'completed', 'failed', 'refunded'] 
          },
          paymentDate: { bsonType: 'date' },
          dueDate: { bsonType: 'date' },
          description: { bsonType: 'string' },
          receipt: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },

  notifications: {
    indexes: [
      { key: { userId: 1 } },
      { key: { isRead: 1 } },
      { key: { type: 1 } },
      { key: { createdAt: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'title', 'message', 'type'],
        properties: {
          userId: { bsonType: 'objectId' },
          title: { bsonType: 'string' },
          message: { bsonType: 'string' },
          type: { 
            bsonType: 'string', 
            enum: ['booking', 'payment', 'maintenance', 'general', 'system'] 
          },
          isRead: { bsonType: 'bool' },
          actionUrl: { bsonType: 'string' },
          metadata: { bsonType: 'object' },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  },

  conversations: {
    indexes: [
      { key: { 'participants.userId': 1 } },
      { key: { updatedAt: -1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['participants', 'unreadCounts', 'isActive'],
        properties: {
          participants: {
            bsonType: 'array',
            minItems: 2,
            items: {
              bsonType: 'object',
              required: ['userId', 'role', 'name', 'email'],
              properties: {
                userId: { bsonType: 'objectId' },
                role: { 
                  bsonType: 'string', 
                  enum: ['student', 'owner', 'admin'] 
                },
                name: { bsonType: 'string' },
                email: { bsonType: 'string' },
                avatar: { bsonType: 'string' }
              }
            }
          },
          lastMessage: {
            bsonType: 'object',
            properties: {
              text: { bsonType: 'string' },
              senderId: { bsonType: 'objectId' },
              timestamp: { bsonType: 'date' }
            }
          },
          unreadCounts: { bsonType: 'object' },
          isActive: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },

  messages: {
    indexes: [
      { key: { conversationId: 1 } },
      { key: { senderId: 1 } },
      { key: { createdAt: -1 } },
      { key: { isDeleted: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['conversationId', 'senderId', 'senderRole', 'text', 'readBy'],
        properties: {
          conversationId: { bsonType: 'objectId' },
          senderId: { bsonType: 'objectId' },
          senderRole: { 
            bsonType: 'string', 
            enum: ['student', 'owner', 'admin'] 
          },
          text: { bsonType: 'string' },
          messageType: { 
            bsonType: 'string', 
            enum: ['text', 'image', 'file'] 
          },
          attachments: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          readBy: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['userId', 'readAt'],
              properties: {
                userId: { bsonType: 'objectId' },
                readAt: { bsonType: 'date' }
              }
            }
          },
          isDeleted: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },

  maintenanceRequests: {
    indexes: [
      { key: { propertyId: 1 } },
      { key: { studentId: 1 } },
      { key: { ownerId: 1 } },
      { key: { status: 1 } },
      { key: { priority: 1 } },
      { key: { createdAt: 1 } }
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['propertyId', 'studentId', 'title', 'description', 'priority', 'status'],
        properties: {
          propertyId: { bsonType: 'objectId' },
          studentId: { bsonType: 'objectId' },
          ownerId: { bsonType: 'objectId' },
          title: { bsonType: 'string' },
          description: { bsonType: 'string' },
          category: { 
            bsonType: 'string', 
            enum: ['plumbing', 'electrical', 'cleaning', 'furniture', 'appliance', 'other'] 
          },
          priority: { 
            bsonType: 'string', 
            enum: ['low', 'medium', 'high', 'urgent'] 
          },
          status: { 
            bsonType: 'string', 
            enum: ['pending', 'in_progress', 'completed', 'cancelled'] 
          },
          images: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          assignedTo: { bsonType: 'string' },
          estimatedCost: { bsonType: 'number', minimum: 0 },
          actualCost: { bsonType: 'number', minimum: 0 },
          completedAt: { bsonType: 'date' },
          notes: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  }
}

export async function initializeDatabase(): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('⚠️ MongoDB not configured. Skipping database initialization.')
    return
  }

  try {
    console.log('🚀 Initializing hostelManagement database...')
    
    const db = await getDatabase()
    
    // Get list of existing collections
    const existingCollections = await db.listCollections().toArray()
    const existingCollectionNames = existingCollections.map(col => col.name)
    
    console.log('📋 Existing collections:', existingCollectionNames)
    
    // Create collections with schemas and indexes
    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        if (!existingCollectionNames.includes(collectionName)) {
          console.log(`📦 Creating collection: ${collectionName}`)
          
          // Create collection with validator
          await db.createCollection(collectionName, {
            validator: schema.validator
          })
          
          console.log(`✅ Collection ${collectionName} created successfully`)
        } else {
          console.log(`📦 Collection ${collectionName} already exists`)
        }
        
        // Create indexes
        const collection = db.collection(collectionName)
        
        if (schema.indexes && schema.indexes.length > 0) {
          console.log(`🔍 Creating indexes for ${collectionName}...`)
          
          for (const indexSpec of schema.indexes) {
            try {
              await collection.createIndex(indexSpec.key, indexSpec.options || {})
            } catch (error: any) {
              // Ignore duplicate index errors
              if (!error.message.includes('already exists')) {
                console.warn(`⚠️ Warning creating index for ${collectionName}:`, error.message)
              }
            }
          }
          
          console.log(`✅ Indexes created for ${collectionName}`)
        }
        
      } catch (error: any) {
        console.error(`❌ Error setting up collection ${collectionName}:`, error.message)
      }
    }
    
    console.log('🎉 Database initialization completed successfully!')
    
    // Initialize default admin user
    const { initializeDefaultAdmin } = await import('./auth')
    await initializeDefaultAdmin()
    
    // Run property status migration to fix existing data
    try {
      const { migratePropertyStatus } = await import('./migrations/fix-property-status')
      await migratePropertyStatus()
    } catch (error) {
      console.warn('⚠️ Property status migration failed (this is okay for new installations):', error)
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

export async function checkDatabaseHealth(): Promise<{
  isConnected: boolean
  collections: string[]
  indexes: Record<string, any[]>
}> {
  if (!isDatabaseConfigured()) {
    return {
      isConnected: false,
      collections: [],
      indexes: {}
    }
  }

  try {
    const db = await getDatabase()
    
    // Check connection
    await db.admin().ping()
    
    // Get collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)
    
    // Get indexes for each collection
    const indexes: Record<string, any[]> = {}
    for (const collectionName of collectionNames) {
      try {
        const collection = db.collection(collectionName)
        indexes[collectionName] = await collection.indexes()
      } catch (error) {
        indexes[collectionName] = []
      }
    }
    
    return {
      isConnected: true,
      collections: collectionNames,
      indexes
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      isConnected: false,
      collections: [],
      indexes: {}
    }
  }
}

// Helper function to get collection with proper typing
export function getCollection(db: Db, collectionName: keyof typeof COLLECTIONS) {
  return db.collection(COLLECTIONS[collectionName])
}



