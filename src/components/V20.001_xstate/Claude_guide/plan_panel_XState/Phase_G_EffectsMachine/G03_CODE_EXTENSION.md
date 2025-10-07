# 💻 PHASE G - CODE : effectsMachine

**Date** : 3 octobre 2025
**Objectif** : Code complet pour créer effectsMachine

---

## 📁 FICHIERS À CRÉER

### **1. Créer : visualPresets.ts**
### **2. Créer : effectsMachine.ts**
### **3. Créer : useEffects.ts** (hook)

---

## 1️⃣ CRÉER : visualPresets.ts

**Chemin** : `xstate-v5/utils/visualPresets.ts`

```typescript
// xstate-v5/utils/visualPresets.ts

export type GlowTarget = 'iris' | 'eyeRings' | 'magicRings';

export interface VisualPreset {
  name: string;
  description: string;
  values: {
    glow: {
      enabled: boolean;
      speed: number;
      min: number;
      max: number;
      targets: GlowTarget[];
    };
    ultraBloom: {
      enabled: boolean;
      intensity?: number;
      threshold?: number;
      radius?: number;
    };
    motionTrail: {
      enabled: boolean;
      length?: number;
      opacity?: number;
    };
  };
}

export const VISUAL_PRESETS: Record<string, VisualPreset> = {
  subtle: {
    name: '✨ Subtle',
    description: 'Légers effets',
    values: {
      glow: {
        enabled: true,
        speed: 0.5,
        min: 0.8,
        max: 1.2,
        targets: ['iris']
      },
      ultraBloom: { enabled: false },
      motionTrail: { enabled: false }
    }
  },
  normal: {
    name: '🌟 Normal',
    description: 'Effets équilibrés',
    values: {
      glow: {
        enabled: true,
        speed: 1.0,
        min: 0.5,
        max: 2.0,
        targets: ['iris', 'eyeRings']
      },
      ultraBloom: { enabled: false },
      motionTrail: { enabled: false }
    }
  },
  intense: {
    name: '🔥 Intense',
    description: 'Effets très marqués',
    values: {
      glow: {
        enabled: true,
        speed: 2.0,
        min: 0.5,
        max: 3.0,
        targets: ['iris', 'eyeRings', 'magicRings']
      },
      ultraBloom: {
        enabled: true,
        intensity: 10.0,
        threshold: 0.1,
        radius: 1.0
      },
      motionTrail: { enabled: false }
    }
  },
  cinematic: {
    name: '🎬 Cinematic',
    description: 'Effet cinématique avec traînée',
    values: {
      glow: {
        enabled: true,
        speed: 0.3,
        min: 1.0,
        max: 2.0,
        targets: ['iris']
      },
      ultraBloom: {
        enabled: true,
        intensity: 8.0,
        threshold: 0.15,
        radius: 1.2
      },
      motionTrail: {
        enabled: true,
        length: 0.7,
        opacity: 0.8
      }
    }
  }
} as const;

export type VisualPresetKey = keyof typeof VISUAL_PRESETS;
```

---

## 2️⃣ CRÉER : effectsMachine.ts

**Chemin** : `xstate-v5/actors/effects/effectsMachine.ts`

```typescript
// xstate-v5/actors/effects/effectsMachine.ts
import { setup, assign, enqueueActions } from 'xstate';
import * as THREE from 'three';
import type { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { VISUAL_PRESETS, type VisualPresetKey, type GlowTarget } from '../../utils/visualPresets';

export interface EffectsContext {
  // Références
  clock: THREE.Clock | null;
  afterimagePass: any | null;  // AfterimagePass type

  // Glow Effect
  glowEnabled: boolean;
  glowSpeed: number;
  glowIntensityMin: number;
  glowIntensityMax: number;
  glowTargets: GlowTarget[];
  currentGlowIntensity: number;

  // Ultra Bloom Effect
  ultraBloomEnabled: boolean;
  ultraBloomIntensity: number;
  ultraBloomThreshold: number;
  ultraBloomRadius: number;

  // Motion Trail Effect
  motionTrailEnabled: boolean;
  trailLength: number;
  trailOpacity: number;

  // Preset
  currentPreset: VisualPresetKey | 'none';
}

export type EffectsEvents =
  // Initialisation
  | { type: 'SET_CLOCK'; clock: THREE.Clock }
  | { type: 'SET_AFTERIMAGE_PASS'; pass: any }

  // Glow
  | { type: 'TOGGLE_GLOW' }
  | { type: 'ENABLE_GLOW' }
  | { type: 'DISABLE_GLOW' }
  | { type: 'UPDATE_GLOW_SPEED'; speed: number }
  | { type: 'UPDATE_GLOW_MIN'; min: number }
  | { type: 'UPDATE_GLOW_MAX'; max: number }
  | { type: 'TOGGLE_GLOW_TARGET'; target: GlowTarget }
  | { type: 'UPDATE_GLOW'; elapsed: number }

  // Ultra Bloom
  | { type: 'TOGGLE_ULTRA_BLOOM' }
  | { type: 'ENABLE_ULTRA_BLOOM' }
  | { type: 'DISABLE_ULTRA_BLOOM' }
  | { type: 'UPDATE_ULTRA_BLOOM_INTENSITY'; intensity: number }
  | { type: 'UPDATE_ULTRA_BLOOM_THRESHOLD'; threshold: number }
  | { type: 'UPDATE_ULTRA_BLOOM_RADIUS'; radius: number }

  // Motion Trail
  | { type: 'TOGGLE_MOTION_TRAIL' }
  | { type: 'ENABLE_MOTION_TRAIL' }
  | { type: 'DISABLE_MOTION_TRAIL' }
  | { type: 'UPDATE_TRAIL_LENGTH'; length: number }
  | { type: 'UPDATE_TRAIL_OPACITY'; opacity: number }

  // Presets
  | { type: 'APPLY_VISUAL_PRESET'; preset: VisualPresetKey }
  | { type: 'CLEAR_PRESET' };

export const effectsMachine = setup({
  types: {} as {
    context: EffectsContext;
    events: EffectsEvents;
  },
  actions: {
    // Calculate glow intensity based on time
    calculateGlowIntensity: assign(({ context, event }) => {
      if (!context.glowEnabled || event.type !== 'UPDATE_GLOW') return {};

      const elapsed = event.elapsed;
      const phase = Math.sin(elapsed * context.glowSpeed) * 0.5 + 0.5;
      const intensity = context.glowIntensityMin +
        phase * (context.glowIntensityMax - context.glowIntensityMin);

      return {
        currentGlowIntensity: intensity
      };
    }),

    // Apply glow to targets (send to materialMachine)
    applyGlowToTargets: enqueueActions(({ context, enqueue }) => {
      if (!context.glowEnabled) return;

      const intensity = context.currentGlowIntensity;

      // Send to materialMachine for each target
      context.glowTargets.forEach((target) => {
        if (target === 'iris') {
          enqueue.sendTo('material', {
            type: 'SET_IRIS_EMISSIVE_INTENSITY',
            intensity
          });
        } else if (target === 'eyeRings') {
          enqueue.sendTo('material', {
            type: 'SET_EYE_RINGS_EMISSIVE_INTENSITY',
            intensity
          });
        } else if (target === 'magicRings') {
          enqueue.sendTo('material', {
            type: 'SET_MAGIC_RINGS_EMISSIVE_INTENSITY',
            intensity
          });
        }
      });

      console.log(`[applyGlowToTargets] Intensity: ${intensity.toFixed(2)}, Targets: ${context.glowTargets.join(', ')}`);
    }),

    // Apply ultra bloom (send to bloomMachine)
    applyUltraBloom: enqueueActions(({ context, enqueue }) => {
      if (context.ultraBloomEnabled) {
        enqueue.sendTo('bloom', {
          type: 'SET_THRESHOLD',
          threshold: context.ultraBloomThreshold
        });
        enqueue.sendTo('bloom', {
          type: 'SET_STRENGTH',
          strength: context.ultraBloomIntensity
        });
        enqueue.sendTo('bloom', {
          type: 'SET_RADIUS',
          radius: context.ultraBloomRadius
        });
        console.log(`[applyUltraBloom] ENABLED - Intensity: ${context.ultraBloomIntensity}, Threshold: ${context.ultraBloomThreshold}`);
      } else {
        // Restore normal bloom (optional)
        enqueue.sendTo('bloom', { type: 'RESTORE_DEFAULTS' });
        console.log(`[applyUltraBloom] DISABLED - Restored defaults`);
      }
    }),

    // Apply motion trail (AfterimagePass)
    applyMotionTrail: ({ context }) => {
      if (context.afterimagePass) {
        context.afterimagePass.enabled = context.motionTrailEnabled;
        if (context.motionTrailEnabled) {
          context.afterimagePass.uniforms['damp'].value = context.trailLength;
        }
        console.log(`[applyMotionTrail] ${context.motionTrailEnabled ? 'ENABLED' : 'DISABLED'}, Length: ${context.trailLength}`);
      }
    }
  }
}).createMachine({
  id: 'effects',
  initial: 'idle',
  context: {
    clock: null,
    afterimagePass: null,

    // Glow
    glowEnabled: false,
    glowSpeed: 1.0,
    glowIntensityMin: 0.5,
    glowIntensityMax: 2.0,
    glowTargets: ['iris'],
    currentGlowIntensity: 1.0,

    // Ultra Bloom
    ultraBloomEnabled: false,
    ultraBloomIntensity: 10.0,
    ultraBloomThreshold: 0.1,
    ultraBloomRadius: 1.0,

    // Motion Trail
    motionTrailEnabled: false,
    trailLength: 0.7,
    trailOpacity: 0.8,

    currentPreset: 'none'
  },
  states: {
    idle: {
      on: {
        SET_CLOCK: {
          target: 'ready',
          actions: assign({ clock: ({ event }) => event.clock })
        }
      }
    },
    ready: {
      on: {
        // Afterimage Pass
        SET_AFTERIMAGE_PASS: {
          actions: assign({ afterimagePass: ({ event }) => event.pass })
        },

        // Glow
        TOGGLE_GLOW: {
          actions: [
            assign({ glowEnabled: ({ context }) => !context.glowEnabled, currentPreset: 'none' }),
            'applyGlowToTargets'
          ]
        },
        ENABLE_GLOW: {
          actions: [
            assign({ glowEnabled: true, currentPreset: 'none' }),
            'applyGlowToTargets'
          ]
        },
        DISABLE_GLOW: {
          actions: assign({ glowEnabled: false, currentPreset: 'none' })
        },
        UPDATE_GLOW_SPEED: {
          actions: assign({ glowSpeed: ({ event }) => event.speed, currentPreset: 'none' })
        },
        UPDATE_GLOW_MIN: {
          actions: assign({ glowIntensityMin: ({ event }) => event.min, currentPreset: 'none' })
        },
        UPDATE_GLOW_MAX: {
          actions: assign({ glowIntensityMax: ({ event }) => event.max, currentPreset: 'none' })
        },
        TOGGLE_GLOW_TARGET: {
          actions: assign({
            glowTargets: ({ context, event }) => {
              const targets = [...context.glowTargets];
              const index = targets.indexOf(event.target);
              if (index >= 0) {
                targets.splice(index, 1);
              } else {
                targets.push(event.target);
              }
              return targets;
            },
            currentPreset: 'none'
          })
        },
        UPDATE_GLOW: {
          actions: ['calculateGlowIntensity', 'applyGlowToTargets']
        },

        // Ultra Bloom
        TOGGLE_ULTRA_BLOOM: {
          actions: [
            assign({ ultraBloomEnabled: ({ context }) => !context.ultraBloomEnabled, currentPreset: 'none' }),
            'applyUltraBloom'
          ]
        },
        ENABLE_ULTRA_BLOOM: {
          actions: [
            assign({ ultraBloomEnabled: true, currentPreset: 'none' }),
            'applyUltraBloom'
          ]
        },
        DISABLE_ULTRA_BLOOM: {
          actions: [
            assign({ ultraBloomEnabled: false, currentPreset: 'none' }),
            'applyUltraBloom'
          ]
        },
        UPDATE_ULTRA_BLOOM_INTENSITY: {
          actions: [
            assign({ ultraBloomIntensity: ({ event }) => event.intensity, currentPreset: 'none' }),
            'applyUltraBloom'
          ]
        },
        UPDATE_ULTRA_BLOOM_THRESHOLD: {
          actions: [
            assign({ ultraBloomThreshold: ({ event }) => event.threshold, currentPreset: 'none' }),
            'applyUltraBloom'
          ]
        },
        UPDATE_ULTRA_BLOOM_RADIUS: {
          actions: [
            assign({ ultraBloomRadius: ({ event }) => event.radius, currentPreset: 'none' }),
            'applyUltraBloom'
          ]
        },

        // Motion Trail
        TOGGLE_MOTION_TRAIL: {
          actions: [
            assign({ motionTrailEnabled: ({ context }) => !context.motionTrailEnabled, currentPreset: 'none' }),
            'applyMotionTrail'
          ]
        },
        ENABLE_MOTION_TRAIL: {
          actions: [
            assign({ motionTrailEnabled: true, currentPreset: 'none' }),
            'applyMotionTrail'
          ]
        },
        DISABLE_MOTION_TRAIL: {
          actions: [
            assign({ motionTrailEnabled: false, currentPreset: 'none' }),
            'applyMotionTrail'
          ]
        },
        UPDATE_TRAIL_LENGTH: {
          actions: [
            assign({ trailLength: ({ event }) => event.length, currentPreset: 'none' }),
            'applyMotionTrail'
          ]
        },
        UPDATE_TRAIL_OPACITY: {
          actions: assign({ trailOpacity: ({ event }) => event.opacity, currentPreset: 'none' })
        },

        // Presets
        APPLY_VISUAL_PRESET: {
          actions: [
            assign(({ event }) => {
              const preset = VISUAL_PRESETS[event.preset];
              return {
                // Glow
                glowEnabled: preset.values.glow.enabled,
                glowSpeed: preset.values.glow.speed,
                glowIntensityMin: preset.values.glow.min,
                glowIntensityMax: preset.values.glow.max,
                glowTargets: preset.values.glow.targets,

                // Ultra Bloom
                ultraBloomEnabled: preset.values.ultraBloom.enabled,
                ultraBloomIntensity: preset.values.ultraBloom.intensity || 10.0,
                ultraBloomThreshold: preset.values.ultraBloom.threshold || 0.1,
                ultraBloomRadius: preset.values.ultraBloom.radius || 1.0,

                // Motion Trail
                motionTrailEnabled: preset.values.motionTrail.enabled,
                trailLength: preset.values.motionTrail.length || 0.7,
                trailOpacity: preset.values.motionTrail.opacity || 0.8,

                currentPreset: event.preset
              };
            }),
            'applyUltraBloom',
            'applyMotionTrail'
          ]
        },
        CLEAR_PRESET: {
          actions: [
            assign({
              glowEnabled: false,
              ultraBloomEnabled: false,
              motionTrailEnabled: false,
              currentPreset: 'none'
            }),
            'applyUltraBloom',
            'applyMotionTrail'
          ]
        }
      }
    }
  }
});
```

---

## 3️⃣ CRÉER : useEffects.ts

**Chemin** : `xstate-v5/hooks/useEffects.ts`

```typescript
// xstate-v5/hooks/useEffects.ts
import { useSelector, useActorRef } from '@xstate/react';
import { effectsMachine } from '../actors/effects/effectsMachine';
import type { VisualPresetKey, GlowTarget } from '../utils/visualPresets';

export function useEffects() {
  const actorRef = useActorRef(effectsMachine);

  // Glow
  const glowEnabled = useSelector(actorRef, (state) => state.context.glowEnabled);
  const glowSpeed = useSelector(actorRef, (state) => state.context.glowSpeed);
  const glowIntensityMin = useSelector(actorRef, (state) => state.context.glowIntensityMin);
  const glowIntensityMax = useSelector(actorRef, (state) => state.context.glowIntensityMax);
  const glowTargets = useSelector(actorRef, (state) => state.context.glowTargets);
  const currentGlowIntensity = useSelector(actorRef, (state) => state.context.currentGlowIntensity);

  // Ultra Bloom
  const ultraBloomEnabled = useSelector(actorRef, (state) => state.context.ultraBloomEnabled);
  const ultraBloomIntensity = useSelector(actorRef, (state) => state.context.ultraBloomIntensity);
  const ultraBloomThreshold = useSelector(actorRef, (state) => state.context.ultraBloomThreshold);
  const ultraBloomRadius = useSelector(actorRef, (state) => state.context.ultraBloomRadius);

  // Motion Trail
  const motionTrailEnabled = useSelector(actorRef, (state) => state.context.motionTrailEnabled);
  const trailLength = useSelector(actorRef, (state) => state.context.trailLength);
  const trailOpacity = useSelector(actorRef, (state) => state.context.trailOpacity);

  // Preset
  const currentPreset = useSelector(actorRef, (state) => state.context.currentPreset);

  // Actions - Glow
  const toggleGlow = () => actorRef.send({ type: 'TOGGLE_GLOW' });
  const updateGlowSpeed = (speed: number) => actorRef.send({ type: 'UPDATE_GLOW_SPEED', speed });
  const updateGlowMin = (min: number) => actorRef.send({ type: 'UPDATE_GLOW_MIN', min });
  const updateGlowMax = (max: number) => actorRef.send({ type: 'UPDATE_GLOW_MAX', max });
  const toggleGlowTarget = (target: GlowTarget) => actorRef.send({ type: 'TOGGLE_GLOW_TARGET', target });
  const updateGlow = (elapsed: number) => actorRef.send({ type: 'UPDATE_GLOW', elapsed });

  // Actions - Ultra Bloom
  const toggleUltraBloom = () => actorRef.send({ type: 'TOGGLE_ULTRA_BLOOM' });
  const updateUltraBloomIntensity = (intensity: number) => actorRef.send({ type: 'UPDATE_ULTRA_BLOOM_INTENSITY', intensity });
  const updateUltraBloomThreshold = (threshold: number) => actorRef.send({ type: 'UPDATE_ULTRA_BLOOM_THRESHOLD', threshold });
  const updateUltraBloomRadius = (radius: number) => actorRef.send({ type: 'UPDATE_ULTRA_BLOOM_RADIUS', radius });

  // Actions - Motion Trail
  const toggleMotionTrail = () => actorRef.send({ type: 'TOGGLE_MOTION_TRAIL' });
  const updateTrailLength = (length: number) => actorRef.send({ type: 'UPDATE_TRAIL_LENGTH', length });
  const updateTrailOpacity = (opacity: number) => actorRef.send({ type: 'UPDATE_TRAIL_OPACITY', opacity });

  // Actions - Presets
  const applyVisualPreset = (preset: VisualPresetKey) => actorRef.send({ type: 'APPLY_VISUAL_PRESET', preset });
  const clearPreset = () => actorRef.send({ type: 'CLEAR_PRESET' });

  return {
    // State - Glow
    glow: {
      enabled: glowEnabled,
      speed: glowSpeed,
      min: glowIntensityMin,
      max: glowIntensityMax,
      targets: glowTargets,
      currentIntensity: currentGlowIntensity
    },

    // State - Ultra Bloom
    ultraBloom: {
      enabled: ultraBloomEnabled,
      intensity: ultraBloomIntensity,
      threshold: ultraBloomThreshold,
      radius: ultraBloomRadius
    },

    // State - Motion Trail
    motionTrail: {
      enabled: motionTrailEnabled,
      length: trailLength,
      opacity: trailOpacity
    },

    // State - Preset
    currentPreset,

    // Actions
    toggleGlow,
    updateGlowSpeed,
    updateGlowMin,
    updateGlowMax,
    toggleGlowTarget,
    updateGlow,
    toggleUltraBloom,
    updateUltraBloomIntensity,
    updateUltraBloomThreshold,
    updateUltraBloomRadius,
    toggleMotionTrail,
    updateTrailLength,
    updateTrailOpacity,
    applyVisualPreset,
    clearPreset
  };
}
```

---

## 4️⃣ INTÉGRATION RENDER LOOP

**Dans votre component Three.js** :

```typescript
// Example: ThreeCanvas.tsx
import { useFrame } from '@react-three/fiber';
import { useEffects } from '../xstate-v5/hooks/useEffects';

export function ThreeCanvas() {
  const { updateGlow } = useEffects();
  const clockRef = useRef(new THREE.Clock());

  useFrame(() => {
    const elapsed = clockRef.current.getElapsedTime();

    // Update glow effect every frame
    updateGlow(elapsed);
  });

  return <Canvas>...</Canvas>;
}
```

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] `visualPresets.ts` créé avec 4 presets
- [ ] `effectsMachine.ts` créé avec machine complète
- [ ] `useEffects.ts` créé (hook)
- [ ] TypeScript compile sans erreurs
- [ ] Imports corrects (THREE, xstate, visualPresets)
- [ ] Console.log présents pour debug
- [ ] UPDATE_GLOW appelé dans render loop

---

## ➡️ PROCHAINE ÉTAPE

**Voir [G04_TESTS.md](G04_TESTS.md)** pour tester le code.

---

**FIN CODE PHASE G**
