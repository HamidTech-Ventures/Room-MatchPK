import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { getDatabase, isDatabaseConfigured } from './mongodb'
import { User, CreateDocument } from './models'

let adminInitialized = false

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined')
  }
  
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined')
  }
  
  return jwt.verify(token, process.env.NEXTAUTH_SECRET)
}

export async function createUser(userData: CreateDocument<User>, silentMode: boolean = false): Promise<User | null> {
  if (!isDatabaseConfigured()) {
    throw new Error('Database not configured. Please set up MongoDB to create users.')
  }

  const db = await getDatabase()
  const users = db.collection('users')
  
  // Check if user already exists
  const existingUser = await users.findOne({ email: userData.email })
  if (existingUser) {
    if (silentMode) {
      return null // Return null instead of throwing error in silent mode
    }
    throw new Error('User already exists')
  }
  
  // Hash password if provided (not needed for Google OAuth users)
  let hashedPassword
  if (userData.password) {
    hashedPassword = await hashPassword(userData.password)
  }
  
  const newUser = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: userData.emailVerified || false,
    isActive: true // Set user as active by default
  }
  
  try {
    const result = await users.insertOne(newUser)
    
    const createdUser = {
      ...newUser,
      _id: result.insertedId.toString()
    }
    
    if (!silentMode) {
      console.log('User created successfully:', { 
        email: createdUser.email, 
        role: createdUser.role, 
        provider: createdUser.provider 
      })
    }
    
    return createdUser
  } catch (error: any) {
    console.error('Error creating user:', error)
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      if (silentMode) {
        return null // Return null instead of throwing error in silent mode
      }
      throw new Error('User already exists')
    }
    throw error
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  const db = await getDatabase()
  const users = db.collection('users')
  
  const user = await users.findOne({ email })
  if (!user) return null
  
  return {
    ...user,
    _id: user._id.toString()
  } as User
}

export async function findUserById(id: string): Promise<User | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  const db = await getDatabase()
  const users = db.collection('users')
  
  const user = await users.findOne({ _id: new ObjectId(id) })
  if (!user) return null
  
  return {
    ...user,
    _id: user._id.toString()
  } as User
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) {
    throw new Error('EMAIL_NOT_FOUND')
  }
  
  if (!user.password) {
    throw new Error('GOOGLE_ONLY_ACCOUNT')
  }
  
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    throw new Error('WRONG_PASSWORD')
  }
  
  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function initializeDefaultAdmin(): Promise<void> {
  if (!isDatabaseConfigured()) {
    return // Silent return if database not configured
  }

  if (adminInitialized) {
    return // Silent return if already initialized
  }

  try {
    const adminEmail = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || 'admin@roommatch.pk'
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'System Administrator'
    
    // Try to create admin user in silent mode
    const createdAdmin = await createUser({
      email: adminEmail,
      name: adminName,
      password: adminPassword,
      role: 'admin',
      provider: 'credentials',
      emailVerified: true
    }, true) // Silent mode enabled
    
    if (createdAdmin) {
      // Admin was created successfully
      console.log('✅ Default admin user created successfully')
      console.log(`📧 Admin Email: ${adminEmail}`)
      console.log(`🔑 Admin Password: ${adminPassword}`)
    }
    // If createdAdmin is null, it means admin already exists - no action needed
    
    adminInitialized = true
  } catch (error) {
    // Only log critical errors, not duplicate key errors
    console.error('❌ Critical error initializing default admin:', error)
  }
}