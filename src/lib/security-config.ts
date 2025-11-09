// Security configuration and validation utilities
export const SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Session security
  SESSION_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  
  // Allowed domains for redirects
  ALLOWED_REDIRECT_DOMAINS: [
    'roommatchpk.com',
    'www.roommatchpk.com',
    'localhost'
  ]
}

export function validateRedirectUrl(url: string, baseUrl: string): boolean {
  try {
    const parsed = new URL(url, baseUrl)
    const baseParsed = new URL(baseUrl)
    
    // Allow same origin
    if (parsed.origin === baseParsed.origin) {
      return true
    }
    
    // Check against allowed domains
    return SECURITY_CONFIG.ALLOWED_REDIRECT_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

export function sanitizeUserData(data: any) {
  const { password, ...sanitized } = data
  return sanitized
}

export function validateEnvironmentVariables(): { isValid: boolean; missing: string[] } {
  const required = [
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  return {
    isValid: missing.length === 0,
    missing
  }
}