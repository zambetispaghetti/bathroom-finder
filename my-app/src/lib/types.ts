export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface OperatingHours {
  open: string;
  close: string;
  days: string[];
}

export interface Bathroom {
  id: string;
  name: string;
  location: Location;
  isPublic: boolean;
  isFree: boolean;
  isAccessible: boolean;
  hours?: OperatingHours;
  rating?: number;
  photos?: string[];
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  amenities?: string[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  bathroomId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type BathroomFormData = Omit<Bathroom, 'id' | 'addedBy' | 'createdAt' | 'updatedAt'>;
export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>; 