// Financial precision utilities: All currency arithmetic is performed in minor units (Paisa).
// 1 NPR = 100 Paisa. Floating-point math is strictly forbidden for money storage.

export function paisaToNpr(paisa: number): string {
  const npr = paisa / 100;
  return `NPR ${npr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function paisaToNprShort(paisa: number): string {
  const npr = paisa / 100;
  return `NPR ${npr.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100);
}

export interface LoanBreakdown {
  principalPaisa: number;
  facilityFeePaisa: number;       // 6%
  totalRepaymentPaisa: number;    // Principal + 6%
  lenderYieldPaisa: number;       // 4%
  platformReservePaisa: number;   // 1%
  universityFundPaisa: number;    // 1%
}

export function calculateLoanBreakdown(
  principalPaisa: number,
  facilityFeeBps: number = 600, // 6.00%
  lenderYieldBps: number = 400  // 4.00%
): LoanBreakdown {
  const facilityFeePaisa = Math.round((principalPaisa * facilityFeeBps) / 10000);
  const totalRepaymentPaisa = principalPaisa + facilityFeePaisa;
  const lenderYieldPaisa = Math.round((principalPaisa * lenderYieldBps) / 10000);
  
  // Remaining 2% split equally between platform operations/reserve and university relief fund
  const platformReservePaisa = Math.round((principalPaisa * 100) / 10000); // 1.00%
  const universityFundPaisa = facilityFeePaisa - lenderYieldPaisa - platformReservePaisa; // remaining ~1.00%

  return {
    principalPaisa,
    facilityFeePaisa,
    totalRepaymentPaisa,
    lenderYieldPaisa,
    platformReservePaisa,
    universityFundPaisa,
  };
}

/**
 * Deterministic Hamilton-Hare (Largest Remainder) split for distributing
 * repayment paisa to partial funders without rounding leaks.
 */
export function calculateProportionalPayout(
  repaymentPaisa: number,
  funders: { id: string; amountFundedPaisa: number }[],
  totalPrincipalPaisa: number
): { id: string; payoutPaisa: number }[] {
  if (funders.length === 0) return [];
  if (funders.length === 1) return [{ id: funders[0].id, payoutPaisa: repaymentPaisa }];

  let allocatedPaisa = 0;
  const rawShares = funders.map(f => {
    const raw = (repaymentPaisa * f.amountFundedPaisa) / totalPrincipalPaisa;
    const floor = Math.floor(raw);
    const remainder = raw - floor;
    allocatedPaisa += floor;
    return { id: f.id, floor, remainder };
  });

  let remainingPaisa = repaymentPaisa - allocatedPaisa;
  // Sort descending by remainder to distribute remaining paisas
  rawShares.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < remainingPaisa; i++) {
    rawShares[i].floor += 1;
  }

  return rawShares.map(s => ({ id: s.id, payoutPaisa: s.floor }));
}
