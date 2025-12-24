import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { authenticateUser, findUserByEmail, createUser, initializeDefaultAdmin } from './auth'

// Dynamic NEXTAUTH_URL based on environment
const getNextAuthUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  return 'http://localhost:3000'
}

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
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
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
              password: `GOOGLE_OAUTH_${Date.now()}`,
              role: 'student',
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
          console.error('❌ Error handling Google OAuth user:', error)
          console.error('Error details:', error)
          // Throw the error to trigger the error page
          throw new Error(`Google OAuth processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      console.log('🔐 SignIn callback triggered:', {
        provider: account?.provider,
        email: user.email,
        userId: user.id
      })

      // Handle Google OAuth sign-in validation
      if (account?.provider === 'google') {
        try {
          console.log('🔍 Processing Google OAuth sign-in for:', user.email)

          // Check if MongoDB is configured
          if (!process.env.MONGODB_URI) {
            console.warn('⚠️ MongoDB not configured, allowing Google sign-in')
            return true
          }

          const existingUser = await findUserByEmail(user.email!)
          console.log('👤 Existing user check result:', existingUser ? 'Found' : 'Not found')

          // Check the callback URL to determine intent
          // Note: We'll handle intent checking in the callback page instead
          // For now, allow all Google sign-ins and handle logic in JWT callback

          // If user exists with credentials only, allow them to link Google account
          if (existingUser && existingUser.provider === 'credentials') {
            console.log('🔗 User exists with credentials, will link Google account')
            return true
          }

          // If user doesn't exist, they will be created in the jwt callback
          if (!existingUser) {
            console.log('✨ New Google user, will create account')
            return true
          }

          // User exists with Google or both providers
          console.log('✅ Existing Google user, allowing sign-in')
          return true
        } catch (error) {
          console.error('❌ Error in signIn callback:', error)
          // Return false to show error page instead of proceeding
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allow OAuth callback URLs
      if (url.includes('/api/auth/callback')) {
        return url
      }
      
      // Redirect to custom callback page
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      return `${baseUrl}/auth/callback`
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
}