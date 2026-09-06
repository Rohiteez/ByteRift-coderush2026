import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  RotateCcw, 
  Wallet, 
  ShieldAlert, 
  GraduationCap, 
  Coins, 
  FileText,
  Sparkles,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { paisaToNpr } from '../../utils/currency';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    resetDemo, 
    activeTab, 
    setActiveTab, 
    lenderBalance, 
    creditScore, 
    currentKyc,
    isLoggedIn,
    isBackendConnected,
    logout
  } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      {/* Top Demo Bar for Hackathon Judges & Quick Switching */}
      <div className="bg-[#fcfbf7] text-stone-600 text-xs px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/40">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">Demo Switcher:</span>
          <span className="text-stone-400 text-[11px] hidden sm:inline">Select test persona:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {allUsers.map(user => {
            const isActive = user.id === currentUser.id && isLoggedIn;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs border border-amber-400'
                    : 'bg-white text-stone-600 hover:bg-amber-50/70 hover:text-stone-900 border border-stone-200/80'
                }`}
              >
                {user.role === 'BORROWER' && user.id === 'usr-new-student' && (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>New Student (KYC)</span>
                  </>
                )}
                {user.role === 'BORROWER' && user.id !== 'usr-new-student' && (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-stone-700" />
                    <span>Borrower ({user.fullName.split(' ')[0]})</span>
                  </>
                )}
                {user.role === 'LENDER' && (
                  <>
                    <Wallet className="w-3.5 h-3.5 text-amber-700" />
                    <span>Lender ({user.fullName.split(' ')[0]})</span>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-stone-600" />
                    <span>Admin / Risk</span>
                  </>
                )}
              </button>
            );
          })}

          <button
            onClick={resetDemo}
            title="Reset to clean initial demo data"
            className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 border border-stone-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-stone-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setActiveTab('LANDING')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-stone-950 shadow-sm shadow-amber-400/25 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-stone-900 block leading-tight">
                  Aafno<span className="text-amber-500">Pay</span>
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block mt-0.5">
                  Student Emergency Credit
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1.5 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('LANDING')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'LANDING' 
                    ? 'text-stone-950 bg-amber-100/80 font-bold' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab(currentKyc?.status === 'VERIFIED' ? 'BORROWER' : 'KYC_WIZARD')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'BORROWER' || activeTab === 'KYC_WIZARD'
                    ? 'text-stone-950 bg-amber-100/80 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-stone-600" />
                <span>Borrower Portal</span>
                {currentKyc?.status !== 'VERIFIED' && (
                  <span className="ml-0.5 px-2 py-0.5 rounded-md text-[10px] bg-amber-200 text-amber-950 font-extrabold">
                    KYC
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('MARKETPLACE')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'MARKETPLACE' 
                    ? 'text-stone-950 bg-amber-100/80 font-bold' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Coins className="w-4 h-4 text-stone-600" />
                <span>P2P Marketplace</span>
              </button>

              <button
                onClick={() => setActiveTab('LENDER')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'LENDER' 
                    ? 'text-stone-950 bg-amber-100/80 font-bold' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Wallet className="w-4 h-4 text-stone-600" />
                <span>Lender Portfolio</span>
              </button>

              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ADMIN' 
                    ? 'text-stone-950 bg-amber-100/80 font-bold' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-stone-600" />
                <span>Admin & Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab('JUDGE_DEFENSE')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'JUDGE_DEFENSE' 
                    ? 'text-stone-950 bg-amber-100/80 font-bold' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <FileText className="w-4 h-4 text-stone-600" />
                <span>Defense & Docs</span>
              </button>
            </nav>
          </div>

          {/* Right Status Badge & Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {currentUser.role === 'LENDER' ? (
                  <div className="hidden sm:flex flex-col items-end bg-amber-50/80 border border-amber-200/80 px-4 py-1.5 rounded-xl">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Lending Wallet</span>
                    <span className="text-sm font-extrabold text-stone-900">{paisaToNpr(lenderBalance)}</span>
                  </div>
                ) : currentUser.role === 'BORROWER' ? (
                  <div className="hidden sm:flex flex-col items-end bg-amber-50/80 border border-amber-200/80 px-4 py-1.5 rounded-xl">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Aafno Trust Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-stone-900">{creditScore.score}/100</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded-md font-bold">
                        Tier {creditScore.tier}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 bg-stone-100 border border-stone-200 text-stone-800 px-4 py-1.5 rounded-xl text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 text-stone-700" />
                    <span>Super Admin</span>
                  </div>
                )}

                <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
                  <img
                    src={currentUser.avatarUrl || 'https://placehold.co/100'}
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-amber-200"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-stone-900 leading-tight">{currentUser.fullName}</p>
                    <p className="text-[10px] text-stone-500 font-medium">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('LOGIN')}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-extrabold shadow-sm shadow-amber-400/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4 stroke-[2.2]" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
