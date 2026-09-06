// In-Browser Mock API Service: Mimics strict backend API contract and enforces server-grade rules.

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
  PurposeCategory
} from '../types';

import { 
  INITIAL_USERS, 
  INITIAL_KYC, 
  INITIAL_STUDENT_VERIFICATIONS, 
  INITIAL_CREDIT_SCORES, 
  INITIAL_LOANS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_FRAUD_ALERTS 
} from './mockData';

import { calculateLoanBreakdown } from '../utils/currency';
import { getTierForScore } from '../utils/scoreEngine';

const STORAGE_KEY_PREFIX = 'aafnopay_demo_';

class MockService {
  private users: User[] = [];
  private kycRecords: Record<string, KYCVerification> = {};
  private studentRecords: Record<string, StudentVerification> = {};
  private creditScores: Record<string, CreditScore> = {};
  private creditHistory: CreditScoreHistoryItem[] = [];
  private loans: LoanRequest[] = [];
  private transactions: Transaction[] = [];
  private fraudAlerts: FraudAlert[] = [];
  private currentUserId: string = 'usr-borrower-1';
  private lenderBalances: Record<string, number> = { 'usr-lender-1': 2500000 }; // NPR 25,000

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'state_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.users = parsed.users;
        this.kycRecords = parsed.kycRecords;
        this.studentRecords = parsed.studentRecords;
        this.creditScores = parsed.creditScores;
        this.creditHistory = parsed.creditHistory;
        this.loans = parsed.loans;
        this.transactions = parsed.transactions;
        this.fraudAlerts = parsed.fraudAlerts;
        this.currentUserId = parsed.currentUserId || 'usr-borrower-1';
        this.lenderBalances = parsed.lenderBalances || { 'usr-lender-1': 2500000 };
        this.ensureAllCategoriesAvailable();
        return;
      }
    } catch {
      // fallback
    }
    this.resetToDefaults();
  }

  public ensureAllCategoriesAvailable() {
    const categories: PurposeCategory[] = ['RENT', 'MEDICAL', 'EDUCATION', 'FOOD', 'UTILITIES'];
    for (const cat of categories) {
      this.ensureCategoryAvailability(cat);
    }
  }

  public ensureCategoryAvailability(category: PurposeCategory) {
    const openInCat = this.loans.filter(
      l => l.purposeCategory === category && ['MATCHING', 'PARTIALLY_FUNDED'].includes(l.status)
    );
    if (openInCat.length === 0) {
      const templates = INITIAL_LOANS.filter(
        l => l.purposeCategory === category && ['MATCHING', 'PARTIALLY_FUNDED'].includes(l.status)
      );
      if (templates.length > 0) {
        templates.forEach(t => {
          this.loans.push({
            ...t,
            id: `loan-mkt-${category.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          });
        });
      }
    }
  }

  public saveState() {
    try {
      const state = {
        users: this.users,
        kycRecords: this.kycRecords,
        studentRecords: this.studentRecords,
        creditScores: this.creditScores,
        creditHistory: this.creditHistory,
        loans: this.loans,
        transactions: this.transactions,
        fraudAlerts: this.fraudAlerts,
        currentUserId: this.currentUserId,
        lenderBalances: this.lenderBalances,
      };
      localStorage.setItem(STORAGE_KEY_PREFIX + 'state_v3', JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  public resetToDefaults() {
    this.users = [...INITIAL_USERS];
    this.kycRecords = { ...INITIAL_KYC };
    this.studentRecords = { ...INITIAL_STUDENT_VERIFICATIONS };
    this.creditScores = { ...INITIAL_CREDIT_SCORES };
    this.loans = [...INITIAL_LOANS];
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.fraudAlerts = [...INITIAL_FRAUD_ALERTS];
    this.currentUserId = 'usr-borrower-1';
    this.lenderBalances = { 'usr-lender-1': 2500000 };
    this.ensureAllCategoriesAvailable();
    this.creditHistory = [
      {
        id: 'hist-01',
        userId: 'usr-borrower-1',
        delta: 30,
        previousScore: 0,
        newScore: 30,
        reason: 'Initial Identity & University Enrollment Verified',
        createdAt: '2026-08-15T11:30:00Z',
      },
      {
        id: 'hist-02',
        userId: 'usr-borrower-1',
        delta: 38,
        previousScore: 30,
        newScore: 68,
        reason: 'Successful early settlement of previous emergency loan',
        createdAt: '2026-08-18T16:00:00Z',
      },
    ];
    this.saveState();
  }

  // --- Current User Management ---
  public getCurrentUser(): User {
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || this.users[0];
  }

  public setCurrentUser(userId: string): User {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    this.currentUserId = userId;
    this.saveState();
    return user;
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  // --- KYC & Student Verification Engine ---
  public getKyc(userId: string): KYCVerification | null {
    return this.kycRecords[userId] || null;
  }

  public getStudentVerification(userId: string): StudentVerification | null {
    return this.studentRecords[userId] || null;
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
    // Generate simulated cryptographic hash
    const docHash = `sha256_${data.docType.toLowerCase()}_${data.docNumber.trim().replace(/[^a-zA-Z0-9]/g, '')}`;

    // Sybil Multi-account Check: Has this national ID already been registered by another user?
    const collision = Object.values(this.kycRecords).find(
      k => k.docNumberHash === docHash && k.userId !== userId
    );

    if (collision) {
      // Record Fraud Alert
      this.fraudAlerts.unshift({
        id: `frd-${Date.now()}`,
        userId,
        userName: data.fullName,
        ruleCode: 'RULE_SYBIL_DUPLICATE_NATIONAL_ID',
        severity: 'CRITICAL',
        description: `Blocked registration attempt. National ID hash already belongs to active account ${collision.userId}.`,
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
      this.saveState();

      throw new Error('DUPLICATE_IDENTITY: This national identity card is already bonded to an existing account. Multiple accounts are strictly prohibited.');
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
      status: 'VERIFIED', // Auto-verify for demo convenience
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.kycRecords[userId] = newKyc;
    this.saveState();
    return newKyc;
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

    // Sybil Roll Number Check
    const collision = Object.values(this.studentRecords).find(
      s => s.studentIdNumberHash === studentHash && s.userId !== userId
    );

    if (collision) {
      throw new Error('DUPLICATE_STUDENT_ID: This student registration number is already verified under another account.');
    }

    const newStudent: StudentVerification = {
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

    this.studentRecords[userId] = newStudent;

    // Unlock Starting Credit Score: 30 points (Tier 1: NPR 4,000 limit)
    const initialScore: CreditScore = {
      userId,
      score: 30,
      tier: 1,
      maxLimitPaisa: 400000, // NPR 4,000
      lastCalculatedAt: new Date().toISOString(),
    };

    this.creditScores[userId] = initialScore;

    this.creditHistory.unshift({
      id: `hist-${Date.now()}`,
      userId,
      delta: 30,
      previousScore: 0,
      newScore: 30,
      reason: 'Identity and Student Academic Status Verified (+30 pts)',
      createdAt: new Date().toISOString(),
    });

    this.saveState();
    return { student: newStudent, score: initialScore };
  }

  // --- Credit Score & Limits ---
  public getCreditScore(userId: string): CreditScore {
    if (!this.creditScores[userId]) {
      return {
        userId,
        score: 0,
        tier: 1,
        maxLimitPaisa: 0,
        lastCalculatedAt: new Date().toISOString(),
      };
    }
    return this.creditScores[userId];
  }

  public getCreditHistory(userId: string): CreditScoreHistoryItem[] {
    return this.creditHistory.filter(h => h.userId === userId);
  }

  // --- Loan Engine ---
  public getLoans(filters?: { borrowerId?: string; status?: string }): LoanRequest[] {
    let result = [...this.loans];
    if (filters?.borrowerId) {
      result = result.filter(l => l.borrowerId === filters.borrowerId);
    }
    if (filters?.status) {
      result = result.filter(l => l.status === filters.status);
    }
    return result;
  }

  public getLoanById(id: string): LoanRequest | undefined {
    return this.loans.find(l => l.id === id);
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
    const userKyc = this.kycRecords[borrowerId];
    if (!userKyc || userKyc.status !== 'VERIFIED') {
      throw new Error('KYC_REQUIRED: You must complete identity verification before requesting an emergency loan.');
    }

    const studentRec = this.studentRecords[borrowerId];
    if (!studentRec || studentRec.verificationStatus !== 'VERIFIED') {
      throw new Error('STUDENT_VERIFICATION_REQUIRED: Active university enrollment verification is required.');
    }

    // Check active loan policy: Only 1 active loan allowed
    const hasActiveLoan = this.loans.some(
      l => l.borrowerId === borrowerId && ['REQUESTED', 'MATCHING', 'PARTIALLY_FUNDED', 'FUNDED', 'AGREEMENT_PENDING', 'ACTIVE'].includes(l.status)
    );
    if (hasActiveLoan) {
      throw new Error('ACTIVE_LOAN_EXISTS: You currently have an active or pending loan. Platform policy limits students to 1 active loan.');
    }

    // Check borrowing limit
    const scoreRec = this.getCreditScore(borrowerId);
    if (data.amountRequestedPaisa > scoreRec.maxLimitPaisa) {
      throw new Error(`LIMIT_EXCEEDED: Requested amount exceeds your current maximum borrowing limit of NPR ${(scoreRec.maxLimitPaisa / 100).toLocaleString()}.`);
    }

    const user = this.users.find(u => u.id === borrowerId);
    const pseudonym = `Student #${Math.floor(1000 + Math.random() * 9000)}`;

    const newLoan: LoanRequest = {
      id: `loan-${Date.now()}`,
      borrowerId,
      borrowerPseudonym: pseudonym,
      universityName: studentRec.universityName,
      faculty: studentRec.faculty,
      purposeCategory: data.purposeCategory,
      purposeDescription: data.purposeDescription,
      amountRequestedPaisa: data.amountRequestedPaisa,
      amountFundedPaisa: 0,
      tenureDays: data.tenureDays || 30,
      facilityFeeRateBps: 600, // 6%
      lenderYieldRateBps: 400,  // 4%
      status: 'MATCHING',
      aafnoScore: scoreRec.score,
      scoreTier: scoreRec.tier,
      funders: [],
      agreementSigned: false,
      createdAt: new Date().toISOString(),
    };

    this.loans.unshift(newLoan);
    this.saveState();
    return newLoan;
  }

  // P2P Funding with Concurrency & Overfunding Guard
  public async fundLoan(
    loanId: string,
    lenderId: string,
    amountToFundPaisa: number
  ): Promise<LoanRequest> {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');

    if (!['MATCHING', 'PARTIALLY_FUNDED'].includes(loan.status)) {
      throw new Error(`LOAN_NOT_FUNDABLE: This loan is currently in '${loan.status}' state and is no longer accepting funds.`);
    }

    const remainingPaisa = loan.amountRequestedPaisa - loan.amountFundedPaisa;

    // Concurrency / Race Condition Guard:
    if (amountToFundPaisa > remainingPaisa) {
      throw new Error(`RACE_CONDITION_PREVENTED: Only NPR ${(remainingPaisa / 100).toLocaleString()} remaining to be funded. You requested NPR ${(amountToFundPaisa / 100).toLocaleString()}.`);
    }

    // Check lender wallet balance
    const currentBalance = this.lenderBalances[lenderId] || 0;
    if (currentBalance < amountToFundPaisa) {
      throw new Error(`INSUFFICIENT_BALANCE: Your lending wallet has NPR ${(currentBalance / 100).toLocaleString()}, which is less than the funding amount.`);
    }

    // Deduct balance
    this.lenderBalances[lenderId] = currentBalance - amountToFundPaisa;

    // Calculate expected 4% lender return
    const breakdown = calculateLoanBreakdown(amountToFundPaisa);
    const expectedReturnPaisa = breakdown.lenderYieldPaisa;

    const lender = this.users.find(u => u.id === lenderId);

    loan.funders.push({
      id: `fnd-${Date.now()}`,
      loanId,
      lenderId,
      lenderName: lender?.fullName || 'Peer Lender',
      amountFundedPaisa: amountToFundPaisa,
      expectedReturnPaisa,
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

      // Record disbursement transaction
      this.transactions.unshift({
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

      // Ensure category always has remaining active requests to fund
      this.ensureCategoryAvailability(loan.purposeCategory);
    } else {
      loan.status = 'PARTIALLY_FUNDED';
    }

    this.saveState();
    return loan;
  }

  // Repayment Engine: Deterministic Settlement & Score Upgrade
  public async repayLoan(
    loanId: string,
    borrowerId: string,
    idempotencyKey: string
  ): Promise<{ loan: LoanRequest; newScore: CreditScore }> {
    // Idempotency check:
    const existingTx = this.transactions.find(t => t.idempotencyKey === idempotencyKey);
    if (existingTx) {
      const loan = this.loans.find(l => l.id === loanId)!;
      const score = this.getCreditScore(borrowerId);
      return { loan, newScore: score };
    }

    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');
    if (loan.borrowerId !== borrowerId) throw new Error('UNAUTHORIZED: You do not own this loan');
    if (loan.status !== 'ACTIVE') throw new Error(`INVALID_STATE: Loan is currently in state '${loan.status}'`);

    const breakdown = calculateLoanBreakdown(loan.amountRequestedPaisa);
    const totalDuePaisa = breakdown.totalRepaymentPaisa;

    // Mark completed
    loan.status = 'COMPLETED';
    loan.completedAt = new Date().toISOString();

    // Payout to lenders
    loan.funders.forEach(f => {
      const payout = f.amountFundedPaisa + f.expectedReturnPaisa;
      this.lenderBalances[f.lenderId] = (this.lenderBalances[f.lenderId] || 0) + payout;
    });

    // Record Repayment Transaction
    this.transactions.unshift({
      id: `tx-repay-${Date.now()}`,
      idempotencyKey,
      loanId: loan.id,
      senderId: borrowerId,
      senderName: 'Verified Student (Borrower)',
      receiverId: 'aafno-ledger-escrow',
      receiverName: 'Aafno Settlement Escrow',
      amountPaisa: totalDuePaisa,
      type: 'REPAYMENT',
      status: 'SUCCESS',
      gatewayReference: `AFN-SETTLE-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    });

    // Score & Credit Ladder Upgrade (+10 points for on-time repayment)
    const currentScoreRec = this.getCreditScore(borrowerId);
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

    this.creditScores[borrowerId] = updatedScore;

    this.creditHistory.unshift({
      id: `hist-${Date.now()}`,
      userId: borrowerId,
      delta: 10,
      previousScore: prevScore,
      newScore: newScoreValue,
      reason: `On-time full repayment of loan #${loan.id.slice(-6)} (+10 pts)`,
      createdAt: new Date().toISOString(),
    });

    this.saveState();
    return { loan, newScore: updatedScore };
  }

  // --- Ledger, Wallets & Fraud ---
  public getLenderBalance(lenderId: string): number {
    return this.lenderBalances[lenderId] || 0;
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getFraudAlerts(): FraudAlert[] {
    return [...this.fraudAlerts];
  }
}

export const mockService = new MockService();
