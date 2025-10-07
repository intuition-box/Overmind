# 📋 PHASE G - SPÉCIFICATIONS : effectsMachine

**Date** : 3 octobre 2025
**Objectif** : Définir EXACTEMENT l'architecture de effectsMachine

---

## 🎯 ARCHITECTURE

### **effectsMachine : Un seul machine pour 3 effets**

```typescript
interface EffectsContext {
  // Références
  clock: THREE.Clock | null;
  afterimagePass: AfterimagePass | null;

  // Glow Effect
  glowEnabled: boolean;
  glowSpeed: number;              // 0.1 - 5.0
  glowIntensityMin: number;       // 0.0 - 2.0
  glowIntensityMax: number;       // 0.0 - 5.0
  glowTargets: GlowTarget[];      // ['iris', 'eyeRings', 'magicRings']
  currentGlowIntensity: number;   // Calculé chaque frame

  // Ultra Bloom Effect
  ultraBloomEnabled: boolean;
  ultraBloomIntensity: number;    // 5.0 - 20.0
  ultraBloomThreshold: number;    // 0.0 - 0.5
  ultraBloomRadius: number;       // 0.5 - 2.0

  // Motion Trail Effect
  motionTrailEnabled: boolean;
  trailLength: number;            // 0.1 - 0.95
  trailOpacity: number;           // 0.1 - 1.0

  // Preset
  currentPreset: VisualPresetKey | 'none';
}

type GlowTarget = 'iris' | 'eyeRings' | 'magicRings';
```

---

## 🔧 CONTEXTE COMPLET

```typescript
export interface EffectsContext {
  // Références Three.js
  clock: THREE.Clock | null;
  afterimagePass: AfterimagePass | null;

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

export type GlowTarget = 'iris' | 'eyeRings' | 'magicRings';
```

---

## 🔧 VALEURS PAR DÉFAUT

```typescript
context: {
  clock: null,
  afterimagePass: null,

  // Glow (disabled by default)
  glowEnabled: false,
  glowSpeed: 1.0,
  glowIntensityMin: 0.5,
  glowIntensityMax: 2.0,
  glowTargets: ['iris'],
  currentGlowIntensity: 1.0,

  // Ultra Bloom (disabled by default)
  ultraBloomEnabled: false,
  ultraBloomIntensity: 10.0,
  ultraBloomThreshold: 0.1,
  ultraBloomRadius: 1.0,

  // Motion Trail (disabled by default)
  motionTrailEnabled: false,
  trailLength: 0.7,
  trailOpacity: 0.8,

  currentPreset: 'none'
}
```

---

## 🔧 ÉVÉNEMENTS

```typescript
export type EffectsEvents =
  // Initialisation
  | { type: 'SET_CLOCK'; clock: THREE.Clock }
  | { type: 'SET_AFTERIMAGE_PASS'; pass: AfterimagePass }

  // Glow
  | { type: 'TOGGLE_GLOW' }
  | { type: 'ENABLE_GLOW' }
  | { type: 'DISABLE_GLOW' }
  | { type: 'UPDATE_GLOW_SPEED'; speed: number }
  | { type: 'UPDATE_GLOW_MIN'; min: number }
  | { type: 'UPDATE_GLOW_MAX'; max: number }
  | { type: 'TOGGLE_GLOW_TARGET'; target: GlowTarget }
  | { type: 'UPDATE_GLOW'; elapsed: number }  // Appelé chaque frame

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
```

---

## 🎬 ACTIONS

### **Action : calculateGlowIntensity**

```typescript
actions: {
  calculateGlowIntensity: assign(({ context, event }) => {
    if (!context.glowEnabled || event.type !== 'UPDATE_GLOW') return {};

    const elapsed = event.elapsed;
    const phase = Math.sin(elapsed * context.glowSpeed) * 0.5 + 0.5;
    const intensity = context.glowIntensityMin +
      phase * (context.glowIntensityMax - context.glowIntensityMin);

    return {
      currentGlowIntensity: intensity
    };
  })
}
```

---

### **Action : applyGlowToTargets**

```typescript
actions: {
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
  })
}
```

---

### **Action : applyUltraBloom**

```typescript
actions: {
  applyUltraBloom: enqueueActions(({ context, enqueue }) => {
    if (context.ultraBloomEnabled) {
      // Override bloom parameters
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
    } else {
      // Restore normal bloom (optionnel)
      enqueue.sendTo('bloom', { type: 'RESTORE_DEFAULTS' });
    }
  })
}
```

---

### **Action : applyMotionTrail**

```typescript
actions: {
  applyMotionTrail: ({ context }) => {
    if (context.afterimagePass) {
      context.afterimagePass.enabled = context.motionTrailEnabled;
      if (context.motionTrailEnabled) {
        context.afterimagePass.uniforms['damp'].value = context.trailLength;
      }
      console.log(`[applyMotionTrail] ${context.motionTrailEnabled ? 'ENABLED' : 'DISABLED'}, length=${context.trailLength}`);
    }
  }
}
```

---

## 🔧 VISUAL PRESETS

**Chemin** : `xstate-v5/utils/visualPresets.ts`

```typescript
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

## 🔄 FLUX D'UTILISATION

### **Cas 1 : UPDATE_GLOW chaque frame**

```
┌──────────────────┐
│ Render Loop      │ → useFrame() - chaque frame
└────────┬─────────┘
         │
         ↓ Event: UPDATE_GLOW({ elapsed: clock.getElapsedTime() })
┌────────┴─────────┐
│ effectsMachine   │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: calculateGlowIntensity
┌────────┴─────────┐
│ Calculate        │ → intensity = min + sin(time * speed) * (max - min)
└────────┬─────────┘
         │
         ↓ Action: applyGlowToTargets
┌────────┴─────────┐
│ Send to material │ → sendTo('material', SET_IRIS_EMISSIVE_INTENSITY)
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ materialMachine  │ → IRIS emissive intensity change
└──────────────────┘
```

---

### **Cas 2 : Utilisateur applique preset Intense**

```
┌──────────────────┐
│ UI: Dropdown     │ → Utilisateur choisit "Intense"
│ [Intense ▼]      │
└────────┬─────────┘
         │
         ↓ Event: APPLY_VISUAL_PRESET({ preset: 'intense' })
┌────────┴─────────┐
│ effectsMachine   │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ ...preset.values })
┌────────┴─────────┐
│ Context updated  │ → glow enabled, ultraBloom enabled
└────────┬─────────┘
         │
         ↓ Action: applyUltraBloom
┌────────┴─────────┐
│ Send to bloom    │ → sendTo('bloom', SET_THRESHOLD/STRENGTH/RADIUS)
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ bloomMachine     │ → Ultra bloom appliqué
└──────────────────┘
```

---

## 🎨 UI ATTENDUE (ControlPanel Tab Effects)

```
┌─────────────────────────────────────────┐
│ ✨ Effects Controls                     │
├─────────────────────────────────────────┤
│                                         │
│ 🌟 Visual Presets                      │
│ [None ▼]                               │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 💫 Glow Effect                         │
│ [  ] Enabled                            │
│ Speed:         [=====□────] 1.0        │
│ Min Intensity: [===□──────] 0.5        │
│ Max Intensity: [==========] 2.0        │
│ Targets:                                │
│   [✅] IRIS                             │
│   [  ] Eye Rings                        │
│   [  ] Magic Rings                      │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🌈 Ultra Bloom                         │
│ [  ] Enabled                            │
│ Intensity:     [==========] 10.0       │
│ Threshold:     [=□────────] 0.1        │
│ Radius:        [=====□────] 1.0        │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🌀 Motion Trail                        │
│ [  ] Enabled                            │
│ Length:        [=======□──] 0.7        │
│ Opacity:       [========□─] 0.8        │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ CRITÈRES DE VALIDATION

### **Fonctionnel**
- ✅ Glow pulse en temps réel selon glowSpeed
- ✅ Glow targets (iris/eyeRings/magicRings) fonctionnent
- ✅ Ultra Bloom override bloom parameters
- ✅ Motion Trail active AfterimagePass
- ✅ Visual Presets appliquent tous paramètres atomiquement
- ✅ Modifications manuelles changent preset à 'none'

### **Technique**
- ✅ UPDATE_GLOW appelé chaque frame
- ✅ Communication avec bloomMachine (sendTo)
- ✅ Communication avec materialMachine (sendTo)
- ✅ Pas de mutation directe du context
- ✅ AfterimagePass enabled/disabled correctement

---

## ➡️ PROCHAINE ÉTAPE

**Voir [G03_CODE_EXTENSION.md](G03_CODE_EXTENSION.md)** pour le code complet.

---

**FIN SPÉCIFICATIONS PHASE G**
