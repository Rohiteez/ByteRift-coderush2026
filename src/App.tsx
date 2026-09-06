import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { KycWizard } from './components/kyc/KycWizard';
import { BorrowerDashboard } from './components/borrower/BorrowerDashboard';
import { LoanMarketplace } from './components/marketplace/LoanMarketplace';
import { LenderDashboard } from './components/lender/LenderDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { JudgeDefense } from './components/defense/JudgeDefense';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, notification } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 antialiased">
      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-amber-400 text-stone-950 border-amber-300'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-stone-900 text-amber-100 border-stone-800'
          }`}>
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-stone-950" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar & Demo Persona Switcher */}
      <Navbar />

      {/* Dynamic View Router */}
      <main className="flex-1">
        {activeTab === 'LANDING' && <LandingPage />}
        {activeTab === 'LOGIN' && <LoginPage />}
        {activeTab === 'KYC_WIZARD' && <KycWizard />}
        {activeTab === 'BORROWER' && <BorrowerDashboard />}
        {activeTab === 'MARKETPLACE' && <LoanMarketplace />}
        {activeTab === 'LENDER' && <LenderDashboard />}
        {activeTab === 'ADMIN' && <AdminDashboard />}
        {activeTab === 'JUDGE_DEFENSE' && <JudgeDefense />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200/80 py-10 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-stone-950 text-xs font-black shadow-xs">
              A
            </div>
            <span className="font-bold text-stone-800 text-sm tracking-tight">Aafno Pay</span>
            <span className="text-stone-400">• Student P2P Emergency Credit</span>
          </div>

          <div className="flex items-center gap-6 text-stone-400">
            <span>Integer Paisa Accounting</span>
            <span>•</span>
            <span>Zero Collateral</span>
            <span>•</span>
            <span>Fixed 6% Emergency Fee</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
