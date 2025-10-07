# 📋 RAPPORT AUDIT : V3Scene.jsx

**Date** : 25/11/2024 - SESSION 4
**Fichier** : `components/V3Scene.jsx`
**Taille** : 730 lignes
**Type** : Scene Three.js Principale (Architecture Hybride)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- React, { useRef, useEffect, useState, useCallback }
- * as THREE from 'three'
```

### **Imports hooks/ (6 hooks)**
```javascript
- useThreeScene from '../hooks/useThreeScene.js'
- useModelLoader from '../hooks/useModelLoader.js'
- useRevealManager from '../hooks/useRevealManager.js'
- useTriggerControls from '../hooks/useTriggerControls.js'
- useCameraFitter from '../hooks/useCameraFitter.js'
- useFloatingSpace from '../hooks/useFloatingSpace.js'
- useTempBloomSync from '../hooks/useTempBloomSync.js' (TEMPORAIRE)
```

### **Imports systems/ (9 systems)**
```javascript
- AnimationController from '../systems/animationSystemes/index.js'
- EyeRingRotationManager from '../systems/eyeSystems/index.js'
- ModelRotationManager from '../systems/eyeSystems/ModelRotationManager.js'
- RevealationSystem from '../systems/revelationSystems/index.js'
- ObjectTransitionManager from '../systems/transitionObjects/index.js'
- BloomControlCenter from '../systems/bloomEffects/BloomControlCenter.js'
- WorldEnvironmentController from '../systems/environmentSystems/WorldEnvironmentController.js'
- PBRLightingController from '../systems/lightingSystems/PBRLightingController.js'
- ParticleSystemController from '../systems/particleSystems/index.js'
- SceneStateController from '../systems/stateController/index.js' (CENTRAL)
```

### **Imports components/ (4 debug panels)**
```javascript
- DebugPanel from './DebugPanel.jsx'
- TestZustandDebugPanel from './TestZustandDebugPanel.jsx'
- DebugPanelV2Simple from './DebugPanelV2Simple.jsx'
- DualPanelTest from './DualPanelTest.jsx'
```

### **Imports utils/**
```javascript
- V3_CONFIG from '../utils/config.js'
```

---

## 🏗️ **ARCHITECTURE SCENE**

### **Hooks Principaux**
```javascript
const {
  scene, camera, renderer, controls, isInitialized,
  startRenderLoop, stopRenderLoop, setupEnvironment,
  getSceneInfo
} = useThreeScene(canvasRef);

const { model, isLoaded: isModelLoaded } = useModelLoader(scene);
const { revealationSystem, triggerReveal } = useRevealManager(scene, camera);
const { triggerFitCamera, triggerResetCamera } = useCameraFitter(camera, controls);
const { floatingSpace, triggerFloat } = useFloatingSpace(scene, camera);
```

### **Systems Controllers (Refs)**
```javascript
// Gestionnaires principaux
const stateControllerRef = useRef(); // SceneStateController (CENTRAL)
const pbrLightingControllerRef = useRef(); // PBRLightingController

// Gestionnaires spécialisés
const animationControllerRef = useRef(); // AnimationController
const eyeRingRotationManagerRef = useRef(); // EyeRingRotationManager
const modelRotationManagerRef = useRef(); // ModelRotationManager
const revealationSystemRef = useRef(); // RevealationSystem
const transitionManagerRef = useRef(); // ObjectTransitionManager
const bloomControlCenterRef = useRef(); // BloomControlCenter
const worldEnvironmentControllerRef = useRef(); // WorldEnvironmentController
const particleSystemControllerRef = useRef(); // ParticleSystemController
```

---

## 🎛️ **ÉTATS LOCAUX**

```javascript
const [showDebug, setShowDebug] = useState(true);
const [forceShowRings, setForceShowRings] = useState(false);
const [currentAnimation, setCurrentAnimation] = useState('permanent');
const [modelLoaded, setModelLoaded] = useState(false);
const [systemsInitialized, setSystemsInitialized] = useState(false);
const [securityState, setSecurityState] = useState('NORMAL');
const [isTransitioning, setIsTransitioning] = useState(false);
const [mouseControlMode, setMouseControlMode] = useState('navigation'); // 'navigation' | 'eyeTracking'
const [magicRingsInfo, setMagicRingsInfo] = useState([]);
```

---

## 🔄 **HOOK DE SYNCHRONISATION TEMPORAIRE**

### **useTempBloomSync**
```javascript
// 🚀 TEMPORARY: Phase 1 sync hook
const {
  currentBloomValues,
  bloomSystem,
  setExposure,
  setBackground,
  getBackground
} = useTempBloomSync(
  scene,
  stateControllerRef.current, // V6 System
  camera,
  renderer
);
```

**Rôle** : Synchroniser V6 Legacy + Zustand + Three.js en attendant construction complète

---

## ⌨️ **CONTRÔLES CLAVIER**

```javascript
// Raccourcis clavier
'p' → Toggle debug panel
't' → Toggle mouse mode (navigation ⟷ eyeTracking)
' ' → Trigger transition (espace)
'r' → Trigger reveal
'f' → Fit camera to model
'ESC' → Reset camera
'1-5' → Security presets
```

---

## 🎨 **DEBUG PANELS ARCHITECTURE**

### **Panel Actuel Rendu**
```javascript
{showDebug && (
  <DualPanelTest
    // 16+ props passées
    stateController={stateControllerRef.current}
    pbrLightingController={pbrLightingControllerRef.current}
    bloomSystem={bloomSystem}
    renderer={renderer}
    particleSystemController={particleSystemControllerRef.current}
    floatingSpace={floatingSpace}
    // ... handlers V6
  />
)}
```

### **Panel Test Zustand (Désactivé)**
```javascript
<TestZustandDebugPanel showDebug={false} />
```

---

## 🔧 **HANDLERS PRINCIPAUX**

### **Bloom Control**
```javascript
const handleColorBloomChange = (colorName, param, value) => {
  // Priorité SceneStateController si disponible
  if (stateControllerRef.current) {
    if (param === 'strength' || param === 'radius' || param === 'threshold') {
      stateControllerRef.current.setGroupBloomParameter(colorName, param, value);
    } else {
      stateControllerRef.current.setMaterialParameter(colorName, param, value);
    }
  }
  // Fallback ancien système
  else if (bloomSystem) {
    // Logic legacy
  }
};
```

### **Security State**
```javascript
const handleSecurityStateChange = (newSecurityState) => {
  setSecurityState(newSecurityState);
  setIsTransitioning(true);

  setTimeout(() => {
    setIsTransitioning(false);
  }, 1000); // Durée transition sécurité
};
```

### **Mouse Control Mode Toggle**
```javascript
const toggleMouseControlMode = useCallback(() => {
  const newMode = mouseControlMode === 'navigation' ? 'eyeTracking' : 'navigation';

  // OrbitControls activation/désactivation
  if (controls) {
    controls.enabled = (newMode === 'navigation');
  }

  // Model Rotation Manager
  if (modelRotationManagerRef.current) {
    if (newMode === 'eyeTracking') {
      modelRotationManagerRef.current.enableMouseTracking();
    } else {
      modelRotationManagerRef.current.disableMouseTracking();
    }
  }

  console.log(`🖱️ Mode souris: ${newMode === 'navigation' ? '🕹️ NAVIGATION' : '👁️ SUIVI ŒIL'}`);
}, [mouseControlMode, controls]);
```

---

## 🔄 **INITIALIZATION FLOW**

### **Étapes d'initialisation**
```javascript
1. useThreeScene → scene, camera, renderer setup
2. useModelLoader → Chargement modèle 3D
3. Systems initialization (9 systems)
4. SceneStateController setup (central)
5. Hook sync useTempBloomSync
6. Event listeners (keyboard, mouse)
7. Start render loop
```

### **Systems Setup**
```javascript
// Initialisation séquentielle des 9 systems
stateControllerRef.current = new SceneStateController(scene, camera, renderer);
pbrLightingControllerRef.current = new PBRLightingController(scene);
animationControllerRef.current = new AnimationController(scene);
eyeRingRotationManagerRef.current = new EyeRingRotationManager(scene);
modelRotationManagerRef.current = new ModelRotationManager(scene);
// ... etc
```

---

## 🎯 **INTÉGRATIONS**

### **SceneStateController (Central)**
- **Rôle** : Contrôleur central synchronisant tous les systems
- **Usage** : Priorité dans tous les handlers
- **Relations** : Connecté avec tous les systems V6

### **useTempBloomSync (Temporaire)**
- **Rôle** : Sync V6 ↔ Zustand ↔ Three.js
- **Status** : TEMPORARY - À supprimer après construction XState
- **Complexité** : 662 lignes (voir session hooks/)

### **DualPanelTest**
- **Rôle** : Comparaison panels V6 vs Zustand
- **Props** : 16+ props passées du scene
- **Usage** : Test architecture hybride

---

## ⚠️ **PROBLÈMES IDENTIFIÉS**

### **1. Architecture Hybride Complexe**
- 6 hooks + 9 systems + 4 debug panels
- Dépendances multiples et croisées
- Flow de données complexe

### **2. Props Drilling Massif**
- 16+ props passées à DualPanelTest
- Couplage fort scene ↔ debug panels

### **3. useState Multiples**
- 9 useState locaux dans scene
- État distribué entre scene + hooks + systems

### **4. Sync Hook Temporaire**
- useTempBloomSync 662 lignes
- Synchronisation manuelle complexe
- À supprimer après construction

### **5. Systems References**
- 10+ useRef pour systems
- Memory leaks potentiels
- Cleanup complexe

---

## 🎯 **POUR CONSTRUCTION XSTATE**

### **Architecture XState suggérée**
```javascript
// Scene simplifié avec machines XState
const {
  // États depuis machines
  scene: { showDebug, mouseControlMode, securityState },
  model: { isLoaded, currentAnimation },
  systems: { isInitialized },

  // Actions vers machines
  send
} = useSceneMachines();

// Plus de 9 useState locaux
// Plus de 10 useRef systems
// Plus de useTempBloomSync
```

### **Machines XState pour scene**
```javascript
machines/
├── sceneMachine.js        # État scene principal
├── modelMachine.js        # Chargement modèle
├── systemsMachine.js      # Initialization systems
├── controlsMachine.js     # Mouse/keyboard controls
└── debugMachine.js        # Debug panels visibility
```

### **Props Reduction**
```javascript
// Au lieu de 16+ props à DualPanelTest
<DebugPanelXState />
// Toutes les données viennent des machines XState
```

---

## 📊 **MÉTRIQUES**

- **Imports** : 22 fichiers
- **Hooks** : 6 hooks custom + 4 React hooks
- **Systems** : 9 systems V6 Legacy
- **useState** : 9 états locaux
- **useRef** : 10+ références systems
- **Debug Panels** : 4 composants debug
- **Handlers** : 15+ handlers

---

## ✅ **CONCLUSION**

**V3Scene = Hub central architecture hybride**
- Orchestration complexe 3 technologies (V6 + Zustand + Three.js)
- Point d'entrée unique mais couplage élevé
- Architecture non-scalable nécessitant refonte XState

**Priorités XState** :
1. Simplifier états locaux (9 → 0)
2. Éliminer useTempBloomSync
3. Réduire props drilling
4. Centraliser contrôles dans machines

---

**FIN SESSION 4 - V3Scene.jsx**
**Durée analyse** : ~40 minutes
**Prochaine session** : BloomControlsPanel.jsx