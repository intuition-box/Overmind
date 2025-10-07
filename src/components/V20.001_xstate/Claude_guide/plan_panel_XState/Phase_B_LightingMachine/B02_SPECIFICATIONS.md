# 📋 PHASE B - SPÉCIFICATIONS : Extensions lightingMachine

**Date** : 3 octobre 2025
**Objectif** : Définir EXACTEMENT ce qu'on doit ajouter à lightingMachine

---

## 🎯 FONCTIONNALITÉS À AJOUTER

### **1. Exposure Control**

#### **Contexte étendu**
```typescript
interface LightingContext {
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  pointLight: THREE.PointLight | null;
  ambientIntensity: number;
  directionalIntensity: number;
  pointIntensity: number;

  // ✅ NOUVEAU : Renderer + Exposure
  renderer: THREE.WebGLRenderer | null;
  exposure: number;  // 0.5 à 3.0
}
```

#### **Valeurs par défaut**
```typescript
context: {
  // ... existant
  renderer: null,
  exposure: 1.7  // V6 Zustand default
}
```

---

### **2. HDR Boost**

#### **Contexte étendu**
```typescript
interface LightingContext {
  // ... existant

  // ✅ NOUVEAU : HDR Boost
  hdrBoostEnabled: boolean;
  hdrBoostMultiplier: number;  // 1.0 à 5.0
}
```

#### **Valeurs par défaut**
```typescript
context: {
  // ... existant
  hdrBoostEnabled: true,        // Actif par défaut (comme V6)
  hdrBoostMultiplier: 2.5       // V6 default
}
```

---

### **3. Light Position Presets**

#### **Contexte étendu**
```typescript
interface LightingContext {
  // ... existant

  // ✅ NOUVEAU : Position directionalLight
  directionalPosition: { x: number; y: number; z: number };
  currentPreset: string;  // Nom du preset actuel
}
```

#### **Valeurs par défaut**
```typescript
context: {
  // ... existant
  directionalPosition: { x: 1, y: 2, z: 3 },  // studio-classic
  currentPreset: 'studio-classic'
}
```

#### **Presets disponibles**
```typescript
// xstate-v5/utils/lightPresets.ts
export const LIGHT_POSITION_PRESETS = {
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
```

---

## 🔧 NOUVEAUX ÉVÉNEMENTS

```typescript
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
  | { type: 'APPLY_LIGHT_PRESET'; preset: string };
```

---

## 🎬 NOUVELLES ACTIONS

### **Action : updateExposure**
```typescript
actions: {
  updateExposure: ({ context }) => {
    if (context.renderer) {
      const finalExposure = context.hdrBoostEnabled
        ? context.exposure * context.hdrBoostMultiplier
        : context.exposure;

      context.renderer.toneMappingExposure = finalExposure;
      console.log(`[updateExposure] Set exposure to ${finalExposure} (base: ${context.exposure}, HDR: ${context.hdrBoostEnabled ? 'ON' : 'OFF'})`);
    }
  }
}
```

### **Action : updateDirectionalPosition**
```typescript
actions: {
  updateDirectionalPosition: ({ context }) => {
    if (context.directionalLight) {
      const { x, y, z } = context.directionalPosition;
      context.directionalLight.position.set(x, y, z);
      console.log(`[updateDirectionalPosition] Set position to (${x}, ${y}, ${z})`);
    }
  }
}
```

---

## 🔧 NOUVEAUX SERVICES

### **Service : applyExposure.ts**
```typescript
// xstate-v5/services/lighting/applyExposure.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

interface ApplyExposureInput {
  renderer: THREE.WebGLRenderer;
  exposure: number;
}

export const applyExposure = fromPromise<
  { success: boolean; exposure: number },
  ApplyExposureInput
>(async ({ input }) => {
  const { renderer, exposure } = input;

  renderer.toneMappingExposure = exposure;

  console.log(`[applyExposure] Set exposure to ${exposure}`);

  return { success: true, exposure };
});
```

### **Service : applyHDRBoost.ts**
```typescript
// xstate-v5/services/lighting/applyHDRBoost.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

interface ApplyHDRBoostInput {
  renderer: THREE.WebGLRenderer;
  baseExposure: number;
  enabled: boolean;
  multiplier: number;
}

export const applyHDRBoost = fromPromise<
  { success: boolean; finalExposure: number },
  ApplyHDRBoostInput
>(async ({ input }) => {
  const { renderer, baseExposure, enabled, multiplier } = input;

  const finalExposure = enabled ? baseExposure * multiplier : baseExposure;
  renderer.toneMappingExposure = finalExposure;

  console.log(`[applyHDRBoost] HDR Boost ${enabled ? 'ON' : 'OFF'}, exposure = ${finalExposure}`);

  return { success: true, finalExposure };
});
```

### **Service : applyLightPosition.ts**
```typescript
// xstate-v5/services/lighting/applyLightPosition.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

interface ApplyLightPositionInput {
  light: THREE.DirectionalLight;
  position: { x: number; y: number; z: number };
}

export const applyLightPosition = fromPromise<
  { success: boolean; position: { x: number; y: number; z: number } },
  ApplyLightPositionInput
>(async ({ input }) => {
  const { light, position } = input;

  light.position.set(position.x, position.y, position.z);

  console.log(`[applyLightPosition] Set light position to (${position.x}, ${position.y}, ${position.z})`);

  return { success: true, position };
});
```

---

## 🔄 FLUX D'UTILISATION

### **Cas 1 : Utilisateur change Exposure**

```
┌──────────────────┐
│ UI: Slider       │ → Utilisateur met exposure à 2.0
│ Exposure: 2.0    │
└────────┬─────────┘
         │
         ↓ Event: UPDATE_EXPOSURE({ exposure: 2.0 })
┌────────┴─────────┐
│ lightingMachine  │
│  ready state     │
└────────┬─────────┘
         │
         ↓ Action: assign({ exposure: 2.0 })
         ↓ Action: updateExposure
┌────────┴─────────┐
│ context.renderer │ → renderer.toneMappingExposure = 2.0 * multiplier
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Scène plus lumineuse
└──────────────────┘
```

---

### **Cas 2 : Utilisateur applique preset**

```
┌──────────────────┐
│ UI: Dropdown     │ → Utilisateur choisit "top-down"
│ [top-down]       │
└────────┬─────────┘
         │
         ↓ Event: APPLY_LIGHT_PRESET({ preset: 'top-down' })
┌────────┴─────────┐
│ lightingMachine  │
│  ready state     │
└────────┬─────────┘
         │
         ↓ Action: assign({
         │   directionalPosition: { x: 0, y: 5, z: 0 },
         │   currentPreset: 'top-down'
         │ })
         ↓ Action: updateDirectionalPosition
┌────────┴─────────┐
│ directionalLight │ → position.set(0, 5, 0)
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Lumière du haut (plongée)
└──────────────────┘
```

---

## 🎨 UI ATTENDUE (ControlPanel Tab Lighting)

```
┌─────────────────────────────────────────┐
│ 💡 Lighting Controls                    │
├─────────────────────────────────────────┤
│                                         │
│ ✨ Exposure                             │
│ Exposure: [========□──] 1.7            │
│ Range: 0.5 - 3.0                        │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🌟 HDR Boost                            │
│ [✅ Enabled]                            │
│ Multiplier: [=======□──] 2.5           │
│ Range: 1.0 - 5.0                        │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🎬 Light Position Presets              │
│ Current: [studio-classic ▼]            │
│                                         │
│ Presets:                                │
│ • 🎬 Studio Classique (1, 2, 3)        │
│ • ☀️ Plongée (0, 5, 0)                 │
│ • 🌅 Dramatique (5, 1, 1)              │
│ • 💡 Face douce (0, 1, 5)              │
│ • ✨ Contre-jour (-2, 3, -2)           │
│ • 🌙 Ambiance basse (2, 0.5, 2)        │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🔆 Light Intensities                   │
│ Ambient:     [======□────] 0.5         │
│ Directional: [========□──] 0.8         │
│ Point:       [==========□] 1.0         │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ CRITÈRES DE VALIDATION

### **Fonctionnel**
- ✅ Slider Exposure change toneMappingExposure du renderer
- ✅ Toggle HDR Boost active/désactive le multiplier
- ✅ Slider HDR Multiplier change l'intensité du boost
- ✅ Dropdown Presets change position directionalLight
- ✅ Changements visibles en temps réel dans Three.js

### **Technique**
- ✅ Événements typés correctement (TypeScript strict)
- ✅ Pas de mutation directe du context (utiliser `assign`)
- ✅ Services retournent des promesses (pattern XState v5)
- ✅ Actions sont idempotentes

### **Visuel**
- ✅ Changement exposure instantané (pas de lag)
- ✅ Presets changent immédiatement l'éclairage
- ✅ HDR boost visible (scène plus lumineuse)

---

## ➡️ PROCHAINE ÉTAPE

**Voir [B03_CODE_EXTENSION.md](B03_CODE_EXTENSION.md)** pour le code complet à écrire.

---

**FIN SPÉCIFICATIONS**
