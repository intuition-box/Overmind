# 📊 PHASE B - ANALYSE ACTUEL : lightingMachine

**Date** : 3 octobre 2025
**Objectif** : Analyser l'état actuel de lightingMachine et identifier ce qui manque
**Sources** : Audit V6 + Recherches GPT Three.js/XState v5

---

## 🔍 ÉTAT ACTUEL DU CODE

### **Fichier analysé**
`/xstate-v5/actors/lighting/lightingMachine.ts`

### **Context actuel**

```typescript
export interface LightingContext {
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  pointLight: THREE.PointLight | null;
  ambientIntensity: number;      // 0.5 par défaut
  directionalIntensity: number;  // 0.8 par défaut
  pointIntensity: number;        // 1.0 par défaut
}
```

### **Événements actuels**

```typescript
export type LightingEvents =
  | { type: 'INITIALIZE'; ambientLight: THREE.AmbientLight; directionalLight: THREE.DirectionalLight; pointLight: THREE.PointLight }
  | { type: 'UPDATE_AMBIENT_INTENSITY'; intensity: number }
  | { type: 'UPDATE_DIRECTIONAL_INTENSITY'; intensity: number }
  | { type: 'UPDATE_POINT_INTENSITY'; intensity: number };
```

### **Actions actuelles**

```typescript
actions: {
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
  }
}
```

---

## ✅ CE QUI FONCTIONNE DÉJÀ

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| **Ambient intensity** | ✅ OK | Event `UPDATE_AMBIENT_INTENSITY` |
| **Directional intensity** | ✅ OK | Event `UPDATE_DIRECTIONAL_INTENSITY` |
| **Point intensity** | ✅ OK | Event `UPDATE_POINT_INTENSITY` |
| **Initialisation** | ✅ OK | Event `INITIALIZE` + transition `idle → ready` |
| **Application Three.js** | ✅ OK | Actions modifient lumières directement |

---

## 🚨 CE QUI MANQUE (Audit V6 + Recherches GPT)

### **1. Exposure (Tone Mapping Exposure)**

❌ **Pas de contrôle d'exposition** :
- Pas de `renderer` référence
- Pas de `exposure` dans context
- Pas d'événement `UPDATE_EXPOSURE`

**Source GPT** : [Three.js - WebGLRenderer.toneMappingExposure](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.toneMapping)

> **renderer.toneMappingExposure** contrôle l'exposition globale de la scène.
> Valeurs typiques : 0.5 à 3.0
> Défaut Three.js : 1.0
> **V6 Zustand utilisait : 1.7**

### **2. HDR Boost**

❌ **Pas de système HDR Boost** :
- Pas de `hdrBoostEnabled` toggle
- Pas de `hdrBoostMultiplier`

**V6 Zustand avait** :
```javascript
hdrBoost: true,
hdrBoostMultiplier: 2.5
// Application: renderer.toneMappingExposure = exposure * (hdrBoost ? multiplier : 1)
```

### **3. Light Position Presets**

❌ **Pas de presets de position** :
- Pas de `directionalPosition` dans context
- Pas de `currentPreset`

**V6 Zustand avait 3 presets** (trouvés dans BloomControlsPanel.jsx) :
```javascript
const LIGHT_PRESETS = {
  Studio: {
    ambient: 0.8,
    directional: 0.8,
    exposure: 1.2
  },
  Outdoor: {
    ambient: 0.5,
    directional: 1.0,
    exposure: 1.0
  },
  Dramatic: {
    ambient: 0.2,
    directional: 1.5,
    exposure: 0.8
  }
};
```

**Recherche GPT propose 6 presets de position** :
```typescript
{
  'studio-classic': { x: 1, y: 2, z: 3 },
  'top-down': { x: 0, y: 5, z: 0 },
  'side-dramatic': { x: 5, y: 1, z: 1 },
  'front-soft': { x: 0, y: 1, z: 5 },
  'back-rim': { x: -2, y: 3, z: -2 },
  'low-moody': { x: 2, y: 0.5, z: 2 }
}
```

---

## 🔬 DÉCOUVERTES CRITIQUES (Recherches GPT)

### **Relation Exposure ↔ Tone Mapping**

**Source** : Recherches GPT

> **Exposure** (renderer.toneMappingExposure) multiplie la luminance avant application du tone mapping.
>
> Formule :
> ```
> finalColor = toneMapping(scene * exposure)
> ```
>
> **Exemple** :
> - exposure = 1.0 → Scène normale
> - exposure = 2.0 → Scène 2x plus lumineuse
> - exposure = 0.5 → Scène 2x plus sombre

### **Lighting Presets complets**

**V6 avait** : Presets qui modifient **ambient + directional + exposure** simultanément.

**Pattern** :
```typescript
// Un preset = 3 paramètres changés atomiquement
{
  ambient: 0.8,       // AmbientLight.intensity
  directional: 0.8,   // DirectionalLight.intensity
  exposure: 1.2       // renderer.toneMappingExposure
}
```

### **DirectionalLight position**

**Source GPT** : [Three.js - DirectionalLight](https://threejs.org/docs/#api/en/lights/DirectionalLight)

> DirectionalLight simule le soleil (rayons parallèles).
> Position importante pour ombres + direction lumière.
>
> **Propriétés** :
> - `light.position.set(x, y, z)` - Position dans l'espace
> - `light.target` - Vers où pointe la lumière (défaut : origine 0,0,0)

---

## 🎯 GAP ANALYSIS

| Fonctionnalité | V6 Zustand | XState v5 Actuel | Requis XState v5 |
|----------------|------------|------------------|------------------|
| **Ambient intensity** | ✅ 0.5 default | ✅ 0.5 default | ✅ Déjà OK |
| **Directional intensity** | ✅ 0.8 default | ✅ 0.8 default | ✅ Déjà OK |
| **Point intensity** | ✅ 1.0 default | ✅ 1.0 default | ✅ Déjà OK |
| **Exposure** | ✅ 1.7 default | ❌ Absent | ✅ REQUIS |
| **HDR Boost** | ✅ toggle + multiplier 2.5 | ❌ Absent | ✅ REQUIS |
| **Light Presets** | ✅ 3 presets (Studio/Outdoor/Dramatic) | ❌ Absent | ✅ REQUIS |
| **Directional Position** | ❌ Pas dans V6 | ❌ Absent | ✅ RECOMMANDÉ (amélioration) |

---

## ⚠️ POINTS D'ATTENTION

### **1. Renderer référence nécessaire**

**Problème** : lightingMachine a besoin du `renderer` pour modifier `toneMappingExposure`.

**Solution** :
```typescript
context: {
  renderer: THREE.WebGLRenderer | null,
  exposure: 1.7
}

// Initialisation
{ type: 'SET_RENDERER', renderer: THREE.WebGLRenderer }

// Action
updateExposure: ({ context }) => {
  if (context.renderer) {
    const finalExposure = context.hdrBoostEnabled
      ? context.exposure * context.hdrBoostMultiplier
      : context.exposure;

    context.renderer.toneMappingExposure = finalExposure;
  }
}
```

### **2. Presets atomiques**

**Pattern V6** : Un événement `APPLY_LIGHT_PRESET` change 3 paramètres simultanément.

**XState v5** : Utiliser `assign` avec plusieurs propriétés :
```typescript
APPLY_LIGHT_PRESET: {
  actions: assign(({ event }) => {
    const preset = LIGHT_PRESETS[event.preset];
    return {
      ambientIntensity: preset.ambient,
      directionalIntensity: preset.directional,
      exposure: preset.exposure,
      currentPreset: event.preset
    };
  })
}
```

### **3. Calcul HDR Boost**

**Formule** :
```typescript
finalExposure = hdrBoostEnabled
  ? exposure * hdrBoostMultiplier
  : exposure
```

**Exemple** :
- exposure = 1.7, hdrBoost = false → finalExposure = 1.7
- exposure = 1.7, hdrBoost = true, multiplier = 2.5 → finalExposure = 4.25

---

## ✅ RÉSUMÉ DES DÉCOUVERTES

### **Ce qui existe déjà** :
1. ✅ lightingMachine basique avec ambient/directional/point intensities
2. ✅ Actions pour appliquer sur lumières Three.js
3. ✅ Initialisation avec lumières

### **Ce qui manque (à ajouter)** :
1. ❌ Renderer référence
2. ❌ Exposure control (renderer.toneMappingExposure)
3. ❌ HDR Boost (toggle + multiplier)
4. ❌ Light Presets (Studio/Outdoor/Dramatic avec ambient+directional+exposure)
5. ❌ DirectionalLight position control (amélioration vs V6)

### **Valeurs par défaut à utiliser** :
- `exposure: 1.7` (V6 default)
- `hdrBoostEnabled: true` (V6 default)
- `hdrBoostMultiplier: 2.5` (V6 default)
- `currentPreset: 'Studio'` (V6 default)

---

## 🚀 PROCHAINE ÉTAPE

→ [B02_SPECIFICATIONS.md](./B02_SPECIFICATIONS.md) - Définir l'architecture complète lightingMachine étendu

---

**FIN ANALYSE ACTUEL**
