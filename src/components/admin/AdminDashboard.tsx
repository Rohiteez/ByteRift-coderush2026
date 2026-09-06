import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Lock,
  DollarSign
} from 'lucide-react';
import { paisaToNpr } from '../../utils/currency';

export const AdminDashboard: React.FC = () => {
  const { transactions, fraudAlerts, loans, allUsers } = useApp();

  const totalVolumePaisa = transactions
    .filter(t => t.type === 'DISBURSEMENT' || t.type === 'REPAYMENT')
    .reduce((sum, t) => sum + t.amountPaisa, 0);

  // Platform 1% & University 1% reserve estimate
  const platformReservePaisa = Math.round((totalVolumePaisa * 100) / 10000);
  const universityFundPaisa = Math.round((totalVolumePaisa * 100) / 10000);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">Admin Risk & Operations Console</h1>
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Real-time fraud heuristics, double-entry financial ledger audit trail, and institutional fund reserve monitor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-amber-100/80 text-amber-950 border border-amber-200/80 rounded-full text-xs font-extrabold flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-700" /> Strict RBAC Enforced
          </span>
        </div>
      </div>

      {/* Platform Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Disbursed & Settled</span>
          <span className="text-3xl font-black text-stone-900 mt-3 block">{paisaToNpr(totalVolumePaisa)}</span>
          <span className="text-xs text-stone-500 mt-1.5 block">Cumulative throughput</span>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Aafno Reserve Fund (1%)</span>
          <span className="text-3xl font-black text-amber-800 mt-3 block">{paisaToNpr(platformReservePaisa)}</span>
          <span className="text-xs text-stone-500 mt-1.5 block">Lender hardship pool</span>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Student Relief Share (1%)</span>
          <span className="text-3xl font-black text-stone-800 mt-3 block">{paisaToNpr(universityFundPaisa)}</span>
          <span className="text-xs text-stone-500 mt-1.5 block">Campus student relief pool</span>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Fraud Heuristics</span>
          <span className="text-3xl font-black text-stone-900 mt-3 block">{fraudAlerts.length} Flagged</span>
          <span className="text-xs text-stone-500 mt-1.5 block">Zero unresolved breaches</span>
        </div>
      </div>

      {/* Fraud Heuristics Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">Anti-Sybil & Fraud Prevention Log</h2>
          </div>
          <span className="text-xs text-stone-400">Internal rules hidden from public endpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f6] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
              <tr>
                <th className="px-8 py-4">Severity</th>
                <th className="px-8 py-4">Rule Code</th>
                <th className="px-8 py-4">Target Account</th>
                <th className="px-8 py-4">Incident Description</th>
                <th className="px-8 py-4">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {fraudAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-900'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-200 text-amber-950'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-mono font-bold text-stone-800">{alert.ruleCode}</td>
                  <td className="px-8 py-5 font-bold text-stone-900">{alert.userName}</td>
                  <td className="px-8 py-5 text-stone-600 max-w-md leading-relaxed">{alert.description}</td>
                  <td className="px-8 py-5 text-amber-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Automatically Blocked
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Transaction Ledger */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-700 stroke-[2.2]" />
            <h2 className="text-lg font-bold text-stone-900">Immutable Financial Ledger (Double-Entry Audit)</h2>
          </div>
          <span className="text-xs text-stone-400 font-mono">Integer Paisa Strict Accounting</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#faf9f6] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100 font-sans">
              <tr>
                <th className="px-8 py-4">Tx ID</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Sender</th>
                <th className="px-8 py-4">Receiver</th>
                <th className="px-8 py-4">Amount (Paisa / NPR)</th>
                <th className="px-8 py-4">Idempotency Key</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-8 py-5 font-bold text-stone-900">{tx.id}</td>
                  <td className="px-8 py-5 font-sans">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                      tx.type === 'DISBURSEMENT'
                        ? 'bg-amber-100 text-amber-950'
                        : tx.type === 'REPAYMENT'
                        ? 'bg-amber-200 text-amber-950'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-sans text-stone-700">{tx.senderName}</td>
                  <td className="px-8 py-5 font-sans text-stone-700">{tx.receiverName}</td>
                  <td className="px-8 py-5 font-bold text-stone-900">
                    {paisaToNpr(tx.amountPaisa)} ({tx.amountPaisa} p)
                  </td>
                  <td className="px-8 py-5 text-stone-400 truncate max-w-[140px]" title={tx.idempotencyKey}>
                    {tx.idempotencyKey}
                  </td>
                  <td className="px-8 py-5 font-sans">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-200">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
