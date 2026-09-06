import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Lock, 
  Sparkles, 
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { paisaToNpr, calculateLoanBreakdown } from '../../utils/currency';

export const LandingPage: React.FC = () => {
  const { setActiveTab, switchUser } = useApp();
  const [calcAmountNpr, setCalcAmountNpr] = useState(4000);
  const breakdown = calculateLoanBreakdown(calcAmountNpr * 100);

  return (
    <div className="space-y-28 pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32 bg-gradient-to-b from-amber-50/40 via-white to-[#faf9f6] border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-950 text-xs font-extrabold uppercase tracking-wider mb-8 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-700 stroke-[2.2]" />
            <span>Ethical Student Micro-Lending Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Small emergencies shouldn’t become big financial problems.
          </h1>

          <p className="mt-8 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Aafno Pay connects verified university scholars with peer lenders for small, dignified emergency credit—starting at NPR 4,000 and growing up to NPR 10,000 as you build trust. No traditional collateral required.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                switchUser('usr-new-student');
                setActiveTab('KYC_WIZARD');
              }}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-md shadow-amber-400/25 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>I am a Student (Start KYC)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                switchUser('usr-lender-1');
                setActiveTab('MARKETPLACE');
              }}
              className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-2xl text-sm font-bold shadow-md shadow-stone-900/10 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Explore Marketplace as Lender</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Key Metric Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-left">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">NPR 4,000</span>
              <p className="text-xs text-stone-500 font-medium mt-1.5">Starting Borrower Cap</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-left">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">NPR 10,000</span>
              <p className="text-xs text-stone-500 font-medium mt-1.5">Maximum Credit Ladder</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-left">
              <span className="text-2xl sm:text-3xl font-black text-stone-800">Fixed 6%</span>
              <p className="text-xs text-stone-500 font-medium mt-1.5">Flat Facility Fee (30 Days)</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-left">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">Fixed 4%</span>
              <p className="text-xs text-stone-500 font-medium mt-1.5">Direct Lender Yield</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Fee & Loan Calculator */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100/70 px-3 py-1 rounded-full">
            Zero Hidden Fees
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3 tracking-tight">
            Transparent Flat Cost Calculator
          </h2>
          <p className="text-stone-500 text-sm max-w-xl mx-auto mt-2.5 leading-relaxed">
            No silent compounding. No confusing annual percentages. Exactly 6% fixed total facility cost for a 30-day emergency term.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Emergency Amount:</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">NPR {calcAmountNpr.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={calcAmountNpr}
                onChange={(e) => setCalcAmountNpr(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-stone-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-2 font-medium">
                <span>NPR 1,000</span>
                <span>NPR 10,000 (Max Limit)</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between text-sm py-2.5 border-b border-stone-100">
                <span className="text-stone-500">Principal Disbursed:</span>
                <span className="font-bold text-stone-900">{paisaToNpr(breakdown.principalPaisa)}</span>
              </div>
              <div className="flex justify-between text-sm py-2.5 border-b border-stone-100">
                <span className="text-stone-500">Total Fixed 6% Fee (30 Days):</span>
                <span className="font-bold text-stone-900">{paisaToNpr(breakdown.facilityFeePaisa)}</span>
              </div>
              <div className="flex justify-between text-base py-4 bg-amber-50 px-5 rounded-2xl text-amber-950 font-extrabold border border-amber-200/50">
                <span>Total Repayment Due:</span>
                <span className="text-amber-900 text-lg">{paisaToNpr(breakdown.totalRepaymentPaisa)}</span>
              </div>
            </div>
          </div>

          {/* Fee Distribution Card (Clean White & Amber) */}
          <div className="bg-[#fdfcfa] p-8 rounded-3xl border border-amber-200/70 space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 block">
                Open Ledger Allocation
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">
                Where does the 6% fee go?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Every paisa is deterministically accounted for in our open ledger:
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/70 shadow-2xs flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">4% Peer Lender Yield</span>
                  <span className="text-[11px] text-stone-500">Compensates peer for lending capital</span>
                </div>
                <span className="text-sm font-black text-amber-700">+{paisaToNpr(breakdown.lenderYieldPaisa)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/70 shadow-2xs flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">1% Aafno Platform Reserve</span>
                  <span className="text-[11px] text-stone-500">Buffers lender capital against hardship</span>
                </div>
                <span className="text-sm font-bold text-stone-700">{paisaToNpr(breakdown.platformReservePaisa)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/70 shadow-2xs flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">1% Student Relief Fund</span>
                  <span className="text-[11px] text-stone-500">Supports campus welfare grants</span>
                </div>
                <span className="text-sm font-bold text-stone-700">{paisaToNpr(breakdown.universityFundPaisa)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Behavioral Credit Escalator */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100/70 px-3 py-1 rounded-full">
            Building Financial Mobility
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3 tracking-tight">
            The Aafno Credit Ladder
          </h2>
          <p className="text-stone-500 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            No credit history? No problem. Every on-time repayment transparently increases your credit score and your emergency borrowing ceiling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700">Tier 1 • Score 0–49</span>
              <h3 className="text-lg font-bold text-stone-900 mt-4">New Scholar</h3>
              <div className="mt-5">
                <span className="text-3xl font-black text-stone-900">NPR 4,000</span>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">Starting limit for all verified students.</p>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-6 pt-4 border-t border-stone-100">Prerequisite: National ID & Campus Enrollment</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm relative flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900">Tier 2 • Score 50–69</span>
              <h3 className="text-lg font-bold text-stone-900 mt-4">Verified Reliable</h3>
              <div className="mt-5">
                <span className="text-3xl font-black text-stone-900">NPR 6,000</span>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">Unlocked after 1 successful clean repayment.</p>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-6 pt-4 border-t border-stone-100">Progression: +10 to +15 pts per on-time cycle</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-amber-300 shadow-sm relative flex flex-col justify-between bg-gradient-to-b from-amber-50/20 to-white">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-200 text-amber-950 font-extrabold">Tier 3 • Score 70–84</span>
              <h3 className="text-lg font-bold text-stone-900 mt-4">Trusted Scholar</h3>
              <div className="mt-5">
                <span className="text-3xl font-black text-amber-700">NPR 8,000</span>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">Reliable borrower with multiple settled loans.</p>
              </div>
            </div>
            <p className="text-[11px] text-amber-800 mt-6 pt-4 border-t border-amber-100 font-medium">Benefits: Priority marketplace matching</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-amber-400 shadow-md relative flex flex-col justify-between bg-gradient-to-b from-amber-50/40 to-white">
            <div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-amber-400 text-stone-950">Tier 4 • Score 85–100</span>
              <h3 className="text-lg font-bold text-stone-900 mt-4">Prime Honor Roll</h3>
              <div className="mt-5">
                <span className="text-3xl font-black text-stone-950">NPR 10,000</span>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">Maximum platform borrowing allowance.</p>
              </div>
            </div>
            <p className="text-[11px] text-amber-900 font-bold mt-6 pt-4 border-t border-amber-200/80">Top-tier borrower standing</p>
          </div>
        </div>
      </section>

      {/* Safety & Legal Disclaimers */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 text-xs text-stone-500 space-y-2.5 shadow-2xs">
          <p className="font-bold text-stone-800 text-sm">
            Technical Prototype Transparency Notice
          </p>
          <p className="leading-relaxed text-stone-500 max-w-2xl mx-auto">
            Aafno Pay is an experimental peer-to-peer micro-lending facilitation technology prototype. We do not claim official commercial banking licenses or government endorsements. Digital agreements and institutional integrations are structured for demonstration purposes under regulatory sandbox principles.
          </p>
        </div>
      </section>
    </div>
  );
};
