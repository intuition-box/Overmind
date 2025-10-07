# 💻 PHASE B - CODE : Extension lightingMachine

**Date** : 3 octobre 2025
**Objectif** : Code complet à écrire pour étendre lightingMachine

---

## 📁 FICHIERS À MODIFIER/CRÉER

### **1. Créer : lightPresets.ts** (constantes)
### **2. Modifier : lightingMachine.ts**
### **3. Créer : applyExposure.ts**
### **4. Créer : applyHDRBoost.ts**
### **5. Créer : applyLightPosition.ts**

---

## 1️⃣ CRÉER : lightPresets.ts

**Chemin** : `xstate-v5/utils/lightPresets.ts`

```typescript
// xstate-v5/utils/lightPresets.ts

export interface LightPreset {
  position: { x: number; y: number; z: number };
  name: string;
  description: string;
}

export const LIGHT_POSITION_PRESETS: Record<string, LightPreset> = {
  'studio-classic': {
    position: { x: 1, y: 2, z: 3 },
    name: '🎬 Studio Classique',
    description: 'Position studio standard'
  },
  'top-down': {
    position: { x: 0, y: 5, z: 0 },
    name: '☀️ Plongée',
    description: 'Lumière du haut (midi)'
  },
  'side-dramatic': {
    position: { x: 5, y: 1, z: 1 },
    name: '🌅 Dramatique',
    description: 'Éclairage de côté'
  },
  'front-soft': {
    position: { x: 0, y: 1, z: 5 },
    name: '💡 Face douce',
    description: 'Lumière frontale douce'
  },
  'back-rim': {
    position: { x: -2, y: 3, z: -2 },
    name: '✨ Contre-jour',
    description: 'Éclairage arrière'
  },
  'low-moody': {
    position: { x: 2, y: 0.5, z: 2 },
    name: '🌙 Ambiance basse',
    description: 'Lumière basse dramatique'
  }
} as const;

export type PresetKey = keyof typeof LIGHT_POSITION_PRESETS;
```

---

## 2️⃣ MODIFIER : lightingMachine.ts

**Chemin** : `xstate-v5/actors/lighting/lightingMachine.ts`

```typescript
// xstate-v5/actors/lighting/lightingMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import { LIGHT_POSITION_PRESETS, type PresetKey } from '../../utils/lightPresets';

export interface LightingContext {
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  pointLight: THREE.PointLight | null;
  ambientIntensity: number;
  directionalIntensity: number;
  pointIntensity: number;

  // ✅ NOUVEAU : Renderer + Exposure
  renderer: THREE.WebGLRenderer | null;
  exposure: number;

  // ✅ NOUVEAU : HDR Boost
  hdrBoostEnabled: boolean;
  hdrBoostMultiplier: number;

  // ✅ NOUVEAU : Light Position
  directionalPosition: { x: number; y: number; z: number };
  currentPreset: PresetKey;
}

export type LightingEvents =
  // Existants
  | { type: 'INITIALIZE'; ambientLight: THREE.AmbientLight; directionalLight: THREE.DirectionalLight; pointLight: THREE.PointLight }
  | { type: 'UPDATE_AMBIENT_INTENSITY'; intensity: number }
  | { type: 'UPDATE_DIRECTIONAL_INTENSITY'; intensity: number }
  | { type: 'UPDATE_POINT_INTENSITY'; intensity: number }

  // ✅ NOUVEAUX : Renderer
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }

  // ✅ NOUVEAUX : Exposure
  | { type: 'UPDATE_EXPOSURE'; exposure: number }

  // ✅ NOUVEAUX : HDR Boost
  | { type: 'TOGGLE_HDR_BOOST' }
  | { type: 'ENABLE_HDR_BOOST' }
  | { type: 'DISABLE_HDR_BOOST' }
  | { type: 'UPDATE_HDR_MULTIPLIER'; multiplier: number }

  // ✅ NOUVEAUX : Light Position
  | { type: 'UPDATE_DIRECTIONAL_POSITION'; position: { x: number; y: number; z: number } }
  | { type: 'APPLY_LIGHT_PRESET'; preset: PresetKey };

export const lightingMachine = setup({
  types: {} as {
    context: LightingContext;
    events: LightingEvents;
  },
  actions: {
    // Existants
    updateAmbientLight: ({ context }) => {
      if (context.ambientLight) {
        context.ambientLight.intensity = context.ambientIntensity;
      }
    },
    updateDirectionalLight: ({ context }) => {
      if (context.directionalLight) {
        context.directionalLight.intensity = context.directionalIntensity;
      }
    },
    updatePointLight: ({ context }) => {
      if (context.pointLight) {
        context.pointLight.intensity = context.pointIntensity;
      }
    },

    // ✅ NOUVEAU : Appliquer exposure
    updateExposure: ({ context }) => {
      if (context.renderer) {
        const finalExposure = context.hdrBoostEnabled
          ? context.exposure * context.hdrBoostMultiplier
          : context.exposure;

        context.renderer.toneMappingExposure = finalExposure;
        console.log(`[updateExposure] Set exposure to ${finalExposure} (base: ${context.exposure}, HDR: ${context.hdrBoostEnabled ? 'ON' : 'OFF'})`);
      }
    },

    // ✅ NOUVEAU : Appliquer position directionalLight
    updateDirectionalPosition: ({ context }) => {
      if (context.directionalLight) {
        const { x, y, z } = context.directionalPosition;
        context.directionalLight.position.set(x, y, z);
        console.log(`[updateDirectionalPosition] Set position to (${x}, ${y}, ${z})`);
      }
    }
  }
}).createMachine({
  id: 'lighting',
  initial: 'idle',
  context: {
    ambientLight: null,
    directionalLight: null,
    pointLight: null,
    ambientIntensity: 0.5,
    directionalIntensity: 0.8,
    pointIntensity: 1.0,

    // ✅ NOUVEAU : Valeurs par défaut (V6 Zustand)
    renderer: null,
    exposure: 1.7,
    hdrBoostEnabled: true,
    hdrBoostMultiplier: 2.5,
    directionalPosition: { x: 1, y: 2, z: 3 },  // studio-classic
    currentPreset: 'studio-classic'
  },
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: 'ready',
          actions: assign({
            ambientLight: ({ event }) => event.ambientLight,
            directionalLight: ({ event }) => event.directionalLight,
            pointLight: ({ event }) => event.pointLight
          })
        }
      }
    },
    ready: {
      on: {
        // Existants
        UPDATE_AMBIENT_INTENSITY: {
          actions: [
            assign({ ambientIntensity: ({ event }) => event.intensity }),
            'updateAmbientLight'
          ]
        },
        UPDATE_DIRECTIONAL_INTENSITY: {
          actions: [
            assign({ directionalIntensity: ({ event }) => event.intensity }),
            'updateDirectionalLight'
          ]
        },
        UPDATE_POINT_INTENSITY: {
          actions: [
            assign({ pointIntensity: ({ event }) => event.intensity }),
            'updatePointLight'
          ]
        },

        // ✅ NOUVEAUX : Renderer
        SET_RENDERER: {
          actions: assign({ renderer: ({ event }) => event.renderer })
        },

        // ✅ NOUVEAUX : Exposure
        UPDATE_EXPOSURE: {
          actions: [
            assign({ exposure: ({ event }) => event.exposure }),
            'updateExposure'
          ]
        },

        // ✅ NOUVEAUX : HDR Boost
        TOGGLE_HDR_BOOST: {
          actions: [
            assign({ hdrBoostEnabled: ({ context }) => !context.hdrBoostEnabled }),
            'updateExposure'
          ]
        },
        ENABLE_HDR_BOOST: {
          actions: [
            assign({ hdrBoostEnabled: true }),
            'updateExposure'
          ]
        },
        DISABLE_HDR_BOOST: {
          actions: [
            assign({ hdrBoostEnabled: false }),
            'updateExposure'
          ]
        },
        UPDATE_HDR_MULTIPLIER: {
          actions: [
            assign({ hdrBoostMultiplier: ({ event }) => event.multiplier }),
            'updateExposure'
          ]
        },

        // ✅ NOUVEAUX : Light Position
        UPDATE_DIRECTIONAL_POSITION: {
          actions: [
            assign({
              directionalPosition: ({ event }) => event.position,
              currentPreset: 'custom' as PresetKey  // Preset custom si position manuelle
            }),
            'updateDirectionalPosition'
          ]
        },
        APPLY_LIGHT_PRESET: {
          actions: [
            assign(({ event }) => {
              const preset = LIGHT_POSITION_PRESETS[event.preset];
              return {
                directionalPosition: preset.position,
                currentPreset: event.preset
              };
            }),
            'updateDirectionalPosition'
          ]
        }
      }
    }
  }
});
```

---

## 3️⃣ CRÉER : applyExposure.ts

**Chemin** : `xstate-v5/services/lighting/applyExposure.ts`

```typescript
// xstate-v5/services/lighting/applyExposure.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface ApplyExposureInput {
  renderer: THREE.WebGLRenderer;
  exposure: number;
}

export interface ApplyExposureOutput {
  success: boolean;
  exposure: number;
}

/**
 * Service XState : Applique exposure au renderer
 *
 * @param renderer - Renderer Three.js
 * @param exposure - Valeur 0.5-3.0 pour l'exposition
 * @returns Promise avec succès et valeur appliquée
 */
export const applyExposure = fromPromise<
  ApplyExposureOutput,
  ApplyExposureInput
>(async ({ input }) => {
  const { renderer, exposure } = input;

  renderer.toneMappingExposure = exposure;

  console.log(`[applyExposure] Set toneMappingExposure to ${exposure}`);

  return { success: true, exposure };
});
```

---

## 4️⃣ CRÉER : applyHDRBoost.ts

**Chemin** : `xstate-v5/services/lighting/applyHDRBoost.ts`

```typescript
// xstate-v5/services/lighting/applyHDRBoost.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface ApplyHDRBoostInput {
  renderer: THREE.WebGLRenderer;
  baseExposure: number;
  enabled: boolean;
  multiplier: number;
}

export interface ApplyHDRBoostOutput {
  success: boolean;
  finalExposure: number;
}

/**
 * Service XState : Applique HDR boost au renderer
 *
 * @param renderer - Renderer Three.js
 * @param baseExposure - Exposition de base
 * @param enabled - true = appliquer boost
 * @param multiplier - Multiplicateur HDR (1.0-5.0)
 * @returns Promise avec succès et exposition finale
 */
export const applyHDRBoost = fromPromise<
  ApplyHDRBoostOutput,
  ApplyHDRBoostInput
>(async ({ input }) => {
  const { renderer, baseExposure, enabled, multiplier } = input;

  const finalExposure = enabled ? baseExposure * multiplier : baseExposure;
  renderer.toneMappingExposure = finalExposure;

  console.log(`[applyHDRBoost] HDR Boost ${enabled ? 'ENABLED' : 'DISABLED'}, final exposure = ${finalExposure.toFixed(2)}`);

  return { success: true, finalExposure };
});
```

---

## 5️⃣ CRÉER : applyLightPosition.ts

**Chemin** : `xstate-v5/services/lighting/applyLightPosition.ts`

```typescript
// xstate-v5/services/lighting/applyLightPosition.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface ApplyLightPositionInput {
  light: THREE.DirectionalLight;
  position: { x: number; y: number; z: number };
}

export interface ApplyLightPositionOutput {
  success: boolean;
  position: { x: number; y: number; z: number };
}

/**
 * Service XState : Applique position à directionalLight
 *
 * @param light - DirectionalLight Three.js
 * @param position - Nouvelle position {x, y, z}
 * @returns Promise avec succès et position appliquée
 */
export const applyLightPosition = fromPromise<
  ApplyLightPositionOutput,
  ApplyLightPositionInput
>(async ({ input }) => {
  const { light, position } = input;

  light.position.set(position.x, position.y, position.z);

  console.log(`[applyLightPosition] Set directionalLight to (${position.x}, ${position.y}, ${position.z})`);

  return { success: true, position };
});
```

---

## 🔧 HOOK : useLighting.ts

**Chemin** : `xstate-v5/hooks/useLighting.ts`

```typescript
// xstate-v5/hooks/useLighting.ts
import { useSelector, useActorRef } from '@xstate/react';
import { lightingMachine } from '../actors/lighting/lightingMachine';
import type { PresetKey } from '../utils/lightPresets';

export function useLighting() {
  const actorRef = useActorRef(lightingMachine);

  // Intensities
  const ambientIntensity = useSelector(actorRef, (state) => state.context.ambientIntensity);
  const directionalIntensity = useSelector(actorRef, (state) => state.context.directionalIntensity);
  const pointIntensity = useSelector(actorRef, (state) => state.context.pointIntensity);

  // Exposure
  const exposure = useSelector(actorRef, (state) => state.context.exposure);

  // HDR Boost
  const hdrBoostEnabled = useSelector(actorRef, (state) => state.context.hdrBoostEnabled);
  const hdrBoostMultiplier = useSelector(actorRef, (state) => state.context.hdrBoostMultiplier);

  // Light Position
  const directionalPosition = useSelector(actorRef, (state) => state.context.directionalPosition);
  const currentPreset = useSelector(actorRef, (state) => state.context.currentPreset);

  // Actions
  const updateAmbientIntensity = (intensity: number) => {
    actorRef.send({ type: 'UPDATE_AMBIENT_INTENSITY', intensity });
  };

  const updateDirectionalIntensity = (intensity: number) => {
    actorRef.send({ type: 'UPDATE_DIRECTIONAL_INTENSITY', intensity });
  };

  const updatePointIntensity = (intensity: number) => {
    actorRef.send({ type: 'UPDATE_POINT_INTENSITY', intensity });
  };

  const updateExposure = (exposure: number) => {
    actorRef.send({ type: 'UPDATE_EXPOSURE', exposure });
  };

  const toggleHDRBoost = () => {
    actorRef.send({ type: 'TOGGLE_HDR_BOOST' });
  };

  const updateHDRMultiplier = (multiplier: number) => {
    actorRef.send({ type: 'UPDATE_HDR_MULTIPLIER', multiplier });
  };

  const updateDirectionalPosition = (position: { x: number; y: number; z: number }) => {
    actorRef.send({ type: 'UPDATE_DIRECTIONAL_POSITION', position });
  };

  const applyLightPreset = (preset: PresetKey) => {
    actorRef.send({ type: 'APPLY_LIGHT_PRESET', preset });
  };

  return {
    // State
    ambientIntensity,
    directionalIntensity,
    pointIntensity,
    exposure,
    hdrBoostEnabled,
    hdrBoostMultiplier,
    directionalPosition,
    currentPreset,

    // Actions
    updateAmbientIntensity,
    updateDirectionalIntensity,
    updatePointIntensity,
    updateExposure,
    toggleHDRBoost,
    updateHDRMultiplier,
    updateDirectionalPosition,
    applyLightPreset
  };
}
```

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] `lightPresets.ts` créé avec tous les presets
- [ ] `lightingMachine.ts` modifié avec context étendu + nouveaux events
- [ ] `applyExposure.ts` créé avec fromPromise
- [ ] `applyHDRBoost.ts` créé avec fromPromise
- [ ] `applyLightPosition.ts` créé avec fromPromise
- [ ] `useLighting.ts` créé (hook)
- [ ] TypeScript compile sans erreurs (`npm run type-check`)
- [ ] Imports corrects (THREE, xstate, lightPresets)
- [ ] Console.log présents pour debug

---

## ➡️ PROCHAINE ÉTAPE

**Voir [B04_TESTS.md](B04_TESTS.md)** pour tester le code avant d'intégrer l'UI.

---

**FIN CODE EXTENSION**
