// xstate-v5/actors/effects/effectsMachine.ts
import { setup, assign, enqueueActions } from 'xstate';
import { EFFECT_PRESETS, type EffectPresetKey } from '../../utils/effectPresets';

export interface EffectsContext {
  // Toggle states
  glowEnabled: boolean;
  ultraBloomEnabled: boolean;
  motionTrailEnabled: boolean;

  // Current preset (optionnel, pour UI)
  currentPreset: EffectPresetKey | null;
}

export type EffectsEvents =
  // Individual toggles
  | { type: 'TOGGLE_GLOW' }
  | { type: 'TOGGLE_ULTRA_BLOOM' }
  | { type: 'TOGGLE_MOTION_TRAIL' }
  | { type: 'ENABLE_GLOW' }
  | { type: 'DISABLE_GLOW' }
  | { type: 'ENABLE_ULTRA_BLOOM' }
  | { type: 'DISABLE_ULTRA_BLOOM' }
  | { type: 'ENABLE_MOTION_TRAIL' }
  | { type: 'DISABLE_MOTION_TRAIL' }

  // Presets (applique combinaison d'effets)
  | { type: 'APPLY_EFFECT_PRESET'; preset: EffectPresetKey }

  // Restore defaults
  | { type: 'RESTORE_DEFAULTS' };

export const effectsMachine = setup({
  types: {} as {
    context: EffectsContext;
    events: EffectsEvents;
  },
  actions: {
    // Log glow toggle
    logGlowToggle: ({ context }) => {
      console.log(`[effectsMachine] ✨ Glow: ${context.glowEnabled ? 'ENABLED' : 'DISABLED'}`);
    },

    // Log ultra bloom toggle
    logUltraBloomToggle: ({ context }) => {
      console.log(`[effectsMachine] 💥 Ultra Bloom: ${context.ultraBloomEnabled ? 'ENABLED' : 'DISABLED'}`);
    },

    // Log motion trail toggle
    logMotionTrailToggle: ({ context }) => {
      console.log(`[effectsMachine] 🌊 Motion Trail: ${context.motionTrailEnabled ? 'ENABLED' : 'DISABLED'}`);
    },

    // Log preset application
    logPresetApplication: ({ event }) => {
      if (event.type === 'APPLY_EFFECT_PRESET') {
        console.log(`[effectsMachine] 🎨 Applied preset "${event.preset}"`);
      }
    }
  }
}).createMachine({
  id: 'effects',
  context: {
    glowEnabled: false,
    ultraBloomEnabled: false,
    motionTrailEnabled: false,
    currentPreset: null
  },
  on: {
    // Individual toggles
    TOGGLE_GLOW: {
      actions: [
        assign({ glowEnabled: ({ context }) => !context.glowEnabled }),
        'logGlowToggle'
      ]
    },
    TOGGLE_ULTRA_BLOOM: {
      actions: [
        assign({ ultraBloomEnabled: ({ context }) => !context.ultraBloomEnabled }),
        'logUltraBloomToggle'
      ]
    },
    TOGGLE_MOTION_TRAIL: {
      actions: [
        assign({ motionTrailEnabled: ({ context }) => !context.motionTrailEnabled }),
        'logMotionTrailToggle'
      ]
    },

    // Enable/Disable
    ENABLE_GLOW: {
      actions: [
        assign({ glowEnabled: true }),
        'logGlowToggle'
      ]
    },
    DISABLE_GLOW: {
      actions: [
        assign({ glowEnabled: false }),
        'logGlowToggle'
      ]
    },
    ENABLE_ULTRA_BLOOM: {
      actions: [
        assign({ ultraBloomEnabled: true }),
        'logUltraBloomToggle'
      ]
    },
    DISABLE_ULTRA_BLOOM: {
      actions: [
        assign({ ultraBloomEnabled: false }),
        'logUltraBloomToggle'
      ]
    },
    ENABLE_MOTION_TRAIL: {
      actions: [
        assign({ motionTrailEnabled: true }),
        'logMotionTrailToggle'
      ]
    },
    DISABLE_MOTION_TRAIL: {
      actions: [
        assign({ motionTrailEnabled: false }),
        'logMotionTrailToggle'
      ]
    },

    // Preset
    APPLY_EFFECT_PRESET: {
      actions: [
        assign({
          glowEnabled: ({ event }) => EFFECT_PRESETS[event.preset].glow,
          ultraBloomEnabled: ({ event }) => EFFECT_PRESETS[event.preset].ultraBloom,
          motionTrailEnabled: ({ event }) => EFFECT_PRESETS[event.preset].motionTrail,
          currentPreset: ({ event }) => event.preset
        }),
        'logPresetApplication'
      ]
    },

    // Restore defaults
    RESTORE_DEFAULTS: {
      actions: assign({
        glowEnabled: false,
        ultraBloomEnabled: false,
        motionTrailEnabled: false,
        currentPreset: null
      })
    }
  }
});
