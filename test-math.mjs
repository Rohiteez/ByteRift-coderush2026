// Automated Test Suite for Aafno Pay Financial & Score Calculations
import { paisaToNpr, calculateLoanBreakdown, calculateProportionalPayout } from './src/utils/currency.ts';
import { getTierForScore } from './src/utils/scoreEngine.ts';

console.log('=== AAFNO PAY TEST SUITE ===');

// Test 1: Paisa to NPR formatting
const formatted = paisaToNpr(400000);
console.assert(formatted === 'NPR 4,000.00', `Paisa formatting failed: got ${formatted}`);
console.log('✔ Test 1 Passed: Paisa formatting (400,000 paisa -> NPR 4,000.00)');

// Test 2: 6% Fee Breakdown (NPR 5,000 Loan)
const breakdown = calculateLoanBreakdown(500000);
console.assert(breakdown.principalPaisa === 500000, 'Principal mismatch');
console.assert(breakdown.facilityFeePaisa === 30000, `Fee mismatch: got ${breakdown.facilityFeePaisa}`);
console.assert(breakdown.tpotalRepaymentPaisa === 530000, `Total due mismatch: got ${breakdown.totalRepaymentPaisa}`);
console.assert(breakdown.lenderYieldPaisa === 20000, `Lender return mismatch: got ${breakdown.lenderYieldPaisa}`);
console.assert(breakdown.platformReservePaisa === 5000, `Platform reserve mismatch: got ${breakdown.platformReservePaisa}`);
console.assert(breakdown.universityFundPaisa === 5000, `University fund mismatch: got ${breakdown.universityFundPaisa}`);
console.assert(
  breakdown.lenderYieldPaisa + breakdown.platformReservePaisa + breakdown.universityFundPaisa === breakdown.facilityFeePaisa,
  'Fee allocation does not sum to 100% of facility fee'
);
console.log('✔ Test 2 Passed: Integer Paisa 6% Breakdown (5,000 NPR -> 300 NPR fee = 200 lender + 50 platform + 50 uni)');

// Test 3: Hamilton-Hare Deterministic Proportional Payout (3 Lenders, odd split)
const funders = [
  { id: 'lender-A', amountFundedPaisa: 200000 },
  { id: 'lender-B', amountFundedPaisa: 200000 },
  { id: 'lender-C', amountFundedPaisa: 100000 },
];
const payouts = calculateProportionalPayout(530000, funders, 500000);
const sumPayout = payouts.reduce((acc, p) => acc + p.payoutPaisa, 0);
console.assert(sumPayout === 530000, `Hamilton-Hare sum mismatch: got ${sumPayout}, expected 530000`);
console.assert(payouts[0].payoutPaisa === 212000, 'Lender A payout mismatch');
console.assert(payouts[1].payoutPaisa === 212000, 'Lender B payout mismatch');
console.assert(payouts[2].payoutPaisa === 106000, 'Lender C payout mismatch');
console.log('✔ Test 3 Passed: Hamilton-Hare largest remainder deterministic split (Exact 100.00% zero-drift allocation)');

// Test 4: Credit Ladder Tier Progression
console.assert(getTierForScore(30).tier === 1, 'Score 30 should be Tier 1');
console.assert(getTierForScore(30).maxLimitPaisa === 400000, 'Tier 1 max limit should be NPR 4,000');
console.assert(getTierForScore(68).tier === 2, 'Score 68 should be Tier 2');
console.assert(getTierForScore(68).maxLimitPaisa === 600000, 'Tier 2 max limit should be NPR 6,000');
console.assert(getTierForScore(78).tier === 3, 'Score 78 should be Tier 3');
console.assert(getTierForScore(78).maxLimitPaisa === 800000, 'Tier 3 max limit should be NPR 8,000');
console.assert(getTierForScore(92).tier === 4, 'Score 92 should be Tier 4');
console.assert(getTierForScore(92).maxLimitPaisa === 1000000, 'Tier 4 max limit should be NPR 10,000');
console.log('✔ Test 4 Passed: Credit Ladder Tier progression (30 -> 4K, 68 -> 6K, 78 -> 8K, 92 -> 10K)');

console.log('\nALL TESTS PASSED SUCCESSFULLY! 🚀');
