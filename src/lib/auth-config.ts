import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { authenticateUser, findUserByEmail, createUser, initializeDefaultAdmin } from './auth'
import { validateRedirectUrl, validateEnvironmentVariables, SECURITY_CONFIG } from './security-config'

// Secure URL validation
const getNextAuthUrl = () => {
  const url = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  // Validate URL format
  try {
    new URL(url)
    return url
  } catch {
    console.error('Invalid NEXTAUTH_URL format')
    return 'http://localhost:3000'
  }
}

// Validate environment on startup
const envValidation = validateEnvironmentVariables()
if (!envValidation.isValid) {
  console.error('Missing required environment variables:', envValidation.missing)
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
          console.warn('Authentication attempt with missing credentials')
          return null
        }

        try {
          // Check if MongoDB is configured
          if (!process.env.MONGODB_URI) {
            console.error('MongoDB not configured, authentication disabled')
            return null
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
          console.error('Authentication error:', {
            email: credentials.email,
            error: error.message,
            timestamp: new Date().toISOString()
          })
          return null
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
    maxAge: SECURITY_CONFIG.SESSION_MAX_AGE,
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
            console.error('MongoDB not configured for OAuth')
            token.role = 'student'
            token.id = user.id || ''
            return token
          }

          const existingUser = await findUserByEmail(user.email!)
          if (!existingUser) {
            // Create new user from Google OAuth
            console.info('Creating new user from Google OAuth')
            const newUser = await createUser({
              email: user.email!,
              name: user.name!,
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
              console.info('New Google user created successfully')
            } else {
              // User already exists, find them
              const existingUser = await findUserByEmail(user.email!)
              if (existingUser) {
                token.role = existingUser.role
                token.id = existingUser._id?.toString() || ''
                token.isNewUser = false
                console.info('Google user already exists')
              }
            }
          } else {
            // Check if existing user has different provider
            if (existingUser.provider !== 'google' && existingUser.provider !== 'both') {
              // Update user to support both providers
              console.info('Linking Google account to existing user')
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
            console.info('Google login successful for existing user')
          }
        } catch (error) {
          console.error('Error handling Google OAuth user:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
          return token // Return token instead of throwing to prevent auth failure
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
      console.info('SignIn callback triggered:', {
        provider: account?.provider,
        hasEmail: !!user.email
      })

      // Handle Google OAuth sign-in validation
      if (account?.provider === 'google') {
        try {
          console.info('Processing Google OAuth sign-in')

          // Check if MongoDB is configured
          if (!process.env.MONGODB_URI) {
            console.error('MongoDB not configured, denying Google sign-in')
            return false
          }

          const existingUser = await findUserByEmail(user.email!)
          console.info('Existing user check result:', existingUser ? 'Found' : 'Not found')

          // Check the callback URL to determine intent
          // Note: We'll handle intent checking in the callback page instead
          // For now, allow all Google sign-ins and handle logic in JWT callback

          // If user exists with credentials only, allow them to link Google account
          if (existingUser && existingUser.provider === 'credentials') {
            console.info('User exists with credentials, will link Google account')
            return true
          }

          // If user doesn't exist, they will be created in the jwt callback
          if (!existingUser) {
            console.info('New Google user, will create account')
            return true
          }

          // User exists with Google or both providers
          console.info('Existing Google user, allowing sign-in')
          return true
        } catch (error) {
          console.error('Error in signIn callback:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.info('NextAuth redirect callback')
      
      // Validate URLs to prevent open redirect attacks
      const isValidUrl = (testUrl: string) => {
        try {
          const parsed = new URL(testUrl, baseUrl)
          return parsed.origin === new URL(baseUrl).origin
        } catch {
          return false
        }
      }
      
      // If this is an OAuth callback, let NextAuth handle it
      if (url.includes('/api/auth/callback')) {
        return url
      }
      
      // Only allow same-origin redirects
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      if (isValidUrl(url)) {
        return url
      }
      
      // Default safe redirect
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET,
}