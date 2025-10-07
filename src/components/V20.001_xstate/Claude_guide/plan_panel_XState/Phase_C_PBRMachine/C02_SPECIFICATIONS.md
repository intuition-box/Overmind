# 📋 PHASE C - SPÉCIFICATIONS : pbrMachine

**Date** : 3 octobre 2025
**Objectif** : Définir EXACTEMENT l'architecture de pbrMachine

---

## 🎯 ARCHITECTURE GLOBALE

### **pbrMachine : Un seul machine pour tous les object types**

```typescript
interface PBRContext {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;

  // Tone Mapping (global)
  toneMapping: ToneMappingType;

  // 4 Object Types
  eyeRings: ObjectPBR;
  iris: ObjectPBR;
  magicRings: ObjectPBR;
  arms: ObjectPBR;

  // Current preset
  currentPreset: PresetKey | 'custom';
}

interface ObjectPBR {
  materials: THREE.Material[] | null;  // Références aux matériaux Three.js
  metalness: number;        // 0-1
  roughness: number;        // 0-1
  envMapIntensity: number;  // 0-3
}

type ToneMappingType = 'None' | 'Linear' | 'Reinhard' | 'Cinematic' | 'ACESFilmic';
```

---

## 🔧 CONTEXTE COMPLET

```typescript
export interface PBRContext {
  // Références Three.js
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;

  // Tone Mapping global
  toneMapping: ToneMappingType;

  // Eye Rings (anneaux externes)
  eyeRings: {
    materials: THREE.Material[] | null;
    metalness: number;
    roughness: number;
    envMapIntensity: number;
  };

  // IRIS (iris des yeux)
  iris: {
    materials: THREE.Material[] | null;
    metalness: number;
    roughness: number;
    envMapIntensity: number;
  };

  // Magic Rings (anneaux magiques révélés)
  magicRings: {
    materials: THREE.Material[] | null;
    metalness: number;
    roughness: number;
    envMapIntensity: number;
  };

  // Arms (bras du modèle)
  arms: {
    materials: THREE.Material[] | null;
    metalness: number;
    roughness: number;
    envMapIntensity: number;
  };

  // Preset actuel
  currentPreset: PresetKey | 'custom';
}
```

---

## 🔧 VALEURS PAR DÉFAUT (V6)

```typescript
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
    metalness: 0.0,  // Dielectric (non-metal)
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
}
```

---

## 🔧 ÉVÉNEMENTS

```typescript
export type PBREvents =
  // Initialisation
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }
  | { type: 'SET_SCENE'; scene: THREE.Scene }

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
```

---

## 🎬 ACTIONS

### **Action : applyToneMapping**

```typescript
actions: {
  applyToneMapping: ({ context }) => {
    if (context.renderer) {
      const mapping = TONE_MAPPING_MAP[context.toneMapping];
      context.renderer.toneMapping = mapping;
      console.log(`[applyToneMapping] Set to ${context.toneMapping}`);
    }
  }
}
```

---

### **Action : applyEyeRingsPBR**

```typescript
actions: {
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

    console.log(`[applyEyeRingsPBR] metalness=${context.eyeRings.metalness}, roughness=${context.eyeRings.roughness}`);
  }
}
```

**Même pattern pour** : `applyIrisPBR`, `applyMagicRingsPBR`, `applyArmsPBR`

---

### **Action : collectMaterials**

```typescript
actions: {
  collectMaterials: ({ context }) => {
    if (!context.scene) return;

    // Eye Rings
    const eyeRingMats: THREE.Material[] = [];
    context.scene.traverse((child) => {
      if (child.name.includes('EYE_RING')) {
        if (child.material) {
          child.material = child.material.clone();  // ✅ Clone pour éviter shared refs
          eyeRingMats.push(child.material);
        }
      }
    });
    context.eyeRings.materials = eyeRingMats;

    // Répéter pour iris, magicRings, arms...
    console.log(`[collectMaterials] Found ${eyeRingMats.length} eye ring materials`);
  }
}
```

---

## 🔧 PRESETS PBR

**Chemin** : `xstate-v5/utils/pbrPresets.ts`

```typescript
export interface PBRPreset {
  name: string;
  description: string;
  values: {
    eyeRings: { metalness: number; roughness: number; envMapIntensity: number };
    iris: { metalness: number; roughness: number; envMapIntensity: number };
    magicRings: { metalness: number; roughness: number; envMapIntensity: number };
    arms: { metalness: number; roughness: number; envMapIntensity: number };
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

## 🔧 TONE MAPPING MAP

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

## 🔄 FLUX D'UTILISATION

### **Cas 1 : Utilisateur change metalness Eye Rings**

```
┌──────────────────┐
│ UI: Slider       │ → Utilisateur met metalness à 0.8
│ Eye Rings        │
│ Metalness: 0.8   │
└────────┬─────────┘
         │
         ↓ Event: UPDATE_EYE_RINGS_METALNESS({ metalness: 0.8 })
┌────────┴─────────┐
│   pbrMachine     │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ eyeRings: { ...context.eyeRings, metalness: 0.8 } })
         ↓ Action: applyEyeRingsPBR
┌────────┴─────────┐
│ eyeRings.materials │ → Foreach mat: mat.metalness = 0.8
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Eye Rings deviennent plus métalliques
└──────────────────┘
```

---

### **Cas 2 : Utilisateur applique preset Chrome**

```
┌──────────────────┐
│ UI: Dropdown     │ → Utilisateur choisit "Chrome"
│ [Chrome]         │
└────────┬─────────┘
         │
         ↓ Event: APPLY_PBR_PRESET({ preset: 'chrome' })
┌────────┴─────────┐
│   pbrMachine     │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({
         │   eyeRings: { ...chrome.values.eyeRings },
         │   iris: { ...chrome.values.iris },
         │   magicRings: { ...chrome.values.magicRings },
         │   arms: { ...chrome.values.arms },
         │   currentPreset: 'chrome'
         │ })
         ↓ Action: applyEyeRingsPBR
         ↓ Action: applyIrisPBR
         ↓ Action: applyMagicRingsPBR
         ↓ Action: applyArmsPBR
┌────────┴─────────┐
│ All materials    │ → Tous les matériaux appliqués atomiquement
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Tout devient chrome (shiny metal)
└──────────────────┘
```

---

### **Cas 3 : Utilisateur change Tone Mapping**

```
┌──────────────────┐
│ UI: Dropdown     │ → Utilisateur choisit "Cinematic"
│ [Cinematic]      │
└────────┬─────────┘
         │
         ↓ Event: SET_TONE_MAPPING({ toneMapping: 'Cinematic' })
┌────────┴─────────┐
│   pbrMachine     │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ toneMapping: 'Cinematic' })
         ↓ Action: applyToneMapping
┌────────┴─────────┐
│ context.renderer │ → renderer.toneMapping = THREE.CinematicToneMapping
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Couleurs mappées en mode cinématique
└──────────────────┘
```

---

## 🎨 UI ATTENDUE (ControlPanel Tab PBR)

```
┌─────────────────────────────────────────┐
│ ⚙️ PBR Controls                         │
├─────────────────────────────────────────┤
│                                         │
│ 🎨 Tone Mapping (Global)               │
│ [ACESFilmic ▼]                         │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🎭 PBR Presets                         │
│ [Custom ▼]                             │
│   • 🔘 Chrome                          │
│   • 💎 Glass                           │
│   • 📄 Matte                           │
│   • 🧴 Plastic                         │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 👁️ Eye Rings                           │
│ Metalness:       [=====□────] 0.5     │
│ Roughness:       [=====□────] 0.5     │
│ EnvMap Intensity:[=====□────] 1.0     │
│                                         │
│ 👀 IRIS                                │
│ Metalness:       [□─────────] 0.0     │
│ Roughness:       [======□───] 0.6     │
│ EnvMap Intensity:[===□──────] 0.5     │
│                                         │
│ ✨ Magic Rings                         │
│ Metalness:       [========□─] 0.8     │
│ Roughness:       [==□───────] 0.2     │
│ EnvMap Intensity:[========□─] 1.5     │
│                                         │
│ 💪 Arms                                │
│ Metalness:       [===□──────] 0.3     │
│ Roughness:       [=======□──] 0.7     │
│ EnvMap Intensity:[====□─────] 0.8     │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ CRITÈRES DE VALIDATION

### **Fonctionnel**
- ✅ Sliders metalness/roughness/envMap changent matériaux Three.js
- ✅ Dropdown Tone Mapping change renderer.toneMapping
- ✅ Preset Chrome applique toutes les valeurs atomiquement
- ✅ Changements visibles en temps réel

### **Technique**
- ✅ Materials clonés (pas de shared references)
- ✅ Vérification type MeshStandardMaterial avant appliquer
- ✅ Events typés correctement
- ✅ Pas de mutation directe du context

---

## ➡️ PROCHAINE ÉTAPE

**Voir [C03_CODE_EXTENSION.md](C03_CODE_EXTENSION.md)** pour le code complet.

---

**FIN SPÉCIFICATIONS PHASE C**
