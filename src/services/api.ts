import { 
  Student, 
  Locker, 
  Rental, 
  Payment, 
  DashboardStats, 
  ApiResponse, 
  PaginatedResponse 
} from '../types';

// Mock API service - replace with real API calls
class ApiService {
  private baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Mock data - replace with real API call
    return {
      totalLockers: 150,
      availableLockers: 45,
      rentedLockers: 98,
      maintenanceLockers: 7,
      overdueRentals: 12,
      monthlyRevenue: 29400,
      totalStudents: 320,
      activeRentals: 98,
    };
  }

  // Students
  async getStudents(page = 1, limit = 10): Promise<PaginatedResponse<Student>> {
    // Mock data - replace with real API call
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@university.edu',
        phone: '(11) 99999-1111',
        studentId: 'STU2024001',
        course: 'Engenharia de Software',
        semester: 6,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@university.edu',
        phone: '(11) 99999-2222',
        studentId: 'STU2024002',
        course: 'Ciência da Computação',
        semester: 4,
        status: 'active',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
      },
    ];

    return {
      data: mockStudents,
      total: 320,
      page,
      limit,
      totalPages: Math.ceil(320 / limit),
    };
  }

  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
    // Mock implementation
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: newStudent,
      message: 'Student created successfully',
      success: true,
    };
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    // Mock implementation
    const updatedStudent: Student = {
      id,
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      studentId: student.studentId || '',
      course: student.course || '',
      semester: student.semester || 1,
      status: student.status || 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: updatedStudent,
      message: 'Student updated successfully',
      success: true,
    };
  }

  async deleteStudent(id: string): Promise<ApiResponse<null>> {
    return {
      data: null,
      message: 'Student deleted successfully',
      success: true,
    };
  }

  // Lockers
  async getLockers(page = 1, limit = 10): Promise<PaginatedResponse<Locker>> {
    // Mock data
    const mockLockers: Locker[] = [
      {
        id: '1',
        number: 'A001',
        location: 'Bloco A - 1º Andar',
        size: 'medium',
        status: 'rented',
        monthlyPrice: 300,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        number: 'A002',
        location: 'Bloco A - 1º Andar',
        size: 'large',
        status: 'available',
        monthlyPrice: 400,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
    ];

    return {
      data: mockLockers,
      total: 150,
      page,
      limit,
      totalPages: Math.ceil(150 / limit),
    };
  }

  async createLocker(locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Locker>> {
    const newLocker: Locker = {
      ...locker,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: newLocker,
      message: 'Locker created successfully',
      success: true,
    };
  }

  async updateLocker(id: string, locker: Partial<Locker>): Promise<ApiResponse<Locker>> {
    const updatedLocker: Locker = {
      id,
      number: locker.number || '',
      location: locker.location || '',
      size: locker.size || 'medium',
      status: locker.status || 'available',
      monthlyPrice: locker.monthlyPrice || 0,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: updatedLocker,
      message: 'Locker updated successfully',
      success: true,
    };
  }

  async deleteLocker(id: string): Promise<ApiResponse<null>> {
    return {
      data: null,
      message: 'Locker deleted successfully',
      success: true,
    };
  }

  // Rentals
  async getRentals(page = 1, limit = 10): Promise<PaginatedResponse<Rental>> {
    const mockRentals: Rental[] = [
      {
        id: '1',
        lockerId: '1',
        studentId: '1',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-07-15T10:00:00Z',
        monthlyPrice: 300,
        totalAmount: 1800,
        status: 'active',
        paymentStatus: 'paid',
        notes: 'Rental for Spring semester',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        locker: {
          id: '1',
          number: 'A001',
          location: 'Bloco A - 1º Andar',
          size: 'medium',
          status: 'rented',
          monthlyPrice: 300,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        student: {
          id: '1',
          name: 'João Silva',
          email: 'joao.silva@university.edu',
          phone: '(11) 99999-1111',
          studentId: 'STU2024001',
          course: 'Engenharia de Software',
          semester: 6,
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      },
    ];

    return {
      data: mockRentals,
      total: 98,
      page,
      limit,
      totalPages: Math.ceil(98 / limit),
    };
  }

  async createRental(rental: Omit<Rental, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Rental>> {
    const newRental: Rental = {
      ...rental,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: newRental,
      message: 'Rental created successfully',
      success: true,
    };
  }

  async updateRental(id: string, rental: Partial<Rental>): Promise<ApiResponse<Rental>> {
    const updatedRental: Rental = {
      id,
      lockerId: rental.lockerId || '',
      studentId: rental.studentId || '',
      startDate: rental.startDate || '',
      endDate: rental.endDate || '',
      monthlyPrice: rental.monthlyPrice || 0,
      totalAmount: rental.totalAmount || 0,
      status: rental.status || 'active',
      paymentStatus: rental.paymentStatus || 'pending',
      notes: rental.notes,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: updatedRental,
      message: 'Rental updated successfully',
      success: true,
    };
  }

  async deleteRental(id: string): Promise<ApiResponse<null>> {
    return {
      data: null,
      message: 'Rental deleted successfully',
      success: true,
    };
  }
}

export const apiService = new ApiService();