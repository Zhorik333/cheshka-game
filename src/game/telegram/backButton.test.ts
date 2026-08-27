import { describe, expect, it } from 'vitest';
import { configureTelegramBackButton, hideTelegramBackButton, type TelegramBackButtonBridge } from './backButton';

function createBackButtonBridge(calls: string[]): TelegramBackButtonBridge {
  return {
    show: () => calls.push('show'),
    hide: () => calls.push('hide'),
    onClick: () => calls.push('onClick'),
    offClick: () => calls.push('offClick'),
  };
}

describe('Telegram BackButton', () => {
  it('does nothing outside Telegram and returns a no-op cleanup', () => {
    const calls: string[] = [];

    const cleanup = configureTelegramBackButton(undefined, () => calls.push('back'));
    cleanup();

    expect(calls).toEqual([]);
  });

  it('shows the Telegram back button and registers the click handler', () => {
    const calls: string[] = [];
    const onBack = () => calls.push('back');

    const cleanup = configureTelegramBackButton(createBackButtonBridge(calls), onBack);

    expect(calls).toEqual(['show', 'onClick']);
    cleanup();
    expect(calls).toEqual(['show', 'onClick', 'offClick']);
  });

  it('hides the Telegram back button when returning to the menu', () => {
    const calls: string[] = [];

    hideTelegramBackButton(createBackButtonBridge(calls));

    expect(calls).toEqual(['hide']);
  });
});
