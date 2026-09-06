import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { paisaToNpr } from '../../utils/currency';

export const LenderDashboard: React.FC = () => {
  const { currentUser, lenderBalance, loans, setActiveTab } = useApp();

  // Find all loans funded by this lender
  const myFundedLoans = loans.filter(l => 
    l.funders.some(f => f.lenderId === currentUser.id)
  );

  const totalLentPaisa = myFundedLoans.reduce((sum, loan) => {
    const myShare = loan.funders
      .filter(f => f.lenderId === currentUser.id)
      .reduce((s, f) => s + f.amountFundedPaisa, 0);
    return sum + myShare;
  }, 0);

  const totalEarnedReturnPaisa = myFundedLoans
    .filter(l => l.status === 'COMPLETED')
    .reduce((sum, loan) => {
      const myReturn = loan.funders
        .filter(f => f.lenderId === currentUser.id)
        .reduce((s, f) => s + f.expectedReturnPaisa, 0);
      return sum + myReturn;
    }, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">Lender Portfolio — {currentUser.fullName}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 stroke-[2.2]" /> Verified Peer Lender
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Empower college scholars with ethical micro-loans while earning a fixed 4% yield per 30-day term.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-xs font-extrabold shadow-sm shadow-amber-400/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Coins className="w-4 h-4 stroke-[2.2]" />
          <span>Browse Loan Requests</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Available Lending Wallet</span>
            <div className="mt-5">
              <span className="text-4xl font-black text-stone-900 tracking-tight">
                {paisaToNpr(lenderBalance)}
              </span>
              <span className="block text-xs text-amber-800 font-bold mt-2">Liquid capital ready for funding</span>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500 flex justify-between">
            <span>Payment Rail:</span>
            <span className="font-bold text-stone-800">Demo Gateway (eSewa / Khalti)</span>
          </div>
        </div>

        {/* Total Deployed */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Capital Deployed</span>
            <div className="mt-5">
              <span className="text-4xl font-black text-stone-900 tracking-tight">
                {paisaToNpr(totalLentPaisa)}
              </span>
              <span className="block text-xs text-stone-500 font-medium mt-2">
                Across {myFundedLoans.length} student loan(s)
              </span>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500 flex justify-between">
            <span>Risk Protection:</span>
            <span className="font-bold text-amber-800">Platform Reserve Backed</span>
          </div>
        </div>

        {/* Returns Earned */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Return Yield Earned</span>
            <div className="mt-5">
              <span className="text-4xl font-black text-amber-800 tracking-tight">
                +{paisaToNpr(totalEarnedReturnPaisa)}
              </span>
              <span className="block text-xs text-stone-400 mt-2 font-medium">Fixed 4% yield credited upon settlement</span>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500 flex justify-between">
            <span>Settled Loans:</span>
            <span className="font-bold text-stone-900">
              {myFundedLoans.filter(l => l.status === 'COMPLETED').length} settled
            </span>
          </div>
        </div>
      </div>

      {/* My Funded Loans Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">My Funded Student Portfolio</h2>
            <p className="text-xs text-stone-500 mt-0.5">Live tracker of micro-credit funded by your account</p>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-950 border border-amber-200/80 rounded-xl text-xs font-bold">
            {myFundedLoans.length} Investment(s)
          </span>
        </div>

        {myFundedLoans.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs">
            You have not funded any student loans yet. Head over to the P2P Marketplace to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
                <tr>
                  <th className="px-8 py-4">Student / Purpose</th>
                  <th className="px-8 py-4">University</th>
                  <th className="px-8 py-4">Amount Funded</th>
                  <th className="px-8 py-4">Expected Return (4%)</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myFundedLoans.map((loan) => {
                  const myFunderRecord = loan.funders.find(f => f.lenderId === currentUser.id);
                  const fundedAmount = myFunderRecord ? myFunderRecord.amountFundedPaisa : loan.amountFundedPaisa;
                  const myReturn = myFunderRecord ? myFunderRecord.expectedReturnPaisa : Math.round((fundedAmount * 400) / 10000);

                  return (
                    <tr key={loan.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <span className="font-extrabold text-stone-900 block">{loan.borrowerPseudonym}</span>
                        <span className="text-[11px] text-stone-500 mt-0.5 block">{loan.purposeCategory}: {loan.purposeDescription}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-stone-800 font-semibold block">{loan.universityName}</span>
                        <span className="text-[10px] text-stone-400">{loan.faculty}</span>
                      </td>
                      <td className="px-8 py-5 font-bold text-stone-900">
                        {paisaToNpr(fundedAmount)}
                      </td>
                      <td className="px-8 py-5 font-black text-amber-800">
                        +{paisaToNpr(myReturn)}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          loan.status === 'COMPLETED'
                            ? 'bg-stone-100 text-stone-800'
                            : loan.status === 'ACTIVE'
                            ? 'bg-amber-200 text-amber-950 font-extrabold'
                            : 'bg-yellow-100 text-yellow-900'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-stone-500 font-medium">
                        {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '30 Days'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
