// Global type definitions for common patterns
export interface PropertyType {
  _id?: string;
  title: string;
  description: string;
  images: string[];
  pricing: {
    pricePerBed: number;
    pricePerMonth?: number;
  };
  location: {
    city: string;
    area: string;
    address: string;
  };
  amenities: string[];
  propertyType: string;
  isActive: boolean;
  status: string;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserType {
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  image?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FormDataType {
  [key: string]: string | number | boolean | string[] | File[] | undefined;
}

export interface ChatMessage {
  _id?: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  conversationId: string;
  isRead?: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Event handler types
export type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;
export type ClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

// Database document types
export type DatabaseDocument = Record<string, unknown> & { _id?: string };
export type DatabaseQuery = Record<string, unknown>;
export type DatabaseUpdate = Record<string, unknown>;

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
