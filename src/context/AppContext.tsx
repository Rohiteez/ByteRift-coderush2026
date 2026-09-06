import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, KYCVerification, StudentVerification, CreditScore, CreditScoreHistoryItem, LoanRequest, Transaction, FraudAlert, Role } from '../types';
import { mockService } from '../services/mockService';
import { backendService } from '../services/backendService';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  isLoggedIn: boolean;
  isBackendConnected: boolean;
  currentKyc: KYCVerification | null;
  currentStudent: StudentVerification | null;
  creditScore: CreditScore;
  creditHistory: CreditScoreHistoryItem[];
  loans: LoanRequest[];
  transactions: Transaction[];
  fraudAlerts: FraudAlert[];
  lenderBalance: number;
  activeTab: 'LANDING' | 'LOGIN' | 'BORROWER' | 'MARKETPLACE' | 'LENDER' | 'ADMIN' | 'KYC_WIZARD' | 'JUDGE_DEFENSE';
  setActiveTab: (tab: 'LANDING' | 'LOGIN' | 'BORROWER' | 'MARKETPLACE' | 'LENDER' | 'ADMIN' | 'KYC_WIZARD' | 'JUDGE_DEFENSE') => void;
  switchUser: (userId: string) => void;
  login: (emailOrId: string) => Promise<boolean>;
  register: (userData: { fullName: string; email: string; phone: string; role: Role }) => Promise<User>;
  logout: () => void;
  resetDemo: () => void;
  submitKyc: (data: any) => Promise<void>;
  submitStudentVerification: (data: any) => Promise<void>;
  requestLoan: (data: any) => Promise<void>;
  fundLoan: (loanId: string, amountPaisa: number) => Promise<void>;
  repayLoan: (loanId: string) => Promise<void>;
  triggerConfetti: () => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(mockService.getAllUsers());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [currentKyc, setCurrentKyc] = useState<KYCVerification | null>(mockService.getKyc(currentUser.id));
  const [currentStudent, setCurrentStudent] = useState<StudentVerification | null>(mockService.getStudentVerification(currentUser.id));
  const [creditScore, setCreditScore] = useState<CreditScore>(mockService.getCreditScore(currentUser.id));
  const [creditHistory, setCreditHistory] = useState<CreditScoreHistoryItem[]>(mockService.getCreditHistory(currentUser.id));
  const [loans, setLoans] = useState<LoanRequest[]>(mockService.getLoans());
  const [transactions, setTransactions] = useState<Transaction[]>(mockService.getTransactions());
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(mockService.getFraudAlerts());
  const [lenderBalance, setLenderBalance] = useState<number>(mockService.getLenderBalance(currentUser.id));
  const [activeTab, setActiveTab] = useState<'LANDING' | 'LOGIN' | 'BORROWER' | 'MARKETPLACE' | 'LENDER' | 'ADMIN' | 'KYC_WIZARD' | 'JUDGE_DEFENSE'>('BORROWER');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const refreshState = useCallback(async (targetUserId?: string) => {
    const isOnline = await backendService.checkBackend();
    setIsBackendConnected(isOnline);

    const activeId = targetUserId || currentUser.id;

    if (isOnline) {
      try {
        const [users, score, history, loanList, txs, alerts] = await Promise.all([
          backendService.getUsers(),
          backendService.getCreditScore(activeId),
          backendService.getCreditHistory(activeId),
          backendService.getLoans(),
          backendService.getTransactions(),
          backendService.getFraudAlerts(),
        ]);

        const activeUser = users.find(u => u.id === activeId) || users[0] || currentUser;
        const [kyc, student] = await Promise.all([
          backendService.getKyc(activeUser.id),
          backendService.getStudentVerification(activeUser.id),
        ]);

        setAllUsers(users);
        setCurrentUser(activeUser);
        setCurrentKyc(kyc);
        setCurrentStudent(student);
        setCreditScore(score);
        setCreditHistory(history);
        setLoans(loanList);
        setTransactions(txs);
        setFraudAlerts(alerts);
        setLenderBalance(activeUser.walletBalancePaisa ?? 2500000);
        return;
      } catch (err) {
        console.warn('Could not sync with backend, falling back to local state:', err);
      }
    }

    // Local fallback
    const user = mockService.getCurrentUser();
    setCurrentUser(user);
    setAllUsers(mockService.getAllUsers());
    setCurrentKyc(mockService.getKyc(user.id));
    setCurrentStudent(mockService.getStudentVerification(user.id));
    setCreditScore(mockService.getCreditScore(user.id));
    setCreditHistory(mockService.getCreditHistory(user.id));
    setLoans(mockService.getLoans());
    setTransactions(mockService.getTransactions());
    setFraudAlerts(mockService.getFraudAlerts());
    setLenderBalance(mockService.getLenderBalance(user.id));
  }, [currentUser]);

  useEffect(() => {
    refreshState();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    });
  };

  const switchUser = async (userId: string) => {
    backendService.setCurrentUserId(userId);
    const matched = allUsers.find(u => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
      setIsLoggedIn(true);
      await refreshState(userId);
      if (matched.role === 'LENDER') {
        setActiveTab('LENDER');
      } else if (matched.role === 'ADMIN') {
        setActiveTab('ADMIN');
      } else {
        const kyc = await backendService.getKyc(userId);
        if (!kyc || kyc.status !== 'VERIFIED') {
          setActiveTab('KYC_WIZARD');
        } else {
          setActiveTab('BORROWER');
        }
      }
      showNotification(`Switched demo view to ${matched.fullName} (${matched.role})`, 'info');
    } else {
      const newUser = mockService.setCurrentUser(userId);
      setIsLoggedIn(true);
      await refreshState();
      showNotification(`Switched demo view to ${newUser.fullName} (${newUser.role})`, 'info');
    }
  };

  const login = async (emailOrId: string): Promise<boolean> => {
    try {
      const user = await backendService.login(emailOrId);
      setIsLoggedIn(true);
      await refreshState(user.id);

      if (user.role === 'LENDER') {
        setActiveTab('LENDER');
      } else if (user.role === 'ADMIN') {
        setActiveTab('ADMIN');
      } else {
        const kyc = await backendService.getKyc(user.id);
        if (!kyc || kyc.status !== 'VERIFIED') {
          setActiveTab('KYC_WIZARD');
        } else {
          setActiveTab('BORROWER');
        }
      }
      showNotification(`Successfully authenticated as ${user.fullName}`, 'success');
      return true;
    } catch {
      const matched = allUsers.find(u => u.email.toLowerCase() === emailOrId.toLowerCase() || u.id === emailOrId);
      if (!matched) {
        showNotification('No user found with those credentials', 'error');
        return false;
      }
      mockService.setCurrentUser(matched.id);
      setIsLoggedIn(true);
      await refreshState();
      showNotification(`Successfully authenticated as ${matched.fullName}`, 'success');
      return true;
    }
  };

  const register = async (userData: { fullName: string; email: string; phone: string; role: Role }): Promise<User> => {
    try {
      const user = await backendService.register(userData);
      setIsLoggedIn(true);
      await refreshState(user.id);

      if (userData.role === 'BORROWER') {
        setActiveTab('KYC_WIZARD');
      } else {
        setActiveTab('MARKETPLACE');
      }

      showNotification(`Account created for ${user.fullName}. Proceed with verification.`, 'success');
      return user;
    } catch {
      const newUser = mockService.setCurrentUser(mockService.getAllUsers()[0].id);
      setIsLoggedIn(true);
      await refreshState();
      showNotification(`Account created for ${userData.fullName}.`, 'success');
      return newUser;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setActiveTab('LOGIN');
    showNotification('Logged out successfully', 'info');
  };

  const resetDemo = async () => {
    mockService.resetToDefaults();
    setIsLoggedIn(true);
    await refreshState();
    setActiveTab('BORROWER');
    showNotification('Demo state has been restored to clean initial seed data', 'success');
  };

  const submitKyc = async (data: any) => {
    await backendService.submitKyc(currentUser.id, data);
    await refreshState();
    showNotification('KYC documents submitted and verified successfully', 'success');
  };

  const submitStudentVerification = async (data: any) => {
    await backendService.submitStudentVerification(currentUser.id, data);
    await refreshState();
    triggerConfetti();
    showNotification('Verification complete! Tier 1 credit unlocked: NPR 4,000 maximum limit', 'success');
  };

  const requestLoan = async (data: any) => {
    await backendService.requestLoan(currentUser.id, data);
    await refreshState();
    showNotification('Emergency loan request listed on marketplace for peer funding!', 'success');
  };

  const fundLoan = async (loanId: string, amountPaisa: number) => {
    await backendService.fundLoan(loanId, currentUser.id, amountPaisa);
    await refreshState();
    showNotification('Investment successful! Digital agreement registered in ledger.', 'success');
  };

  const repayLoan = async (loanId: string) => {
    const result = await backendService.repayLoan(loanId, currentUser.id);
    await refreshState();
    triggerConfetti();
    const newScore = result?.newScore?.score ?? result?.newScore ?? 78;
    const maxLimitPaisa = result?.newScore?.maxLimitPaisa ?? result?.maxLimitPaisa ?? 800000;
    showNotification(
      `Loan settled! Credit Score upgraded to ${newScore}/100. New limit: NPR ${(maxLimitPaisa / 100).toLocaleString()}!`,
      'success'
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoggedIn,
        isBackendConnected,
        currentKyc,
        currentStudent,
        creditScore,
        creditHistory,
        loans,
        transactions,
        fraudAlerts,
        lenderBalance,
        activeTab,
        setActiveTab,
        switchUser,
        login,
        register,
        logout,
        resetDemo,
        submitKyc,
        submitStudentVerification,
        requestLoan,
        fundLoan,
        repayLoan,
        triggerConfetti,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
