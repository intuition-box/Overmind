# 💻 PHASE C - CODE : pbrMachine

**Date** : 3 octobre 2025
**Objectif** : Code complet pour créer pbrMachine

---

## 📁 FICHIERS À CRÉER

### **1. Créer : pbrPresets.ts**
### **2. Créer : toneMappingMap.ts**
### **3. Créer : pbrMachine.ts**
### **4. Créer : collectMaterials.ts** (service)
### **5. Créer : applyPBR.ts** (service)
### **6. Créer : usePBR.ts** (hook)

---

## 1️⃣ CRÉER : pbrPresets.ts

**Chemin** : `xstate-v5/utils/pbrPresets.ts`

```typescript
// xstate-v5/utils/pbrPresets.ts

export interface ObjectPBRValues {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
}

export interface PBRPreset {
  name: string;
  description: string;
  values: {
    eyeRings: ObjectPBRValues;
    iris: ObjectPBRValues;
    magicRings: ObjectPBRValues;
    arms: ObjectPBRValues;
  };
}

export const PBR_PRESETS: Record<string, PBRPreset> = {
  chrome: {
    name: '🔘 Chrome',
    description: 'Shiny metallic surface',
    values: {
      eyeRings:   { metalness: 1.0, roughness: 0.1, envMapIntensity: 2.0 },
      iris:       { metalness: 0.9, roughness: 0.2, envMapIntensity: 1.8 },
      magicRings: { metalness: 1.0, roughness: 0.0, envMapIntensity: 2.5 },
      arms:       { metalness: 0.8, roughness: 0.3, envMapIntensity: 1.5 }
    }
  },
  glass: {
    name: '💎 Glass',
    description: 'Transparent glass-like',
    values: {
      eyeRings:   { metalness: 0.0, roughness: 0.0, envMapIntensity: 1.5 },
      iris:       { metalness: 0.0, roughness: 0.1, envMapIntensity: 1.2 },
      magicRings: { metalness: 0.0, roughness: 0.0, envMapIntensity: 2.0 },
      arms:       { metalness: 0.0, roughness: 0.2, envMapIntensity: 1.0 }
    }
  },
  matte: {
    name: '📄 Matte',
    description: 'No reflections, diffuse',
    values: {
      eyeRings:   { metalness: 0.0, roughness: 1.0, envMapIntensity: 0.3 },
      iris:       { metalness: 0.0, roughness: 0.9, envMapIntensity: 0.2 },
      magicRings: { metalness: 0.0, roughness: 1.0, envMapIntensity: 0.5 },
      arms:       { metalness: 0.0, roughness: 0.8, envMapIntensity: 0.4 }
    }
  },
  plastic: {
    name: '🧴 Plastic',
    description: 'Smooth plastic surface',
    values: {
      eyeRings:   { metalness: 0.2, roughness: 0.4, envMapIntensity: 0.8 },
      iris:       { metalness: 0.1, roughness: 0.5, envMapIntensity: 0.6 },
      magicRings: { metalness: 0.3, roughness: 0.3, envMapIntensity: 1.0 },
      arms:       { metalness: 0.1, roughness: 0.6, envMapIntensity: 0.7 }
    }
  }
} as const;

export type PresetKey = keyof typeof PBR_PRESETS;
```

---

## 2️⃣ CRÉER : toneMappingMap.ts

**Chemin** : `xstate-v5/utils/toneMappingMap.ts`

```typescript
// xstate-v5/utils/toneMappingMap.ts
import * as THREE from 'three';

export const TONE_MAPPING_MAP = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cinematic: THREE.CinematicToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping
} as const;

export type ToneMappingType = keyof typeof TONE_MAPPING_MAP;
```

---

## 3️⃣ CRÉER : pbrMachine.ts

**Chemin** : `xstate-v5/actors/pbr/pbrMachine.ts`

```typescript
// xstate-v5/actors/pbr/pbrMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import { TONE_MAPPING_MAP, type ToneMappingType } from '../../utils/toneMappingMap';
import { PBR_PRESETS, type PresetKey } from '../../utils/pbrPresets';

export interface ObjectPBR {
  materials: THREE.Material[] | null;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
}

export interface PBRContext {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  toneMapping: ToneMappingType;

  eyeRings: ObjectPBR;
  iris: ObjectPBR;
  magicRings: ObjectPBR;
  arms: ObjectPBR;

  currentPreset: PresetKey | 'custom';
}

export type PBREvents =
  // Initialisation
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }
  | { type: 'SET_SCENE'; scene: THREE.Scene }
  | { type: 'COLLECT_MATERIALS' }

  // Tone Mapping
  | { type: 'SET_TONE_MAPPING'; toneMapping: ToneMappingType }

  // Eye Rings
  | { type: 'UPDATE_EYE_RINGS_METALNESS'; metalness: number }
  | { type: 'UPDATE_EYE_RINGS_ROUGHNESS'; roughness: number }
  | { type: 'UPDATE_EYE_RINGS_ENVMAP'; envMapIntensity: number }

  // IRIS
  | { type: 'UPDATE_IRIS_METALNESS'; metalness: number }
  | { type: 'UPDATE_IRIS_ROUGHNESS'; roughness: number }
  | { type: 'UPDATE_IRIS_ENVMAP'; envMapIntensity: number }

  // Magic Rings
  | { type: 'UPDATE_MAGIC_RINGS_METALNESS'; metalness: number }
  | { type: 'UPDATE_MAGIC_RINGS_ROUGHNESS'; roughness: number }
  | { type: 'UPDATE_MAGIC_RINGS_ENVMAP'; envMapIntensity: number }

  // Arms
  | { type: 'UPDATE_ARMS_METALNESS'; metalness: number }
  | { type: 'UPDATE_ARMS_ROUGHNESS'; roughness: number }
  | { type: 'UPDATE_ARMS_ENVMAP'; envMapIntensity: number }

  // Presets
  | { type: 'APPLY_PBR_PRESET'; preset: PresetKey };

export const pbrMachine = setup({
  types: {} as {
    context: PBRContext;
    events: PBREvents;
  },
  actions: {
    // Tone Mapping
    applyToneMapping: ({ context }) => {
      if (context.renderer) {
        const mapping = TONE_MAPPING_MAP[context.toneMapping];
        context.renderer.toneMapping = mapping;
        console.log(`[applyToneMapping] Set to ${context.toneMapping}`);
      }
    },

    // Collect Materials
    collectMaterials: ({ context }) => {
      if (!context.scene) {
        console.warn('[collectMaterials] No scene available');
        return;
      }

      // Eye Rings
      const eyeRingMats: THREE.Material[] = [];
      context.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('EYE_RING')) {
          if (child.material) {
            child.material = child.material.clone();
            eyeRingMats.push(child.material);
          }
        }
      });
      context.eyeRings.materials = eyeRingMats;

      // IRIS
      const irisMats: THREE.Material[] = [];
      context.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('IRIS')) {
          if (child.material) {
            child.material = child.material.clone();
            irisMats.push(child.material);
          }
        }
      });
      context.iris.materials = irisMats;

      // Magic Rings
      const magicRingMats: THREE.Material[] = [];
      context.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('MAGIC_RING')) {
          if (child.material) {
            child.material = child.material.clone();
            magicRingMats.push(child.material);
          }
        }
      });
      context.magicRings.materials = magicRingMats;

      // Arms
      const armMats: THREE.Material[] = [];
      context.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('ARM')) {
          if (child.material) {
            child.material = child.material.clone();
            armMats.push(child.material);
          }
        }
      });
      context.arms.materials = armMats;

      console.log(`[collectMaterials] Found ${eyeRingMats.length} eyeRing, ${irisMats.length} iris, ${magicRingMats.length} magicRing, ${armMats.length} arm materials`);
    },

    // Apply PBR - Eye Rings
    applyEyeRingsPBR: ({ context }) => {
      if (!context.eyeRings.materials) return;

      context.eyeRings.materials.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial) {
          mat.metalness = context.eyeRings.metalness;
          mat.roughness = context.eyeRings.roughness;
          mat.envMapIntensity = context.eyeRings.envMapIntensity;
          mat.needsUpdate = true;
        }
      });

      console.log(`[applyEyeRingsPBR] metalness=${context.eyeRings.metalness.toFixed(2)}, roughness=${context.eyeRings.roughness.toFixed(2)}, envMap=${context.eyeRings.envMapIntensity.toFixed(2)}`);
    },

    // Apply PBR - IRIS
    applyIrisPBR: ({ context }) => {
      if (!context.iris.materials) return;

      context.iris.materials.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial) {
          mat.metalness = context.iris.metalness;
          mat.roughness = context.iris.roughness;
          mat.envMapIntensity = context.iris.envMapIntensity;
          mat.needsUpdate = true;
        }
      });

      console.log(`[applyIrisPBR] metalness=${context.iris.metalness.toFixed(2)}, roughness=${context.iris.roughness.toFixed(2)}, envMap=${context.iris.envMapIntensity.toFixed(2)}`);
    },

    // Apply PBR - Magic Rings
    applyMagicRingsPBR: ({ context }) => {
      if (!context.magicRings.materials) return;

      context.magicRings.materials.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial) {
          mat.metalness = context.magicRings.metalness;
          mat.roughness = context.magicRings.roughness;
          mat.envMapIntensity = context.magicRings.envMapIntensity;
          mat.needsUpdate = true;
        }
      });

      console.log(`[applyMagicRingsPBR] metalness=${context.magicRings.metalness.toFixed(2)}, roughness=${context.magicRings.roughness.toFixed(2)}, envMap=${context.magicRings.envMapIntensity.toFixed(2)}`);
    },

    // Apply PBR - Arms
    applyArmsPBR: ({ context }) => {
      if (!context.arms.materials) return;

      context.arms.materials.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial) {
          mat.metalness = context.arms.metalness;
          mat.roughness = context.arms.roughness;
          mat.envMapIntensity = context.arms.envMapIntensity;
          mat.needsUpdate = true;
        }
      });

      console.log(`[applyArmsPBR] metalness=${context.arms.metalness.toFixed(2)}, roughness=${context.arms.roughness.toFixed(2)}, envMap=${context.arms.envMapIntensity.toFixed(2)}`);
    },

    // Apply ALL PBR (used in presets)
    applyAllPBR: ({ context }) => {
      // Eye Rings
      if (context.eyeRings.materials) {
        context.eyeRings.materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial) {
            mat.metalness = context.eyeRings.metalness;
            mat.roughness = context.eyeRings.roughness;
            mat.envMapIntensity = context.eyeRings.envMapIntensity;
            mat.needsUpdate = true;
          }
        });
      }

      // IRIS
      if (context.iris.materials) {
        context.iris.materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial) {
            mat.metalness = context.iris.metalness;
            mat.roughness = context.iris.roughness;
            mat.envMapIntensity = context.iris.envMapIntensity;
            mat.needsUpdate = true;
          }
        });
      }

      // Magic Rings
      if (context.magicRings.materials) {
        context.magicRings.materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial) {
            mat.metalness = context.magicRings.metalness;
            mat.roughness = context.magicRings.roughness;
            mat.envMapIntensity = context.magicRings.envMapIntensity;
            mat.needsUpdate = true;
          }
        });
      }

      // Arms
      if (context.arms.materials) {
        context.arms.materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial) {
            mat.metalness = context.arms.metalness;
            mat.roughness = context.arms.roughness;
            mat.envMapIntensity = context.arms.envMapIntensity;
            mat.needsUpdate = true;
          }
        });
      }

      console.log(`[applyAllPBR] Applied preset ${context.currentPreset} to all objects`);
    }
  }
}).createMachine({
  id: 'pbr',
  initial: 'idle',
  context: {
    renderer: null,
    scene: null,
    toneMapping: 'ACESFilmic',

    eyeRings: {
      materials: null,
      metalness: 0.5,
      roughness: 0.5,
      envMapIntensity: 1.0
    },

    iris: {
      materials: null,
      metalness: 0.0,
      roughness: 0.6,
      envMapIntensity: 0.5
    },

    magicRings: {
      materials: null,
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.5
    },

    arms: {
      materials: null,
      metalness: 0.3,
      roughness: 0.7,
      envMapIntensity: 0.8
    },

    currentPreset: 'custom'
  },
  states: {
    idle: {
      on: {
        SET_RENDERER: {
          actions: assign({ renderer: ({ event }) => event.renderer })
        },
        SET_SCENE: {
          actions: assign({ scene: ({ event }) => event.scene })
        },
        COLLECT_MATERIALS: {
          target: 'ready',
          actions: 'collectMaterials'
        }
      }
    },
    ready: {
      on: {
        // Tone Mapping
        SET_TONE_MAPPING: {
          actions: [
            assign({ toneMapping: ({ event }) => event.toneMapping }),
            'applyToneMapping'
          ]
        },

        // Eye Rings
        UPDATE_EYE_RINGS_METALNESS: {
          actions: [
            assign({
              eyeRings: ({ context, event }) => ({
                ...context.eyeRings,
                metalness: event.metalness
              }),
              currentPreset: 'custom'
            }),
            'applyEyeRingsPBR'
          ]
        },
        UPDATE_EYE_RINGS_ROUGHNESS: {
          actions: [
            assign({
              eyeRings: ({ context, event }) => ({
                ...context.eyeRings,
                roughness: event.roughness
              }),
              currentPreset: 'custom'
            }),
            'applyEyeRingsPBR'
          ]
        },
        UPDATE_EYE_RINGS_ENVMAP: {
          actions: [
            assign({
              eyeRings: ({ context, event }) => ({
                ...context.eyeRings,
                envMapIntensity: event.envMapIntensity
              }),
              currentPreset: 'custom'
            }),
            'applyEyeRingsPBR'
          ]
        },

        // IRIS (same pattern)
        UPDATE_IRIS_METALNESS: {
          actions: [
            assign({
              iris: ({ context, event }) => ({
                ...context.iris,
                metalness: event.metalness
              }),
              currentPreset: 'custom'
            }),
            'applyIrisPBR'
          ]
        },
        UPDATE_IRIS_ROUGHNESS: {
          actions: [
            assign({
              iris: ({ context, event }) => ({
                ...context.iris,
                roughness: event.roughness
              }),
              currentPreset: 'custom'
            }),
            'applyIrisPBR'
          ]
        },
        UPDATE_IRIS_ENVMAP: {
          actions: [
            assign({
              iris: ({ context, event }) => ({
                ...context.iris,
                envMapIntensity: event.envMapIntensity
              }),
              currentPreset: 'custom'
            }),
            'applyIrisPBR'
          ]
        },

        // Magic Rings (same pattern)
        UPDATE_MAGIC_RINGS_METALNESS: {
          actions: [
            assign({
              magicRings: ({ context, event }) => ({
                ...context.magicRings,
                metalness: event.metalness
              }),
              currentPreset: 'custom'
            }),
            'applyMagicRingsPBR'
          ]
        },
        UPDATE_MAGIC_RINGS_ROUGHNESS: {
          actions: [
            assign({
              magicRings: ({ context, event }) => ({
                ...context.magicRings,
                roughness: event.roughness
              }),
              currentPreset: 'custom'
            }),
            'applyMagicRingsPBR'
          ]
        },
        UPDATE_MAGIC_RINGS_ENVMAP: {
          actions: [
            assign({
              magicRings: ({ context, event }) => ({
                ...context.magicRings,
                envMapIntensity: event.envMapIntensity
              }),
              currentPreset: 'custom'
            }),
            'applyMagicRingsPBR'
          ]
        },

        // Arms (same pattern)
        UPDATE_ARMS_METALNESS: {
          actions: [
            assign({
              arms: ({ context, event }) => ({
                ...context.arms,
                metalness: event.metalness
              }),
              currentPreset: 'custom'
            }),
            'applyArmsPBR'
          ]
        },
        UPDATE_ARMS_ROUGHNESS: {
          actions: [
            assign({
              arms: ({ context, event }) => ({
                ...context.arms,
                roughness: event.roughness
              }),
              currentPreset: 'custom'
            }),
            'applyArmsPBR'
          ]
        },
        UPDATE_ARMS_ENVMAP: {
          actions: [
            assign({
              arms: ({ context, event }) => ({
                ...context.arms,
                envMapIntensity: event.envMapIntensity
              }),
              currentPreset: 'custom'
            }),
            'applyArmsPBR'
          ]
        },

        // Presets
        APPLY_PBR_PRESET: {
          actions: [
            assign(({ event }) => {
              const preset = PBR_PRESETS[event.preset];
              return {
                eyeRings: {
                  materials: null,  // Preserve materials reference
                  ...preset.values.eyeRings
                },
                iris: {
                  materials: null,
                  ...preset.values.iris
                },
                magicRings: {
                  materials: null,
                  ...preset.values.magicRings
                },
                arms: {
                  materials: null,
                  ...preset.values.arms
                },
                currentPreset: event.preset
              };
            }),
            'applyAllPBR'
          ]
        }
      }
    }
  }
});
```

---

## 4️⃣ CRÉER : usePBR.ts

**Chemin** : `xstate-v5/hooks/usePBR.ts`

```typescript
// xstate-v5/hooks/usePBR.ts
import { useSelector, useActorRef } from '@xstate/react';
import { pbrMachine } from '../actors/pbr/pbrMachine';
import type { ToneMappingType } from '../utils/toneMappingMap';
import type { PresetKey } from '../utils/pbrPresets';

export function usePBR() {
  const actorRef = useActorRef(pbrMachine);

  // Tone Mapping
  const toneMapping = useSelector(actorRef, (state) => state.context.toneMapping);

  // Eye Rings
  const eyeRingsMetalness = useSelector(actorRef, (state) => state.context.eyeRings.metalness);
  const eyeRingsRoughness = useSelector(actorRef, (state) => state.context.eyeRings.roughness);
  const eyeRingsEnvMap = useSelector(actorRef, (state) => state.context.eyeRings.envMapIntensity);

  // IRIS
  const irisMetalness = useSelector(actorRef, (state) => state.context.iris.metalness);
  const irisRoughness = useSelector(actorRef, (state) => state.context.iris.roughness);
  const irisEnvMap = useSelector(actorRef, (state) => state.context.iris.envMapIntensity);

  // Magic Rings
  const magicRingsMetalness = useSelector(actorRef, (state) => state.context.magicRings.metalness);
  const magicRingsRoughness = useSelector(actorRef, (state) => state.context.magicRings.roughness);
  const magicRingsEnvMap = useSelector(actorRef, (state) => state.context.magicRings.envMapIntensity);

  // Arms
  const armsMetalness = useSelector(actorRef, (state) => state.context.arms.metalness);
  const armsRoughness = useSelector(actorRef, (state) => state.context.arms.roughness);
  const armsEnvMap = useSelector(actorRef, (state) => state.context.arms.envMapIntensity);

  // Current Preset
  const currentPreset = useSelector(actorRef, (state) => state.context.currentPreset);

  // Actions
  const setToneMapping = (toneMapping: ToneMappingType) => {
    actorRef.send({ type: 'SET_TONE_MAPPING', toneMapping });
  };

  const updateEyeRingsMetalness = (metalness: number) => {
    actorRef.send({ type: 'UPDATE_EYE_RINGS_METALNESS', metalness });
  };

  const updateEyeRingsRoughness = (roughness: number) => {
    actorRef.send({ type: 'UPDATE_EYE_RINGS_ROUGHNESS', roughness });
  };

  const updateEyeRingsEnvMap = (envMapIntensity: number) => {
    actorRef.send({ type: 'UPDATE_EYE_RINGS_ENVMAP', envMapIntensity });
  };

  const updateIrisMetalness = (metalness: number) => {
    actorRef.send({ type: 'UPDATE_IRIS_METALNESS', metalness });
  };

  const updateIrisRoughness = (roughness: number) => {
    actorRef.send({ type: 'UPDATE_IRIS_ROUGHNESS', roughness });
  };

  const updateIrisEnvMap = (envMapIntensity: number) => {
    actorRef.send({ type: 'UPDATE_IRIS_ENVMAP', envMapIntensity });
  };

  const updateMagicRingsMetalness = (metalness: number) => {
    actorRef.send({ type: 'UPDATE_MAGIC_RINGS_METALNESS', metalness });
  };

  const updateMagicRingsRoughness = (roughness: number) => {
    actorRef.send({ type: 'UPDATE_MAGIC_RINGS_ROUGHNESS', roughness });
  };

  const updateMagicRingsEnvMap = (envMapIntensity: number) => {
    actorRef.send({ type: 'UPDATE_MAGIC_RINGS_ENVMAP', envMapIntensity });
  };

  const updateArmsMetalness = (metalness: number) => {
    actorRef.send({ type: 'UPDATE_ARMS_METALNESS', metalness });
  };

  const updateArmsRoughness = (roughness: number) => {
    actorRef.send({ type: 'UPDATE_ARMS_ROUGHNESS', roughness });
  };

  const updateArmsEnvMap = (envMapIntensity: number) => {
    actorRef.send({ type: 'UPDATE_ARMS_ENVMAP', envMapIntensity });
  };

  const applyPBRPreset = (preset: PresetKey) => {
    actorRef.send({ type: 'APPLY_PBR_PRESET', preset });
  };

  return {
    // State
    toneMapping,
    currentPreset,

    eyeRings: {
      metalness: eyeRingsMetalness,
      roughness: eyeRingsRoughness,
      envMapIntensity: eyeRingsEnvMap
    },

    iris: {
      metalness: irisMetalness,
      roughness: irisRoughness,
      envMapIntensity: irisEnvMap
    },

    magicRings: {
      metalness: magicRingsMetalness,
      roughness: magicRingsRoughness,
      envMapIntensity: magicRingsEnvMap
    },

    arms: {
      metalness: armsMetalness,
      roughness: armsRoughness,
      envMapIntensity: armsEnvMap
    },

    // Actions
    setToneMapping,
    updateEyeRingsMetalness,
    updateEyeRingsRoughness,
    updateEyeRingsEnvMap,
    updateIrisMetalness,
    updateIrisRoughness,
    updateIrisEnvMap,
    updateMagicRingsMetalness,
    updateMagicRingsRoughness,
    updateMagicRingsEnvMap,
    updateArmsMetalness,
    updateArmsRoughness,
    updateArmsEnvMap,
    applyPBRPreset
  };
}
```

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] `pbrPresets.ts` créé avec 4 presets (Chrome/Glass/Matte/Plastic)
- [ ] `toneMappingMap.ts` créé avec 5 tone mapping options
- [ ] `pbrMachine.ts` créé avec context complet (4 object types)
- [ ] `usePBR.ts` créé (hook)
- [ ] TypeScript compile sans erreurs
- [ ] Imports corrects (THREE, xstate, presets)
- [ ] Console.log présents pour debug
- [ ] Materials clonés (pas de shared references)

---

## ➡️ PROCHAINE ÉTAPE

**Voir [C04_TESTS.md](C04_TESTS.md)** pour tester le code.

---

**FIN CODE PHASE C**
