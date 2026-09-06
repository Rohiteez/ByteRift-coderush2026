import { supabase, isSupabaseConfigured } from '../config/supabase';
import { 
  User, 
  KYCVerification, 
  StudentVerification, 
  CreditScore, 
  CreditScoreHistoryItem, 
  LoanRequest, 
  LoanFunder,
  Transaction, 
  FraudAlert,
  DocType,
  PurposeCategory
} from '../types';
import { calculateLoanBreakdown } from './currency';
import { getTierForScore } from './scoreEngine';

// Seed state for fallback or initial population
const SEED_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'aashish.sharma@ioe.edu.np',
    phone: '9841234567',
    fullName: 'Aashish Sharma',
    role: 'BORROWER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    walletBalancePaisa: 0,
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'rohan.adhikari@ku.edu.np',
    phone: '9851122334',
    fullName: 'Rohan Adhikari',
    role: 'BORROWER',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    walletBalancePaisa: 0,
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'sunita.thapa@gmail.com',
    phone: '9801987654',
    fullName: 'Sunita Thapa',
    role: 'LENDER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    walletBalancePaisa: 2500000, // NPR 25,000.00
    createdAt: '2026-07-10T14:30:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'admin.risk@aafnopay.com',
    phone: '9811002233',
    fullName: 'Bikash Shrestha',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    walletBalancePaisa: 0,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

class DatabaseService {
  // In-memory mirror cache used for zero-config fallback
  private memUsers: User[] = [...SEED_USERS];
  private memKyc: Record<string, KYCVerification> = {
    '00000000-0000-0000-0000-000000000001': {
      id: 'kyc-01',
      userId: '00000000-0000-0000-0000-000000000001',
      docType: 'CITIZENSHIP',
      docNumber: '27-01-78-04921',
      docNumberHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fullName: 'Aashish Sharma',
      dob: '2003-05-14',
      frontDocUrl: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Citizenship+Card+Front',
      backDocUrl: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Citizenship+Card+Back',
      selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      status: 'VERIFIED',
      verifiedAt: '2026-08-15T11:20:00Z',
      createdAt: '2026-08-15T10:15:00Z',
    }
  };
  private memStudents: Record<string, StudentVerification> = {
    '00000000-0000-0000-0000-000000000001': {
      id: 'stu-01',
      userId: '00000000-0000-0000-0000-000000000001',
      universityName: 'Tribhuvan University — IOE Pulchowk',
      studentIdNumber: '076BCT015',
      studentIdNumberHash: '1f8ac10f23c5b5bc1167bda84b833e5c057a77d2c1d94d4e503996f5d9e794b2',
      studentCardUrl: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Pulchowk+Campus+Card',
      faculty: 'Computer Engineering (B.E.)',
      enrollmentYear: 2021,
      expectedGraduationYear: 2025,
      verificationStatus: 'VERIFIED',
      academicClearanceStatus: 'CLEAR',
      verifiedAt: '2026-08-15T11:25:00Z',
    }
  };
  private memScores: Record<string, CreditScore> = {
    '00000000-0000-0000-0000-000000000001': {
      userId: '00000000-0000-0000-0000-000000000001',
      score: 68,
      tier: 2,
      maxLimitPaisa: 600000,
      lastCalculatedAt: '2026-08-20T12:00:00Z',
    },
    '00000000-0000-0000-0000-000000000002': {
      userId: '00000000-0000-0000-0000-000000000002',
      score: 0,
      tier: 1,
      maxLimitPaisa: 0,
      lastCalculatedAt: '2026-09-01T09:00:00Z',
    }
  };
  private memScoreHistory: CreditScoreHistoryItem[] = [
    {
      id: 'hist-01',
      userId: '00000000-0000-0000-0000-000000000001',
      delta: 30,
      previousScore: 0,
      newScore: 30,
      reason: 'Initial Identity & University Enrollment Verified',
      createdAt: '2026-08-15T11:30:00Z',
    },
    {
      id: 'hist-02',
      userId: '00000000-0000-0000-0000-000000000001',
      delta: 38,
      previousScore: 30,
      newScore: 68,
      reason: 'Successful early settlement of previous emergency loan',
      createdAt: '2026-08-18T16:00:00Z',
    }
  ];
  private memLoans: LoanRequest[] = [
    // 1. ACTIVE LOAN (For Aashish's borrower dashboard)
    {
      id: '11111111-1111-1111-1111-111111111111',
      borrowerId: '00000000-0000-0000-0000-000000000001',
      borrowerPseudonym: 'Student #4892',
      universityName: 'Tribhuvan University — IOE Pulchowk',
      faculty: 'Computer Engineering (B.E.)',
      purposeCategory: 'MEDICAL',
      purposeDescription: 'Emergency prescription medication and medical diagnosis after accidental injury',
      amountRequestedPaisa: 400000,
      amountFundedPaisa: 400000,
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'ACTIVE',
      aafnoScore: 68,
      scoreTier: 2,
      agreementSigned: true,
      disbursedAt: '2026-08-20T14:00:00Z',
      dueDate: '2026-09-19T14:00:00Z',
      funders: [
        {
          id: 'fnd-01',
          loanId: '11111111-1111-1111-1111-111111111111',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 400000,
          expectedReturnPaisa: 16000,
          fundedAt: '2026-08-20T12:30:00Z',
        }
      ],
      createdAt: '2026-08-20T11:00:00Z',
    },

    // 2. MEDICAL (Open with remaining capacity to fund)
    {
      id: '22222222-2222-2222-2222-222222222201',
      borrowerId: '00000000-0000-0000-0000-000000000002',
      borrowerPseudonym: 'Student #5120',
      universityName: 'Tribhuvan University — IOE Pulchowk',
      faculty: 'Computer Engineering (B.E.)',
      purposeCategory: 'MEDICAL',
      purposeDescription: 'Urgent diagnostic lab tests and prescription antibiotics after severe typhoid infection',
      amountRequestedPaisa: 350000,
      amountFundedPaisa: 150000, // NPR 2,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 71,
      scoreTier: 3,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-med-01',
          loanId: '22222222-2222-2222-2222-222222222201',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 150000,
          expectedReturnPaisa: 6000,
          fundedAt: '2026-09-03T11:00:00Z',
        }
      ],
      createdAt: '2026-09-03T09:00:00Z',
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      borrowerId: '00000000-0000-0000-0000-000000000002',
      borrowerPseudonym: 'Student #9042',
      universityName: 'Kathmandu Medical College',
      faculty: 'B.Sc. Nursing',
      purposeCategory: 'MEDICAL',
      purposeDescription: 'Emergency dental extraction & postoperative anti-inflammatory pain medication',
      amountRequestedPaisa: 250000,
      amountFundedPaisa: 50000, // NPR 2,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 65,
      scoreTier: 2,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-med-02',
          loanId: '22222222-2222-2222-2222-222222222202',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 50000,
          expectedReturnPaisa: 2000,
          fundedAt: '2026-09-04T08:00:00Z',
        }
      ],
      createdAt: '2026-09-04T06:30:00Z',
    },

    // 3. RENT (Open with remaining capacity to fund)
    {
      id: '22222222-2222-2222-2222-222222222222',
      borrowerId: '00000000-0000-0000-0000-000000000001',
      borrowerPseudonym: 'Student #3104',
      universityName: 'Kathmandu University — Dhulikhel',
      faculty: 'Computer Science (B.Sc.)',
      purposeCategory: 'RENT',
      purposeDescription: 'Urgent room rent shortfall before monthly allowance transfer',
      amountRequestedPaisa: 600000,
      amountFundedPaisa: 300000, // NPR 3,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 74,
      scoreTier: 3,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-02',
          loanId: '22222222-2222-2222-2222-222222222222',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 300000,
          expectedReturnPaisa: 12000,
          fundedAt: '2026-09-02T17:30:00Z',
        }
      ],
      createdAt: '2026-09-02T16:00:00Z',
    },
    {
      id: '22222222-2222-2222-2222-222222222203',
      borrowerId: '00000000-0000-0000-0000-000000000002',
      borrowerPseudonym: 'Student #2189',
      universityName: 'Tribhuvan University — IOE Pulchowk',
      faculty: 'Civil Engineering (B.E.)',
      purposeCategory: 'RENT',
      purposeDescription: 'Semester hostel advance deposit shortfall before campus deadline',
      amountRequestedPaisa: 500000,
      amountFundedPaisa: 200000, // NPR 3,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 70,
      scoreTier: 2,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-rent-02',
          loanId: '22222222-2222-2222-2222-222222222203',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 200000,
          expectedReturnPaisa: 8000,
          fundedAt: '2026-09-03T15:00:00Z',
        }
      ],
      createdAt: '2026-09-03T12:00:00Z',
    },

    // 4. EDUCATION (Open with remaining capacity to fund)
    {
      id: '22222222-2222-2222-2222-222222222204',
      borrowerId: '00000000-0000-0000-0000-000000000002',
      borrowerPseudonym: 'Student #7819',
      universityName: 'Pokhara University',
      faculty: 'Business Administration (BBA)',
      purposeCategory: 'EDUCATION',
      purposeDescription: 'Semester board exam clearance fee deadline',
      amountRequestedPaisa: 400000,
      amountFundedPaisa: 100000, // NPR 3,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 58,
      scoreTier: 2,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-edu-01',
          loanId: '22222222-2222-2222-2222-222222222204',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 100000,
          expectedReturnPaisa: 4000,
          fundedAt: '2026-09-03T18:00:00Z',
        }
      ],
      createdAt: '2026-09-03T07:15:00Z',
    },
    {
      id: '22222222-2222-2222-2222-222222222205',
      borrowerId: '00000000-0000-0000-0000-000000000001',
      borrowerPseudonym: 'Student #6340',
      universityName: 'Tribhuvan University — IOE Pulchowk',
      faculty: 'Electrical Engineering (B.E.)',
      purposeCategory: 'EDUCATION',
      purposeDescription: 'Microcontroller hardware kit and semester lab manual printing fee',
      amountRequestedPaisa: 350000,
      amountFundedPaisa: 100000, // NPR 2,500 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 72,
      scoreTier: 3,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-edu-02',
          loanId: '22222222-2222-2222-2222-222222222205',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 100000,
          expectedReturnPaisa: 4000,
          fundedAt: '2026-09-04T07:00:00Z',
        }
      ],
      createdAt: '2026-09-04T05:00:00Z',
    },

    // 5. FOOD (Open with remaining capacity to fund)
    {
      id: '22222222-2222-2222-2222-222222222206',
      borrowerId: '00000000-0000-0000-0000-000000000001',
      borrowerPseudonym: 'Student #1522',
      universityName: 'Kathmandu University — Dhulikhel',
      faculty: 'Mechanical Engineering (B.E.)',
      purposeCategory: 'FOOD',
      purposeDescription: 'Campus cafeteria mess card monthly recharge before family allowance release',
      amountRequestedPaisa: 300000,
      amountFundedPaisa: 100000, // NPR 2,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 69,
      scoreTier: 2,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-food-01',
          loanId: '22222222-2222-2222-2222-222222222206',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 100000,
          expectedReturnPaisa: 4000,
          fundedAt: '2026-09-04T09:00:00Z',
        }
      ],
      createdAt: '2026-09-04T07:00:00Z',
    },
    {
      id: '22222222-2222-2222-2222-222222222207',
      borrowerId: '00000000-0000-0000-0000-000000000002',
      borrowerPseudonym: 'Student #8431',
      universityName: 'Pokhara University',
      faculty: 'Computer Application (BCA)',
      purposeCategory: 'FOOD',
      purposeDescription: 'Emergency grocery provisions and subsistence essentials during exam preparation',
      amountRequestedPaisa: 250000,
      amountFundedPaisa: 50000, // NPR 2,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 63,
      scoreTier: 2,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-food-02',
          loanId: '22222222-2222-2222-2222-222222222207',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 50000,
          expectedReturnPaisa: 2000,
          fundedAt: '2026-09-04T10:00:00Z',
        }
      ],
      createdAt: '2026-09-04T08:15:00Z',
    },

    // 6. UTILITIES (Open with remaining capacity to fund)
    {
      id: '22222222-2222-2222-2222-222222222208',
      borrowerId: '00000000-0000-0000-0000-000000000001',
      borrowerPseudonym: 'Student #3908',
      universityName: 'Tribhuvan University — IOE Pulchowk',
      faculty: 'Electronics & Information Engineering',
      purposeCategory: 'UTILITIES',
      purposeDescription: 'Hostel high-speed fiber internet quarterly subscription for final year AI project research',
      amountRequestedPaisa: 200000,
      amountFundedPaisa: 50000, // NPR 1,500 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 76,
      scoreTier: 3,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-util-01',
          loanId: '22222222-2222-2222-2222-222222222208',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 50000,
          expectedReturnPaisa: 2000,
          fundedAt: '2026-09-04T11:00:00Z',
        }
      ],
      createdAt: '2026-09-04T09:30:00Z',
    },
    {
      id: '22222222-2222-2222-2222-222222222209',
      borrowerId: '00000000-0000-0000-0000-000000000002',
      borrowerPseudonym: 'Student #7741',
      universityName: 'Nepal Engineering College',
      faculty: 'Architecture',
      purposeCategory: 'UTILITIES',
      purposeDescription: 'Shared student apartment electricity meter recharge & emergency water tanker contribution',
      amountRequestedPaisa: 280000,
      amountFundedPaisa: 80000, // NPR 2,000 remaining to fund!
      tenureDays: 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'PARTIALLY_FUNDED',
      aafnoScore: 64,
      scoreTier: 2,
      agreementSigned: false,
      funders: [
        {
          id: 'fnd-util-02',
          loanId: '22222222-2222-2222-2222-222222222209',
          lenderId: '00000000-0000-0000-0000-000000000003',
          lenderName: 'Sunita Thapa',
          amountFundedPaisa: 80000,
          expectedReturnPaisa: 3200,
          fundedAt: '2026-09-04T12:00:00Z',
        }
      ],
      createdAt: '2026-09-04T10:45:00Z',
    },
  ];

  private memTransactions: Transaction[] = [
    {
      id: 'tx-disb-01',
      idempotencyKey: 'idem-disb-seed-01',
      loanId: '11111111-1111-1111-1111-111111111111',
      senderId: '00000000-0000-0000-0000-000000000003',
      senderName: 'Sunita Thapa (Lender)',
      receiverId: '00000000-0000-0000-0000-000000000001',
      receiverName: 'Student #4892 (Borrower)',
      amountPaisa: 400000,
      type: 'DISBURSEMENT',
      status: 'SUCCESS',
      gatewayReference: 'AFN-DISB-749210',
      createdAt: '2026-08-20T14:00:00Z',
    }
  ];
  private memFraudAlerts: FraudAlert[] = [
    {
      id: 'frd-01',
      userId: '00000000-0000-0000-0000-000000000002',
      userName: 'Rohan Adhikari',
      ruleCode: 'RULE_RAPID_VELOCITY_CHECK',
      severity: 'LOW',
      description: 'Multiple wallet query attempts from new device subnet within 60 seconds.',
      isResolved: false,
      createdAt: '2026-09-03T10:15:00Z',
    }
  ];

  // --------------------------------------------------------------------------
  // USER METHODS
  // --------------------------------------------------------------------------
  public async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data || []).map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        fullName: u.full_name,
        role: u.role,
        avatarUrl: u.avatar_url,
        walletBalancePaisa: Number(u.wallet_balance_paisa || 0),
        createdAt: u.created_at,
      }));
    }
    return [...this.memUsers];
  }

  public async getUserById(userId: string): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error || !data) return null;
      return {
        id: data.id,
        email: data.email,
        phone: data.phone,
        fullName: data.full_name,
        role: data.role,
        avatarUrl: data.avatar_url,
        walletBalancePaisa: Number(data.wallet_balance_paisa || 0),
        createdAt: data.created_at,
      };
    }
    return this.memUsers.find(u => u.id === userId || u.email === userId) || null;
  }

  public async createUser(userData: {
    fullName: string;
    email: string;
    phone: string;
    role: User['role'];
  }): Promise<User> {
    const newUser: User = {
      id: (isSupabaseConfigured() && supabase) ? undefined as any : `usr-${Date.now()}`,
      email: userData.email,
      phone: userData.phone,
      fullName: userData.fullName,
      role: userData.role,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      walletBalancePaisa: userData.role === 'LENDER' ? 2500000 : 0,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          phone: userData.phone,
          full_name: userData.fullName,
          role: userData.role,
          avatar_url: newUser.avatarUrl,
          wallet_balance_paisa: newUser.walletBalancePaisa,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return {
        id: data.id,
        email: data.email,
        phone: data.phone,
        fullName: data.full_name,
        role: data.role,
        avatarUrl: data.avatar_url,
        walletBalancePaisa: Number(data.wallet_balance_paisa),
        createdAt: data.created_at,
      };
    }

    this.memUsers.push(newUser);
    return newUser;
  }

  // --------------------------------------------------------------------------
  // KYC & STUDENT METHODS
  // --------------------------------------------------------------------------
  public async getKyc(userId: string): Promise<KYCVerification | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('kyc_verifications').select('*').eq('user_id', userId).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        docType: data.doc_type,
        docNumber: data.doc_number,
        docNumberHash: data.doc_number_hash,
        fullName: data.full_name,
        dob: data.dob,
        frontDocUrl: data.front_doc_url,
        backDocUrl: data.back_doc_url,
        selfieUrl: data.selfie_url,
        status: data.status,
        rejectionReason: data.rejection_reason,
        verifiedAt: data.verified_at,
        createdAt: data.created_at,
      };
    }
    return this.memKyc[userId] || null;
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
    const docHash = `sha256_${data.docType.toLowerCase()}_${data.docNumber.trim().replace(/[^a-zA-Z0-9]/g, '')}`;

    if (isSupabaseConfigured() && supabase) {
      // Check collision
      const { data: collision } = await supabase
        .from('kyc_verifications')
        .select('user_id')
        .eq('doc_number_hash', docHash)
        .neq('user_id', userId)
        .maybeSingle();

      if (collision) {
        await this.logFraudAlert({
          userId,
          userName: data.fullName,
          ruleCode: 'RULE_SYBIL_DUPLICATE_NATIONAL_ID',
          severity: 'CRITICAL',
          description: `Blocked registration attempt. National ID hash already belongs to active account ${collision.user_id}.`,
        });
        throw new Error('DUPLICATE_IDENTITY: This national identity card is already bonded to an existing account.');
      }

      const { data: record, error } = await supabase
        .from('kyc_verifications')
        .upsert({
          user_id: userId,
          doc_type: data.docType,
          doc_number: data.docNumber,
          doc_number_hash: docHash,
          full_name: data.fullName,
          dob: data.dob,
          front_doc_url: data.frontDocUrl,
          back_doc_url: data.backDocUrl,
          selfie_url: data.selfieUrl,
          status: 'VERIFIED',
          verified_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: record.id,
        userId: record.user_id,
        docType: record.doc_type,
        docNumber: record.doc_number,
        docNumberHash: record.doc_number_hash,
        fullName: record.full_name,
        dob: record.dob,
        frontDocUrl: record.front_doc_url,
        backDocUrl: record.back_doc_url,
        selfieUrl: record.selfie_url,
        status: record.status,
        verifiedAt: record.verified_at,
        createdAt: record.created_at,
      };
    }

    // Fallback in-memory
    const existing = Object.values(this.memKyc).find(
      k => k.docNumberHash === docHash && k.userId !== userId
    );
    if (existing) {
      await this.logFraudAlert({
        userId,
        userName: data.fullName,
        ruleCode: 'RULE_SYBIL_DUPLICATE_NATIONAL_ID',
        severity: 'CRITICAL',
        description: `Blocked registration attempt. National ID hash already belongs to active account ${existing.userId}.`,
      });
      throw new Error('DUPLICATE_IDENTITY: This national identity card is already bonded to an existing account.');
    }

    const newKyc: KYCVerification = {
      id: `kyc-${Date.now()}`,
      userId,
      docType: data.docType,
      docNumber: data.docNumber,
      docNumberHash: docHash,
      fullName: data.fullName,
      dob: data.dob,
      frontDocUrl: data.frontDocUrl,
      backDocUrl: data.backDocUrl,
      selfieUrl: data.selfieUrl,
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.memKyc[userId] = newKyc;
    return newKyc;
  }

  public async getStudentVerification(userId: string): Promise<StudentVerification | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('student_verifications').select('*').eq('user_id', userId).maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        universityName: data.university_name,
        studentIdNumber: data.student_id_number,
        studentIdNumberHash: data.student_id_number_hash,
        studentCardUrl: data.student_card_url,
        faculty: data.faculty,
        enrollmentYear: data.enrollment_year,
        expectedGraduationYear: data.expected_graduation_year,
        verificationStatus: data.verification_status,
        academicClearanceStatus: data.academic_clearance_status,
        verifiedAt: data.verified_at,
      };
    }
    return this.memStudents[userId] || null;
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
    const studentHash = `sha256_student_${data.studentIdNumber.trim().toLowerCase()}`;

    if (isSupabaseConfigured() && supabase) {
      const { data: collision } = await supabase
        .from('student_verifications')
        .select('user_id')
        .eq('student_id_number_hash', studentHash)
        .neq('user_id', userId)
        .maybeSingle();

      if (collision) {
        throw new Error('DUPLICATE_STUDENT_ID: This student registration number is already verified under another account.');
      }

      const { data: studentRecord, error: stuErr } = await supabase
        .from('student_verifications')
        .upsert({
          user_id: userId,
          university_name: data.universityName,
          student_id_number: data.studentIdNumber,
          student_id_number_hash: studentHash,
          student_card_url: data.studentCardUrl,
          faculty: data.faculty,
          enrollment_year: data.enrollmentYear,
          expected_graduation_year: data.expectedGraduationYear,
          verification_status: 'VERIFIED',
          academic_clearance_status: 'CLEAR',
          verified_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (stuErr) throw new Error(stuErr.message);

      // Unlock initial score 30 points
      const { data: scoreRecord, error: scoreErr } = await supabase
        .from('credit_scores')
        .upsert({
          user_id: userId,
          score: 30,
          tier: 1,
          max_limit_paisa: 400000,
          last_calculated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (scoreErr) throw new Error(scoreErr.message);

      await supabase.from('credit_score_history').insert({
        user_id: userId,
        delta: 30,
        previous_score: 0,
        new_score: 30,
        reason: 'Identity and Student Academic Status Verified (+30 pts)',
      });

      return {
        student: {
          id: studentRecord.id,
          userId: studentRecord.user_id,
          universityName: studentRecord.university_name,
          studentIdNumber: studentRecord.student_id_number,
          studentIdNumberHash: studentRecord.student_id_number_hash,
          studentCardUrl: studentRecord.student_card_url,
          faculty: studentRecord.faculty,
          enrollmentYear: studentRecord.enrollment_year,
          expectedGraduationYear: studentRecord.expected_graduation_year,
          verificationStatus: studentRecord.verification_status,
          academicClearanceStatus: studentRecord.academic_clearance_status,
          verifiedAt: studentRecord.verified_at,
        },
        score: {
          userId: scoreRecord.user_id,
          score: scoreRecord.score,
          tier: scoreRecord.tier,
          maxLimitPaisa: Number(scoreRecord.max_limit_paisa),
          lastCalculatedAt: scoreRecord.last_calculated_at,
        },
      };
    }

    // In-memory fallback
    const collision = Object.values(this.memStudents).find(
      s => s.studentIdNumberHash === studentHash && s.userId !== userId
    );
    if (collision) {
      throw new Error('DUPLICATE_STUDENT_ID: This student registration number is already verified under another account.');
    }

    const student: StudentVerification = {
      id: `stu-${Date.now()}`,
      userId,
      universityName: data.universityName,
      studentIdNumber: data.studentIdNumber,
      studentIdNumberHash: studentHash,
      studentCardUrl: data.studentCardUrl,
      faculty: data.faculty,
      enrollmentYear: data.enrollmentYear,
      expectedGraduationYear: data.expectedGraduationYear,
      verificationStatus: 'VERIFIED',
      academicClearanceStatus: 'CLEAR',
      verifiedAt: new Date().toISOString(),
    };
    this.memStudents[userId] = student;

    const initialScore: CreditScore = {
      userId,
      score: 30,
      tier: 1,
      maxLimitPaisa: 400000,
      lastCalculatedAt: new Date().toISOString(),
    };
    this.memScores[userId] = initialScore;

    this.memScoreHistory.unshift({
      id: `hist-${Date.now()}`,
      userId,
      delta: 30,
      previousScore: 0,
      newScore: 30,
      reason: 'Identity and Student Academic Status Verified (+30 pts)',
      createdAt: new Date().toISOString(),
    });

    return { student, score: initialScore };
  }

  // --------------------------------------------------------------------------
  // CREDIT SCORES
  // --------------------------------------------------------------------------
  public async getCreditScore(userId: string): Promise<CreditScore> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('credit_scores').select('*').eq('user_id', userId).maybeSingle();
      if (data) {
        return {
          userId: data.user_id,
          score: data.score,
          tier: data.tier,
          maxLimitPaisa: Number(data.max_limit_paisa),
          lastCalculatedAt: data.last_calculated_at,
        };
      }
    }
    return this.memScores[userId] || {
      userId,
      score: 0,
      tier: 1,
      maxLimitPaisa: 0,
      lastCalculatedAt: new Date().toISOString(),
    };
  }

  public async getCreditHistory(userId: string): Promise<CreditScoreHistoryItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('credit_score_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return (data || []).map(h => ({
        id: h.id,
        userId: h.user_id,
        delta: h.delta,
        previousScore: h.previous_score,
        newScore: h.new_score,
        reason: h.reason,
        createdAt: h.created_at,
      }));
    }
    return this.memScoreHistory.filter(h => h.userId === userId);
  }

  // --------------------------------------------------------------------------
  // LOANS & P2P MARKETPLACE
  // --------------------------------------------------------------------------
  public async getLoans(filters?: { borrowerId?: string; status?: string }): Promise<LoanRequest[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('loan_requests').select('*, loan_funders(*)').order('created_at', { ascending: false });
      if (filters?.borrowerId) query = query.eq('borrower_id', filters.borrowerId);
      if (filters?.status) query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      if (data && data.length > 0) {
        return data.map(l => ({
          id: l.id,
          borrowerId: l.borrower_id,
          borrowerPseudonym: l.borrower_pseudonym,
          universityName: l.university_name,
          faculty: l.faculty,
          purposeCategory: l.purpose_category,
          purposeDescription: l.purpose_description,
          amountRequestedPaisa: Number(l.amount_requested_paisa),
          amountFundedPaisa: Number(l.amount_funded_paisa),
          tenureDays: l.tenure_days,
          facilityFeeRateBps: l.facility_fee_rate_bps,
          lenderYieldRateBps: l.lender_yield_rate_bps,
          status: l.status,
          aafnoScore: l.aafno_score,
          scoreTier: l.score_tier,
          funders: (l.loan_funders || []).map((f: any) => ({
            id: f.id,
            loanId: f.loan_id,
            lenderId: f.lender_id,
            lenderName: 'Peer Lender',
            amountFundedPaisa: Number(f.amount_funded_paisa),
            expectedReturnPaisa: Number(f.expected_return_paisa),
            fundedAt: f.funded_at,
          })),
          agreementSigned: l.agreement_signed,
          disbursedAt: l.disbursed_at,
          dueDate: l.due_date,
          completedAt: l.completed_at,
          createdAt: l.created_at,
        }));
      }
    }

    let result = [...this.memLoans];
    if (filters?.borrowerId) result = result.filter(l => l.borrowerId === filters.borrowerId);
    if (filters?.status) result = result.filter(l => l.status === filters.status);
    return result;
  }

  public async getLoanById(id: string): Promise<LoanRequest | null> {
    const loans = await this.getLoans();
    return loans.find(l => l.id === id) || null;
  }

  public async requestLoan(
    borrowerId: string,
    data: {
      purposeCategory: PurposeCategory;
      purposeDescription: string;
      amountRequestedPaisa: number;
      tenureDays?: number;
    }
  ): Promise<LoanRequest> {
    const kyc = await this.getKyc(borrowerId);
    if (!kyc || kyc.status !== 'VERIFIED') {
      throw new Error('KYC_REQUIRED: You must complete identity verification before requesting an emergency loan.');
    }

    const student = await this.getStudentVerification(borrowerId);
    if (!student || student.verificationStatus !== 'VERIFIED') {
      throw new Error('STUDENT_VERIFICATION_REQUIRED: Active university enrollment verification is required.');
    }

    const existingLoans = await this.getLoans({ borrowerId });
    const hasActive = existingLoans.some(l => 
      ['REQUESTED', 'MATCHING', 'PARTIALLY_FUNDED', 'FUNDED', 'AGREEMENT_PENDING', 'ACTIVE'].includes(l.status)
    );
    if (hasActive) {
      throw new Error('ACTIVE_LOAN_EXISTS: You currently have an active or pending loan. Platform policy limits students to 1 active loan.');
    }

    const creditScore = await this.getCreditScore(borrowerId);
    if (data.amountRequestedPaisa > creditScore.maxLimitPaisa) {
      throw new Error(`LIMIT_EXCEEDED: Requested amount exceeds your current maximum borrowing limit of NPR ${(creditScore.maxLimitPaisa / 100).toLocaleString()}.`);
    }

    const pseudonym = `Student #${Math.floor(1000 + Math.random() * 9000)}`;

    if (isSupabaseConfigured() && supabase) {
      const { data: record, error } = await supabase
        .from('loan_requests')
        .insert({
          borrower_id: borrowerId,
          borrower_pseudonym: pseudonym,
          university_name: student.universityName,
          faculty: student.faculty,
          purpose_category: data.purposeCategory,
          purpose_description: data.purposeDescription,
          amount_requested_paisa: data.amountRequestedPaisa,
          amount_funded_paisa: 0,
          tenure_days: data.tenureDays || 30,
          facility_fee_rate_bps: 600,
          lender_yield_rate_bps: 400,
          status: 'MATCHING',
          aafno_score: creditScore.score,
          score_tier: creditScore.tier,
          agreement_signed: false,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);

      return {
        id: record.id,
        borrowerId: record.borrower_id,
        borrowerPseudonym: record.borrower_pseudonym,
        universityName: record.university_name,
        faculty: record.faculty,
        purposeCategory: record.purpose_category,
        purposeDescription: record.purpose_description,
        amountRequestedPaisa: Number(record.amount_requested_paisa),
        amountFundedPaisa: 0,
        tenureDays: record.tenure_days,
        facilityFeeRateBps: record.facility_fee_rate_bps,
        lenderYieldRateBps: record.lender_yield_rate_bps,
        status: record.status,
        aafnoScore: record.aafno_score,
        scoreTier: record.score_tier,
        funders: [],
        agreementSigned: false,
        createdAt: record.created_at,
      };
    }

    const newLoan: LoanRequest = {
      id: `loan-${Date.now()}`,
      borrowerId,
      borrowerPseudonym: pseudonym,
      universityName: student.universityName,
      faculty: student.faculty,
      purposeCategory: data.purposeCategory,
      purposeDescription: data.purposeDescription,
      amountRequestedPaisa: data.amountRequestedPaisa,
      amountFundedPaisa: 0,
      tenureDays: data.tenureDays || 30,
      facilityFeeRateBps: 600,
      lenderYieldRateBps: 400,
      status: 'MATCHING',
      aafnoScore: creditScore.score,
      scoreTier: creditScore.tier,
      funders: [],
      agreementSigned: false,
      createdAt: new Date().toISOString(),
    };
    this.memLoans.unshift(newLoan);
    return newLoan;
  }

  // Atomic Peer Funding
  public async fundLoan(
    loanId: string,
    lenderId: string,
    amountToFundPaisa: number
  ): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      // Call atomic RPC function defined in schema.sql
      const { data, error } = await supabase.rpc('fund_loan_atomic', {
        p_loan_id: loanId,
        p_lender_id: lenderId,
        p_amount_paisa: amountToFundPaisa,
      });
      if (error) throw new Error(error.message);
      return data;
    }

    // In-memory fallback
    const loan = this.memLoans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    if (!['MATCHING', 'PARTIALLY_FUNDED'].includes(loan.status)) {
      throw new Error(`LOAN_NOT_FUNDABLE: This loan is currently in '${loan.status}' state and is no longer accepting funds.`);
    }

    const remainingPaisa = loan.amountRequestedPaisa - loan.amountFundedPaisa;
    if (amountToFundPaisa > remainingPaisa) {
      throw new Error(`RACE_CONDITION_PREVENTED: Only NPR ${(remainingPaisa / 100).toLocaleString()} remaining. You requested NPR ${(amountToFundPaisa / 100).toLocaleString()}.`);
    }

    const lender = this.memUsers.find(u => u.id === lenderId);
    const balance = lender?.walletBalancePaisa || 0;
    if (balance < amountToFundPaisa) {
      throw new Error(`INSUFFICIENT_BALANCE: Wallet balance NPR ${(balance / 100).toLocaleString()} is less than the funding amount.`);
    }

    if (lender) lender.walletBalancePaisa = balance - amountToFundPaisa;

    const breakdown = calculateLoanBreakdown(amountToFundPaisa);
    loan.funders.push({
      id: `fnd-${Date.now()}`,
      loanId,
      lenderId,
      lenderName: lender?.fullName || 'Peer Lender',
      amountFundedPaisa: amountToFundPaisa,
      expectedReturnPaisa: breakdown.lenderYieldPaisa,
      fundedAt: new Date().toISOString(),
    });

    loan.amountFundedPaisa += amountToFundPaisa;

    if (loan.amountFundedPaisa >= loan.amountRequestedPaisa) {
      loan.status = 'ACTIVE';
      loan.agreementSigned = true;
      loan.disbursedAt = new Date().toISOString();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loan.tenureDays);
      loan.dueDate = dueDate.toISOString();

      this.memTransactions.unshift({
        id: `tx-disb-${Date.now()}`,
        idempotencyKey: `idem-disb-${loan.id}-${Date.now()}`,
        loanId: loan.id,
        senderId: lenderId,
        senderName: lender?.fullName || 'Lender Network',
        receiverId: loan.borrowerId,
        receiverName: loan.borrowerPseudonym,
        amountPaisa: loan.amountRequestedPaisa,
        type: 'DISBURSEMENT',
        status: 'SUCCESS',
        gatewayReference: `AFN-DISB-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
      });
    } else {
      loan.status = 'PARTIALLY_FUNDED';
    }

    return loan;
  }

  // Atomic Loan Repayment & Score Ladder
  public async repayLoan(
    loanId: string,
    borrowerId: string,
    idempotencyKey: string
  ): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.rpc('repay_loan_atomic', {
        p_loan_id: loanId,
        p_borrower_id: borrowerId,
        p_idempotency_key: idempotencyKey,
      });
      if (error) throw new Error(error.message);
      return data;
    }

    // In-memory fallback
    const existingTx = this.memTransactions.find(t => t.idempotencyKey === idempotencyKey);
    if (existingTx) {
      const loan = this.memLoans.find(l => l.id === loanId)!;
      const score = await this.getCreditScore(borrowerId);
      return { loan, newScore: score };
    }

    const loan = this.memLoans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    if (loan.borrowerId !== borrowerId) throw new Error('UNAUTHORIZED: You do not own this loan');
    if (loan.status !== 'ACTIVE') throw new Error(`INVALID_STATE: Loan is currently in state '${loan.status}'`);

    const breakdown = calculateLoanBreakdown(loan.amountRequestedPaisa);
    loan.status = 'COMPLETED';
    loan.completedAt = new Date().toISOString();

    loan.funders.forEach(f => {
      const lender = this.memUsers.find(u => u.id === f.lenderId);
      if (lender) {
        lender.walletBalancePaisa = (lender.walletBalancePaisa || 0) + f.amountFundedPaisa + f.expectedReturnPaisa;
      }
    });

    this.memTransactions.unshift({
      id: `tx-repay-${Date.now()}`,
      idempotencyKey,
      loanId: loan.id,
      senderId: borrowerId,
      senderName: 'Verified Student (Borrower)',
      receiverId: 'aafno-ledger-escrow',
      receiverName: 'Aafno Settlement Escrow',
      amountPaisa: breakdown.totalRepaymentPaisa,
      type: 'REPAYMENT',
      status: 'SUCCESS',
      gatewayReference: `AFN-SETTLE-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    });

    const currentScoreRec = await this.getCreditScore(borrowerId);
    const prevScore = currentScoreRec.score;
    const newScoreValue = Math.min(100, prevScore + 10);
    const newTierInfo = getTierForScore(newScoreValue);

    const updatedScore: CreditScore = {
      userId: borrowerId,
      score: newScoreValue,
      tier: newTierInfo.tier,
      maxLimitPaisa: newTierInfo.maxLimitPaisa,
      lastCalculatedAt: new Date().toISOString(),
    };
    this.memScores[borrowerId] = updatedScore;

    this.memScoreHistory.unshift({
      id: `hist-${Date.now()}`,
      userId: borrowerId,
      delta: 10,
      previousScore: prevScore,
      newScore: newScoreValue,
      reason: `On-time full repayment of loan #${loan.id.slice(0, 8)} (+10 pts)`,
      createdAt: new Date().toISOString(),
    });

    return { loan, newScore: updatedScore };
  }

  // --------------------------------------------------------------------------
  // LEDGER TRANSACTIONS & FRAUD ALERTS
  // --------------------------------------------------------------------------
  public async getTransactions(): Promise<Transaction[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      return (data || []).map(t => ({
        id: t.id,
        idempotencyKey: t.idempotency_key,
        loanId: t.loan_id,
        senderId: t.sender_id,
        senderName: t.sender_name,
        receiverId: t.receiver_id,
        receiverName: t.receiver_name,
        amountPaisa: Number(t.amount_paisa),
        type: t.type,
        status: t.status,
        gatewayReference: t.gateway_reference,
        createdAt: t.created_at,
      }));
    }
    return [...this.memTransactions];
  }

  public async getFraudAlerts(): Promise<FraudAlert[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('fraud_alerts').select('*').order('created_at', { ascending: false });
      return (data || []).map(f => ({
        id: f.id,
        userId: f.user_id,
        userName: f.user_name,
        loanId: f.loan_id,
        ruleCode: f.rule_code,
        severity: f.severity,
        description: f.description,
        isResolved: f.is_resolved,
        createdAt: f.created_at,
      }));
    }
    return [...this.memFraudAlerts];
  }

  public async logFraudAlert(alert: {
    userId: string;
    userName: string;
    loanId?: string;
    ruleCode: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
  }): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('fraud_alerts').insert({
        user_id: alert.userId,
        user_name: alert.userName,
        loan_id: alert.loanId,
        rule_code: alert.ruleCode,
        severity: alert.severity,
        description: alert.description,
        is_resolved: false,
      });
      return;
    }
    this.memFraudAlerts.unshift({
      id: `frd-${Date.now()}`,
      userId: alert.userId,
      userName: alert.userName,
      loanId: alert.loanId,
      ruleCode: alert.ruleCode,
      severity: alert.severity,
      description: alert.description,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }
}

export const dbService = new DatabaseService();
