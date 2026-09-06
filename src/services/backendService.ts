import { apiClient, ApiError } from './apiClient';
import { mockService } from './mockService';
import { 
  User, 
  KYCVerification, 
  StudentVerification, 
  CreditScore, 
  CreditScoreHistoryItem, 
  LoanRequest, 
  Transaction, 
  FraudAlert,
  DocType,
  PurposeCategory,
  Role
} from '../types';

class BackendService {
  private isBackendAvailable: boolean | null = null;
  private currentUserId: string = '00000000-0000-0000-0000-000000000001';

  public async checkBackend(): Promise<boolean> {
    const available = await apiClient.checkHealth();
    this.isBackendAvailable = available;
    return available;
  }

  public getBackendStatus(): boolean | null {
    return this.isBackendAvailable;
  }

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  public setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  // --- Users & Auth ---
  public async getUsers(): Promise<User[]> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<User[]>('/users');
      } catch (err) {
        console.warn('Backend query failed, using local mock data:', err);
      }
    }
    return mockService.getAllUsers();
  }

  public async getUserById(id: string): Promise<User | null> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<User>(`/users/${id}`);
      } catch (err) {
        console.warn('Backend query failed, using local mock data:', err);
      }
    }
    const all = mockService.getAllUsers();
    return all.find(u => u.id === id) || null;
  }

  public async login(identifier: string): Promise<User> {
    if (await this.checkBackend()) {
      const user = await apiClient.post<User>('/auth/login', { identifier });
      this.currentUserId = user.id;
      return user;
    }
    const user = mockService.getAllUsers().find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.id === identifier);
    if (!user) throw new Error('Invalid credentials');
    this.currentUserId = user.id;
    mockService.setCurrentUser(user.id);
    return user;
  }

  public async register(userData: { fullName: string; email: string; phone: string; role: Role }): Promise<User> {
    if (await this.checkBackend()) {
      const user = await apiClient.post<User>('/auth/register', userData);
      this.currentUserId = user.id;
      return user;
    }
    const user = mockService.setCurrentUser(mockService.getAllUsers()[0].id);
    return user;
  }

  // --- KYC & Student Verification ---
  public async getKyc(userId: string): Promise<KYCVerification | null> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<KYCVerification | null>(`/kyc/${userId}`);
      } catch (err) {
        console.warn('Backend kyc fetch error:', err);
      }
    }
    return mockService.getKyc(userId);
  }

  public async submitKyc(
    userId: string,
    data: {
      docType: DocType;
      docNumber: string;
      fullName: string;
      dob: string;
      frontDocUrl: string;
      backDocUrl?: string;
      selfieUrl: string;
    }
  ): Promise<KYCVerification> {
    if (await this.checkBackend()) {
      return await apiClient.post<KYCVerification>(`/kyc/${userId}`, data);
    }
    return await mockService.submitKyc(userId, data);
  }

  public async getStudentVerification(userId: string): Promise<StudentVerification | null> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<StudentVerification | null>(`/student/${userId}`);
      } catch (err) {
        console.warn('Backend student fetch error:', err);
      }
    }
    return mockService.getStudentVerification(userId);
  }

  public async submitStudentVerification(
    userId: string,
    data: {
      universityName: string;
      studentIdNumber: string;
      faculty: string;
      enrollmentYear: number;
      expectedGraduationYear: number;
      studentCardUrl: string;
    }
  ): Promise<{ student: StudentVerification; score: CreditScore }> {
    if (await this.checkBackend()) {
      return await apiClient.post<{ student: StudentVerification; score: CreditScore }>(`/student/${userId}`, data);
    }
    return await mockService.submitStudentVerification(userId, data);
  }

  // --- Credit Score ---
  public async getCreditScore(userId: string): Promise<CreditScore> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<CreditScore>(`/credit-score/${userId}`);
      } catch (err) {
        console.warn('Backend score fetch error:', err);
      }
    }
    return mockService.getCreditScore(userId);
  }

  public async getCreditHistory(userId: string): Promise<CreditScoreHistoryItem[]> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<CreditScoreHistoryItem[]>(`/credit-history/${userId}`);
      } catch (err) {
        console.warn('Backend credit history error:', err);
      }
    }
    return mockService.getCreditHistory(userId);
  }

  // --- Loans & Marketplace ---
  public async getLoans(filters?: { borrowerId?: string; status?: string }): Promise<LoanRequest[]> {
    if (await this.checkBackend()) {
      try {
        let path = '/loans';
        const params = new URLSearchParams();
        if (filters?.borrowerId) params.append('borrowerId', filters.borrowerId);
        if (filters?.status) params.append('status', filters.status);
        if (params.toString()) path += `?${params.toString()}`;
        return await apiClient.get<LoanRequest[]>(path);
      } catch (err) {
        console.warn('Backend getLoans error:', err);
      }
    }
    return mockService.getLoans(filters);
  }

  public async requestLoan(
    borrowerId: string,
    data: {
      purposeCategory: PurposeCategory;
      purposeDescription: string;
      amountRequestedPaisa: number;
      tenureDays: number;
    }
  ): Promise<LoanRequest> {
    if (await this.checkBackend()) {
      return await apiClient.post<LoanRequest>('/loans', { borrowerId, ...data });
    }
    return await mockService.requestLoan(borrowerId, data);
  }

  public async fundLoan(loanId: string, lenderId: string, amountPaisa: number): Promise<any> {
    if (await this.checkBackend()) {
      return await apiClient.post<any>(`/loans/${loanId}/fund`, { lenderId, amountPaisa });
    }
    return await mockService.fundLoan(loanId, lenderId, amountPaisa);
  }

  public async repayLoan(loanId: string, borrowerId: string): Promise<any> {
    const idempotencyKey = `idem-repay-${loanId}-${Date.now()}`;
    if (await this.checkBackend()) {
      return await apiClient.post<any>(`/loans/${loanId}/repay`, { borrowerId, idempotencyKey });
    }
    return await mockService.repayLoan(loanId, borrowerId, idempotencyKey);
  }

  // --- Transactions & Fraud ---
  public async getTransactions(): Promise<Transaction[]> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<Transaction[]>('/admin/transactions');
      } catch (err) {
        console.warn('Backend transactions error:', err);
      }
    }
    return mockService.getTransactions();
  }

  public async getFraudAlerts(): Promise<FraudAlert[]> {
    if (await this.checkBackend()) {
      try {
        return await apiClient.get<FraudAlert[]>('/admin/fraud-alerts');
      } catch (err) {
        console.warn('Backend fraud alerts error:', err);
      }
    }
    return mockService.getFraudAlerts();
  }
}

export const backendService = new BackendService();
