# 📋 G03 - FILES ORDER CHECKLIST

**Date** : 2 octobre 2025
**Phase** : G - Plan d'Implémentation
**Session** : G03 - Ordre Création Fichiers
**Statut** : ✅ COMPLET

---

## 🎯 OBJECTIF

Lister les **47 fichiers** à créer dans l'**ordre exact** basé sur les dépendances, avec temps estimé et validations.

---

## 📊 PRINCIPE D'ORDRE

**Règle** : Un fichier ne peut être créé que si toutes ses dépendances existent déjà.

**Exemple** :
```
❌ MAUVAIS ORDRE :
1. useApplication.ts (dépend de applicationMachine.ts qui n'existe pas encore)
2. applicationMachine.ts

✅ BON ORDRE :
1. applicationMachine.ts (pas de dépendances)
2. useApplication.ts (dépend de applicationMachine.ts ✅)
```

---

## 🗂️ LISTE COMPLÈTE (47 FICHIERS)

### **PHASE 1 : FOUNDATION (Fichiers 1-10) - 4h**

#### **1/47 : types.ts (Global Types)**
- **Path** : `/xstate-v5/utils/types.ts`
- **Dépendances** : Aucune
- **Temps** : 15 min
- **Lignes** : ~50
- **Validation** : TypeScript compile sans erreur
- **Description** : Types globaux partagés

```typescript
// Types de base pour tout le projet
export interface GLBLoadOutput { /* ... */ }
export interface BoneValidation { /* ... */ }
// ...
```

---

#### **2/47 : colorConversion.ts**
- **Path** : `/xstate-v5/utils/colorConversion.ts`
- **Dépendances** : Aucune
- **Temps** : 10 min
- **Lignes** : ~20
- **Validation** : Tests unitaires passent
- **Description** : Fonctions conversion couleurs HTML ↔ Hex

```typescript
export function htmlToHex(htmlColor: string): number { /* ... */ }
export function hexToHtml(hexColor: number): string { /* ... */ }
```

---

#### **3/47 : easingFunctions.ts**
- **Path** : `/xstate-v5/utils/easingFunctions.ts`
- **Dépendances** : Aucune
- **Temps** : 10 min
- **Lignes** : ~30
- **Validation** : Tests unitaires passent
- **Description** : Fonctions easing pour animations

---

#### **4/47 : applicationMachine.types.ts**
- **Path** : `/xstate-v5/actors/application/applicationMachine.types.ts`
- **Dépendances** : `types.ts`
- **Temps** : 15 min
- **Lignes** : ~40
- **Validation** : TypeScript compile
- **Description** : Types pour ApplicationActor

---

#### **5/47 : applicationMachine.ts**
- **Path** : `/xstate-v5/actors/application/applicationMachine.ts`
- **Dépendances** : `applicationMachine.types.ts`
- **Temps** : 20 min
- **Lignes** : ~60
- **Validation** : Machine s'instancie sans erreur
- **Description** : Root actor orchestration

---

#### **6/47 : useApplication.ts**
- **Path** : `/xstate-v5/hooks/useApplication.ts`
- **Dépendances** : `applicationMachine.ts`
- **Temps** : 15 min
- **Lignes** : ~40
- **Validation** : Hook compile et retourne état
- **Description** : Hook React pour ApplicationActor

---

#### **7/47 : OvermindContext.tsx**
- **Path** : `/xstate-v5/context/OvermindContext.tsx`
- **Dépendances** : `applicationMachine.ts`
- **Temps** : 20 min
- **Lignes** : ~50
- **Validation** : Context fonctionne
- **Description** : React Context pour DI

---

#### **8/47 : OvermindProvider.tsx**
- **Path** : `/xstate-v5/context/OvermindProvider.tsx`
- **Dépendances** : `OvermindContext.tsx`, `useApplication.ts`
- **Temps** : 15 min
- **Lignes** : ~40
- **Validation** : Provider wraps children
- **Description** : Provider root

---

#### **9/47 : App.tsx**
- **Path** : `/xstate-v5/components/App/App.tsx`
- **Dépendances** : `OvermindProvider.tsx`, `useApplication.ts`
- **Temps** : 10 min
- **Lignes** : ~30
- **Validation** : App affiche "Hello XState"
- **Description** : Composant root

---

#### **10/47 : index.ts (barrel exports)**
- **Path** : `/xstate-v5/index.ts`
- **Dépendances** : Tous fichiers 1-9
- **Temps** : 10 min
- **Lignes** : ~20
- **Validation** : Imports fonctionnent
- **Description** : Exports centralisés

---

### **✅ VALIDATION PHASE 1**

**Commandes** :
```bash
npm run dev
```

**Résultat attendu** :
- ✅ Application démarre sur http://localhost:3000
- ✅ Aucune erreur console
- ✅ Affiche "Hello XState" ou interface minimale
- ✅ State machine visible dans Stately Inspector

---

### **PHASE 2 : SCENE LIFECYCLE (Fichiers 11-20) - 5h**

#### **11/47 : loadGLBFile.ts**
- **Path** : `/xstate-v5/services/scene/loadGLBFile.ts`
- **Dépendances** : `types.ts`
- **Temps** : 30 min
- **Lignes** : ~80
- **Validation** : Service charge GLB
- **Description** : Service fromPromise pour chargement GLB

---

#### **12/47 : validateBones.ts**
- **Path** : `/xstate-v5/services/scene/validateBones.ts`
- **Dépendances** : `types.ts`
- **Temps** : 20 min
- **Lignes** : ~60
- **Validation** : Validation 484 bones
- **Description** : Service validation squelette

---

#### **13/47 : setupScene.ts**
- **Path** : `/xstate-v5/services/scene/setupScene.ts`
- **Dépendances** : `types.ts`
- **Temps** : 20 min
- **Lignes** : ~50
- **Validation** : Scene Three.js créée
- **Description** : Service setup scène

---

#### **14/47 : sceneLifecycleMachine.types.ts**
- **Path** : `/xstate-v5/actors/scene/sceneLifecycleMachine.types.ts`
- **Dépendances** : `types.ts`
- **Temps** : 20 min
- **Lignes** : ~50
- **Validation** : Types compilent
- **Description** : Types SceneLifecycleActor

---

#### **15/47 : sceneLifecycleMachine.ts**
- **Path** : `/xstate-v5/actors/scene/sceneLifecycleMachine.ts`
- **Dépendances** : `sceneLifecycleMachine.types.ts`, `loadGLBFile.ts`, `validateBones.ts`, `setupScene.ts`
- **Temps** : 40 min
- **Lignes** : ~100
- **Validation** : Machine charge modèle
- **Description** : Actor gestion cycle vie scène

---

#### **16/47 : useSceneLifecycle.ts**
- **Path** : `/xstate-v5/hooks/useSceneLifecycle.ts`
- **Dépendances** : `sceneLifecycleMachine.ts`
- **Temps** : 20 min
- **Lignes** : ~50
- **Validation** : Hook retourne scene state
- **Description** : Hook React pour SceneLifecycleActor

---

#### **17/47 : OvermindScene.tsx**
- **Path** : `/xstate-v5/components/Scene/OvermindScene.tsx`
- **Dépendances** : `useSceneLifecycle.ts`
- **Temps** : 30 min
- **Lignes** : ~80
- **Validation** : Canvas Three.js affiché
- **Description** : Composant scène 3D

---

#### **18/47 : processMaterials.ts**
- **Path** : `/xstate-v5/services/scene/processMaterials.ts`
- **Dépendances** : `types.ts`
- **Temps** : 25 min
- **Lignes** : ~70
- **Validation** : Matériaux traités
- **Description** : Service traitement matériaux

---

#### **19/47 : cleanupResources.ts**
- **Path** : `/xstate-v5/services/scene/cleanupResources.ts`
- **Dépendances** : `types.ts`
- **Temps** : 20 min
- **Lignes** : ~60
- **Validation** : Cleanup sans memory leaks
- **Description** : Service cleanup Three.js

---

#### **20/47 : modelLoaderMachine.ts**
- **Path** : `/xstate-v5/actors/model/modelLoaderMachine.ts`
- **Dépendances** : `loadGLBFile.ts`, `validateBones.ts`, `processMaterials.ts`
- **Temps** : 30 min
- **Lignes** : ~80
- **Validation** : Modèle charge + 484 bones validés
- **Description** : Actor chargement modèle

---

### **✅ VALIDATION PHASE 2**

**Résultat attendu** :
- ✅ Modèle GLB s'affiche dans canvas
- ✅ 484 bones validés
- ✅ Matériaux correctement appliqués
- ✅ Aucune erreur Three.js console

---

### **PHASE 3 : ANIMATION & CAMERA (Fichiers 21-28) - 4h**

#### **21/47 : setupAnimationMixer.ts**
- **Path** : `/xstate-v5/services/animation/setupAnimationMixer.ts`
- **Dépendances** : `types.ts`
- **Temps** : 25 min
- **Lignes** : ~60

---

#### **22/47 : crossfadeAnimation.ts**
- **Path** : `/xstate-v5/services/animation/crossfadeAnimation.ts`
- **Dépendances** : `types.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **23/47 : animationMachine.ts**
- **Path** : `/xstate-v5/actors/animation/animationMachine.ts`
- **Dépendances** : `setupAnimationMixer.ts`, `crossfadeAnimation.ts`
- **Temps** : 35 min
- **Lignes** : ~90

---

#### **24/47 : useAnimationControl.ts**
- **Path** : `/xstate-v5/hooks/useAnimationControl.ts`
- **Dépendances** : `animationMachine.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **25/47 : setupCamera.ts**
- **Path** : `/xstate-v5/services/rendering/setupCamera.ts`
- **Dépendances** : `types.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **26/47 : cameraMachine.ts**
- **Path** : `/xstate-v5/actors/camera/cameraMachine.ts`
- **Dépendances** : `setupCamera.ts`
- **Temps** : 25 min
- **Lignes** : ~60

---

#### **27/47 : useCameraControl.ts**
- **Path** : `/xstate-v5/hooks/useCameraControl.ts`
- **Dépendances** : `cameraMachine.ts`
- **Temps** : 15 min
- **Lignes** : ~40

---

#### **28/47 : AnimationControl.tsx**
- **Path** : `/xstate-v5/components/AnimationControl/AnimationControl.tsx`
- **Dépendances** : `useAnimationControl.ts`
- **Temps** : 25 min
- **Lignes** : ~70

---

### **✅ VALIDATION PHASE 3**

**Résultat attendu** :
- ✅ 29 animations disponibles
- ✅ Animations jouent avec crossfade
- ✅ Caméra OrbitControls fonctionne
- ✅ UI contrôle animations

---

### **PHASE 4 : RENDERING & EFFECTS (Fichiers 29-38) - 5h**

#### **29/47 : setupBloomPass.ts**
- **Path** : `/xstate-v5/services/rendering/setupBloomPass.ts`
- **Temps** : 25 min
- **Lignes** : ~60

---

#### **30/47 : bloomMachine.ts**
- **Path** : `/xstate-v5/actors/bloom/bloomMachine.ts`
- **Temps** : 30 min
- **Lignes** : ~80

---

#### **31/47 : useBloomControl.ts**
- **Path** : `/xstate-v5/hooks/useBloomControl.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **32/47 : setupLights.ts**
- **Path** : `/xstate-v5/services/rendering/setupLights.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **33/47 : lightingMachine.ts**
- **Path** : `/xstate-v5/actors/lighting/lightingMachine.ts`
- **Temps** : 25 min
- **Lignes** : ~60

---

#### **34/47 : createParticleSystem.ts**
- **Path** : `/xstate-v5/services/rendering/createParticleSystem.ts`
- **Temps** : 30 min
- **Lignes** : ~70

---

#### **35/47 : particleMachine.ts**
- **Path** : `/xstate-v5/actors/particle/particleMachine.ts`
- **Temps** : 30 min
- **Lignes** : ~70

---

#### **36/47 : renderingMachine.ts**
- **Path** : `/xstate-v5/actors/rendering/renderingMachine.ts`
- **Temps** : 35 min
- **Lignes** : ~90

---

#### **37/47 : useRenderingControl.ts**
- **Path** : `/xstate-v5/hooks/useRenderingControl.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **38/47 : transitionMachine.ts**
- **Path** : `/xstate-v5/actors/transition/transitionMachine.ts`
- **Temps** : 25 min
- **Lignes** : ~60

---

### **✅ VALIDATION PHASE 4**

**Résultat attendu** :
- ✅ Bloom effect fonctionne
- ✅ Lumières scène configurables
- ✅ Particules s'affichent
- ✅ 60 FPS maintenu

---

### **PHASE 5 : FEATURES UI (Fichiers 39-45) - 4h**

#### **39/47 : applyColorToMaterials.ts**
- **Path** : `/xstate-v5/services/features/applyColorToMaterials.ts`
- **Temps** : 25 min
- **Lignes** : ~60

---

#### **40/47 : bloomColorPickerMachine.ts**
- **Path** : `/xstate-v5/actors/features/bloomColorPicker/bloomColorPickerMachine.ts`
- **Temps** : 30 min
- **Lignes** : ~80

---

#### **41/47 : useBloomColorPicker.ts**
- **Path** : `/xstate-v5/hooks/useBloomColorPicker.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **42/47 : BloomColorPicker.tsx**
- **Path** : `/xstate-v5/components/BloomColorPicker/BloomColorPicker.tsx`
- **Temps** : 30 min
- **Lignes** : ~80

---

#### **43/47 : debugPanelMachine.ts**
- **Path** : `/xstate-v5/actors/features/debugPanel/debugPanelMachine.ts`
- **Temps** : 30 min
- **Lignes** : ~70

---

#### **44/47 : useDebugPanel.ts**
- **Path** : `/xstate-v5/hooks/useDebugPanel.ts`
- **Temps** : 20 min
- **Lignes** : ~50

---

#### **45/47 : DebugPanel.tsx**
- **Path** : `/xstate-v5/components/DebugPanel/DebugPanel.tsx`
- **Temps** : 40 min
- **Lignes** : ~120

---

### **✅ VALIDATION PHASE 5**

**Résultat attendu** :
- ✅ Color picker change couleurs bloom
- ✅ Debug panel affiche tous contrôles
- ✅ Debouncing 200ms fonctionne
- ✅ UI réactive et fluide

---

### **PHASE 6 : POLISH & TESTS (Fichiers 46-47) - 2h**

#### **46/47 : Zustand Stores**
- **Path** : `/xstate-v5/stores/useDebugPanelStore.ts`
- **Temps** : 30 min
- **Lignes** : ~40

---

#### **47/47 : Tests Setup**
- **Path** : `/xstate-v5/__tests__/setup.ts`
- **Temps** : 20 min
- **Lignes** : ~30

---

## 📊 RÉSUMÉ PHASES

| Phase | Fichiers | Durée | Description |
|-------|----------|-------|-------------|
| **1** | 1-10 | 4h | Foundation (types, utils, app root) |
| **2** | 11-20 | 5h | Scene lifecycle (GLB, validation, materials) |
| **3** | 21-28 | 4h | Animation & Camera |
| **4** | 29-38 | 5h | Rendering & Effects (bloom, lights, particles) |
| **5** | 39-45 | 4h | Features UI (color picker, debug panel) |
| **6** | 46-47 | 2h | Polish & Tests |

**TOTAL** : **47 fichiers** / **24 heures**

---

## ✅ CHECKLIST GLOBALE

**Phase 1** : ☐☐☐☐☐☐☐☐☐☐ (0/10)
**Phase 2** : ☐☐☐☐☐☐☐☐☐☐ (0/10)
**Phase 3** : ☐☐☐☐☐☐☐☐ (0/8)
**Phase 4** : ☐☐☐☐☐☐☐☐☐☐ (0/10)
**Phase 5** : ☐☐☐☐☐☐☐ (0/7)
**Phase 6** : ☐☐ (0/2)

**PROGRESSION TOTALE** : 0/47 (0%)

---

**Prochaine** : G04 Code Templates

