# 📋 RAPPORT AUDIT : useModelLoader.js

**Date** : 25/09/2025 - SESSION 14
**Fichier** : `hooks/useModelLoader.js`
**Taille** : 237 lignes
**Type** : Hook Chargement Modèle 3D (GLTF + DRACO + Materials)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useState, useCallback } from 'react'
- { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
- { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
- * as THREE from 'three'
```

### **Imports internes**
```javascript
- { RING_MATERIALS, ARM_MATERIALS_ALL } from '../utils/materials.js'
- { V3_CONFIG } from '../utils/config.js'
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Chargement GLTF** : GLTF + DRACO compression support
- **Classification meshes** : Détection automatique types meshes (iris, eye, arms, rings)
- **Matériaux PBR** : Préparation matériaux pour bloom + PBR presets
- **Bloom grouping** : Attribution userData.bloomGroup pour contrôles bloom
- **Animations support** : Extraction animations GLTF + mixer setup

---

## 🔧 **SIGNATURE HOOK**

```javascript
export function useModelLoader() {
  // Return: { model, isLoaded, loadModel, loadingProgress, isLoading, error }
}
```

**Pattern** : Hook simple sans paramètres, configuration via V3_CONFIG

---

## 🎛️ **ÉTAT LOCAL (5 useState)**

```javascript
const [loadingProgress, setLoadingProgress] = useState(0);      // 0-100%
const [isLoading, setIsLoading] = useState(false);            // Flag chargement
const [isLoaded, setIsLoaded] = useState(false);              // Flag succès
const [model, setModel] = useState(null);                     // Three.js Object3D
const [error, setError] = useState(null);                     // Error object
```

---

## 🔍 **SYSTÈME DÉTECTION MESHES**

### **5 Fonctions Classification (useCallback)**

#### **1. isIRISMesh - Détection Iris**
```javascript
const isIRISMesh = useCallback((meshName) => {
  if (!meshName) return false;
  return meshName.toLowerCase().includes('iris');
}, []);
```

#### **2. isEyeMesh - Détection Anneaux Œil**
```javascript
const isEyeMesh = useCallback((meshName) => {
  const name = meshName.toLowerCase();

  // ✅ SEULEMENT les anneaux Eye qui doivent briller
  return (
    name.includes('anneaux_eye_ext') ||
    name.includes('anneaux_eye_int')
  );
}, []);
```

#### **3. isArmMesh - Détection Bras (Filtrée)**
```javascript
const isArmMesh = useCallback((meshName) => {
  const name = meshName.toLowerCase();

  // ✅ EXCLURE dos_eye et eye_int (gardent matériaux originaux)
  if (name.includes('dos_eye') || name.includes('eye_int')) {
    return false;
  }

  // ✅ Bras avec effet léger
  return (
    name.includes('bras') ||
    name.includes('arm')
  );
}, []);
```

#### **4. isRingMesh - Détection Anneaux Magiques**
```javascript
const isRingMesh = useCallback((meshName, materialName) => {
  const name = (meshName || '').toLowerCase();
  const mat = (materialName || '').toLowerCase();
  return RING_MATERIALS.some(ringMat =>
    name.includes(ringMat.toLowerCase()) || mat.includes(ringMat.toLowerCase())
  );
}, []);
```

#### **5. isBigArmMesh/isLittleArmMesh - Détection Tailles Bras**
```javascript
const isBigArmMesh = useCallback((meshName) => {
  const name = meshName.toLowerCase();
  return ARM_MATERIALS_ALL.some(armMat =>
    name.includes(armMat.toLowerCase()) && name.includes('gros')
  );
}, []);

const isLittleArmMesh = useCallback((meshName) => {
  const name = meshName.toLowerCase();
  return ARM_MATERIALS_ALL.some(armMat =>
    name.includes(armMat.toLowerCase()) && name.includes('petit')
  );
}, []);
```

---

## 🎨 **SYSTÈME MATÉRIAUX PBR**

### **3 Créateurs Matériaux (useCallback)**

#### **Pattern Commun Matériaux**
```javascript
const createIRISMaterial = useCallback((originalMaterial) => {
  const newMaterial = originalMaterial ? originalMaterial.clone() : new THREE.MeshStandardMaterial();

  // ✅ COMPATIBLE avec presets PBR
  newMaterial.metalness = 0.3;
  newMaterial.roughness = 1.0;
  // Ne pas forcer emissive - laissé à BloomControlCenter

  return newMaterial;
}, []);
```

**Architecture** : Clone matériau original + values PBR de base + pas d'emissive forcé

#### **createEyeMaterial - Anneaux Œil**
- Même pattern que IRIS
- metalness: 0.3, roughness: 1.0
- Compatible PBR presets

#### **createArmMaterial - Bras**
- Même pattern que IRIS/Eye
- Standardisation across all materials
- Préparation bloom sans forcer emissive

---

## 📥 **FONCTION CHARGEMENT PRINCIPALE**

### **loadModel Signature**
```javascript
const loadModel = useCallback((scene, onSuccess) => {
  // scene: Three.js Scene pour ajout modèle
  // onSuccess: Callback avec data classification
}, [dependencies])
```

### **Architecture Chargement (4 phases)**

#### **Phase 1 : Setup Loaders**
```javascript
setIsLoading(true);
setError(null);
setLoadingProgress(0);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(V3_CONFIG.model.dracoPath);
loader.setDRACOLoader(dracoLoader);
```

#### **Phase 2 : Classification Meshes**
```javascript
const magicRings = [];
const bigArms = [];
const littleArms = [];
const eyeComponents = [];
const otherMeshes = [];

loadedModel.traverse((child) => {
  if (child.isMesh) {
    const meshName = child.name || '';
    const materialName = child.material?.name || '';

    // Classification + assignment userData.bloomGroup
    if (isIRISMesh(meshName)) {
      child.material = createIRISMaterial(child.material);
      child.userData.bloomGroup = 'iris'; // ✅ Marqueur BloomControlCenter
      eyeComponents.push(child);
    }
    // ... autres classifications
  }
});
```

#### **Phase 3 : Animations Setup**
```javascript
let mixer = null;
let animations = [];

if (gltf.animations && gltf.animations.length > 0) {
  animations = gltf.animations; // ✅ Stocker animations GLTF
  mixer = new THREE.AnimationMixer(loadedModel);
  // ❌ PAS de auto-play - laissé à AnimationController
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip);
    // action.play(); // ❌ DÉSACTIVÉ
  });
}
```

#### **Phase 4 : Success Callback**
```javascript
if (onSuccess) {
  onSuccess({
    magicRings,      // Anneaux révélation
    bigArms,         // Gros bras
    littleArms,      // Petits bras
    eyeComponents,   // Iris + anneaux œil
    otherMeshes,     // Reste
    animations,      // ✅ Animations GLTF
    mixer,          // ✅ AnimationMixer
    model: loadedModel
  });
}
```

---

## 🏷️ **SYSTÈME BLOOM GROUPING**

### **userData.bloomGroup Attribution**
```javascript
// Classification pour BloomControlCenter
child.userData.bloomGroup = 'iris';        // Iris meshes
child.userData.bloomGroup = 'eyeRings';    // Anneaux œil
child.userData.bloomGroup = 'arms';        // Bras
child.userData.bloomGroup = 'revealRings'; // Anneaux magiques
```

**Intégration** : BloomControlCenter utilise ces marqueurs pour groupes bloom

---

## 📊 **PROGRESS TRACKING**

### **Loading Progress Handler**
```javascript
// Callback progress GLTFLoader
(progress) => {
  const percent = (progress.loaded / progress.total) * 100;
  setLoadingProgress(percent);
}
```

### **Error Handling**
```javascript
(error) => {
  console.error('❌ Erreur chargement modèle:', error);
  setError(error);
  setIsLoading(false);
}
```

---

## 🔄 **CONFIGURATION EXTERNE**

### **V3_CONFIG Dependencies**
```javascript
// Configuration paths
loader.load(
  V3_CONFIG.model.path,        // Path vers GLTF
  // success callback
);

dracoLoader.setDecoderPath(V3_CONFIG.model.dracoPath); // DRACO decoder
```

### **Materials Dependencies**
```javascript
// Classification arrays depuis utils/materials.js
RING_MATERIALS.some(...)     // Anneaux magiques
ARM_MATERIALS_ALL.some(...)  // Bras classification
```

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Classification Intelligente**
- **Détection robuste** : Multiple critères name + material
- **Filtrage précis** : Exclusions spécifiques (dos_eye, eye_int)
- **Extensible** : Arrays configuration externes
- **Type safety** : Validation name/material existence

### **2. Matériaux PBR Ready**
- **Clone preservation** : Garde matériau original
- **PBR compatible** : Values metalness/roughness standard
- **Bloom preparation** : userData.bloomGroup sans emissive forcé
- **Standardisation** : Pattern uniforme tous matériaux

### **3. Loading Experience**
- **Progress tracking** : 0-100% granulaire
- **Error handling** : Gestion erreurs complète
- **State management** : Loading states clairs
- **Success callback** : Data structurée pour parent

### **4. Animations Support**
- **GLTF animations** : Extraction automatique
- **Mixer ready** : AnimationMixer configuré
- **Control delegation** : Pas d'auto-play, contrôle externe
- **Clean separation** : Loading ≠ Animation control

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Hardcoded Material Values**
```javascript
// Values PBR fixées
newMaterial.metalness = 0.3;
newMaterial.roughness = 1.0;
// Pas configurable, pas de variation selon mesh type
```

### **2. String-Based Classification**
```javascript
// Fragile si noms modèle 3D changent
name.includes('anneaux_eye_ext')
name.includes('iris')
// Pas de fallback robuste
```

### **3. Single Model Assumption**
```javascript
// Hook assume 1 seul modèle par scène
// Pas de support multi-models
// State global partagé
```

### **4. Configuration Coupling**
```javascript
// Dépendance forte V3_CONFIG
loader.load(V3_CONFIG.model.path)
// Pas de path paramétrable
// Pas de loader options configurables
```

---

## 🎯 **USAGE PATTERN**

### **Intégration V3Scene.jsx**
```javascript
const { model, isLoaded, loadModel, loadingProgress, isLoading, error } = useModelLoader();

useEffect(() => {
  if (scene && !isLoaded && !isLoading) {
    loadModel(scene, (loadedData) => {
      // Utiliser loadedData.magicRings, loadedData.eyeComponents, etc.
      setMagicRingsInfo(loadedData.magicRings);
      // Setup autres systèmes avec data classifiée
    });
  }
}, [scene, isLoaded, isLoading, loadModel]);
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **ModelLoader Machine**
```javascript
const modelLoaderMachine = createMachine({
  id: 'modelLoader',
  initial: 'idle',
  context: {
    model: null,
    progress: 0,
    error: null,
    classificationData: null,
    config: {
      modelPath: '',
      dracoPath: '',
      materialSettings: {
        metalness: 0.3,
        roughness: 1.0
      }
    }
  },
  states: {
    idle: {
      on: {
        LOAD_MODEL: {
          target: 'loading',
          actions: 'initializeLoading'
        }
      }
    },
    loading: {
      invoke: {
        src: 'loadModelService',
        onDone: {
          target: 'classifying',
          actions: 'setLoadedModel'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      },
      on: {
        PROGRESS_UPDATE: {
          actions: 'updateProgress'
        }
      }
    },
    classifying: {
      invoke: {
        src: 'classifyMeshesService',
        onDone: {
          target: 'success',
          actions: 'setClassificationData'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    success: {
      type: 'final',
      entry: 'notifySuccess'
    },
    error: {
      on: {
        RETRY: 'loading',
        RESET: 'idle'
      }
    }
  },
  actions: {
    initializeLoading: assign({
      progress: 0,
      error: null
    }),
    updateProgress: assign({
      progress: (_, event) => event.progress
    }),
    setLoadedModel: assign({
      model: (_, event) => event.data.model
    }),
    setClassificationData: assign({
      classificationData: (_, event) => event.data
    }),
    setError: assign({
      error: (_, event) => event.data
    })
  }
});
```

### **Services XState**
```javascript
// Service chargement GLTF
const loadModelService = (context, event) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath(context.config.dracoPath);
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      context.config.modelPath,
      (gltf) => {
        resolve({
          model: gltf.scene,
          animations: gltf.animations,
          mixer: new THREE.AnimationMixer(gltf.scene)
        });
      },
      (progress) => {
        // Send progress event
        const percent = (progress.loaded / progress.total) * 100;
        // callback('PROGRESS_UPDATE', { progress: percent });
      },
      reject
    );
  });
};

// Service classification meshes
const classifyMeshesService = (context, event) => {
  return new Promise((resolve) => {
    const { model } = context;
    const classificationData = {
      magicRings: [],
      eyeComponents: [],
      bigArms: [],
      littleArms: [],
      otherMeshes: []
    };

    model.traverse((child) => {
      if (child.isMesh) {
        // Classification logic
        // Attribution userData.bloomGroup
        // Material setup
      }
    });

    resolve(classificationData);
  });
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 237 (taille modérée)
- **useState** : 5 (loading states)
- **useCallback** : 8 (detectors + creators + loadModel)
- **Three.js loaders** : GLTFLoader + DRACOLoader
- **Classification functions** : 6 détecteurs
- **Material creators** : 3 creators
- **Mesh groups** : 5 catégories
- **External dependencies** : V3_CONFIG + materials arrays

---

## ✅ **CONCLUSION**

**useModelLoader = Hook chargement GLTF sophistiqué avec classification automatique meshes**

### **Points forts**
- **Classification intelligente** : Détection robuste types meshes
- **PBR compatibility** : Matériaux préparés pour presets
- **Progress tracking** : UX loading complète
- **Bloom integration** : userData.bloomGroup attribution
- **Animations support** : GLTF animations + mixer ready

### **Points faibles**
- **Hardcoded values** : Material properties fixes
- **String classification** : Fragile si noms modèle changent
- **Single model** : Pas de support multi-models
- **Config coupling** : Dépendance forte V3_CONFIG

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Pattern** : Machine loading states + services
- **Services** : loadModel + classifyMeshes découplés
- **Benefits** : Error recovery + retry logic + state clarity

**Recommandation** : **CONSTRUIRE vers machine XState** avec services séparés + **configuration flexible** + **classification configurable**

---

**FIN SESSION 14 - useModelLoader.js**
**Durée analyse** : ~30 minutes
**Prochaine session** : usePerformanceMonitor.js