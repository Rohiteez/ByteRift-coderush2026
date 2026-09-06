// Aafno Trust Score Engine: Dynamic, explainable credit ladder logic

export interface TierInfo {
  tier: 1 | 2 | 3 | 4;
  label: string;
  badgeColor: string;
  maxLimitPaisa: number;
  minScore: number;
  maxScore: number;
}

export const TIER_DEFINITIONS: Record<1 | 2 | 3 | 4, TierInfo> = {
  1: {
    tier: 1,
    label: 'New Scholar',
    badgeColor: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    maxLimitPaisa: 400000, // NPR 4,000
    minScore: 0,
    maxScore: 49,
  },
  2: {
    tier: 2,
    label: 'Verified Reliable',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    maxLimitPaisa: 600000, // NPR 6,000
    minScore: 50,
    maxScore: 69,
  },
  3: {
    tier: 3,
    label: 'Trusted Scholar',
    badgeColor: 'bg-amber-200/80 text-amber-950 border-amber-300',
    maxLimitPaisa: 800000, // NPR 8,000
    minScore: 70,
    maxScore: 84,
  },
  4: {
    tier: 4,
    label: 'Prime Honor Roll',
    badgeColor: 'bg-yellow-400 text-stone-950 border-yellow-500 font-extrabold',
    maxLimitPaisa: 1000000, // NPR 10,000
    minScore: 85,
    maxScore: 100,
  },
};

export function getTierForScore(score: number): TierInfo {
  if (score >= 85) return TIER_DEFINITIONS[4];
  if (score >= 70) return TIER_DEFINITIONS[3];
  if (score >= 50) return TIER_DEFINITIONS[2];
  return TIER_DEFINITIONS[1];
}

export function getNextMilestone(score: number): { nextTargetScore: number; nextLimitPaisa: number; pointsNeeded: number } | null {
  if (score < 50) {
    return { nextTargetScore: 50, nextLimitPaisa: 600000, pointsNeeded: 50 - score };
  }
  if (score < 70) {
    return { nextTargetScore: 70, nextLimitPaisa: 800000, pointsNeeded: 70 - score };
  }
  if (score < 85) {
    return { nextTargetScore: 85, nextLimitPaisa: 1000000, pointsNeeded: 85 - score };
  }
  return null; // Maximum tier reached
}

export const EXPLAINABLE_FACTORS = [
  { factor: 'Identity & National KYC Verification', impact: '+30 pts', description: 'Verified Nepalese Citizenship or National ID card' },
  { factor: 'University Enrollment Verification', impact: '+10 pts', description: 'Active academic record confirmed with partner institution' },
  { factor: 'On-Time Loan Repayment', impact: '+10 pts', description: 'Loan settled in full on or before the due date' },
  { factor: 'Consecutive Discipline Bonus', impact: '+5 pts', description: 'Maintaining 2+ consecutive clean loan cycles' },
  { factor: 'Late Payment Penalty', impact: '-15 pts', description: 'Repayment delayed past the 30-day term' },
  { factor: 'Default / Academic Hold', impact: '-50 pts', description: 'Unresolved overdue loan exceeding grace period' },
];
