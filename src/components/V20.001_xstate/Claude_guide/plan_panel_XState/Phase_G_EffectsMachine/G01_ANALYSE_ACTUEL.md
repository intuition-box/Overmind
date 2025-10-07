# 🔍 PHASE G - ANALYSE ACTUEL : effectsMachine

**Date** : 3 octobre 2025
**Objectif** : Analyser l'état actuel des effets avancés (Glow/Ultra Bloom/Motion Trail)

---

## 📊 ÉTAT ACTUEL

### **Fichier existant : effectsMachine.ts ?**

**Statut** : ❌ **PAS DE MACHINE EFFECTS EXISTANTE**

Actuellement, il n'existe PAS de `effectsMachine.ts` dans le système XState v5.

---

## 🔍 CE QUE V6 ZUSTAND AVAIT

D'après la recherche GPT approfondie, V6 avait **3 sections d'effets avancés** :

---

## 1️⃣ GLOW EFFECT

### **Description**
Pulsation lumineuse des objets (emissive intensity varie dans le temps)

### **Paramètres V6**
```typescript
{
  glowEnabled: boolean;           // Toggle ON/OFF
  glowSpeed: number;              // 0.1 - 5.0 (vitesse pulsation)
  glowIntensityMin: number;       // 0.0 - 2.0 (intensité minimale)
  glowIntensityMax: number;       // 0.0 - 5.0 (intensité maximale)
  glowTargets: string[];          // ['iris', 'eyeRings', 'magicRings']
}
```

### **Valeurs par défaut V6**
```typescript
{
  glowEnabled: false,
  glowSpeed: 1.0,
  glowIntensityMin: 0.5,
  glowIntensityMax: 2.0,
  glowTargets: ['iris']  // Seul l'iris pulse par défaut
}
```

### **Implémentation**
```typescript
// Dans la boucle de rendu (animate)
if (glowEnabled) {
  const time = clock.getElapsedTime();
  const intensity = glowIntensityMin +
    (Math.sin(time * glowSpeed) * 0.5 + 0.5) *
    (glowIntensityMax - glowIntensityMin);

  // Appliquer aux matériaux cibles
  irisMaterials.forEach(mat => {
    mat.emissiveIntensity = intensity;
  });
}
```

---

## 2️⃣ ULTRA BLOOM EFFECT

### **Description**
Bloom extrêmement intense (luminance très élevée)

### **Paramètres V6**
```typescript
{
  ultraBloomEnabled: boolean;     // Toggle ON/OFF
  ultraBloomIntensity: number;    // 5.0 - 20.0 (très élevé)
  ultraBloomThreshold: number;    // 0.0 - 0.5 (très bas, tout bloom)
  ultraBloomRadius: number;       // 0.5 - 2.0
}
```

### **Valeurs par défaut V6**
```typescript
{
  ultraBloomEnabled: false,
  ultraBloomIntensity: 10.0,   // 10x plus intense que bloom normal
  ultraBloomThreshold: 0.1,    // Très bas, presque tout bloom
  ultraBloomRadius: 1.0
}
```

### **Implémentation**
```typescript
// Ultra Bloom = Override bloom pass avec valeurs extrêmes
if (ultraBloomEnabled) {
  bloomPass.threshold = ultraBloomThreshold;
  bloomPass.strength = ultraBloomIntensity;
  bloomPass.radius = ultraBloomRadius;
} else {
  // Retour aux valeurs normales
  bloomPass.threshold = normalThreshold;
  bloomPass.strength = normalStrength;
  bloomPass.radius = normalRadius;
}
```

---

## 3️⃣ MOTION TRAIL EFFECT

### **Description**
Effet de traînée/afterimage (persistence de vision)

### **Paramètres V6**
```typescript
{
  motionTrailEnabled: boolean;    // Toggle ON/OFF
  trailLength: number;            // 0.1 - 0.95 (durée de la traînée)
  trailOpacity: number;           // 0.1 - 1.0 (opacité de la traînée)
}
```

### **Valeurs par défaut V6**
```typescript
{
  motionTrailEnabled: false,
  trailLength: 0.7,      // 70% persistence
  trailOpacity: 0.8
}
```

### **Implémentation**
```typescript
// Utilise AfterimagePass de Three.js
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';

const afterimagePass = new AfterimagePass(trailLength);
composer.addPass(afterimagePass);

// Update
afterimagePass.uniforms['damp'].value = trailLength;
```

---

## 4️⃣ VISUAL PRESETS

### **Description**
Presets qui combinent les 3 effets ci-dessus atomiquement

### **Presets V6**

#### **Preset "Subtle"**
```typescript
{
  name: '✨ Subtle',
  description: 'Légers effets',
  values: {
    glow: { enabled: true, speed: 0.5, min: 0.8, max: 1.2, targets: ['iris'] },
    ultraBloom: { enabled: false },
    motionTrail: { enabled: false }
  }
}
```

#### **Preset "Normal"**
```typescript
{
  name: '🌟 Normal',
  description: 'Effets équilibrés',
  values: {
    glow: { enabled: true, speed: 1.0, min: 0.5, max: 2.0, targets: ['iris', 'eyeRings'] },
    ultraBloom: { enabled: false },
    motionTrail: { enabled: false }
  }
}
```

#### **Preset "Intense"**
```typescript
{
  name: '🔥 Intense',
  description: 'Effets très marqués',
  values: {
    glow: { enabled: true, speed: 2.0, min: 0.5, max: 3.0, targets: ['iris', 'eyeRings', 'magicRings'] },
    ultraBloom: { enabled: true, intensity: 10.0, threshold: 0.1, radius: 1.0 },
    motionTrail: { enabled: false }
  }
}
```

#### **Preset "Cinematic"**
```typescript
{
  name: '🎬 Cinematic',
  description: 'Effet cinématique avec traînée',
  values: {
    glow: { enabled: true, speed: 0.3, min: 1.0, max: 2.0, targets: ['iris'] },
    ultraBloom: { enabled: true, intensity: 8.0, threshold: 0.15, radius: 1.2 },
    motionTrail: { enabled: true, length: 0.7, opacity: 0.8 }
  }
}
```

---

## ⚠️ CONTRAINTES TECHNIQUES

### **1. Glow nécessite Clock**

```typescript
// Three.js Clock pour animation
const clock = new THREE.Clock();

// Dans useFrame
const elapsed = clock.getElapsedTime();
const intensity = Math.sin(elapsed * glowSpeed);
```

---

### **2. Ultra Bloom override bloom normal**

```typescript
// ❌ CONFLIT : Ultra Bloom ET Bloom normal actifs en même temps
// → Ultra Bloom doit override les paramètres de bloomMachine

// ✅ SOLUTION : effectsMachine communique avec bloomMachine
enqueue.sendTo('bloom', {
  type: 'OVERRIDE_PARAMS',
  threshold: ultraBloomThreshold,
  strength: ultraBloomIntensity
});
```

---

### **3. Motion Trail nécessite AfterimagePass**

```typescript
// Dépendance Three.js
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';

// Doit être ajouté au composer
composer.addPass(afterimagePass);

// ⚠️ Impact performance : ~2-5ms par frame
```

---

### **4. Glow targets = communication avec materialMachine**

```typescript
// Glow modifie emissiveIntensity
// → Doit communiquer avec materialMachine (Phase C)

if (glowTargets.includes('iris')) {
  enqueue.sendTo('material', {
    type: 'ANIMATE_IRIS_EMISSIVE',
    intensity: currentGlowIntensity
  });
}
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
│   • ✨ Subtle                          │
│   • 🌟 Normal                          │
│   • 🔥 Intense                         │
│   • 🎬 Cinematic                       │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 💫 Glow Effect                         │
│ [✅ Enabled]                            │
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

## 📋 VALEURS PAR DÉFAUT

```typescript
context: {
  // Glow
  glowEnabled: false,
  glowSpeed: 1.0,
  glowIntensityMin: 0.5,
  glowIntensityMax: 2.0,
  glowTargets: ['iris'],
  currentGlowIntensity: 1.0,  // Valeur courante calculée

  // Ultra Bloom
  ultraBloomEnabled: false,
  ultraBloomIntensity: 10.0,
  ultraBloomThreshold: 0.1,
  ultraBloomRadius: 1.0,

  // Motion Trail
  motionTrailEnabled: false,
  trailLength: 0.7,
  trailOpacity: 0.8,

  // Preset
  currentPreset: 'none',

  // Références
  clock: null,
  afterimagePass: null
}
```

---

## ✅ RÉCAPITULATIF

### **Ce qui existe**
❌ Rien (pas de effectsMachine)

### **Ce qu'il faut créer**
1. ✅ `effectsMachine.ts` avec context complet
2. ✅ Actions pour Glow (calculate intensity based on time)
3. ✅ Actions pour Ultra Bloom (override bloom params)
4. ✅ Actions pour Motion Trail (toggle AfterimagePass)
5. ✅ Communication avec bloomMachine (sendTo)
6. ✅ Communication avec materialMachine (sendTo)
7. ✅ 4 Visual Presets (Subtle/Normal/Intense/Cinematic)
8. ✅ Hook `useEffects.ts`
9. ✅ Service `updateGlow.ts` (appelé chaque frame)

---

## ➡️ PROCHAINE ÉTAPE

**Voir [G02_SPECIFICATIONS.md](G02_SPECIFICATIONS.md)** pour l'architecture complète.

---

**FIN ANALYSE PHASE G**
