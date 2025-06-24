import { 
  Student, 
  Locker, 
  Rental, 
  Payment, 
  DashboardStats, 
  ApiResponse, 
  PaginatedResponse 
} from '../types';

// API service with real backend integration
class ApiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const response = await this.request<ApiResponse<{ user: any; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      localStorage.setItem('auth_token', response.data.token);
      return response.data;
    }

    throw new Error(response.message);
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.request<ApiResponse<DashboardStats>>('/dashboard/stats');
    
    if (response.success) {
      return response.data;
    }

    throw new Error(response.message);
  }

  // Students
  async getStudents(page = 1, limit = 10): Promise<PaginatedResponse<Student>> {
    const response = await this.request<PaginatedResponse<Student>>(`/students?page=${page}&limit=${limit}`);
    return response;
  }

  async getStudent(id: string): Promise<Student> {
    const response = await this.request<ApiResponse<Student>>(`/students/${id}`);
    
    if (response.success) {
      return response.data;
    }

    throw new Error(response.message);
  }

  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
    const response = await this.request<ApiResponse<Student>>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });

    return response;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    const response = await this.request<ApiResponse<Student>>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });

    return response;
  }

  async deleteStudent(id: string): Promise<ApiResponse<null>> {
    const response = await this.request<ApiResponse<null>>(`/students/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  // Lockers
  async getLockers(page = 1, limit = 10): Promise<PaginatedResponse<Locker>> {
    const response = await this.request<PaginatedResponse<Locker>>(`/lockers?page=${page}&limit=${limit}`);
    return response;
  }

  async getLocker(id: string): Promise<Locker> {
    const response = await this.request<ApiResponse<Locker>>(`/lockers/${id}`);
    
    if (response.success) {
      return response.data;
    }

    throw new Error(response.message);
  }

  async createLocker(locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Locker>> {
    const response = await this.request<ApiResponse<Locker>>('/lockers', {
      method: 'POST',
      body: JSON.stringify(locker),
    });

    return response;
  }

  async updateLocker(id: string, locker: Partial<Locker>): Promise<ApiResponse<Locker>> {
    const response = await this.request<ApiResponse<Locker>>(`/lockers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locker),
    });

    return response;
  }

  async deleteLocker(id: string): Promise<ApiResponse<null>> {
    const response = await this.request<ApiResponse<null>>(`/lockers/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  // Rentals
  async getRentals(page = 1, limit = 10): Promise<PaginatedResponse<Rental>> {
    const response = await this.request<PaginatedResponse<Rental>>(`/rentals?page=${page}&limit=${limit}`);
    return response;
  }

  async getRental(id: string): Promise<Rental> {
    const response = await this.request<ApiResponse<Rental>>(`/rentals/${id}`);
    
    if (response.success) {
      return response.data;
    }

    throw new Error(response.message);
  }

  async createRental(rental: Omit<Rental, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Rental>> {
    const response = await this.request<ApiResponse<Rental>>('/rentals', {
      method: 'POST',
      body: JSON.stringify(rental),
    });

    return response;
  }

  async updateRental(id: string, rental: Partial<Rental>): Promise<ApiResponse<Rental>> {
    const response = await this.request<ApiResponse<Rental>>(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rental),
    });

    return response;
  }

  async deleteRental(id: string): Promise<ApiResponse<null>> {
    const response = await this.request<ApiResponse<null>>(`/rentals/${id}`, {
      method: 'DELETE',
    });

    return response;
  }
}

export const apiService = new ApiService();