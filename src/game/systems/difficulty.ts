export type CycleDifficulty = {
  posterCount: number;
  humanCount: number;
  humanSpeedMultiplier: number;
  nightViewMultiplier: number;
};

export function getCycleDifficulty(cycle: number): CycleDifficulty {
  const safeCycle = Math.max(1, Math.floor(cycle));
  const extraCycles = safeCycle - 1;

  return {
    posterCount: Math.min(10, 5 + extraCycles * 2),
    humanCount: Math.min(4, 2 + extraCycles),
    humanSpeedMultiplier: roundToTwoDecimals(1 + extraCycles * 0.08),
    nightViewMultiplier: roundToTwoDecimals(1 + extraCycles * 0.06),
  };
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
