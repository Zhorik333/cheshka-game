import { describe, expect, it } from 'vitest';
import { createPosterComboState, recordPosterCombo } from './posterCombo';

describe('recordPosterCombo', () => {
  it('builds a quick tearing streak and resets after the window expires', () => {
    const initial = createPosterComboState(4_000);

    const first = recordPosterCombo(initial, 1_000, 1);
    expect(first.state.streak).toBe(1);
    expect(first.bonusScore).toBe(0);
    expect(first.label).toBe('цепочка x1');

    const second = recordPosterCombo(first.state, 3_500, 1);
    expect(second.state.streak).toBe(2);
    expect(second.bonusScore).toBe(5);
    expect(second.label).toBe('цепочка x2 +5');

    const expired = recordPosterCombo(second.state, 8_000, 1);
    expect(expired.state.streak).toBe(1);
    expect(expired.bonusScore).toBe(0);
    expect(expired.label).toBe('цепочка x1');
  });
});
