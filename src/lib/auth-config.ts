import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { authenticateUser, findUserByEmail, createUser, initializeDefaultAdmin } from './auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('EMAIL_PASSWORD_REQUIRED')
        }

        try {
          // Check if MongoDB is configured
          if (!process.env.MONGODB_URI) {
            console.warn('MongoDB not configured, authentication disabled')
            throw new Error('DATABASE_NOT_CONFIGURED')
          }

          // Initialize default admin if not exists
          await initializeDefaultAdmin()
          
          const user = await authenticateUser(credentials.email, credentials.password)
          if (user) {
            return {
              id: (user._id || user.id || '').toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar
            }
          }
          return null
        } catch (error: any) {
          console.error('Authentication error:', error)
          // Re-throw the error so it can be handled by the client
          throw new Error(error.message || 'AUTHENTICATION_FAILED')
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    ] : [])
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'credentials') {
        // For credentials login, user.id is already the MongoDB ObjectId
        token.role = user.role || 'student'
        token.id = user.id.toString()
      }
      
      // Handle Google OAuth user creation
      if (account?.provider === 'google' && user) {
        try {
          // Check if MongoDB is configured
          if (!process.env.MONGODB_URI) {
            console.warn('MongoDB not configured, using default user data')
            token.role = 'student'
            token.id = user.id || ''
            return token
          }

          const existingUser = await findUserByEmail(user.email!)
          if (!existingUser) {
            // Create new user from Google OAuth
            console.log('Creating new user from Google OAuth:', user.email)
            const newUser = await createUser({
              email: user.email!,
              name: user.name!,
              role: 'student', // Default role for Google OAuth users
              provider: 'google',
              googleId: user.id,
              avatar: user.image || undefined,
              emailVerified: true
            })
            
            if (newUser) {
              token.role = newUser.role
              token.id = newUser._id?.toString() || ''
              token.isNewUser = true // Mark as new user for callback handling
              console.log('New Google user created successfully:', newUser.email)
            } else {
              // User already exists, find them
              const existingUser = await findUserByEmail(user.email!)
              if (existingUser) {
                token.role = existingUser.role
                token.id = existingUser._id?.toString() || ''
                token.isNewUser = false
                console.log('Google user already exists:', existingUser.email)
              }
            }
          } else {
            // Check if existing user has different provider
            if (existingUser.provider !== 'google' && existingUser.provider !== 'both') {
              // Update user to support both providers
              console.log('Linking Google account to existing user:', existingUser.email)
              const db = await (await import('./mongodb')).getDatabase()
              await db.collection('users').updateOne(
                { email: user.email },
                { 
                  $set: { 
                    provider: 'both',
                    googleId: user.id,
                    avatar: user.image || existingUser.avatar,
                    emailVerified: true,
                    updatedAt: new Date()
                  }
                }
              )
            }
            token.role = existingUser.role
            token.id = existingUser._id?.toString() || ''
            token.isNewUser = false
            console.log('Google login successful for existing user:', existingUser.email)
          }
        } catch (error) {
          console.error('Error handling Google OAuth user:', error)
          // Set default values to prevent login failure
          token.role = 'student'
          token.id = user.id || ''
          token.isNewUser = false
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as "student" | "owner" | "admin"
        session.user.isNewUser = token.isNewUser as boolean
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Handle Google OAuth sign-in validation
      if (account?.provider === 'google') {
        try {
          // Check if MongoDB is configured
          if (!process.env.MONGODB_URI) {
            console.warn('MongoDB not configured, allowing Google sign-in')
            return true
          }

          const existingUser = await findUserByEmail(user.email!)
          
          // Check the callback URL to determine intent
          // Note: We'll handle intent checking in the callback page instead
          // For now, allow all Google sign-ins and handle logic in JWT callback
          
          // If user exists with credentials only, allow them to link Google account
          if (existingUser && existingUser.provider === 'credentials') {
            console.log('User exists with credentials, will link Google account')
            return true
          }
          
          // If user doesn't exist, they will be created in the jwt callback
          if (!existingUser) {
            console.log('New Google user, will create account')
            return true
          }
          
          // User exists with Google or both providers
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // Don't block sign-in on error, let it proceed
          return true
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl })
      
      // Always redirect to our custom callback page after successful authentication
      if (url.startsWith('/') || url.startsWith(baseUrl)) {
        const callbackUrl = `${baseUrl}/auth/callback`
        console.log('Redirecting to callback:', callbackUrl)
        return callbackUrl
      }
      
      console.log('Redirecting to baseUrl:', baseUrl)
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  debug: false, // Disable debug to avoid warnings
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
}