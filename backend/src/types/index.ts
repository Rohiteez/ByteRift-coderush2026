// Aafno Pay: Shared Backend Data Types & API Envelopes

export type Role = 'BORROWER' | 'LENDER' | 'ADMIN';
export type DocType = 'CITIZENSHIP' | 'NATIONAL_ID' | 'PASSPORT';
export type VerificationStatus = 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AcademicClearanceStatus = 'CLEAR' | 'FINANCIAL_HOLD' | 'EXPELLED';

export type PurposeCategory = 
  | 'RENT' 
  | 'FOOD' 
  | 'MEDICAL' 
  | 'EDUCATION' 
  | 'TRANSPORT' 
  | 'UTILITIES' 
  | 'OTHER';

export type LoanStatus = 
  | 'REQUESTED'
  | 'MATCHING'
  | 'PARTIALLY_FUNDED'
  | 'FUNDED'
  | 'AGREEMENT_PENDING'
  | 'ACTIVE'
  | 'PAYMENT_DUE'
  | 'OVERDUE'
  | 'GRACE_PERIOD'
  | 'DEFAULTED'
  | 'RECOVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type TransactionType = 
  | 'DISBURSEMENT'
  | 'REPAYMENT'
  | 'PLATFORM_FEE'
  | 'RESERVE_FEE'
  | 'WALLET_TOPUP'
  | 'REFUND';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  walletBalancePaisa?: number;
  createdAt: string;
}

export interface KYCVerification {
  id: string;
  userId: string;
  docType: DocType;
  docNumber: string;
  docNumberHash: string;
  fullName: string;
  dob: string;
  frontDocUrl: string;
  backDocUrl?: string;
  selfieUrl: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface StudentVerification {
  id: string;
  userId: string;
  universityName: string;
  studentIdNumber: string;
  studentIdNumberHash: string;
  studentCardUrl: string;
  faculty: string;
  enrollmentYear: number;
  expectedGraduationYear: number;
  verificationStatus: VerificationStatus;
  academicClearanceStatus: AcademicClearanceStatus;
  verifiedAt?: string;
}

export interface CreditScore {
  userId: string;
  score: number; // 0 - 100
  tier: 1 | 2 | 3 | 4;
  maxLimitPaisa: number;
  lastCalculatedAt: string;
}

export interface CreditScoreHistoryItem {
  id: string;
  userId: string;
  delta: number;
  previousScore: number;
  newScore: number;
  reason: string;
  createdAt: string;
}

export interface LoanFunder {
  id: string;
  loanId: string;
  lenderId: string;
  lenderName: string;
  amountFundedPaisa: number;
  expectedReturnPaisa: number;
  fundedAt: string;
}

export interface LoanRequest {
  id: string;
  borrowerId: string;
  borrowerPseudonym: string;
  universityName: string;
  faculty: string;
  purposeCategory: PurposeCategory;
  purposeDescription: string;
  amountRequestedPaisa: number;
  amountFundedPaisa: number;
  tenureDays: number;
  facilityFeeRateBps: number; // 600 = 6%
  lenderYieldRateBps: number;  // 400 = 4%
  status: LoanStatus;
  aafnoScore: number;
  scoreTier: 1 | 2 | 3 | 4;
  funders: LoanFunder[];
  agreementSigned: boolean;
  disbursedAt?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  idempotencyKey: string;
  loanId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amountPaisa: number;
  type: TransactionType;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  gatewayReference: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  loanId?: string;
  ruleCode: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  isResolved: boolean;
  createdAt: string;
}

// Standard API Contract Envelopes
export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
