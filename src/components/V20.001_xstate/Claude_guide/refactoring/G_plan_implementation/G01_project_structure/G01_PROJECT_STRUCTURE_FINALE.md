# 📁 G01 - STRUCTURE PROJET FINALE

**Date** : 2 octobre 2025
**Phase** : G - Plan d'Implémentation
**Session** : G01 - Structure Projet
**Statut** : ✅ COMPLET

---

## 🎯 OBJECTIF

Définir l'**arborescence exacte** du projet après implémentation, incluant :
- Où créer le nouveau code XState v5
- Où déplacer l'ancien code legacy
- Organisation dossiers finale
- Conventions de nommage

---

## 📊 SITUATION ACTUELLE

### **Structure existante**
```
src/components/V19.9_refacto-wip-xstate/
├── components/           # Composants React legacy
├── systems/              # Managers legacy (SecurityIRISManager, etc.)
├── utils/                # Utilitaires legacy (config, materials, etc.)
├── hooks/                # Hooks React legacy
└── Claude_guide/         # Documentation (Phases A-F)
```

---

## 🆕 STRUCTURE FINALE

### **Arborescence complète**

```
src/components/V19.9_refacto-wip-xstate/
│
├── 📁 xstate-v5/                    ← NOUVEAU CODE (Construction from scratch)
│   │
│   ├── 📁 actors/                   ← State machines XState v5
│   │   ├── 📁 application/
│   │   │   ├── applicationMachine.ts
│   │   │   ├── applicationMachine.types.ts
│   │   │   └── applicationMachine.test.ts
│   │   │
│   │   ├── 📁 scene/
│   │   │   ├── sceneLifecycleMachine.ts
│   │   │   ├── sceneLifecycleMachine.types.ts
│   │   │   └── sceneLifecycleMachine.test.ts
│   │   │
│   │   ├── 📁 model/
│   │   │   ├── modelLoaderMachine.ts
│   │   │   └── modelLoaderMachine.test.ts
│   │   │
│   │   ├── 📁 animation/
│   │   │   ├── animationMachine.ts
│   │   │   └── animationMachine.test.ts
│   │   │
│   │   ├── 📁 camera/
│   │   │   ├── cameraMachine.ts
│   │   │   └── cameraMachine.test.ts
│   │   │
│   │   ├── 📁 rendering/
│   │   │   ├── renderingMachine.ts
│   │   │   └── renderingMachine.test.ts
│   │   │
│   │   ├── 📁 bloom/
│   │   │   ├── bloomMachine.ts
│   │   │   └── bloomMachine.test.ts
│   │   │
│   │   ├── 📁 particle/
│   │   │   ├── particleMachine.ts
│   │   │   └── particleMachine.test.ts
│   │   │
│   │   ├── 📁 lighting/
│   │   │   ├── lightingMachine.ts
│   │   │   └── lightingMachine.test.ts
│   │   │
│   │   ├── 📁 interaction/
│   │   │   ├── interactionMachine.ts
│   │   │   └── interactionMachine.test.ts
│   │   │
│   │   ├── 📁 transition/
│   │   │   ├── transitionMachine.ts
│   │   │   └── transitionMachine.test.ts
│   │   │
│   │   └── 📁 features/
│   │       ├── 📁 bloomColorPicker/
│   │       │   ├── bloomColorPickerMachine.ts
│   │       │   ├── bloomColorPickerMachine.types.ts
│   │       │   └── bloomColorPickerMachine.test.ts
│   │       │
│   │       └── 📁 debugPanel/
│   │           ├── debugPanelMachine.ts
│   │           └── debugPanelMachine.test.ts
│   │
│   ├── 📁 services/                 ← fromPromise services
│   │   ├── 📁 scene/
│   │   │   ├── loadGLBFile.ts
│   │   │   ├── validateBones.ts
│   │   │   ├── processMaterials.ts
│   │   │   ├── setupScene.ts
│   │   │   ├── cleanupResources.ts
│   │   │   └── services.test.ts
│   │   │
│   │   ├── 📁 animation/
│   │   │   ├── setupAnimationMixer.ts
│   │   │   ├── crossfadeAnimation.ts
│   │   │   └── services.test.ts
│   │   │
│   │   ├── 📁 rendering/
│   │   │   ├── setupCamera.ts
│   │   │   ├── setupBloomPass.ts
│   │   │   ├── setupLights.ts
│   │   │   ├── createParticleSystem.ts
│   │   │   └── services.test.ts
│   │   │
│   │   ├── 📁 performance/
│   │   │   ├── monitorPerformance.ts
│   │   │   ├── optimizePerformance.ts
│   │   │   └── services.test.ts
│   │   │
│   │   └── 📁 features/
│   │       ├── applyColorToMaterials.ts
│   │       ├── animateTransition.ts
│   │       └── services.test.ts
│   │
│   ├── 📁 hooks/                    ← React hooks (useActorRef + useSelector)
│   │   ├── useApplication.ts
│   │   ├── useSceneLifecycle.ts
│   │   ├── useModelLoader.ts
│   │   ├── useAnimationControl.ts
│   │   ├── useCameraControl.ts
│   │   ├── useRenderingControl.ts
│   │   ├── useBloomControl.ts
│   │   ├── useParticleControl.ts
│   │   ├── useLightingControl.ts
│   │   ├── useBloomColorPicker.ts
│   │   ├── useDebugPanel.ts
│   │   ├── usePerformanceMonitor.ts
│   │   └── hooks.test.ts
│   │
│   ├── 📁 components/               ← React components (UI)
│   │   ├── 📁 App/
│   │   │   ├── App.tsx
│   │   │   └── App.test.tsx
│   │   │
│   │   ├── 📁 Scene/
│   │   │   ├── OvermindScene.tsx
│   │   │   └── OvermindScene.test.tsx
│   │   │
│   │   ├── 📁 BloomColorPicker/
│   │   │   ├── BloomColorPicker.tsx
│   │   │   ├── BloomColorPicker.css
│   │   │   └── BloomColorPicker.test.tsx
│   │   │
│   │   ├── 📁 DebugPanel/
│   │   │   ├── DebugPanel.tsx
│   │   │   ├── DebugPanel.css
│   │   │   └── DebugPanel.test.tsx
│   │   │
│   │   ├── 📁 AnimationControl/
│   │   │   ├── AnimationControl.tsx
│   │   │   └── AnimationControl.test.tsx
│   │   │
│   │   └── 📁 PerformanceMonitor/
│   │       ├── PerformanceMonitor.tsx
│   │       └── PerformanceMonitor.test.tsx
│   │
│   ├── 📁 utils/                    ← Utilitaires (fonctions pures)
│   │   ├── colorConversion.ts
│   │   ├── easingFunctions.ts
│   │   ├── receptionist.ts
│   │   ├── types.ts
│   │   └── utils.test.ts
│   │
│   ├── 📁 context/                  ← React Context (DI)
│   │   ├── OvermindContext.tsx
│   │   └── OvermindProvider.tsx
│   │
│   ├── 📁 stores/                   ← Zustand stores (UI state)
│   │   ├── useDebugPanelStore.ts
│   │   ├── useAnimationSelectorStore.ts
│   │   └── useLayoutStore.ts
│   │
│   └── 📄 index.ts                  ← Barrel export
│
├── 📁 legacy/                       ← ANCIEN CODE (Déplacé ici)
│   ├── components/
│   ├── systems/
│   ├── utils/
│   └── hooks/
│
└── 📁 Claude_guide/                 ← Documentation inchangée
    ├── audits/
    └── refactoring/
        ├── A_baseline_audit/
        ├── B_diagnostic_architectural/
        ├── C_recherche_approfondie/
        ├── D_diagnostic_technique/
        ├── E_plan_construction/
        ├── F_vision_cible/
        └── G_plan_implementation/  ← On est ici
```

---

## 🔀 MIGRATION ANCIEN CODE

### **ÉTAPE 1 : Créer dossier legacy**

```bash
mkdir -p src/components/V19.9_refacto-wip-xstate/legacy
```

### **ÉTAPE 2 : Déplacer ancien code**

```bash
# Déplacer (PAS supprimer) ancien code
mv src/components/V19.9_refacto-wip-xstate/components \
   src/components/V19.9_refacto-wip-xstate/legacy/

mv src/components/V19.9_refacto-wip-xstate/systems \
   src/components/V19.9_refacto-wip-xstate/legacy/

mv src/components/V19.9_refacto-wip-xstate/utils \
   src/components/V19.9_refacto-wip-xstate/legacy/

mv src/components/V19.9_refacto-wip-xstate/hooks \
   src/components/V19.9_refacto-wip-xstate/legacy/
```

### **ÉTAPE 3 : Créer dossiers nouveau code**

```bash
# Créer structure xstate-v5
mkdir -p src/components/V19.9_refacto-wip-xstate/xstate-v5/{actors,services,hooks,components,utils,context,stores}

# Créer sous-dossiers actors
mkdir -p src/components/V19.9_refacto-wip-xstate/xstate-v5/actors/{application,scene,model,animation,camera,rendering,bloom,particle,lighting,interaction,transition,features}

# Créer sous-dossiers services
mkdir -p src/components/V19.9_refacto-wip-xstate/xstate-v5/services/{scene,animation,rendering,performance,features}
```

---

## 📝 CONVENTIONS NOMMAGE

### **Fichiers State Machines**

```typescript
// Format : {domain}Machine.ts
applicationMachine.ts
sceneLifecycleMachine.ts
bloomColorPickerMachine.ts
```

### **Fichiers Types**

```typescript
// Format : {domain}Machine.types.ts
applicationMachine.types.ts
sceneLifecycleMachine.types.ts
```

### **Fichiers Services**

```typescript
// Format : {verb}{Noun}.ts
loadGLBFile.ts
validateBones.ts
setupScene.ts
applyColorToMaterials.ts
```

### **Fichiers Hooks**

```typescript
// Format : use{Feature}.ts
useApplication.ts
useSceneLifecycle.ts
useBloomColorPicker.ts
```

### **Fichiers Components**

```typescript
// Format : {ComponentName}.tsx
App.tsx
OvermindScene.tsx
BloomColorPicker.tsx
```

### **Fichiers Tests**

```typescript
// Format : {fileName}.test.ts
applicationMachine.test.ts
useApplication.test.ts
App.test.tsx
```

---

## 🎯 IMPORTS ABSOLUS

### **Configuration tsconfig.json**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@xstate-v5/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/*"],
      "@actors/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/actors/*"],
      "@services/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/services/*"],
      "@hooks/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/hooks/*"],
      "@components/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/components/*"],
      "@utils/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/utils/*"],
      "@legacy/*": ["src/components/V19.9_refacto-wip-xstate/legacy/*"]
    }
  }
}
```

### **Exemple imports**

```typescript
// ✅ Bon (imports absolus)
import { applicationMachine } from '@actors/application/applicationMachine';
import { loadGLBFile } from '@services/scene/loadGLBFile';
import { useApplication } from '@hooks/useApplication';
import { SecurityIRISManager } from '@legacy/systems/eyeSystems/SecurityIRISManager';

// ❌ Mauvais (imports relatifs profonds)
import { applicationMachine } from '../../../actors/application/applicationMachine';
```

---

## 📦 BARREL EXPORTS

### **index.ts par dossier**

```typescript
// xstate-v5/actors/index.ts
export { applicationMachine } from './application/applicationMachine';
export { sceneLifecycleMachine } from './scene/sceneLifecycleMachine';
export { bloomColorPickerMachine } from './features/bloomColorPicker/bloomColorPickerMachine';

// xstate-v5/services/index.ts
export { loadGLBFile } from './scene/loadGLBFile';
export { validateBones } from './scene/validateBones';
export { applyColorToMaterials } from './features/applyColorToMaterials';

// xstate-v5/hooks/index.ts
export { useApplication } from './useApplication';
export { useSceneLifecycle } from './useSceneLifecycle';
export { useBloomColorPicker } from './useBloomColorPicker';
```

**Usage** :
```typescript
// Import groupé
import {
  applicationMachine,
  sceneLifecycleMachine
} from '@actors';

import {
  loadGLBFile,
  validateBones
} from '@services';
```

---

## 🚫 CE QU'ON NE TOUCHE PAS

### **Dossiers intacts**

```
src/components/V19.9_refacto-wip-xstate/
└── Claude_guide/         ← NE PAS TOUCHER
    ├── audits/
    ├── refactoring/
    └── MEMO_OVERMIND_COMPLET.md
```

**Raison** : Documentation référence pour tout le projet

---

## ✅ CHECKLIST STRUCTURE

### **Avant de coder**

- [ ] Créer dossier `/legacy/`
- [ ] Déplacer ancien code dans `/legacy/`
- [ ] Créer dossier `/xstate-v5/`
- [ ] Créer tous sous-dossiers (actors, services, hooks, etc.)
- [ ] Configurer `tsconfig.json` (imports absolus)
- [ ] Créer fichiers `index.ts` (barrel exports)

### **Validation structure**

- [ ] Ancien code accessible via `@legacy/*`
- [ ] Nouveau code accessible via `@xstate-v5/*`
- [ ] Aucun fichier perdu
- [ ] Documentation intacte
- [ ] VSCode auto-complete fonctionne

---

## 📊 STATISTIQUES FINALES

**Nombre de fichiers à créer** : **~47 fichiers**

**Répartition** :
- Actors : 13 machines + 13 types + 13 tests = 39 fichiers
- Services : 13 services + 5 tests = 18 fichiers
- Hooks : 12 hooks + 1 test = 13 fichiers
- Components : 6 components + 6 tests = 12 fichiers
- Utils : 4 utils + 1 test = 5 fichiers
- Context : 2 fichiers
- Stores : 3 stores
- Config : 1 index.ts

**TOTAL** : ~92 fichiers nouveaux

---

**Prochaine** : G02 Dependencies Setup

