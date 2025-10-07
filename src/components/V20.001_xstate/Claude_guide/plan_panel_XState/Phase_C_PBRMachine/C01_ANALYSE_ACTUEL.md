# 🔍 PHASE C - ANALYSE ACTUEL : pbrMachine

**Date** : 3 octobre 2025
**Objectif** : Analyser l'état actuel et définir ce qui manque pour PBR

---

## 📊 ÉTAT ACTUEL

### **Fichier existant : pbrMachine.ts ?**

**Statut** : ❌ **PAS DE MACHINE PBR EXISTANTE**

Actuellement, il n'existe PAS de `pbrMachine.ts` dans le système XState v5.

---

## 🔍 GAP ANALYSIS : CE QUI MANQUE

### **1. Aucune machine PBR**

V6 Zustand avait un store PBR complet avec :
- Metalness (0-1)
- Roughness (0-1)
- Environment Map Intensity (0-3)
- Tone Mapping (None/Linear/Reinhard/Cinematic/ACESFilmic)
- Presets PBR (Chrome/Glass/Matte/Plastic)

**XState v5** : ❌ Rien de tout ça n'existe

---

## 📋 CE QU'ON DOIT CRÉER

### **Architecture : 4 Object Types**

D'après la recherche GPT approfondie, V6 avait 4 types d'objets PBR :

1. **Eye Rings** (anneaux externes)
2. **IRIS** (iris des yeux)
3. **Magic Rings** (anneaux magiques révélés)
4. **Arms** (bras du modèle)

Chaque type a ses propres paramètres PBR :
- `metalness` : 0-1 (0 = dielectric, 1 = metal)
- `roughness` : 0-1 (0 = mirror, 1 = matte)
- `envMapIntensity` : 0-3 (intensité réflexions environnement)

---

## 🎯 FONCTIONNALITÉS V6 À RECRÉER

### **1. PBR Per-Object-Type**

```typescript
// V6 Zustand structure
{
  eyeRings: {
    metalness: 0.8,
    roughness: 0.2,
    envMapIntensity: 1.0
  },
  iris: {
    metalness: 0.0,
    roughness: 0.5,
    envMapIntensity: 0.5
  },
  magicRings: {
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 2.0
  },
  arms: {
    metalness: 0.3,
    roughness: 0.7,
    envMapIntensity: 0.8
  }
}
```

---

### **2. Tone Mapping Global**

V6 avait un dropdown tone mapping avec 5 options :

```typescript
// V6 Zustand
toneMapping: 'ACESFilmic'  // Default
toneMappingOptions: [
  'None',         // THREE.NoToneMapping
  'Linear',       // THREE.LinearToneMapping
  'Reinhard',     // THREE.ReinhardToneMapping
  'Cinematic',    // THREE.CinematicToneMapping
  'ACESFilmic'    // THREE.ACESFilmicToneMapping
]
```

**Implémentation** : `renderer.toneMapping = THREE.ACESFilmicToneMapping`

---

### **3. Presets PBR**

V6 avait 4 presets qui changeaient **tous les object types à la fois** :

#### **Preset "Chrome"**
```typescript
{
  eyeRings:   { metalness: 1.0, roughness: 0.1, envMapIntensity: 2.0 },
  iris:       { metalness: 0.9, roughness: 0.2, envMapIntensity: 1.8 },
  magicRings: { metalness: 1.0, roughness: 0.0, envMapIntensity: 2.5 },
  arms:       { metalness: 0.8, roughness: 0.3, envMapIntensity: 1.5 }
}
```

#### **Preset "Glass"**
```typescript
{
  eyeRings:   { metalness: 0.0, roughness: 0.0, envMapIntensity: 1.5 },
  iris:       { metalness: 0.0, roughness: 0.1, envMapIntensity: 1.2 },
  magicRings: { metalness: 0.0, roughness: 0.0, envMapIntensity: 2.0 },
  arms:       { metalness: 0.0, roughness: 0.2, envMapIntensity: 1.0 }
}
```

#### **Preset "Matte"**
```typescript
{
  eyeRings:   { metalness: 0.0, roughness: 1.0, envMapIntensity: 0.3 },
  iris:       { metalness: 0.0, roughness: 0.9, envMapIntensity: 0.2 },
  magicRings: { metalness: 0.0, roughness: 1.0, envMapIntensity: 0.5 },
  arms:       { metalness: 0.0, roughness: 0.8, envMapIntensity: 0.4 }
}
```

#### **Preset "Plastic"**
```typescript
{
  eyeRings:   { metalness: 0.2, roughness: 0.4, envMapIntensity: 0.8 },
  iris:       { metalness: 0.1, roughness: 0.5, envMapIntensity: 0.6 },
  magicRings: { metalness: 0.3, roughness: 0.3, envMapIntensity: 1.0 },
  arms:       { metalness: 0.1, roughness: 0.6, envMapIntensity: 0.7 }
}
```

---

## 🔧 TECHNIQUE : COMMENT APPLIQUER PBR

### **Materials Three.js**

```typescript
// 1. Trouver tous les matériaux d'un type
const eyeRingMaterials: THREE.Material[] = [];

scene.traverse((child) => {
  if (child.name.includes('EYE_RING')) {
    if (child.material) {
      // ✅ IMPORTANT : Cloner pour éviter shared references
      child.material = child.material.clone();
      eyeRingMaterials.push(child.material);
    }
  }
});

// 2. Appliquer PBR à tous les matériaux
eyeRingMaterials.forEach((mat) => {
  if (mat instanceof THREE.MeshStandardMaterial) {
    mat.metalness = 0.8;
    mat.roughness = 0.2;
    mat.envMapIntensity = 1.0;
    mat.needsUpdate = true;
  }
});
```

---

## ⚠️ CONTRAINTES TECHNIQUES

### **1. MeshStandardMaterial requis**

PBR ne fonctionne qu'avec `MeshStandardMaterial` ou `MeshPhysicalMaterial`.

```typescript
// ✅ OK
if (mat instanceof THREE.MeshStandardMaterial ||
    mat instanceof THREE.MeshPhysicalMaterial) {
  mat.metalness = 0.8;
}

// ❌ PAS OK
if (mat instanceof THREE.MeshBasicMaterial) {
  mat.metalness = 0.8;  // Erreur : property doesn't exist
}
```

---

### **2. Environment Map requis pour envMapIntensity**

Si `envMapIntensity > 0`, il FAUT une environment map chargée :

```typescript
const envMap = new THREE.CubeTextureLoader().load([...]);
scene.environment = envMap;

// Maintenant envMapIntensity fonctionne
mat.envMapIntensity = 2.0;
```

**Sans envMap** : `envMapIntensity` ne fait rien (pas d'erreur, juste invisible)

---

### **3. Tone Mapping affecte TOUT le rendu**

```typescript
// Global pour toute la scène
renderer.toneMapping = THREE.ACESFilmicToneMapping;
```

Impossible d'avoir différents tone mappings par objet.

---

## 📊 VALEURS PAR DÉFAUT V6

D'après la recherche GPT :

```typescript
// V6 Zustand defaults
{
  toneMapping: 'ACESFilmic',

  eyeRings: {
    metalness: 0.5,
    roughness: 0.5,
    envMapIntensity: 1.0
  },

  iris: {
    metalness: 0.0,    // Dielectric (non-metal)
    roughness: 0.6,
    envMapIntensity: 0.5
  },

  magicRings: {
    metalness: 0.8,
    roughness: 0.2,
    envMapIntensity: 1.5
  },

  arms: {
    metalness: 0.3,
    roughness: 0.7,
    envMapIntensity: 0.8
  }
}
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
│   • None                                │
│   • Linear                              │
│   • Reinhard                            │
│   • Cinematic                           │
│   • ACESFilmic                          │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🎭 PBR Presets                         │
│ [Apply Preset ▼]                       │
│   • 🔘 Chrome    (shiny metal)         │
│   • 💎 Glass     (transparent)         │
│   • 📄 Matte     (no reflections)      │
│   • 🧴 Plastic   (smooth surface)      │
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

## ✅ RÉCAPITULATIF

### **Ce qui existe**
❌ Rien (pas de pbrMachine)

### **Ce qu'il faut créer**
1. ✅ `pbrMachine.ts` avec context pour 4 object types
2. ✅ Actions pour appliquer PBR aux matériaux Three.js
3. ✅ Support tone mapping global (5 options)
4. ✅ 4 presets PBR (Chrome/Glass/Matte/Plastic)
5. ✅ Events pour UPDATE_METALNESS, UPDATE_ROUGHNESS, UPDATE_ENVMAP
6. ✅ Hook `usePBR.ts`
7. ✅ Services pour appliquer PBR (fromPromise pattern)

---

## ➡️ PROCHAINE ÉTAPE

**Voir [C02_SPECIFICATIONS.md](C02_SPECIFICATIONS.md)** pour l'architecture complète.

---

**FIN ANALYSE PHASE C**
