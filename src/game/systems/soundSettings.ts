const SOUND_ENABLED_KEY = 'cheshkaSoundEnabled';

export type SettingsStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function loadSoundEnabled(storage: SettingsStorage): boolean {
  return storage.getItem(SOUND_ENABLED_KEY) !== 'false';
}

export function saveSoundEnabled(storage: SettingsStorage, enabled: boolean): boolean {
  storage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
  return enabled;
}

export function toggleSoundEnabled(storage: SettingsStorage, current: boolean): boolean {
  return saveSoundEnabled(storage, !current);
}

export function getSoundToggleLabel(enabled: boolean): string {
  return enabled ? 'Звук: вкл' : 'Звук: выкл';
}
