import { 
  Student, 
  Locker, 
  Rental, 
  Payment, 
  DashboardStats, 
  ApiResponse, 
  PaginatedResponse 
} from '../types';

// Mock data for demo purposes
const mockDashboardStats: DashboardStats = {
  totalLockers: 150,
  availableLockers: 45,
  rentedLockers: 98,
  maintenanceLockers: 7,
  overdueRentals: 12,
  monthlyRevenue: 29400,
  totalStudents: 285,
  activeRentals: 98
};

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    studentId: '2023001',
    course: 'Engenharia de Software',
    semester: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 99999-2222',
    studentId: '2023002',
    course: 'Administração',
    semester: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 99999-3333',
    studentId: '2023003',
    course: 'Design Gráfico',
    semester: 7,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockLockers: Locker[] = [
  {
    id: '1',
    number: 'A001',
    location: 'Bloco A - 1º Andar',
    size: 'medium',
    status: 'available',
    monthlyPrice: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    number: 'A002',
    location: 'Bloco A - 1º Andar',
    size: 'large',
    status: 'rented',
    monthlyPrice: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    number: 'B001',
    location: 'Bloco B - 2º Andar',
    size: 'small',
    status: 'maintenance',
    monthlyPrice: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockRentals: Rental[] = [
  {
    id: '1',
    lockerId: '2',
    studentId: '1',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    monthlyPrice: 80,
    totalAmount: 400,
    status: 'active',
    paymentStatus: 'paid',
    notes: 'Locação semestral',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    locker: mockLockers.find(l => l.id === '2'),
    student: mockStudents.find(s => s.id === '1')
  }
];

// API service with mock data (no backend required)
class ApiService {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth (demo only)
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    await this.delay();
    
    if (email === 'admin@lockers.com' && password === 'admin123') {
      const user = {
        id: '1',
        name: 'Administrador',
        email: 'admin@lockers.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const token = btoa(`${email}:${Date.now()}`);
      
      return { user, token };
    }
    
    throw new Error('Credenciais inválidas');
  }

  async logout(): Promise<void> {
    await this.delay(200);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay();
    return mockDashboardStats;
  }

  // Students
  async getStudents(page = 1, limit = 10): Promise<PaginatedResponse<Student>> {
    await this.delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = mockStudents.slice(start, end);
    
    return {
      data,
      total: mockStudents.length,
      page,
      limit,
      totalPages: Math.ceil(mockStudents.length / limit)
    };
  }

  async getStudent(id: string): Promise<Student> {
    await this.delay();
    
    const student = mockStudents.find(s => s.id === id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }
    
    return student;
  }

  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Student>> {
    await this.delay();
    
    const newStudent: Student = {
      ...student,
      id: String(mockStudents.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockStudents.push(newStudent);
    
    return {
      success: true,
      message: 'Aluno criado com sucesso',
      data: newStudent
    };
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    await this.delay();
    
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Aluno não encontrado');
    }
    
    mockStudents[index] = {
      ...mockStudents[index],
      ...student,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: 'Aluno atualizado com sucesso',
      data: mockStudents[index]
    };
  }

  async deleteStudent(id: string): Promise<ApiResponse<null>> {
    await this.delay();
    
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Aluno não encontrado');
    }
    
    mockStudents.splice(index, 1);
    
    return {
      success: true,
      message: 'Aluno excluído com sucesso',
      data: null
    };
  }

  // Lockers
  async getLockers(page = 1, limit = 10): Promise<PaginatedResponse<Locker>> {
    await this.delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = mockLockers.slice(start, end);
    
    return {
      data,
      total: mockLockers.length,
      page,
      limit,
      totalPages: Math.ceil(mockLockers.length / limit)
    };
  }

  async getLocker(id: string): Promise<Locker> {
    await this.delay();
    
    const locker = mockLockers.find(l => l.id === id);
    if (!locker) {
      throw new Error('Armário não encontrado');
    }
    
    return locker;
  }

  async createLocker(locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Locker>> {
    await this.delay();
    
    const newLocker: Locker = {
      ...locker,
      id: String(mockLockers.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockLockers.push(newLocker);
    
    return {
      success: true,
      message: 'Armário criado com sucesso',
      data: newLocker
    };
  }

  async updateLocker(id: string, locker: Partial<Locker>): Promise<ApiResponse<Locker>> {
    await this.delay();
    
    const index = mockLockers.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Armário não encontrado');
    }
    
    mockLockers[index] = {
      ...mockLockers[index],
      ...locker,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: 'Armário atualizado com sucesso',
      data: mockLockers[index]
    };
  }

  async deleteLocker(id: string): Promise<ApiResponse<null>> {
    await this.delay();
    
    const index = mockLockers.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Armário não encontrado');
    }
    
    mockLockers.splice(index, 1);
    
    return {
      success: true,
      message: 'Armário excluído com sucesso',
      data: null
    };
  }

  // Rentals
  async getRentals(page = 1, limit = 10): Promise<PaginatedResponse<Rental>> {
    await this.delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = mockRentals.slice(start, end);
    
    return {
      data,
      total: mockRentals.length,
      page,
      limit,
      totalPages: Math.ceil(mockRentals.length / limit)
    };
  }

  async getRental(id: string): Promise<Rental> {
    await this.delay();
    
    const rental = mockRentals.find(r => r.id === id);
    if (!rental) {
      throw new Error('Locação não encontrada');
    }
    
    return rental;
  }

  async createRental(rental: Omit<Rental, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Rental>> {
    await this.delay();
    
    const newRental: Rental = {
      ...rental,
      id: String(mockRentals.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locker: mockLockers.find(l => l.id === rental.lockerId),
      student: mockStudents.find(s => s.id === rental.studentId)
    };
    
    mockRentals.push(newRental);
    
    return {
      success: true,
      message: 'Locação criada com sucesso',
      data: newRental
    };
  }

  async updateRental(id: string, rental: Partial<Rental>): Promise<ApiResponse<Rental>> {
    await this.delay();
    
    const index = mockRentals.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Locação não encontrada');
    }
    
    mockRentals[index] = {
      ...mockRentals[index],
      ...rental,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: 'Locação atualizada com sucesso',
      data: mockRentals[index]
    };
  }

  async deleteRental(id: string): Promise<ApiResponse<null>> {
    await this.delay();
    
    const index = mockRentals.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Locação não encontrada');
    }
    
    mockRentals.splice(index, 1);
    
    return {
      success: true,
      message: 'Locação excluída com sucesso',
      data: null
    };
  }
}

export const apiService = new ApiService();