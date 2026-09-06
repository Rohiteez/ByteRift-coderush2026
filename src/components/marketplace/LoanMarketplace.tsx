import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LoanRequest } from '../../types';
import { 
  ShieldCheck, 
  Coins, 
  Search, 
  GraduationCap, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { paisaToNpr, calculateLoanBreakdown } from '../../utils/currency';
import { getTierForScore } from '../../utils/scoreEngine';

export const LoanMarketplace: React.FC = () => {
  const { 
    loans, 
    currentUser, 
    lenderBalance, 
    fundLoan, 
    setActiveTab, 
    switchUser, 
    showNotification 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [fundingLoan, setFundingLoan] = useState<LoanRequest | null>(null);
  const [fundingAmountNpr, setFundingAmountNpr] = useState<number>(1000);
  const [agreementConsent, setAgreementConsent] = useState(true);
  const [isSubmittingFunding, setIsSubmittingFunding] = useState(false);

  const openLoans = loans.filter(l => ['MATCHING', 'PARTIALLY_FUNDED'].includes(l.status));
  const filteredLoans = selectedCategory === 'ALL' 
    ? openLoans 
    : openLoans.filter(l => l.purposeCategory === selectedCategory);

  const handleOpenFundModal = (loan: LoanRequest) => {
    // If current user is borrower, prompt to switch to lender demo persona!
    if (currentUser.role !== 'LENDER') {
      showNotification('Switched demo persona to Sunita Thapa (Verified Lender) to fund loans', 'info');
      switchUser('usr-lender-1');
    }
    const remainingNpr = (loan.amountRequestedPaisa - loan.amountFundedPaisa) / 100;
    setFundingLoan(loan);
    setFundingAmountNpr(remainingNpr);
  };

  const handleConfirmFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingLoan) return;
    if (!agreementConsent) {
      showNotification('You must accept the digital peer loan terms', 'error');
      return;
    }

    const amountPaisa = fundingAmountNpr * 100;
    setIsSubmittingFunding(true);
    try {
      await fundLoan(fundingLoan.id, amountPaisa);
      setFundingLoan(null);
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmittingFunding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="px-3.5 py-1 bg-amber-100 text-amber-950 border border-amber-200/80 rounded-full text-xs font-bold uppercase tracking-wider">
            Verified Student P2P Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-3 tracking-tight">
            Emergency Credit Marketplace
          </h1>
          <p className="text-xs text-stone-500 mt-2 max-w-2xl leading-relaxed">
            Fund emergency micro-loans for verified university students. All students have completed national KYC and institutional enrollment verification. Returns fixed at 4% for 30-day term.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50/80 border border-amber-200/80 px-5 py-3 rounded-2xl text-right">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Your Available Capital</span>
            <span className="text-lg font-black text-stone-900">{paisaToNpr(lenderBalance)}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 text-xs font-bold text-stone-600">
        <span className="text-stone-400 mr-2 flex items-center gap-1.5 font-medium">
          <Filter className="w-3.5 h-3.5 text-stone-400" /> Filter:
        </span>
        {['ALL', 'RENT', 'MEDICAL', 'EDUCATION', 'FOOD', 'UTILITIES'].map((cat) => {
          const count = cat === 'ALL'
            ? openLoans.length
            : openLoans.filter(l => l.purposeCategory === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-stone-950 font-extrabold shadow-xs border border-amber-400'
                  : 'bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loans Grid */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">All Current Requests Funded!</h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            All listed student loans in this category have achieved full funding.
          </p>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className="mt-5 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            View Other Available Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLoans.map((loan) => {
            const fundedPercent = Math.round((loan.amountFundedPaisa / loan.amountRequestedPaisa) * 100);
            const remainingPaisa = loan.amountRequestedPaisa - loan.amountFundedPaisa;
            const breakdown = calculateLoanBreakdown(loan.amountRequestedPaisa);
            const tier = getTierForScore(loan.aafnoScore);

            return (
              <div 
                key={loan.id}
                className="bg-white rounded-3xl border border-stone-200/80 hover:border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-8">
                  {/* Top Pseudonym & Privacy-Safe Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-stone-800">
                        <GraduationCap className="w-5 h-5 text-amber-800" />
                      </span>
                      <div>
                        <span className="text-sm font-extrabold text-stone-900 block">{loan.borrowerPseudonym}</span>
                        <span className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-700 stroke-[2.2]" /> Verified Student
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${tier.badgeColor}`}>
                      Score {loan.aafnoScore}
                    </span>
                  </div>

                  {/* University & Purpose */}
                  <div className="mt-4 space-y-1">
                    <p className="text-xs font-bold text-stone-800">{loan.universityName}</p>
                    <p className="text-[11px] text-stone-400 font-medium">{loan.faculty}</p>
                  </div>

                  <div className="mt-5 p-4 bg-[#faf9f6] rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-1">
                      Emergency Purpose: {loan.purposeCategory}
                    </span>
                    <p className="text-xs text-stone-700 line-clamp-2 italic leading-relaxed">
                      "{loan.purposeDescription}"
                    </p>
                  </div>

                  {/* Funding Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">Funded: <strong className="text-stone-900 font-extrabold">{paisaToNpr(loan.amountFundedPaisa)}</strong></span>
                      <span className="font-black text-amber-800">{fundedPercent}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-2.5 rounded-full transition-all"
                        style={{ width: `${fundedPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-400 font-medium">
                      <span>Goal: {paisaToNpr(loan.amountRequestedPaisa)}</span>
                      <span>Left: {paisaToNpr(remainingPaisa)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Return & CTA */}
                <div className="px-8 py-5 bg-[#fdfcfa] border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Expected Return (4%)</span>
                    <span className="text-sm font-black text-amber-800">+{paisaToNpr(breakdown.lenderYieldPaisa)}</span>
                  </div>

                  <button
                    onClick={() => handleOpenFundModal(loan)}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Fund Request</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FUND LOAN MODAL */}
      {fundingLoan && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-5 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900">Fund Peer Emergency Loan</h3>
                <p className="text-xs text-stone-500 mt-0.5">{fundingLoan.borrowerPseudonym} • {fundingLoan.universityName}</p>
              </div>
              <button 
                onClick={() => setFundingLoan(null)}
                className="text-stone-400 hover:text-stone-800 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmFund} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Amount to Fund: <strong className="text-stone-900 font-extrabold">NPR {fundingAmountNpr.toLocaleString()}</strong>
                </label>
                <input
                  type="range"
                  min="500"
                  max={(fundingLoan.amountRequestedPaisa - fundingLoan.amountFundedPaisa) / 100}
                  step="500"
                  value={fundingAmountNpr}
                  onChange={(e) => setFundingAmountNpr(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-stone-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1.5 font-medium">
                  <span>Min: NPR 500</span>
                  <span>Remaining Goal: {paisaToNpr(fundingLoan.amountRequestedPaisa - fundingLoan.amountFundedPaisa)}</span>
                </div>
              </div>

              {/* Real-Time Return Calculation */}
              <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 text-xs space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Your Investment:</span>
                  <span className="font-bold text-stone-900">NPR {fundingAmountNpr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Fixed Return (4% for 30 days):</span>
                  <span className="font-black text-amber-800">
                    +{paisaToNpr(Math.round((fundingAmountNpr * 100 * 400) / 10000))}
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold pt-2 border-t border-amber-200">
                  <span>Total Payout to Your Wallet:</span>
                  <span className="text-amber-950">{paisaToNpr(Math.round((fundingAmountNpr * 100 * 10400) / 10000))}</span>
                </div>
              </div>

              {/* Digital Loan Agreement Checkbox */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreementConsent}
                    onChange={(e) => setAgreementConsent(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
                  />
                  <span className="text-stone-600 leading-relaxed">
                    I accept the <strong className="text-stone-900">Digital Peer Promissory Agreement</strong> (v1.0.0). I understand micro-lending carries risk and is protected by the Institutional Reserve Allocation.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFundingLoan(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFunding}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  {isSubmittingFunding ? 'Registering Ledger...' : 'Confirm & Disburse Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
