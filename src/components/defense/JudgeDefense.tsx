import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  Database, 
  AlertTriangle, 
  FileCode, 
  Layers, 
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const JudgeDefense: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'QA' | 'LOOPHOLES' | 'SCHEMA' | 'API'>('QA');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: '1. Why would a lender trust a student who has no collateral?',
      a: 'Lenders trust students because risk is heavily restricted and mathematically managed: (1) Initial loans are capped at only NPR 4,000; (2) Identity is verified through government records and active university enrollment; (3) 1% of every loan transaction feeds an Institutional Reserve Guarantee Fund to buffer lenders in verified hardship cases; (4) Failure to repay triggers academic holds and platform ban.'
    },
    {
      q: '2. What happens if the borrower defaults?',
      a: 'We never employ predatory or illegal collection practices. When a student defaults: (1) Late fees are strictly capped at 10% of principal (no usurious compound debt traps); (2) Their Aafno Trust Score drops by 50 points, completely freezing further borrowing; (3) The University Academic Registry Oracle flags an "Academic Clearance Hold" requiring student financial counseling before official degree transcripts are cleared; (4) The lender is partially reimbursed from the platform reserve fund.'
    },
    {
      q: '3. Why start at NPR 4,000?',
      a: 'NPR 4,000 is intentionally calibrated: it is large enough to solve immediate, legitimate student emergencies (e.g. food, inhalers/prescriptions, public transport pass, utility cutoff) without saddling an unbanked student with unmanageable debt. It also ensures that a first-time default does not break a peer lender.'
    },
    {
      q: '4. How does the credit score increase?',
      a: 'Through transparent, explainable factors: +30 points upon initial KYC & university verification; +10 points for on-time loan repayment; +12 points for early settlement. Scores cannot be artificially inflated through rapid wash borrowing because of a 7-day minimum tenure requirement and a 14-day score cooldown between loans.'
    },
    {
      q: '5. Why should someone lend money instead of keeping it in a bank or digital wallet?',
      a: 'Digital wallets in Nepal typically yield 0% interest, while commercial bank savings accounts yield 3–5% annually. Aafno Pay offers a 4% fixed return on a 30-day term, delivering an attractive yield while enabling direct, tangible social impact within the collegiate ecosystem.'
    },
    {
      q: '6. How do you prevent fake students?',
      a: 'By combining two independent data sources: (1) Government National Identity (Citizenship / NID) KYC; (2) Live query against the partner University Academic Registry Oracle validating enrollment status, active semester registration, and good standing.'
    },
    {
      q: '7. How do you prevent multiple accounts (Sybil attacks)?',
      a: 'We generate and index salted SHA-256 cryptographic hashes of Government Citizenship Numbers and University Registration Roll Numbers. Database UNIQUE constraints reject duplicate registrations with 409 CONFLICT, preventing banned students from resetting their score under new emails.'
    },
    {
      q: '8. What happens if someone borrows from multiple lenders simultaneously?',
      a: 'The system enforces a strict single-active-loan rule. A borrower cannot request a new loan or accept funding while any loan is in REQUESTED, MATCHING, PARTIALLY_FUNDED, or ACTIVE status.'
    },
    {
      q: '9. How does Aafno Pay earn money and sustain operations?',
      a: 'From the 2% spread between the 6% total facility fee paid by the borrower and the 4% yield earned by the lender. 1% funds platform cloud infrastructure, security, and operations, while 1% accumulates in the mutual University Student Relief & Guarantee Fund.'
    },
    {
      q: '10. Can you legally seize university security deposits or tuition fees?',
      a: 'No. Seizing tuition without legal mandate is illegal. We explicitly do not treat student IDs or university deposits as seized collateral. Instead, institutional collaboration operates on academic clearance flags and mutual revolving relief endowments.'
    },
    {
      q: '11. How do you prevent P2P funding race conditions?',
      a: 'With pessimistic database row locking (SELECT ... FOR UPDATE) and table-level CHECK constraints (amount_funded_paisa <= amount_requested_paisa) inside atomic transactions. If two lenders fund simultaneously, the second transaction is safely rejected with a concurrency conflict.'
    },
    {
      q: '12. How do you prevent double repayment or duplicate charges?',
      a: 'Every payment mutation requires a unique UUID Idempotency-Key header. The transaction ledger checks for prior execution of that idempotency key before performing balance deductions or state changes.'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="px-4 py-1.5 bg-amber-100 text-amber-950 rounded-full text-xs font-bold uppercase tracking-wider">
            Fintech Architecture & Defense
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-3 tracking-tight">
            System Rigor, Vulnerability Matrix & Judge Defense
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-2xl leading-relaxed">
            Complete technical documentation, mathematical proof, database schema, and defense answers for hackathon evaluation.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#f4f2ea] p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('QA')}
            className={`px-4 py-2 rounded-xl transition-all ${activeSubTab === 'QA' ? 'bg-amber-400 text-stone-950 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Judge Q&A (Defense)
          </button>
          <button
            onClick={() => setActiveSubTab('LOOPHOLES')}
            className={`px-4 py-2 rounded-xl transition-all ${activeSubTab === 'LOOPHOLES' ? 'bg-amber-400 text-stone-950 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            14-Point Vulnerability Audit
          </button>
          <button
            onClick={() => setActiveSubTab('SCHEMA')}
            className={`px-4 py-2 rounded-xl transition-all ${activeSubTab === 'SCHEMA' ? 'bg-amber-400 text-stone-950 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Relational DDL
          </button>
          <button
            onClick={() => setActiveSubTab('API')}
            className={`px-4 py-2 rounded-xl transition-all ${activeSubTab === 'API' ? 'bg-amber-400 text-stone-950 shadow-xs font-extrabold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            API Contract
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Judge Q&A */}
      {activeSubTab === 'QA' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-10 space-y-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span>Core Evaluation Questions & Transparent Defenses</span>
          </h2>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div key={index} className="border border-stone-200/80 rounded-2xl overflow-hidden transition-colors shadow-2xs">
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 bg-[#fdfcfa] hover:bg-amber-50/50 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-900 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-amber-600 shrink-0 ml-3" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-3" />}
                  </button>
                  {isOpen && (
                    <div className="p-5 text-xs sm:text-sm text-stone-600 leading-relaxed bg-white border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: 14-Point Vulnerability Audit */}
      {activeSubTab === 'LOOPHOLES' && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-950 flex items-center gap-3 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Every vulnerability identified in Phase 1 has a corresponding software and cryptographic safeguard.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
              <span className="font-extrabold text-rose-700 uppercase tracking-wide block">1. Floating Point Drift</span>
              <p className="text-stone-600 leading-relaxed"><strong className="text-stone-800">Loophole:</strong> Micro-cent roundings break ledger balance reconciliation.</p>
              <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 leading-relaxed"><strong className="text-amber-900">Fix:</strong> Minor units (paisa integers) & Hamilton-Hare Largest Remainder split algorithm.</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
              <span className="font-extrabold text-rose-700 uppercase tracking-wide block">2. P2P Funding Race Conditions</span>
              <p className="text-stone-600 leading-relaxed"><strong className="text-stone-800">Loophole:</strong> Concurrent lenders overfund the same loan beyond requested goal.</p>
              <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 leading-relaxed"><strong className="text-amber-900">Fix:</strong> DB row locks (SELECT ... FOR UPDATE) and table CHECK constraints.</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
              <span className="font-extrabold text-rose-700 uppercase tracking-wide block">3. Multi-Account Sybil Evasion</span>
              <p className="text-stone-600 leading-relaxed"><strong className="text-stone-800">Loophole:</strong> Defaulted user signs up with new email to get fresh NPR 4K.</p>
              <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 leading-relaxed"><strong className="text-amber-900">Fix:</strong> Salted SHA-256 unique constraints on National ID and University Roll numbers.</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
              <span className="font-extrabold text-rose-700 uppercase tracking-wide block">4. Wash Lending Score Pumping</span>
              <p className="text-stone-600 leading-relaxed"><strong className="text-stone-800">Loophole:</strong> Friend lends & borrower repays in 10 mins repeatedly to jump to Tier 4.</p>
              <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 leading-relaxed"><strong className="text-amber-900">Fix:</strong> Minimum 7-day active tenure rule and 14-day cooldown between loans.</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
              <span className="font-extrabold text-rose-700 uppercase tracking-wide block">5. Privacy Leaks on Marketplace</span>
              <p className="text-stone-600 leading-relaxed"><strong className="text-stone-800">Loophole:</strong> Student medical issues, citizenship cards, or phone numbers exposed.</p>
              <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 leading-relaxed"><strong className="text-amber-900">Fix:</strong> Pseudonymization ("Student #8492") and strict DTO data minimization.</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
              <span className="font-extrabold text-rose-700 uppercase tracking-wide block">6. Duplicate Repayment Webhooks</span>
              <p className="text-stone-600 leading-relaxed"><strong className="text-stone-800">Loophole:</strong> Gateway webhook fires twice or user double-clicks Repay.</p>
              <p className="text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 leading-relaxed"><strong className="text-amber-900">Fix:</strong> Unique Idempotency-Key validation in the double-entry transaction ledger.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Relational DDL */}
      {activeSubTab === 'SCHEMA' && (
        <div className="bg-[#1c1917] rounded-3xl p-8 text-stone-200 text-xs font-mono overflow-x-auto border border-stone-800 shadow-sm">
          <div className="flex justify-between items-center text-amber-400 mb-5 pb-3 border-b border-stone-800 font-sans">
            <span className="font-bold">Production Relational Schema (PostgreSQL / SQLite)</span>
            <span className="text-stone-400 text-xs">Integer Paisa Units • Unique Constraints</span>
          </div>
          <pre className="text-stone-300 leading-relaxed">{`-- 1. USERS & ROLES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('BORROWER', 'LENDER', 'ADMIN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. KYC VERIFICATIONS (Separated sensitive document table)
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('CITIZENSHIP', 'NATIONAL_ID', 'PASSPORT')),
    doc_number_hash VARCHAR(64) UNIQUE NOT NULL, -- Salted hash prevents multi-account Sybils
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    front_doc_path TEXT NOT NULL,
    selfie_path TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. LOAN REQUESTS
CREATE TABLE loan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID NOT NULL REFERENCES users(id),
    purpose_category VARCHAR(50) NOT NULL,
    amount_requested_paisa BIGINT NOT NULL CHECK (amount_requested_paisa BETWEEN 50000 AND 1000000),
    amount_funded_paisa BIGINT NOT NULL DEFAULT 0,
    tenure_days INT NOT NULL DEFAULT 30,
    facility_fee_rate_bps INT NOT NULL DEFAULT 600, -- 6.00%
    lender_yield_rate_bps INT NOT NULL DEFAULT 400, -- 4.00%
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_not_overfunded CHECK (amount_funded_paisa <= amount_requested_paisa)
);`}</pre>
        </div>
      )}

      {/* SUBTAB 4: API Contract */}
      {activeSubTab === 'API' && (
        <div className="bg-[#1c1917] rounded-3xl p-8 text-stone-200 text-xs font-mono overflow-x-auto space-y-4 border border-stone-800 shadow-sm">
          <div className="text-amber-400 font-sans pb-3 border-b border-stone-800">
            <span className="font-bold">Standard API Response Envelopes</span>
          </div>
          <pre className="text-stone-300 leading-relaxed">{`// SUCCESS ENVELOPE (HTTP 200 / 201)
{
  "success": true,
  "data": {
    "loan_id": "loan-4892",
    "amount_requested_paisa": 400000,
    "facility_fee_paisa": 24000,
    "total_repayment_paisa": 424000,
    "status": "ACTIVE"
  },
  "message": "Loan successfully disbursed"
}

// ERROR ENVELOPE (HTTP 400 / 403 / 409)
{
  "success": false,
  "error": {
    "code": "LOAN_LIMIT_EXCEEDED",
    "message": "Requested amount exceeds your current Tier 2 borrowing limit of NPR 6,000.",
    "details": { "current_limit_paisa": 600000, "requested_paisa": 800000 }
  }
}`}</pre>
        </div>
      )}
    </div>
  );
};
