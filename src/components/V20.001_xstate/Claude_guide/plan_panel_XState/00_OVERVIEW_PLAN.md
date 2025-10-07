# 🎯 PLAN COMPLET : Création ControlPanel + PerformanceMonitor XState v5

**Date** : 3 octobre 2025
**Objectif** : Créer un système de contrôle UI complet connecté aux machines XState v5
**Architecture** : 6 TABS - Full V6 Zustand Parity avec XState v5 best practices

---

## 📋 CONTEXTE

### **Situation actuelle**
- ✅ **14 machines XState créées** (bloomMachine, cameraMachine, lightingMachine, materialMachine, etc.)
- ❌ **Pas d'UI de contrôle** pour interagir avec ces machines
- ❌ **DebugPanel actuel affiche 0/0/0** (pas connecté aux machines)
- ❌ **Fonctionnalités incomplètes** dans certaines machines

### **Audit V6 Zustand révèle ce qui manque**
- ❌ **3 sections d'effets avancés** : Glow / Ultra Bloom / Motion Trail
- ❌ **Visual Presets** : Subtle / Normal / Intense / Cinematic
- ❌ **Per-group bloom params** : threshold/strength/radius par groupe (pas que emissive)
- ❌ **Per-object-type PBR** : Eye Rings / IRIS / Magic Rings / Arms (4 groupes séparés)
- ❌ **Camera controls** : View Presets / FOV / Fit Camera
- ❌ **Scene controls** : Background Color / Grid / Axes Helpers
- ❌ **Lighting** : Ambient/Directional intensities manquantes

### **Ce qu'on doit créer**
1. **PerformanceMonitor** (popup bas à droite) → FPS/Bones/Anims en temps réel
2. **ControlPanel** (panel haut à droite, style V6) → **6 TABS** : Bloom / Effects / Lighting / Camera / PBR / Scene

---

## 🗂️ STRUCTURE DU PLAN

```
Claude_guide/plan_panel_XState/
├── 00_OVERVIEW_PLAN.md                    ← Vue d'ensemble (ce fichier)
│
├── Phase_A_BloomMachine/                  ← ÉTENDU (per-group params)
│   ├── A01_ANALYSE_ACTUEL.md
│   ├── A02_SPECIFICATIONS.md              ← Per-group threshold/strength/radius + Reveal
│   ├── A03_CODE_EXTENSION.md
│   └── A04_TESTS.md
│
├── Phase_B_LightingMachine/               ← ÉTENDU (ambient/directional)
│   ├── B01_ANALYSE_ACTUEL.md
│   ├── B02_SPECIFICATIONS.md              ← Ambient/Directional intensities + presets complets
│   ├── B03_CODE_EXTENSION.md
│   └── B04_TESTS.md
│
├── Phase_C_PBRMachine/                    ← PER-OBJECT-TYPE
│   ├── C01_ANALYSE_ACTUEL.md
│   ├── C02_SPECIFICATIONS.md              ← 4 object types (Eye Rings/IRIS/Magic Rings/Arms)
│   ├── C03_CODE_CREATION.md               ← pbrMachine from scratch XState v5
│   └── C04_TESTS.md
│
├── Phase_D_PerformanceMonitor/
│   ├── D01_MAQUETTE_UI.md
│   ├── D02_CONNEXION_MACHINES.md
│   ├── D03_CODE.md
│   └── D04_TESTS.md
│
├── Phase_E_ControlPanel/                  ← 6 TABS (au lieu de 4)
│   ├── E01_MAQUETTE_UI.md                 ← 6 tabs mockup
│   ├── E02_ARCHITECTURE.md                ← Connexion UI ↔ Machines
│   ├── E03_CODE_TAB_BLOOM.md
│   ├── E04_CODE_TAB_EFFECTS.md            ← NOUVEAU (Glow/Ultra/Trail)
│   ├── E05_CODE_TAB_LIGHTING.md
│   ├── E06_CODE_TAB_CAMERA.md
│   ├── E07_CODE_TAB_PBR.md
│   ├── E08_CODE_TAB_SCENE.md              ← NOUVEAU (Background/Grid/Axes)
│   └── E09_TESTS.md
│
├── Phase_F_Tests/
│   ├── F01_CHECKLIST_COMPLETE.md
│   ├── F02_TESTS_INTEGRATION.md
│   └── F03_TESTS_PERFORMANCE.md
│
├── Phase_G_EffectsMachine/                ← NOUVEAU (Glow/Ultra/Trail)
│   ├── G01_ANALYSE_BESOINS.md             ← Ce que V6 avait (Glow/Ultra/Trail)
│   ├── G02_SPECIFICATIONS.md              ← effectsMachine specs XState v5
│   ├── G03_CODE_CREATION.md               ← effectsMachine from scratch
│   └── G04_TESTS.md
│
└── Phase_H_SceneMachine/                  ← NOUVEAU (Background/Grid/Axes)
    ├── H01_ANALYSE_BESOINS.md             ← Scene controls analysis
    ├── H02_SPECIFICATIONS.md              ← sceneMachine specs XState v5
    ├── H03_CODE_CREATION.md               ← sceneMachine from scratch
    └── H04_TESTS.md
```

---

## 🎯 ORDRE D'EXÉCUTION

### **Phase A : Étendre bloomMachine** (Priorité 1) 🔴
**Durée estimée** : 2-3h (au lieu de 1-2h)
**Objectif** : Per-group bloom params + Reveal Toggle

**Livrables** :
- ✅ bloomMachine étendu avec **per-group threshold/strength/radius** (pas que emissive)
- ✅ Context `groups` avec params complets par groupe :
  - `iris` : { threshold, strength, radius, emissiveIntensity, materials }
  - `eyeRings` : { threshold, strength, radius, emissiveIntensity, materials }
  - `revealRings` : { threshold, strength, radius, emissiveIntensity, materials, visible, objects }
- ✅ Événements : `UPDATE_GROUP_BLOOM`, `UPDATE_GROUP_EMISSIVE`, `TOGGLE_REVEAL_VISIBILITY`
- ✅ Actions qui appliquent per-group sur Three.js

---

### **Phase B : Étendre lightingMachine** (Priorité 2) 🔴
**Durée estimée** : 2h
**Objectif** : Ambient/Directional intensities + presets complets

**Livrables** :
- ✅ Context étendu : `ambientIntensity`, `directionalIntensity`, `exposure`, `hdrBoost`, `presets`
- ✅ Événements : `UPDATE_AMBIENT`, `UPDATE_DIRECTIONAL`, `UPDATE_EXPOSURE`, `APPLY_LIGHT_PRESET`
- ✅ **3 presets complets V6** :
  - Studio : { ambient: 0.8, directional: 0.8, exposure: 1.2 }
  - Outdoor : { ambient: 0.5, directional: 1.0, exposure: 1.0 }
  - Dramatic : { ambient: 0.2, directional: 1.5, exposure: 0.8 }

---

### **Phase C : Créer pbrMachine** (Priorité 3) 🔴
**Durée estimée** : 3-4h
**Objectif** : PBR per-object-type (4 groupes) from scratch XState v5

**Livrables** :
- ✅ `pbrMachine.ts` from scratch (Actor System, spawn pattern)
- ✅ Context **per-object-type** :
  ```typescript
  objectTypes: {
    eyeRings: { metalness, roughness, emissiveColor, emissiveIntensity },
    iris: { metalness, roughness, emissiveColor, emissiveIntensity },
    magicRings: { metalness, roughness, emissiveColor, emissiveIntensity },
    arms: { metalness, roughness, emissiveColor, emissiveIntensity }
  }
  ```
- ✅ Global : `toneMapping`, `envMapIntensity`, `currentPreset`
- ✅ Événements : `UPDATE_OBJECT_TYPE_PBR`, `SET_TONE_MAPPING`, `APPLY_PBR_PRESET`
- ✅ Presets : CHROME / GLASS / MATTE / PLASTIC (4 presets complets)
- ✅ Hook `usePBR.ts`

---

### **Phase G : Créer effectsMachine** (Priorité 4) 🟡
**Durée estimée** : 3-4h
**Objectif** : Glow / Ultra Bloom / Motion Trail + Visual Presets

**Livrables** :
- ✅ `effectsMachine.ts` from scratch (Actor System)
- ✅ Context :
  ```typescript
  glow: { enabled, intensity, size, decay, pulsing }
  ultraBloom: { enabled, luminanceThreshold, strength, blurIterations }
  motionTrail: { enabled, opacity, length, decay }
  visualPreset: 'subtle' | 'normal' | 'intense' | 'cinematic'
  ```
- ✅ Événements : `TOGGLE_GLOW`, `UPDATE_GLOW_*`, `TOGGLE_ULTRA`, `UPDATE_ULTRA_*`, `TOGGLE_TRAIL`, `APPLY_VISUAL_PRESET`
- ✅ **4 Visual Presets** qui modifient tous les effets simultanément
- ✅ Hook `useEffects.ts`

---

### **Phase H : Créer sceneMachine** (Priorité 5) 🟡
**Durée estimée** : 2h
**Objectif** : Background Color / Grid Helper / Axes Helper

**Livrables** :
- ✅ `sceneMachine.ts` from scratch (Actor System)
- ✅ Context :
  ```typescript
  backgroundColor: string (hex color)
  gridHelper: { enabled, size, divisions }
  axesHelper: { enabled, size }
  ```
- ✅ Événements : `UPDATE_BACKGROUND_COLOR`, `TOGGLE_GRID`, `TOGGLE_AXES`
- ✅ Actions qui ajoutent/retirent helpers de la scène Three.js
- ✅ Hook `useScene.ts`

---

### **Phase D : Créer PerformanceMonitor** (Priorité 6) 🟡
**Durée estimée** : 1h
**Objectif** : Popup FPS/Bones/Anims

**Livrables** :
- ✅ `PerformanceMonitor.tsx` (popup bas à droite)
- ✅ Hook `usePerformance.ts` qui lit depuis machines
- ✅ Auto-update 100ms

---

### **Phase E : Créer ControlPanel** (Priorité 7) 🟢
**Durée estimée** : 6-8h (6 tabs au lieu de 4)
**Objectif** : Panel complet 6 tabs

**Livrables** :
- ✅ `ControlPanel.tsx` (panel haut à droite, style V6)
- ✅ **Tab 1: BLOOM**
  - BloomColorPicker (palette complète)
  - Reveal Toggle (TRÈS VISIBLE)
  - Global threshold/strength/radius
  - Per-group controls (threshold/strength/radius/emissive per group)

- ✅ **Tab 2: EFFECTS** 🆕
  - Visual Presets (Subtle/Normal/Intense/Cinematic)
  - Glow Section (intensity/size/decay + toggle)
  - Ultra Bloom Section (luminance threshold/strength/iterations + toggle)
  - Motion Trail Section (opacity/length/decay + toggle)

- ✅ **Tab 3: LIGHTING**
  - Exposure slider
  - Ambient Intensity slider 🆕
  - Directional Intensity slider 🆕
  - Light Position Presets dropdown (Studio/Outdoor/Dramatic)
  - HDR Boost toggle + multiplier

- ✅ **Tab 4: CAMERA**
  - Position X/Y/Z sliders
  - Target X/Y/Z sliders
  - FOV slider 🆕
  - View Presets (Front/Side/Top/Isometric) 🆕
  - Reset + Fit Camera buttons 🆕

- ✅ **Tab 5: PBR**
  - Object Type Selector dropdown 🆕 (Eye Rings/IRIS/Magic Rings/Arms)
  - Metalness slider (per object type)
  - Roughness slider (per object type)
  - Emissive Color picker (per object type)
  - Emissive Intensity slider (per object type)
  - Tone Mapping dropdown (global)
  - Env Map Intensity slider (global)
  - PBR Presets (Chrome/Glass/Matte/Plastic)

- ✅ **Tab 6: SCENE** 🆕
  - Background Color Picker
  - Grid Helper Toggle + Size/Divisions sliders
  - Axes Helper Toggle + Size slider

---

### **Phase F : Tests Exhaustifs** (Priorité 8) 🟢
**Durée estimée** : 3h (au lieu de 2h, car plus de features)
**Objectif** : Vérifier TOUT

**Livrables** :
- ✅ Checklist complète (150+ points avec 6 tabs)
- ✅ Tests d'intégration UI ↔ Machines
- ✅ Tests performance (memory leaks, re-renders)
- ✅ Documentation bugs corrigés

---

## 📊 RÉCAPITULATIF

| Phase | Machine | Durée | Priorité | Dépendances |
|-------|---------|-------|----------|-------------|
| **A** | bloomMachine (étendu) | 2-3h | 🔴 1 | Aucune |
| **B** | lightingMachine (étendu) | 2h | 🔴 2 | Aucune |
| **C** | pbrMachine (per-object) | 3-4h | 🔴 3 | Aucune |
| **G** | effectsMachine (nouveau) | 3-4h | 🟡 4 | Aucune |
| **H** | sceneMachine (nouveau) | 2h | 🟡 5 | Aucune |
| **D** | PerformanceMonitor | 1h | 🟡 6 | A, B, C, G, H |
| **E** | ControlPanel (6 tabs) | 6-8h | 🟢 7 | A, B, C, D, G, H |
| **F** | Tests exhaustifs | 3h | 🟢 8 | Toutes |

**Durée totale estimée** : **22-30 heures**

---

## ✅ CRITÈRES DE SUCCÈS

### **Fonctionnel**
- ✅ PerformanceMonitor affiche FPS/Bones/Anims corrects
- ✅ Bouton Reveal Toggle montre/cache objets reveal
- ✅ Tous les sliders ControlPanel modifient Three.js en temps réel
- ✅ **Visual Presets changent tous les effets simultanément**
- ✅ **Per-group bloom params** fonctionnent (threshold/strength/radius par groupe)
- ✅ **Per-object-type PBR** fonctionne (4 groupes indépendants)
- ✅ **Background Color/Grid/Axes** modifiables
- ✅ Pas de lag visuel (60 FPS maintenu)

### **Technique**
- ✅ Architecture XState v5 respectée (Actor System, spawn pattern)
- ✅ **3 nouvelles machines** créées from scratch (pbrMachine, effectsMachine, sceneMachine)
- ✅ Pas de re-renders inutiles (useSelector optimisé)
- ✅ Pas de memory leaks (acteurs nettoyés)
- ✅ TypeScript strict mode (0 erreurs)

### **UX**
- ✅ UI ressemble au V6 Zustand (style et layout)
- ✅ **6 tabs** bien organisés (Bloom/Effects/Lighting/Camera/PBR/Scene)
- ✅ Contrôles réactifs et intuitifs
- ✅ Feedback visuel clair

---

## 🚧 CHANGEMENTS PAR RAPPORT AU PLAN INITIAL

### **Ajouts critiques** :
1. ✅ **Phase G (effectsMachine)** - Glow/Ultra Bloom/Motion Trail + Visual Presets
2. ✅ **Phase H (sceneMachine)** - Background/Grid/Axes
3. ✅ **Tab 2: Effects** dans ControlPanel
4. ✅ **Tab 6: Scene** dans ControlPanel
5. ✅ **Per-group bloom params** (threshold/strength/radius par groupe, pas que emissive)
6. ✅ **Per-object-type PBR** (4 groupes : Eye Rings/IRIS/Magic Rings/Arms)
7. ✅ **Ambient/Directional intensities** dans lightingMachine
8. ✅ **Camera controls** : View Presets / FOV / Fit Camera
9. ✅ **BloomColorPicker** : palette complète (pas 5 boutons)

### **Total** :
- **Avant** : 4 tabs, 11-15h
- **Après** : **6 tabs, 22-30h** (Full V6 Parity)

---

## 🚀 PROCHAINE ÉTAPE

**Commencer Phase A** : Analyser bloomMachine actuel et planifier extensions (per-group threshold/strength/radius + Reveal Toggle)

→ Voir [Phase_A_BloomMachine/A01_ANALYSE_ACTUEL.md](Phase_A_BloomMachine/A01_ANALYSE_ACTUEL.md)

---

**FIN OVERVIEW - VERSION 6 TABS FULL PARITY**
