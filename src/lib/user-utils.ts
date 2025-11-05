import { ObjectId } from 'mongodb'
import { getDatabase } from './mongodb'
import { Session } from 'next-auth'

export async function getUserObjectId(session: Session): Promise<ObjectId | null> {
  if (!session?.user?.email) {
    return null
  }

  try {
    // First try to use the session user ID if it's a valid ObjectId
    if (session.user.id && ObjectId.isValid(session.user.id)) {
      return new ObjectId(session.user.id)
    }

    // If not valid, find user by email to get their actual ObjectId
    const db = await getDatabase()
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user || !user._id) {
      console.error('User not found in database:', session.user.email)
      return null
    }

    return user._id as ObjectId
  } catch (error) {
    console.error('Error getting user ObjectId:', error)
    return null
  }
}