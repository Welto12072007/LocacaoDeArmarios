// Core Types for Locker Management System

export  default interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentId: string;
  course: string;
  semester: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Locker {
  id: string;
  number: string;
  location: string;
  size: 'small' | 'medium' | 'large';
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  monthlyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  id: string;
  lockerId: string;
  studentId: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  totalAmount: number;
  status: 'active' | 'overdue' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  locker?: Locker;
  student?: Student;
}

export interface Payment {
  id: string;
  rentalId: string;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'card' | 'pix' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLockers: number;
  availableLockers: number;
  rentedLockers: number;
  maintenanceLockers: number;
  overdueRentals: number;
  monthlyRevenue: number;
  totalStudents: number;
  activeRentals: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}