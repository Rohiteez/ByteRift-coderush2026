// Seed data for hackathon demo personas and marketplace

import { User, KYCVerification, StudentVerification, CreditScore, LoanRequest, Transaction, FraudAlert } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-borrower-1',
    email: 'aashish.sharma@ioe.edu.np',
    phone: '9841234567',
    fullName: 'Aashish Sharma',
    role: 'BORROWER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'usr-new-student',
    email: 'rohan.adhikari@ku.edu.np',
    phone: '9851122334',
    fullName: 'Rohan Adhikari',
    role: 'BORROWER',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'usr-lender-1',
    email: 'sunita.thapa@gmail.com',
    phone: '9801987654',
    fullName: 'Sunita Thapa',
    role: 'LENDER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-10T14:30:00Z',
  },
  {
    id: 'usr-admin-1',
    email: 'admin.risk@aafnopay.com',
    phone: '9811002233',
    fullName: 'Bikash Shrestha',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_KYC: Record<string, KYCVerification> = {
  'usr-borrower-1': {
    id: 'kyc-01',
    userId: 'usr-borrower-1',
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
  },
};

export const INITIAL_STUDENT_VERIFICATIONS: Record<string, StudentVerification> = {
  'usr-borrower-1': {
    id: 'stu-01',
    userId: 'usr-borrower-1',
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
  },
};

export const INITIAL_CREDIT_SCORES: Record<string, CreditScore> = {
  'usr-borrower-1': {
    userId: 'usr-borrower-1',
    score: 68,
    tier: 2,
    maxLimitPaisa: 600000, // NPR 6,000.00
    lastCalculatedAt: '2026-08-20T12:00:00Z',
  },
  'usr-new-student': {
    userId: 'usr-new-student',
    score: 0,
    tier: 1,
    maxLimitPaisa: 0, // Unverified: 0 until KYC approved
    lastCalculatedAt: '2026-09-01T09:00:00Z',
  },
};

export const INITIAL_LOANS: LoanRequest[] = [
  // 1. ACTIVE LOAN (For Aashish's active borrower dashboard)
  {
    id: 'loan-active-01',
    borrowerId: 'usr-borrower-1',
    borrowerPseudonym: 'Student #4892',
    universityName: 'Tribhuvan University — IOE Pulchowk',
    faculty: 'Computer Engineering (B.E.)',
    purposeCategory: 'MEDICAL',
    purposeDescription: 'Emergency prescription medication and medical diagnosis after accidental injury',
    amountRequestedPaisa: 400000, // NPR 4,000
    amountFundedPaisa: 400000,    // Fully funded
    tenureDays: 30,
    facilityFeeRateBps: 600,      // 6.00%
    lenderYieldRateBps: 400,       // 4.00%
    status: 'ACTIVE',
    aafnoScore: 68,
    scoreTier: 2,
    agreementSigned: true,
    disbursedAt: '2026-08-20T14:00:00Z',
    dueDate: '2026-09-19T14:00:00Z',
    funders: [
      {
        id: 'fnd-01',
        loanId: 'loan-active-01',
        lenderId: 'usr-lender-1',
        lenderName: 'Sunita Thapa',
        amountFundedPaisa: 400000,
        expectedReturnPaisa: 16000, // NPR 160 (4%)
        fundedAt: '2026-08-20T12:30:00Z',
      },
    ],
    createdAt: '2026-08-20T11:00:00Z',
  },

  // 2. MEDICAL (Open requests with remaining capacity)
  {
    id: 'loan-mkt-med-01',
    borrowerId: 'usr-stub-med-1',
    borrowerPseudonym: 'Student #5120',
    universityName: 'Tribhuvan University — IOE Pulchowk',
    faculty: 'Computer Engineering (B.E.)',
    purposeCategory: 'MEDICAL',
    purposeDescription: 'Urgent diagnostic lab tests and prescription antibiotics after severe typhoid infection',
    amountRequestedPaisa: 350000, // NPR 3,500
    amountFundedPaisa: 150000,    // NPR 1,500 funded -> NPR 2,000 remaining!
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
        loanId: 'loan-mkt-med-01',
        lenderId: 'usr-stub-lender-2',
        lenderName: 'Ramesh Adhikari',
        amountFundedPaisa: 150000,
        expectedReturnPaisa: 6000,
        fundedAt: '2026-09-03T11:00:00Z',
      },
    ],
    createdAt: '2026-09-03T09:00:00Z',
  },
  {
    id: 'loan-mkt-med-02',
    borrowerId: 'usr-stub-med-2',
    borrowerPseudonym: 'Student #9042',
    universityName: 'Kathmandu Medical College',
    faculty: 'B.Sc. Nursing',
    purposeCategory: 'MEDICAL',
    purposeDescription: 'Emergency dental extraction & postoperative anti-inflammatory pain medication',
    amountRequestedPaisa: 250000, // NPR 2,500
    amountFundedPaisa: 50000,     // NPR 500 funded -> NPR 2,000 remaining!
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
        loanId: 'loan-mkt-med-02',
        lenderId: 'usr-lender-1',
        lenderName: 'Sunita Thapa',
        amountFundedPaisa: 50000,
        expectedReturnPaisa: 2000,
        fundedAt: '2026-09-04T08:00:00Z',
      },
    ],
    createdAt: '2026-09-04T06:30:00Z',
  },

  // 3. RENT (Open requests with remaining capacity)
  {
    id: 'loan-mkt-02',
    borrowerId: 'usr-stub-2',
    borrowerPseudonym: 'Student #3104',
    universityName: 'Kathmandu University — Dhulikhel',
    faculty: 'Computer Science (B.Sc.)',
    purposeCategory: 'RENT',
    purposeDescription: 'Urgent room rent shortfall before monthly allowance transfer',
    amountRequestedPaisa: 600000, // NPR 6,000
    amountFundedPaisa: 300000,    // NPR 3,000 funded -> NPR 3,000 remaining!
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
        loanId: 'loan-mkt-02',
        lenderId: 'usr-stub-lender',
        lenderName: 'Prashant K.',
        amountFundedPaisa: 300000,
        expectedReturnPaisa: 12000,
        fundedAt: '2026-09-02T10:00:00Z',
      },
    ],
    createdAt: '2026-09-02T08:00:00Z',
  },
  {
    id: 'loan-mkt-rent-02',
    borrowerId: 'usr-stub-rent-2',
    borrowerPseudonym: 'Student #2189',
    universityName: 'Tribhuvan University — IOE Pulchowk',
    faculty: 'Civil Engineering (B.E.)',
    purposeCategory: 'RENT',
    purposeDescription: 'Semester hostel advance deposit shortfall before campus deadline',
    amountRequestedPaisa: 500000, // NPR 5,000
    amountFundedPaisa: 200000,    // NPR 2,000 funded -> NPR 3,000 remaining!
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
        loanId: 'loan-mkt-rent-02',
        lenderId: 'usr-lender-1',
        lenderName: 'Sunita Thapa',
        amountFundedPaisa: 200000,
        expectedReturnPaisa: 8000,
        fundedAt: '2026-09-03T15:00:00Z',
      },
    ],
    createdAt: '2026-09-03T12:00:00Z',
  },

  // 4. EDUCATION (Open requests with remaining capacity)
  {
    id: 'loan-mkt-03',
    borrowerId: 'usr-stub-3',
    borrowerPseudonym: 'Student #7819',
    universityName: 'Pokhara University',
    faculty: 'Business Administration (BBA)',
    purposeCategory: 'EDUCATION',
    purposeDescription: 'Semester board exam clearance fee deadline',
    amountRequestedPaisa: 400000, // NPR 4,000
    amountFundedPaisa: 100000,    // NPR 1,000 funded -> NPR 3,000 remaining!
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
        loanId: 'loan-mkt-03',
        lenderId: 'usr-stub-lender',
        lenderName: 'Prashant K.',
        amountFundedPaisa: 100000,
        expectedReturnPaisa: 4000,
        fundedAt: '2026-09-03T18:00:00Z',
      },
    ],
    createdAt: '2026-09-03T07:15:00Z',
  },
  {
    id: 'loan-mkt-edu-02',
    borrowerId: 'usr-stub-edu-2',
    borrowerPseudonym: 'Student #6340',
    universityName: 'Tribhuvan University — IOE Pulchowk',
    faculty: 'Electrical Engineering (B.E.)',
    purposeCategory: 'EDUCATION',
    purposeDescription: 'Microcontroller hardware kit and semester lab manual printing fee',
    amountRequestedPaisa: 350000, // NPR 3,500
    amountFundedPaisa: 100000,    // NPR 1,000 funded -> NPR 2,500 remaining!
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
        loanId: 'loan-mkt-edu-02',
        lenderId: 'usr-lender-1',
        lenderName: 'Sunita Thapa',
        amountFundedPaisa: 100000,
        expectedReturnPaisa: 4000,
        fundedAt: '2026-09-04T07:00:00Z',
      },
    ],
    createdAt: '2026-09-04T05:00:00Z',
  },

  // 5. FOOD (Open requests with remaining capacity)
  {
    id: 'loan-mkt-food-01',
    borrowerId: 'usr-stub-food-1',
    borrowerPseudonym: 'Student #1522',
    universityName: 'Kathmandu University — Dhulikhel',
    faculty: 'Mechanical Engineering (B.E.)',
    purposeCategory: 'FOOD',
    purposeDescription: 'Campus cafeteria mess card monthly recharge before family allowance release',
    amountRequestedPaisa: 300000, // NPR 3,000
    amountFundedPaisa: 100000,    // NPR 1,000 funded -> NPR 2,000 remaining!
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
        loanId: 'loan-mkt-food-01',
        lenderId: 'usr-stub-lender',
        lenderName: 'Prashant K.',
        amountFundedPaisa: 100000,
        expectedReturnPaisa: 4000,
        fundedAt: '2026-09-04T09:00:00Z',
      },
    ],
    createdAt: '2026-09-04T07:00:00Z',
  },
  {
    id: 'loan-mkt-food-02',
    borrowerId: 'usr-stub-food-2',
    borrowerPseudonym: 'Student #8431',
    universityName: 'Pokhara University',
    faculty: 'Computer Application (BCA)',
    purposeCategory: 'FOOD',
    purposeDescription: 'Emergency grocery provisions and subsistence essentials during exam preparation',
    amountRequestedPaisa: 250000, // NPR 2,500
    amountFundedPaisa: 50000,     // NPR 500 funded -> NPR 2,000 remaining!
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
        loanId: 'loan-mkt-food-02',
        lenderId: 'usr-lender-1',
        lenderName: 'Sunita Thapa',
        amountFundedPaisa: 50000,
        expectedReturnPaisa: 2000,
        fundedAt: '2026-09-04T10:00:00Z',
      },
    ],
    createdAt: '2026-09-04T08:15:00Z',
  },

  // 6. UTILITIES (Open requests with remaining capacity)
  {
    id: 'loan-mkt-util-01',
    borrowerId: 'usr-stub-util-1',
    borrowerPseudonym: 'Student #3908',
    universityName: 'Tribhuvan University — IOE Pulchowk',
    faculty: 'Electronics & Information Engineering',
    purposeCategory: 'UTILITIES',
    purposeDescription: 'Hostel high-speed fiber internet quarterly subscription for final year AI project research',
    amountRequestedPaisa: 200000, // NPR 2,000
    amountFundedPaisa: 50000,     // NPR 500 funded -> NPR 1,500 remaining!
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
        loanId: 'loan-mkt-util-01',
        lenderId: 'usr-stub-lender',
        lenderName: 'Prashant K.',
        amountFundedPaisa: 50000,
        expectedReturnPaisa: 2000,
        fundedAt: '2026-09-04T11:00:00Z',
      },
    ],
    createdAt: '2026-09-04T09:30:00Z',
  },
  {
    id: 'loan-mkt-util-02',
    borrowerId: 'usr-stub-util-2',
    borrowerPseudonym: 'Student #7741',
    universityName: 'Nepal Engineering College',
    faculty: 'Architecture',
    purposeCategory: 'UTILITIES',
    purposeDescription: 'Shared student apartment electricity meter recharge & emergency water tanker contribution',
    amountRequestedPaisa: 280000, // NPR 2,800
    amountFundedPaisa: 80000,     // NPR 800 funded -> NPR 2,000 remaining!
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
        loanId: 'loan-mkt-util-02',
        lenderId: 'usr-lender-1',
        lenderName: 'Sunita Thapa',
        amountFundedPaisa: 80000,
        expectedReturnPaisa: 3200,
        fundedAt: '2026-09-04T12:00:00Z',
      },
    ],
    createdAt: '2026-09-04T10:45:00Z',
  },
];


export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-01',
    idempotencyKey: 'idem-4892-topup-001',
    senderId: 'gateway-esewa',
    senderName: 'eSewa Mobile Wallet',
    receiverId: 'usr-lender-1',
    receiverName: 'Sunita Thapa',
    amountPaisa: 2500000, // NPR 25,000
    type: 'WALLET_TOPUP',
    status: 'SUCCESS',
    gatewayReference: 'ESEWA-REF-889124',
    createdAt: '2026-08-19T09:00:00Z',
  },
  {
    id: 'tx-02',
    idempotencyKey: 'idem-4892-disburse-002',
    loanId: 'loan-active-01',
    senderId: 'usr-lender-1',
    senderName: 'Sunita Thapa (Lender)',
    receiverId: 'usr-borrower-1',
    receiverName: 'Aashish Sharma (Borrower)',
    amountPaisa: 400000, // NPR 4,000
    type: 'DISBURSEMENT',
    status: 'SUCCESS',
    gatewayReference: 'AFN-DISB-772910',
    createdAt: '2026-08-20T14:00:00Z',
  },
];

export const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'frd-01',
    userId: 'usr-suspicious-99',
    userName: 'Suspicious Device #99',
    ruleCode: 'RULE_SYBIL_DUPLICATE_HASH',
    severity: 'HIGH',
    description: 'Attempted to register with an already bonded Citizenship ID hash. Blocked at database constraint layer.',
    isResolved: true,
    createdAt: '2026-08-28T16:20:00Z',
  },
  {
    id: 'frd-02',
    userId: 'usr-borrower-1',
    userName: 'Aashish Sharma',
    ruleCode: 'RULE_SIMULTANEOUS_LOAN_PREVENTION',
    severity: 'LOW',
    description: 'System safely rejected concurrent loan application because an active loan is currently open.',
    isResolved: true,
    createdAt: '2026-08-25T11:15:00Z',
  },
];
