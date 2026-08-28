import { describe, expect, it } from 'vitest';
import { createPosterStates } from './posterLayout';

describe('createPosterStates', () => {
  it('creates the requested number of uncollected posters from spawn points', () => {
    const posters = createPosterStates(2);

    expect(posters).toHaveLength(2);
    expect(posters).toEqual([
      { id: 'poster-1', x: 238, y: 92, collected: false },
      { id: 'poster-2', x: 505, y: 93, collected: false },
    ]);
  });

  it('does not create more posters than available spawn points', () => {
    expect(createPosterStates(999)).toHaveLength(10);
  });
});
