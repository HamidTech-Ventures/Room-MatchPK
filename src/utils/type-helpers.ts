// Utility functions to handle common TypeScript patterns

// Safe type assertion for unknown objects
export function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object');
  }
}

// Safe property access
export function getProperty<T>(obj: Record<string, unknown>, key: string, defaultValue: T): T {
  return (obj[key] as T) ?? defaultValue;
}

// Safe array handling
export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

// Safe string handling
export function ensureString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return String(value || '');
}

// Safe number handling
export function ensureNumber(value: unknown): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Safe boolean handling
export function ensureBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return Boolean(value);
}

// Error handling utility
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

// Form validation utility
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

// Async handler wrapper
export function asyncHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Async handler error:', error);
      return null;
    }
  };
}

// Database document type guard
export function isValidDocument(doc: unknown): doc is Record<string, unknown> {
  return typeof doc === 'object' && doc !== null && !Array.isArray(doc);
}
