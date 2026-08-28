export type BobFrame = {
  yOffset: number;
  scaleY: number;
};

export type PulseFrame = {
  alpha: number;
  scale: number;
};

export function getMovementBobFrame(isMoving: boolean, elapsedMs: number): BobFrame {
  if (!isMoving) {
    return { yOffset: 0, scaleY: 1 };
  }

  const wave = Math.sin(elapsedMs / 95);
  return {
    yOffset: roundToTwoDecimals(wave * 2.6),
    scaleY: roundToTwoDecimals(1 + Math.abs(wave) * 0.045),
  };
}

export function getPosterPulseFrame(elapsedMs: number, phaseOffsetMs = 0): PulseFrame {
  const wave = (Math.sin((elapsedMs + phaseOffsetMs) / 360) + 1) / 2;
  return {
    alpha: roundToTwoDecimals(0.24 + wave * 0.2),
    scale: roundToTwoDecimals(0.94 + wave * 0.12),
  };
}

export function getFlashlightPulseFrame(isNight: boolean, elapsedMs: number): PulseFrame {
  if (!isNight) {
    return { alpha: 0.26, scale: 1 };
  }

  const wave = (Math.sin(elapsedMs / 240) + 1) / 2;
  return {
    alpha: roundToTwoDecimals(0.32 + wave * 0.14),
    scale: roundToTwoDecimals(0.98 + wave * 0.08),
  };
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
