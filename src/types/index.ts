// Core Types for Locker Management System

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
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
  clientId: string;
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
  client?: Client;
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
  totalClients: number;
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