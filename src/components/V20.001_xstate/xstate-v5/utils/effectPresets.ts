// xstate-v5/utils/effectPresets.ts

export interface EffectPreset {
  glow: boolean;
  ultraBloom: boolean;
  motionTrail: boolean;
  name: string;
  description: string;
}

export const EFFECT_PRESETS: Record<string, EffectPreset> = {
  'all-off': {
    glow: false,
    ultraBloom: false,
    motionTrail: false,
    name: '🚫 All OFF',
    description: 'Tous les effets désactivés'
  },
  'glow-only': {
    glow: true,
    ultraBloom: false,
    motionTrail: false,
    name: '✨ Glow Only',
    description: 'Glow activé seul'
  },
  'ultra-bloom': {
    glow: false,
    ultraBloom: true,
    motionTrail: false,
    name: '💥 Ultra Bloom',
    description: 'Bloom maximal activé'
  },
  'all-on': {
    glow: true,
    ultraBloom: true,
    motionTrail: true,
    name: '🔥 All ON',
    description: 'Tous les effets activés (intense)'
  }
} as const;

export type EffectPresetKey = keyof typeof EFFECT_PRESETS;
