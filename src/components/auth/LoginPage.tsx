import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  GraduationCap, 
  Wallet, 
  ShieldAlert, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { allUsers, login, register, setActiveTab, showNotification } = useApp();
  
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('BORROWER');
  const [regConsent, setRegConsent] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError('Please enter your email or registered identifier');
      return;
    }
    const success = login(loginEmail.trim());
    if (!success) {
      setLoginError('Invalid credentials. You can also use the one-click demo logins below.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError('Please complete all required registration fields');
      return;
    }
    if (!regConsent) {
      setRegError('You must agree to the platform terms and privacy disclosures');
      return;
    }

    try {
      register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        role: regRole,
      });
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    }
  };

  const handleQuickLogin = (userId: string) => {
    login(userId);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-16 px-6 sm:px-8 lg:px-12 bg-[#faf9f6]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* Left Side: Brand Overview & Security Pillars */}
        <div className="md:col-span-5 space-y-7 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100/80 border border-amber-200/80 text-amber-950 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-700 stroke-[2.2]" />
            <span>Institutional Student Credit</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Aafno<span className="text-amber-500">Pay</span>
            </h1>
            <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-widest">
              Zero Collateral • P2P Verification
            </p>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            Access dignified emergency micro-loans between NPR 4,000 and NPR 10,000. Verified through national KYC and university academic registries.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3 text-xs text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[2.2]" />
              <span>Transparent fixed 6% facility fee with zero hidden charges.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[2.2]" />
              <span>Cryptographic hash protection against multi-account evasion.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[2.2]" />
              <span>1% Reserve Fund allocation to protect peer lenders.</span>
            </div>
          </div>

          <div className="pt-5 border-t border-stone-200 text-[11px] text-stone-400">
            Complies with digital promissory protocols and integer paisa ledger accounting.
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-stone-200/80 shadow-md p-8 sm:p-10">
          {/* Auth Mode Toggle */}
          <div className="flex bg-stone-100/70 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => {
                setAuthMode('LOGIN');
                setLoginError(null);
                setRegError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'LOGIN' ? 'bg-amber-400 text-stone-950 font-extrabold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('REGISTER');
                setLoginError(null);
                setRegError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'REGISTER' ? 'bg-amber-400 text-stone-950 font-extrabold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo One-Click Access for Judges */}
          <div className="mb-7 p-4 bg-[#faf9f6] border border-amber-200/70 rounded-2xl">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block mb-2.5">
              Quick Test Personas (One-Click Sign-In)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('usr-borrower-1')}
                className="p-2.5 text-left bg-white hover:bg-amber-50/60 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-stone-700" />
                  Borrower (Aashish)
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Active Loan NPR 4,000</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('usr-new-student')}
                className="p-2.5 text-left bg-white hover:bg-amber-50/60 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-700" />
                  New Student (Rohan)
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Needs KYC Verification</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('usr-lender-1')}
                className="p-2.5 text-left bg-white hover:bg-amber-50/60 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-800" />
                  Lender (Sunita)
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Balance NPR 25,000</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('usr-admin-1')}
                className="p-2.5 text-left bg-white hover:bg-amber-50/60 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-stone-700" />
                  Admin / Risk
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Fraud & Ledger Console</span>
              </button>
            </div>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="student@ioe.edu.np or 9841234567"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-amber-500 accent-amber-500" />
                  <span>Remember session</span>
                </label>
                <span className="text-amber-800 font-bold cursor-pointer hover:underline">
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold rounded-2xl text-xs shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer hover:scale-[1.02]"
              >
                <span>Sign In to Aafno Pay</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegRole('BORROWER')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      regRole === 'BORROWER'
                        ? 'border-amber-400 bg-amber-50/80 text-stone-950 font-bold shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-stone-700" />
                    <span className="text-xs">Student Borrower</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('LENDER')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      regRole === 'LENDER'
                        ? 'border-amber-400 bg-amber-50/80 text-stone-950 font-bold shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-700" />
                    <span className="text-xs">Peer Lender</span>
                  </button>
                </div>
              </div>

              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Suman Poudel"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="student@tu.edu.np"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Set Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-stone-600 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regConsent}
                    onChange={(e) => setRegConsent(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 accent-amber-500"
                  />
                  <span className="leading-relaxed">
                    I accept the Master Platform Terms. I understand identity verification via national and academic registries is mandatory before requesting loans.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold rounded-2xl text-xs shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer hover:scale-[1.02]"
              >
                <span>Create Verified Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
