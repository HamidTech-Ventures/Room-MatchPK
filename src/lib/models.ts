import { ObjectId } from 'mongodb'

// User interfaces
export interface User {
  _id?: string | ObjectId
  id?: string
  email: string
  name: string
  password?: string
  role: 'student' | 'owner' | 'admin'
  avatar?: string
  phone?: string
  address?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  emailVerified?: boolean
  provider?: 'credentials' | 'google' | 'both'
  googleId?: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Property interfaces
export interface Property {
  _id?: string | ObjectId
  title: string
  description?: string
  ownerId: string | ObjectId
  propertyType: 'hostel' | 'apartment' | 'office' | 'pg' | 'flat' | 'house' | 'hostel-mess'
  propertySubType?: string

  address: any // Flexible address structure from frontend
  location?: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  pricing: {
    pricePerBed: number
    securityDeposit?: number
    maintenanceCharges?: number
    electricityCharges?: string
    waterCharges?: string
  }
  
  // Frontend form fields
  propertyName?: string
  country?: string
  province?: string
  city?: string
  area?: string
  mapLink?: string
  postalCode?: string
  
  // House/Office specific fields
  houseSize?: string
  officeSize?: string
  furnishingStatus?: string
  monthlyRent?: number
  amenities?: string[]
  images?: Array<{
    url: string
    publicId: string
    isActive?: boolean
    uploadedAt?: Date
  }>
  totalRooms?: number
  availableRooms?: number
  roomDetails?: Array<{
    roomNumber: string
    roomType: string
    capacity: number
    currentOccupancy: number
    isAvailable: boolean
  }>
  rules?: string[]
  tags?: string[]
  contactInfo?: {
    phone?: string
    email?: string
    whatsapp?: string
    name?: string
  }
  nearbyUniversity?: string
  // Food Service Details
  foodService?: string // yes/no
  foodTimings?: {
    breakfast: { enabled: boolean, startTime: string, endTime: string }
    lunch: { enabled: boolean, startTime: string, endTime: string }
    dinner: { enabled: boolean, startTime: string, endTime: string }
    snacks: { enabled: boolean, startTime: string, endTime: string }
  }
  foodOptions?: {
    veg: boolean
    nonVeg: boolean
    halal: boolean
    customDiet: boolean
    breakfast?: boolean
    lunch?: boolean
    dinner?: boolean
    snacks?: boolean
  }
  foodPricing?: {
    included: boolean
    monthlyPrice?: string
    perMealPrice?: string
  }
  foodHygiene?: string
  foodStaff?: string
  foodCapacity?: string
  foodMenuRotation?: boolean
  foodSpecialRequirements?: string
  
  // Additional frontend fields
  mealsOffered?: string[]
  workingHours?: string
  meetingRoom?: boolean
  internet?: boolean
  powerBackup?: boolean
  security?: boolean
  airConditioning?: boolean
  washroom?: string
  bathrooms?: string
  furnished?: string
  advanceSecurity?: string
  preferredTenant?: string
  parking?: string
  floorLevel?: string
  availableFrom?: string
  status?: 'pending' | 'approved' | 'rejected'
  isActive?: boolean
  isVerified?: boolean
  rating?: number
  totalReviews?: number
  createdAt?: Date
  updatedAt?: Date
  cnicPicFront?: string
  cnicPicBack?: string
  ownerPic?: string
  
  // Owner details from forms
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  cnicNumber?: string
  // Mess specific fields
  messName?: string
  messType?: string
  monthlyCharges?: number
  generalTimings?: string
  timings?: string
  deliveryAvailable?: boolean
  deliveryCharges?: string
  coverageArea?: string
  trialAvailable?: boolean
  paymentOptions?: {
    cash: boolean
    jazzcash: boolean
    easypaisa: boolean
  }
  sampleMenu?: string
  hygieneCertification?: string
}

// Booking interfaces
export interface Booking {
  _id?: string | ObjectId
  studentId: string | ObjectId
  propertyId: string | ObjectId
  ownerId: string | ObjectId
  roomNumber?: string
  checkInDate: Date
  checkOutDate?: Date
  duration: number // in months
  totalAmount: number
  securityDeposit?: number
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected'
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'
  specialRequests?: string
  cancellationReason?: string
  createdAt?: Date
  updatedAt?: Date
}

// Review interfaces
export interface Review {
  _id?: string | ObjectId
  propertyId: string | ObjectId
  studentId: string | ObjectId
  bookingId?: string | ObjectId
  rating: number // 1-5
  comment?: string
  images?: string[]
  isVerified?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Payment interfaces
export interface Payment {
  _id?: string | ObjectId
  bookingId: string | ObjectId
  studentId: string | ObjectId
  ownerId?: string | ObjectId
  amount: number
  paymentType: 'rent' | 'security_deposit' | 'maintenance' | 'utility' | 'fine'
  paymentMethod?: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque'
  transactionId?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentDate?: Date
  dueDate?: Date
  description?: string
  receipt?: string
  createdAt?: Date
  updatedAt?: Date
}

// Notification interfaces
export interface Notification {
  _id?: string | ObjectId
  userId: string | ObjectId
  title: string
  message: string
  type: 'booking' | 'payment' | 'maintenance' | 'general' | 'system'
  isRead?: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt?: Date
}

// Conversation interfaces
export interface Conversation {
  _id?: string | ObjectId
  participants: Array<{
    userId: string | ObjectId
    role: 'student' | 'owner' | 'admin'
    name: string
    email: string
    avatar?: string
  }>
  lastMessage?: {
    text: string
    senderId: string | ObjectId
    timestamp: Date
  }
  unreadCounts: {
    [userId: string]: number
  }
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Legacy conversation format for backward compatibility
export interface LegacyConversation {
  _id?: string | ObjectId
  user1: string | ObjectId
  user1Role: 'student' | 'owner' | 'admin'
  user1Name: string
  user1Email: string
  user2: string | ObjectId
  user2Role: 'student' | 'owner' | 'admin'
  user2Name: string
  user2Email: string
  active?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Union type for handling both conversation formats
export type ConversationDocument = Conversation | LegacyConversation

// Message interfaces
export interface Message {
  _id?: string | ObjectId
  conversationId: string | ObjectId
  senderId: string | ObjectId
  senderRole: 'student' | 'owner' | 'admin'
  text: string
  messageType?: 'text' | 'image' | 'file'
  attachments?: string[]
  readBy: Array<{
    userId: string | ObjectId
    readAt: Date
  }>
  isDeleted?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Maintenance Request interfaces
export interface MaintenanceRequest {
  _id?: string | ObjectId
  propertyId: string | ObjectId
  studentId: string | ObjectId
  ownerId?: string | ObjectId
  title: string
  description: string
  category?: 'plumbing' | 'electrical' | 'cleaning' | 'furniture' | 'appliance' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  images?: string[]
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
  completedAt?: Date
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

// Image tracking interface
export interface Image {
  _id?: string | ObjectId
  propertyId?: string | ObjectId
  userId: string | ObjectId
  url: string
  publicId: string
  folder: string
  type?: 'property' | 'owner_document' | 'review' | 'other'
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  deletedBy?: string | ObjectId
}

// Utility type for creating documents without _id
export type CreateDocument<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>

// Utility type for updating documents
export type UpdateDocument<T> = Partial<Omit<T, '_id' | 'createdAt'>> & {
  updatedAt?: Date
}