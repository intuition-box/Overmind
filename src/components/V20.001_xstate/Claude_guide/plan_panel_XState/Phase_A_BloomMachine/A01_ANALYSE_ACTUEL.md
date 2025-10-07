# 📊 PHASE A - ANALYSE ACTUEL : bloomMachine

**Date** : 3 octobre 2025
**Objectif** : Analyser l'état actuel de bloomMachine et identifier ce qui manque
**Sources** : Audit V6 + Recherches GPT Three.js/XState v5

---

## 🔍 ÉTAT ACTUEL DU CODE

### **Fichier analysé**
`/xstate-v5/actors/bloom/bloomMachine.ts`

### **Context actuel**

```typescript
export interface BloomContext {
  bloomPass: UnrealBloomPass | null;
  threshold: number;    // Valeur globale unique
  strength: number;     // Valeur globale unique
  radius: number;       // Valeur globale unique
  enabled: boolean;
}
```

**Valeurs par défaut** :
- `threshold: 0.5`
- `strength: 1.5`
- `radius: 0.4`
- `enabled: true`

### **Événements actuels**

```typescript
export type BloomEvents =
  | { type: 'INITIALIZE'; bloomPass: UnrealBloomPass }
  | { type: 'UPDATE_THRESHOLD'; threshold: number }
  | { type: 'UPDATE_STRENGTH'; strength: number }
  | { type: 'UPDATE_RADIUS'; radius: number }
  | { type: 'TOGGLE_ENABLED' }
  | { type: 'ENABLE' }
  | { type: 'DISABLE' };
```

### **Actions actuelles**

```typescript
actions: {
  updateBloomPass: ({ context }) => {
    if (context.bloomPass) {
      context.bloomPass.threshold = context.threshold;
      context.bloomPass.strength = context.strength;
      context.bloomPass.radius = context.radius;
      context.bloomPass.enabled = context.enabled;
    }
  }
}
```

---

## 🚨 CE QUI MANQUE (Audit V6 + Recherches GPT)

### **1. Gestion des groupes d'objets**

❌ **Pas de context pour les groupes** :
- `iris` (IRIS meshes)
- `eyeRings` (Anneaux_Eye_Ext/Int)
- `revealRings` (Ring_SG1, Ring_SG2, etc.)

❌ **Pas de propriétés emissive per-group** :
- `emissiveColor` (couleur émissive par groupe)
- `emissiveIntensity` (intensité émissive par groupe)

### **2. Reveal Toggle**

❌ **Pas de gestion de visibilité** :
- Pas de toggle pour montrer/cacher `revealRings`
- Pas de références aux objets Three.js pour gérer `visible`

### **3. BloomColorPicker**

❌ **Pas de système de couleur** :
- Pas d'événement pour changer la couleur émissive globale
- Pas de stockage de la couleur actuelle

### **4. Séparation des responsabilités**

⚠️ **bloomMachine fait tout** :
- Actuellement bloomMachine gère SEULEMENT les paramètres UnrealBloomPass
- Il devrait aussi coordonner avec un `materialMachine` pour les propriétés emissive

---

## 🔬 DÉCOUVERTES CRITIQUES (Recherches GPT)

### **Limitation technique Three.js**

**Source** : [Stack Overflow - Selective Bloom](https://stackoverflow.com/questions/61024142/selective-bloom-in-three-js)

> **UnrealBloomPass a des paramètres GLOBAUX** :
> - `threshold` : seuil de luminance global pour toute la scène
> - `strength` : force du bloom global
> - `radius` : rayon du flou global
>
> **Il est IMPOSSIBLE d'avoir threshold/strength/radius différents par objet.**

**Solution technique** :
```javascript
// ❌ IMPOSSIBLE : threshold différent par objet
irisBloomPass.threshold = 0.3;
eyeRingsBloomPass.threshold = 0.8;

// ✅ POSSIBLE : Un seul threshold global + emissive par objet
bloomPass.threshold = 0.5;  // Global
irisMesh.material.emissiveIntensity = 2.0;      // Forte émission → bloom fort
eyeRingsMesh.material.emissiveIntensity = 0.2;  // Faible émission → bloom faible
```

**Formule de luminance Three.js** :
```
luminance = emissive * emissiveIntensity + (color * light contributions)
if (luminance > threshold) { apply bloom }
```

### **Ce qui fonctionne réellement per-group**

✅ **Propriétés matériau (per-mesh)** :
- `material.emissive` (THREE.Color) - Couleur émissive
- `material.emissiveIntensity` (number) - Intensité émissive
- `mesh.visible` (boolean) - Visibilité de l'objet

❌ **Propriétés bloom (global seulement)** :
- `bloomPass.threshold` - Global
- `bloomPass.strength` - Global
- `bloomPass.radius` - Global

---

## 📋 CE QUE V6 AVAIT (Même si c'était une illusion)

### **V6 BloomControlCenter structure**

```javascript
// V6 stockait per-group mais appliquait globalement
this.groupConfigs = {
  iris: {
    emissiveColor: 0x00ff88,
    emissiveIntensity: 0.3,
    bloomSettings: { threshold: 0.3, strength: 0.8, radius: 0.4 }  // ❌ Jamais appliqué séparément !
  },
  eyeRings: {
    emissiveColor: 0x4488ff,
    emissiveIntensity: 0.4,
    bloomSettings: { threshold: 0.4, strength: 0.6, radius: 0.3 }  // ❌ Jamais appliqué séparément !
  },
  revealRings: {
    emissiveColor: 0xffaa00,
    emissiveIntensity: 0.5,
    bloomSettings: { threshold: 0.43, strength: 0.80, radius: 0.36 }  // ❌ Jamais appliqué séparément !
  }
}
```

**Réalité** :
- V6 avait UN SEUL `UnrealBloomPass` avec des paramètres globaux
- Changer "iris.threshold" modifiait en fait le threshold global
- Seuls `emissiveColor` et `emissiveIntensity` fonctionnaient vraiment per-group

### **V6 Security Presets (qu'on ne veut PAS)**

❌ **À NE PAS reproduire** :
- SAFE / DANGER / WARNING / SCANNING / NORMAL
- Remplacé par BloomColorPicker (palette complète)

---

## 🎯 GAP ANALYSIS

| Fonctionnalité | V6 Zustand | XState v5 Actuel | Requis XState v5 |
|----------------|------------|------------------|------------------|
| **Global bloom params** | ✅ threshold/strength/radius | ✅ threshold/strength/radius | ✅ Déjà OK |
| **Per-group emissive color** | ✅ (fonctionnait) | ❌ Absent | ✅ REQUIS |
| **Per-group emissive intensity** | ✅ (fonctionnait) | ❌ Absent | ✅ REQUIS |
| **Per-group bloom params** | ❌ (illusion UI) | ❌ Absent | ❌ PAS POSSIBLE (limitation Three.js) |
| **Reveal Toggle** | ✅ (fonctionnait) | ❌ Absent | ✅ REQUIS |
| **BloomColorPicker** | ✅ (palette) | ❌ Absent | ✅ REQUIS |
| **Security Presets** | ✅ (V6 avait) | ❌ Absent | ❌ PAS VOULU (remplacé par ColorPicker) |
| **Object detection/grouping** | ✅ (BloomControlCenter) | ❌ Absent | ✅ REQUIS (dans materialMachine) |

---

## ⚠️ AVERTISSEMENT IMPORTANT

### **Ne PAS reproduire l'illusion de V6**

V6 donnait aux utilisateurs des sliders séparés pour `iris.threshold`, `eyeRings.threshold`, etc., mais **ces valeurs n'étaient jamais appliquées séparément**. Changer n'importe lequel de ces sliders modifiait le même `UnrealBloomPass.threshold` global.

**Pour XState v5, on sera HONNÊTE** :
- ✅ Bloom global (threshold/strength/radius) clairement marqué comme "Global Bloom Settings"
- ✅ Emissive per-group (color/intensity) clairement marqué comme "Per-Group Emissive"
- ❌ Pas de faux sliders "per-group threshold" qui ne fonctionnent pas vraiment

---

## 🏗️ ARCHITECTURE RECOMMANDÉE (Pattern Actor)

### **Séparation des responsabilités**

```
┌─────────────────────────────────────────────────┐
│          applicationMachine (root)              │
│                                                 │
│  ┌──────────────────┐    ┌──────────────────┐  │
│  │  bloomMachine    │    │ materialMachine  │  │
│  │                  │◄───┤                  │  │
│  │ • Global params  │    │ • Per-group      │  │
│  │   - threshold    │    │   emissive       │  │
│  │   - strength     │    │ • Object refs    │  │
│  │   - radius       │    │ • Visibility     │  │
│  │ • UnrealBloom    │    │   toggle         │  │
│  │   Pass ref       │    │                  │  │
│  └──────────────────┘    └──────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**bloomMachine** gère :
- ✅ UnrealBloomPass global (threshold/strength/radius)
- ✅ Enable/disable bloom
- ✅ Coordination (peut envoyer events à materialMachine)

**materialMachine** gère :
- ✅ Références aux meshes par groupe (iris/eyeRings/revealRings)
- ✅ Propriétés emissive (color/intensity) per-group
- ✅ Visibility toggle (reveal rings)
- ✅ Application des changements sur les matériaux Three.js

**Communication** :
- bloomMachine peut faire `sendTo('materialMachine', { type: 'SET_EMISSIVE', group: 'iris', color: '#00ff88', intensity: 1.5 })`
- materialMachine applique directement sur les meshes

---

## ✅ RÉSUMÉ DES DÉCOUVERTES

### **Ce qui existe déjà** :
1. ✅ bloomMachine basique avec global threshold/strength/radius
2. ✅ Actions pour appliquer sur UnrealBloomPass
3. ✅ Enable/disable toggle

### **Ce qui manque (à ajouter)** :
1. ❌ Context pour groupes (iris/eyeRings/revealRings)
2. ❌ Propriétés emissive (color/intensity) per-group
3. ❌ Reveal toggle (visibility)
4. ❌ BloomColorPicker integration
5. ❌ Communication avec materialMachine
6. ❌ Clonage des matériaux (éviter partage matériau entre meshes)

### **Ce qu'on ne fera PAS** :
1. ❌ Per-group threshold/strength/radius (limitation technique Three.js)
2. ❌ Security Presets (remplacé par ColorPicker)
3. ❌ Illusion UI (sliders qui ne fonctionnent pas vraiment)

---

## 🚀 PROCHAINE ÉTAPE

→ [A02_SPECIFICATIONS.md](./A02_SPECIFICATIONS.md) - Définir l'architecture complète bloomMachine + materialMachine

---

**FIN ANALYSE ACTUEL**
