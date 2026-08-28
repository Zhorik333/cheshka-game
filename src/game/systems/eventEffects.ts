export type EventEffectKind = 'posterCollect' | 'dash' | 'hide' | 'caught' | 'dayClear';

export type EventEffectStyle = {
  color: number;
  alpha: number;
  startRadius: number;
  endRadius: number;
  durationMs: number;
  particles: number;
};

export const EVENT_EFFECT_STYLES: Record<EventEffectKind, EventEffectStyle> = {
  posterCollect: {
    color: 0xffee75,
    alpha: 0.78,
    startRadius: 10,
    endRadius: 44,
    durationMs: 420,
    particles: 6,
  },
  dash: {
    color: 0x9b7df0,
    alpha: 0.62,
    startRadius: 16,
    endRadius: 62,
    durationMs: 360,
    particles: 4,
  },
  hide: {
    color: 0x4da65a,
    alpha: 0.58,
    startRadius: 20,
    endRadius: 54,
    durationMs: 520,
    particles: 5,
  },
  caught: {
    color: 0xff5b4d,
    alpha: 0.72,
    startRadius: 18,
    endRadius: 70,
    durationMs: 520,
    particles: 8,
  },
  dayClear: {
    color: 0xffd45c,
    alpha: 0.72,
    startRadius: 24,
    endRadius: 86,
    durationMs: 680,
    particles: 10,
  },
};

export function getEventEffectStyle(kind: EventEffectKind): EventEffectStyle {
  return { ...EVENT_EFFECT_STYLES[kind] };
}

export function getParticleAngles(count: number): number[] {
  if (count <= 0) {
    return [];
  }

  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_value, index) => Number((index * step).toFixed(4)));
}

export function isSubtleMobileEffect(style: EventEffectStyle): boolean {
  return style.durationMs <= 700
    && style.endRadius <= 90
    && style.alpha <= 0.8
    && style.particles <= 10;
}
