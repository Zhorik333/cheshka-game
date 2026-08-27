import { moveTowards, type Point } from '../utils/movement';

export type DashConfig = {
  distance: number;
  cooldownMs: number;
};

export type DashState = DashConfig & {
  availableAtMs: number;
};

export type DashResult = {
  dashed: boolean;
  position: Point;
  state: DashState;
};

export function createDashState(config: DashConfig): DashState {
  return {
    ...config,
    availableAtMs: 0,
  };
}

export function performDash(
  state: DashState,
  currentPosition: Point,
  targetPosition: Point,
  timeMs: number,
): DashResult {
  if (timeMs < state.availableAtMs) {
    return {
      dashed: false,
      position: { ...currentPosition },
      state,
    };
  }

  return {
    dashed: true,
    position: moveTowards(currentPosition, targetPosition, state.distance),
    state: {
      ...state,
      availableAtMs: timeMs + state.cooldownMs,
    },
  };
}

export function isDashReady(state: DashState, timeMs: number): boolean {
  return timeMs >= state.availableAtMs;
}

export function getDashCooldownSeconds(state: DashState, timeMs: number): number {
  return Math.ceil(Math.max(0, state.availableAtMs - timeMs) / 1000);
}

export function getDashCooldownRatio(state: DashState, timeMs: number): number {
  const remainingMs = Math.max(0, state.availableAtMs - timeMs);

  if (remainingMs === 0) {
    return 0;
  }

  return Math.min(1, remainingMs / state.cooldownMs);
}
