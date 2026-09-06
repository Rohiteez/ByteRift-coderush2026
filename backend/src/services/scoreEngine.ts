// Aafno Trust Score Engine for Backend Service

export interface TierInfo {
  tier: 1 | 2 | 3 | 4;
  label: string;
  maxLimitPaisa: number;
  minScore: number;
  maxScore: number;
}

export const TIER_DEFINITIONS: Record<1 | 2 | 3 | 4, TierInfo> = {
  1: {
    tier: 1,
    label: 'New Scholar',
    maxLimitPaisa: 400000, // NPR 4,000
    minScore: 0,
    maxScore: 49,
  },
  2: {
    tier: 2,
    label: 'Verified Reliable',
    maxLimitPaisa: 600000, // NPR 6,000
    minScore: 50,
    maxScore: 69,
  },
  3: {
    tier: 3,
    label: 'Trusted Scholar',
    maxLimitPaisa: 800000, // NPR 8,000
    minScore: 70,
    maxScore: 84,
  },
  4: {
    tier: 4,
    label: 'Prime Honor Roll',
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
