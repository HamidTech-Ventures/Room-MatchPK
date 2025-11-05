import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Create a mock client promise for when MongoDB is not configured
const createMockClientPromise = (): Promise<MongoClient> => {
  return Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: () => Promise.resolve(null),
        find: () => ({ toArray: () => Promise.resolve([]) }),
        insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
        updateOne: () => Promise.resolve({ modifiedCount: 0 }),
        deleteOne: () => Promise.resolve({ deletedCount: 0 }),
        createIndex: () => Promise.resolve(),
        indexes: () => Promise.resolve([])
      }),
      listCollections: () => ({ toArray: () => Promise.resolve([]) }),
      createCollection: () => Promise.resolve(),
      admin: () => ({ ping: () => Promise.resolve() })
    }),
    close: () => Promise.resolve()
  } as any)
}

if (!uri) {
  console.warn('MongoDB URI not configured. Database features will be disabled.')
  clientPromise = createMockClientPromise()
} else {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB || 'hostelManagement')
}

export function isDatabaseConfigured(): boolean {
  return !!uri
}