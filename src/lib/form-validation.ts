"use client"

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  url?: boolean
  numeric?: boolean
  integer?: boolean
  positive?: boolean
  customValidator?: (value: any) => string | null
  dependsOn?: {
    field: string
    condition: (dependentValue: any, currentValue: any) => boolean
    message: string
  }
}

export interface FieldValidation {
  isValid: boolean
  error: string
}

export interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
  firstErrorField?: string
}

/**
 * Validates a single field based on its validation rules
 */
export function validateField(
  value: any, 
  rules: ValidationRule, 
  fieldName?: string,
  allFormData?: Record<string, any>
): FieldValidation {
  // Handle null/undefined values
  const stringValue = value?.toString().trim() || ""
  const numericValue = typeof value === 'number' ? value : parseFloat(stringValue)

  // Required validation
  if (rules.required && (!value || stringValue === "")) {
    return {
      isValid: false,
      error: `${fieldName || 'This field'} is required`
    }
  }

  // If field is empty and not required, skip other validations
  if (!rules.required && stringValue === "") {
    return { isValid: true, error: "" }
  }

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return {
      isValid: false,
      error: `${fieldName || 'This field'} must be at least ${rules.minLength} characters`
    }
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: `${fieldName || 'This field'} must not exceed ${rules.maxLength} characters`
    }
  }

  // Numeric validations
  if (rules.numeric || rules.integer || rules.min !== undefined || rules.max !== undefined || rules.positive) {
    if (isNaN(numericValue)) {
      return {
        isValid: false,
        error: `${fieldName || 'This field'} must be a valid number`
      }
    }

    if (rules.integer && !Number.isInteger(numericValue)) {
      return {
        isValid: false,
        error: `${fieldName || 'This field'} must be a whole number`
      }
    }

    if (rules.positive && numericValue <= 0) {
      return {
        isValid: false,
        error: `${fieldName || 'This field'} must be a positive number`
      }
    }

    if (rules.min !== undefined && numericValue < rules.min) {
      return {
        isValid: false,
        error: `${fieldName || 'This field'} must be at least ${rules.min}`
      }
    }

    if (rules.max !== undefined && numericValue > rules.max) {
      return {
        isValid: false,
        error: `${fieldName || 'This field'} must not exceed ${rules.max}`
      }
    }
  }

  // Email validation
  if (rules.email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(stringValue)) {
      return {
        isValid: false,
        error: "Please enter a valid email address"
      }
    }
  }

  // Phone validation (Pakistan format)
  if (rules.phone) {
    const phonePattern = /^(\+92|0)?[0-9]{10,11}$/
    const cleanPhone = stringValue.replace(/[\s-]/g, '')
    if (!phonePattern.test(cleanPhone)) {
      return {
        isValid: false,
        error: "Please enter a valid phone number (e.g., 03001234567)"
      }
    }
  }

  // URL validation
  if (rules.url) {
    try {
      new URL(stringValue)
    } catch {
      return {
        isValid: false,
        error: "Please enter a valid URL"
      }
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return {
      isValid: false,
      error: `${fieldName || 'This field'} format is invalid`
    }
  }

  // Dependent field validation
  if (rules.dependsOn && allFormData) {
    const dependentValue = allFormData[rules.dependsOn.field]
    if (!rules.dependsOn.condition(dependentValue, value)) {
      return {
        isValid: false,
        error: rules.dependsOn.message
      }
    }
  }

  // Custom validator
  if (rules.customValidator) {
    const customError = rules.customValidator(value)
    if (customError) {
      return {
        isValid: false,
        error: customError
      }
    }
  }

  return { isValid: true, error: "" }
}

/**
 * Validates an entire form based on validation schema
 */
export function validateForm(
  formData: Record<string, any>,
  validationSchema: Record<string, ValidationRule>
): FormValidation {
  const errors: Record<string, string> = {}
  let firstErrorField: string | undefined

  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const validation = validateField(formData[fieldName], rules, fieldName, formData)
    if (!validation.isValid) {
      errors[fieldName] = validation.error
      if (!firstErrorField) {
        firstErrorField = fieldName
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField
  }
}

/**
 * Real-time validation hook for forms
 */
export function useFormValidation(
  formData: Record<string, any>,
  validationSchema: Record<string, ValidationRule>,
  touchedFields: Record<string, boolean> = {}
) {
  const validateSingleField = (fieldName: string) => {
    const rules = validationSchema[fieldName]
    if (!rules) return { isValid: true, error: "" }
    
    return validateField(formData[fieldName], rules, fieldName, formData)
  }

  const validateAllFields = () => {
    return validateForm(formData, validationSchema)
  }

  const getFieldError = (fieldName: string) => {
    if (!touchedFields[fieldName]) return ""
    const validation = validateSingleField(fieldName)
    return validation.error
  }

  const isFieldValid = (fieldName: string) => {
    if (!touchedFields[fieldName]) return true
    const validation = validateSingleField(fieldName)
    return validation.isValid
  }

  const getFieldClassName = (fieldName: string, baseClassName: string = "") => {
    if (!touchedFields[fieldName]) return baseClassName
    
    const isValid = isFieldValid(fieldName)
    const errorClass = isValid 
      ? "border-green-300 focus:border-green-500 focus:ring-green-500" 
      : "border-red-300 focus:border-red-500 focus:ring-red-500"
    
    return `${baseClassName} ${errorClass}`.trim()
  }

  return {
    validateSingleField,
    validateAllFields,
    getFieldError,
    isFieldValid,
    getFieldClassName
  }
}

/**
 * Common validation schemas for different form types
 */
export const validationSchemas = {
  // Sign Up Form Validation
  signUp: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Za-z\s]+$/,
      customValidator: (value: string) => {
        if (value && !/^[A-Za-z\s]+$/.test(value)) {
          return "Name can only contain letters and spaces"
        }
        return null
      }
    },
    email: {
      required: true,
      email: true,
      maxLength: 100
    },
    phone: {
      required: true,
      phone: true,
      customValidator: (value: string) => {
        const cleanPhone = value?.replace(/[\s-]/g, '') || ""
        if (cleanPhone.length > 11) {
          return "Phone number cannot exceed 11 digits"
        }
        if (!/^\d+$/.test(cleanPhone)) {
          return "Phone number can only contain digits"
        }
        return null
      }
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 128,
      customValidator: (value: string) => {
        if (value && value.length < 6) {
          return "Password must be at least 6 characters long"
        }
        if (value && !/(?=.*[a-zA-Z])/.test(value)) {
          return "Password must contain at least one letter"
        }
        return null
      }
    },
    terms: {
      required: true,
      customValidator: (value: boolean) => {
        if (!value) return "You must accept the terms and conditions"
        return null
      }
    }
  },

  // Login Form Validation
  login: {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 1
    }
  },

  // Property Form Validation
  property: {
    propertyName: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    propertyType: {
      required: true
    },
    genderPreference: {
      required: true
    },
    totalRooms: {
      required: true,
      numeric: true,
      integer: true,
      min: 1,
      max: 1000
    },
    availableRooms: {
      required: true,
      numeric: true,
      integer: true,
      min: 0,
      dependsOn: {
        field: 'totalRooms',
        condition: (totalRooms: any, availableRooms: any) => {
          return Number(availableRooms) <= Number(totalRooms)
        },
        message: 'Available rooms cannot exceed total rooms'
      }
    },
    pricePerBed: {
      required: true,
      numeric: true,
      positive: true,
      max: 1000000
    },
    address: {
      required: true,
      minLength: 5,
      maxLength: 200
    },
    country: {
      required: true
    },
    province: {
      required: true
    },
    city: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    area: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    mapLink: {
      required: true,
      url: true
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 1000
    },
    ownerName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Za-z\s]+$/
    },
    ownerEmail: {
      required: true,
      email: true
    },
    ownerPhone: {
      required: true,
      phone: true
    },
    cnicNumber: {
      required: true,
      customValidator: (value: string) => {
        const cleanCnic = value?.replace(/[-\s]/g, '') || ""
        if (cleanCnic.length !== 13) {
          return "CNIC must be exactly 13 digits"
        }
        if (!/^\d+$/.test(cleanCnic)) {
          return "CNIC can only contain digits"
        }
        return null
      }
    }
  },

  // Mess Form Validation
  mess: {
    messName: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    messType: {
      required: true
    },
    monthlyCharges: {
      required: true,
      numeric: true,
      positive: true,
      max: 100000
    },
    timings: {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 1000
    }
  },

  // Contact Form Validation
  contact: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Za-z\s]+$/
    },
    email: {
      required: true,
      email: true
    },
    phone: {
      phone: true
    },
    subject: {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000
    }
  }
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number // 0-4
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else feedback.push("Use at least 8 characters")

  if (/[a-z]/.test(password)) score++
  else feedback.push("Add lowercase letters")

  if (/[A-Z]/.test(password)) score++
  else feedback.push("Add uppercase letters")

  if (/\d/.test(password)) score++
  else feedback.push("Add numbers")

  if (/[^A-Za-z0-9]/.test(password)) score++
  else feedback.push("Add special characters")

  return {
    score,
    feedback,
    isStrong: score >= 3
  }
}

/**
 * Utility to format validation error messages for toast notifications
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  const errorList = Object.entries(errors)
    .map(([field, error]) => `• ${error}`)
    .join('\n')
  
  return `Please fix the following errors:\n${errorList}`
}

/**
 * Debounced validation function
 */
export function createDebouncedValidator(
  validationFn: () => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout
  
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(validationFn, delay)
  }
}
