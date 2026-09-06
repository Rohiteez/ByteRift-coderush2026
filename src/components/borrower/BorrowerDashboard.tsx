import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  Lock,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { paisaToNpr, calculateLoanBreakdown } from '../../utils/currency';
import { getTierForScore, getNextMilestone, EXPLAINABLE_FACTORS } from '../../utils/scoreEngine';
import { PurposeCategory } from '../../types';

export const BorrowerDashboard: React.FC = () => {
  const { 
    currentUser, 
    creditScore, 
    creditHistory, 
    loans, 
    repayLoan, 
    requestLoan, 
    currentKyc, 
    setActiveTab, 
    showNotification 
  } = useApp();

  const activeLoan = loans.find(
    l => l.borrowerId === currentUser.id && ['ACTIVE', 'MATCHING', 'PARTIALLY_FUNDED', 'PAYMENT_DUE'].includes(l.status)
  );

  const completedLoans = loans.filter(
    l => l.borrowerId === currentUser.id && l.status === 'COMPLETED'
  );

  const tierInfo = getTierForScore(creditScore.score);
  const nextMilestone = getNextMilestone(creditScore.score);

  // New Loan Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [purposeCategory, setPurposeCategory] = useState<PurposeCategory>('MEDICAL');
  const [purposeDescription, setPurposeDescription] = useState('');
  const [requestedAmountNpr, setRequestedAmountNpr] = useState(4000);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);

  // Repayment Modal State
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);

  const availableLimitPaisa = Math.max(0, creditScore.maxLimitPaisa - (activeLoan ? activeLoan.amountRequestedPaisa : 0));
  const maxAvailableNpr = availableLimitPaisa / 100;

  const currentBreakdown = activeLoan ? calculateLoanBreakdown(activeLoan.amountRequestedPaisa) : null;
  const newLoanBreakdown = calculateLoanBreakdown(requestedAmountNpr * 100);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purposeDescription.trim()) {
      showNotification('Please briefly describe the emergency purpose', 'error');
      return;
    }
    setIsSubmittingLoan(true);
    try {
      await requestLoan({
        purposeCategory,
        purposeDescription,
        amountRequestedPaisa: requestedAmountNpr * 100,
        tenureDays: 30,
      });
      setIsRequestModalOpen(false);
      setPurposeDescription('');
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const handleRepay = async () => {
    if (!activeLoan) return;
    setIsRepaying(true);
    try {
      await repayLoan(activeLoan.id);
      setIsRepayModalOpen(false);
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsRepaying(false);
    }
  };

  if (!currentKyc || currentKyc.status !== 'VERIFIED') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border border-amber-200 rounded-3xl p-10 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5 text-amber-700">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900">Verification Required</h2>
          <p className="text-stone-600 text-sm mt-3 mb-8 leading-relaxed">
            To protect peer lenders and adhere to student verification policy, you must submit your national identity and university enrollment first.
          </p>
          <button
            onClick={() => setActiveTab('KYC_WIZARD')}
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-sm shadow-amber-400/20 cursor-pointer transition-all hover:scale-[1.02]"
          >
            Complete KYC Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">Welcome, {currentUser.fullName}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Verified Student
            </span>
          </div>
          <p className="text-stone-500 text-xs mt-2">
            Institute: <span className="font-semibold text-stone-700">Tribhuvan University — IOE Pulchowk</span> • Single active loan policy enforced.
          </p>
        </div>

        <div>
          {!activeLoan ? (
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-sm shadow-amber-400/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Request Emergency Loan</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRepayModalOpen(true)}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-md shadow-amber-400/25 flex items-center gap-2 transition-all cursor-pointer animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-stone-950 stroke-[2.2]" />
              <span>Settle & Repay Active Loan</span>
            </button>
          )}
        </div>
      </div>

      {/* Credit Ladder & Limit Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Aafno Trust Score Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Aafno Trust Score</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${tierInfo.badgeColor}`}>
                Tier {tierInfo.tier}: {tierInfo.label}
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-5xl font-black text-stone-900 tracking-tight">{creditScore.score}</span>
              <span className="text-sm font-bold text-stone-400">/ 100</span>
            </div>

            {/* Score Bar */}
            <div className="mt-4">
              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-amber-400 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${creditScore.score}%` }}
                />
              </div>
            </div>

            {nextMilestone && (
              <p className="text-xs text-stone-500 mt-3 font-medium">
                Need <span className="font-extrabold text-amber-800">+{nextMilestone.pointsNeeded} pts</span> to reach next tier (NPR {(nextMilestone.nextLimitPaisa / 100).toLocaleString()}).
              </p>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Score Model: Platform Risk Indicator</span>
            <span className="text-stone-600 font-medium">Explainable</span>
          </div>
        </div>

        {/* Current Borrowing Limit Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Maximum Approved Limit</span>
            <div className="mt-5">
              <span className="text-4xl font-black text-stone-900 tracking-tight">
                {paisaToNpr(creditScore.maxLimitPaisa)}
              </span>
              <span className="block text-xs text-amber-800 font-bold mt-2">
                Progression cap up to NPR 10,000.00
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>Starting Cap: NPR 4,000</span>
            <span className="font-bold text-stone-900">Absolute: NPR 10,000</span>
          </div>
        </div>

        {/* Available Credit Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Available Emergency Credit</span>
            <div className="mt-5">
              <span className="text-4xl font-black text-amber-700 tracking-tight">
                {paisaToNpr(availableLimitPaisa)}
              </span>
              <span className="block text-xs text-stone-500 mt-2 font-medium">
                {activeLoan ? 'Restricted: 1 active loan policy' : 'Ready to request immediately'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>Active Debt:</span>
            <span className="font-bold text-stone-900">
              {activeLoan ? paisaToNpr(activeLoan.amountRequestedPaisa) : 'NPR 0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Active Loan Section */}
      {activeLoan && currentBreakdown && (
        <div className="bg-white rounded-3xl border border-amber-300 shadow-sm overflow-hidden">
          <div className="bg-amber-50/80 text-stone-900 p-8 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-200/80 text-amber-900 rounded-2xl">
                <Coins className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-stone-900">Active Emergency Loan #{activeLoan.id.slice(-6)}</h2>
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-300 text-stone-950">
                    {activeLoan.status}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">Category: {activeLoan.purposeCategory} • {activeLoan.purposeDescription}</p>
              </div>
            </div>

            <button
              onClick={() => setIsRepayModalOpen(true)}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Repay via Demo Gateway
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-white">
            <div>
              <span className="text-xs text-stone-400 font-semibold block">Principal Disbursed</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{paisaToNpr(currentBreakdown.principalPaisa)}</span>
            </div>

            <div>
              <span className="text-xs text-stone-400 font-semibold block">Fixed Facility Fee (6%)</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{paisaToNpr(currentBreakdown.facilityFeePaisa)}</span>
            </div>

            <div>
              <span className="text-xs text-stone-400 font-semibold block">Total Due at Repayment</span>
              <span className="text-2xl font-black text-amber-800 mt-1 block">{paisaToNpr(currentBreakdown.totalRepaymentPaisa)}</span>
            </div>

            <div>
              <span className="text-xs text-stone-400 font-semibold block">Due Date (30 Days)</span>
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base mt-1">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{activeLoan.dueDate ? new Date(activeLoan.dueDate).toLocaleDateString() : '30 Days'}</span>
              </div>
            </div>
          </div>

          {/* Transparent Fee Disclosure */}
          <div className="px-8 py-5 bg-[#fdfcfa] border-t border-stone-100 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-4">
            <span className="font-bold text-stone-800">Transparent 6% Breakdown:</span>
            <div className="flex items-center gap-6 flex-wrap">
              <span>Lender Return (4%): <strong className="text-stone-900 font-extrabold">{paisaToNpr(currentBreakdown.lenderYieldPaisa)}</strong></span>
              <span>Platform Reserve (1%): <strong className="text-stone-900 font-bold">{paisaToNpr(currentBreakdown.platformReservePaisa)}</strong></span>
              <span>Student Relief Fund (1%): <strong className="text-stone-900 font-bold">{paisaToNpr(currentBreakdown.universityFundPaisa)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Credit Building History & Score Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Factors */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-amber-700 stroke-[2.2]" />
            <span>How Your Aafno Trust Score Grows</span>
          </h2>
          <div className="space-y-3.5">
            {EXPLAINABLE_FACTORS.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
                <div>
                  <p className="text-xs font-bold text-stone-900">{item.factor}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{item.description}</p>
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${
                  item.impact.startsWith('+') ? 'bg-amber-100 text-amber-950' : 'bg-rose-50 text-rose-800'
                }`}>
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Score History */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs">
          <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-stone-700" />
            <span>Score Audit Ledger</span>
          </h2>
          {creditHistory.length === 0 ? (
            <p className="text-xs text-stone-400 py-12 text-center">No score changes recorded yet.</p>
          ) : (
            <div className="space-y-3.5">
              {creditHistory.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-stone-50/70 border border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-900">{item.reason}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-800">+{item.delta} pts</span>
                    <span className="text-[10px] text-stone-400 block font-medium">{item.previousScore} → {item.newScore}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REQUEST LOAN MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-5 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900">Request Emergency Credit</h3>
                <p className="text-xs text-stone-500 mt-0.5">Listed on peer marketplace for verified peer lenders</p>
              </div>
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Emergency Category
                </label>
                <select
                  value={purposeCategory}
                  onChange={(e) => setPurposeCategory(e.target.value as PurposeCategory)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                  <option value="RENT">Emergency Rent Shortfall</option>
                  <option value="FOOD">Food & Groceries</option>
                  <option value="MEDICAL">Medical & Urgent Health</option>
                  <option value="EDUCATION">Educational Books & Exam Fees</option>
                  <option value="TRANSPORT">Transportation</option>
                  <option value="UTILITIES">Utility Bills</option>
                  <option value="OTHER">Other Short-Term Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Amount Needed: <strong className="text-stone-900 font-extrabold">NPR {requestedAmountNpr.toLocaleString()}</strong>
                </label>
                <input
                  type="range"
                  min="500"
                  max={Math.min(creditScore.maxLimitPaisa / 100, 10000)}
                  step="500"
                  value={requestedAmountNpr}
                  onChange={(e) => setRequestedAmountNpr(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-stone-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1.5 font-medium">
                  <span>Min: NPR 500</span>
                  <span>Approved Limit: NPR {(creditScore.maxLimitPaisa / 100).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Purpose Description (Privacy-safe details for lenders)
                </label>
                <textarea
                  placeholder="e.g. Urgent prescription medication required after emergency clinic visit"
                  value={purposeDescription}
                  onChange={(e) => setPurposeDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* Fee Breakdown Box */}
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60 text-xs space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Principal:</span>
                  <span className="font-bold text-stone-900">{paisaToNpr(newLoanBreakdown.principalPaisa)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Total Fixed Fee (6% for 30 days):</span>
                  <span className="font-bold text-stone-900">{paisaToNpr(newLoanBreakdown.facilityFeePaisa)}</span>
                </div>
                <div className="flex justify-between text-amber-950 font-extrabold pt-2 border-t border-amber-200/60">
                  <span>Total Repayment:</span>
                  <span>{paisaToNpr(newLoanBreakdown.totalRepaymentPaisa)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLoan}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  {isSubmittingLoan ? 'Listing...' : 'Confirm & Post to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPAYMENT MODAL */}
      {isRepayModalOpen && activeLoan && currentBreakdown && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-stone-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="text-2xl font-extrabold text-stone-900">Settle Emergency Loan</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Demo Payment Gateway: Dispatches 4% yield to lenders and triggers credit score jump
              </p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs space-y-2.5 mb-6">
              <div className="flex justify-between">
                <span className="text-stone-500">Loan ID:</span>
                <span className="font-mono font-bold text-stone-800">{activeLoan.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Principal:</span>
                <span className="font-semibold text-stone-800">{paisaToNpr(currentBreakdown.principalPaisa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">6% Emergency Fee:</span>
                <span className="font-semibold text-stone-800">{paisaToNpr(currentBreakdown.facilityFeePaisa)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2.5 border-t border-stone-200">
                <span>Total Due:</span>
                <span className="text-amber-800">{paisaToNpr(currentBreakdown.totalRepaymentPaisa)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 text-xs text-amber-950">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Credit Upgrade Incentive:
              </p>
              <p className="mt-1 leading-relaxed text-amber-900">
                Settling on time will add <strong>+10 points</strong> to your Aafno Trust Score and unlock <strong>NPR 8,000</strong> Tier 3 limit!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsRepayModalOpen(false)}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRepay}
                disabled={isRepaying}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                {isRepaying ? 'Processing Ledger...' : 'Confirm Repayment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
