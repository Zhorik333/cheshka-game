import { describe, expect, it } from 'vitest';
import { getSoundToggleLabel, loadSoundEnabled, saveSoundEnabled, toggleSoundEnabled } from './soundSettings';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    dump: () => Object.fromEntries(values),
  };
}

describe('soundSettings', () => {
  it('keeps sound enabled by default for first launch', () => {
    expect(loadSoundEnabled(createStorage())).toBe(true);
  });

  it('loads an explicit disabled preference', () => {
    expect(loadSoundEnabled(createStorage({ cheshkaSoundEnabled: 'false' }))).toBe(false);
  });

  it('saves enabled and disabled values as strings', () => {
    const storage = createStorage();

    expect(saveSoundEnabled(storage, false)).toBe(false);
    expect(storage.dump()).toEqual({ cheshkaSoundEnabled: 'false' });
    expect(saveSoundEnabled(storage, true)).toBe(true);
    expect(storage.dump()).toEqual({ cheshkaSoundEnabled: 'true' });
  });

  it('toggles the stored setting', () => {
    const storage = createStorage();

    expect(toggleSoundEnabled(storage, true)).toBe(false);
    expect(loadSoundEnabled(storage)).toBe(false);
    expect(toggleSoundEnabled(storage, false)).toBe(true);
    expect(loadSoundEnabled(storage)).toBe(true);
  });

  it('returns short mobile labels', () => {
    expect(getSoundToggleLabel(true)).toBe('Звук: вкл');
    expect(getSoundToggleLabel(false)).toBe('Звук: выкл');
  });
});
