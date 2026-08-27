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
