import { describe, expect, it } from 'vitest';
import { moveTowards } from './movement';

describe('moveTowards', () => {
  it('moves toward the target without overshooting', () => {
    const next = moveTowards({ x: 0, y: 0 }, { x: 10, y: 0 }, 4);

    expect(next).toEqual({ x: 4, y: 0 });
  });

  it('snaps to the target when close enough', () => {
    const next = moveTowards({ x: 8, y: 0 }, { x: 10, y: 0 }, 4);

    expect(next).toEqual({ x: 10, y: 0 });
  });
});
