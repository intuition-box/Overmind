# 📋 RAPPORT AUDIT : useThreeScene.js

**Date** : 25/09/2025 - SESSION 19
**Fichier** : `hooks/useThreeScene.js`
**Taille** : 384 lignes
**Type** : Hook Scene Three.js Master (Orchestration Complète)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useEffect, useRef, useState, useCallback } from 'react'
- * as THREE from 'three'
- { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
```

### **Imports internes**
```javascript
- { useSimpleBloom } from './useSimpleBloom.js'
- { V3_CONFIG } from '../utils/config.js'
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Scene orchestration** : Setup scene + renderer + camera + controls + lighting
- **Bloom integration** : Coordination avec useSimpleBloom + BloomControlCenter
- **Tone mapping** : AgX + PMREMGenerator + exposure control
- **PBR lighting** : Studio Pro+ presets + controllable lights
- **Background system** : Multiple types (color, transparent, presets)
- **Render loop** : RAF avec delta time + controls + bloom
- **Global coordination** : window.* references pour systems legacy

---

## 🔧 **SIGNATURE HOOK**

```javascript
export function useThreeScene(canvasRef) {
  // Return: { scene, renderer, camera, controls, isInitialized, [18 more methods] }
}
```

**Pattern** : Hook orchestrateur master avec coordination multi-systèmes

---

## 🎛️ **ÉTAT LOCAL (5 useRef + 1 useState)**

### **Références Three.js Core**
```javascript
const sceneRef = useRef(null);          // THREE.Scene
const rendererRef = useRef(null);       // THREE.WebGLRenderer
const controlsRef = useRef(null);       // OrbitControls
const cameraRef = useRef(null);         // PerspectiveCamera
const animationIdRef = useRef(null);    // RAF ID
```

### **État Initialisation**
```javascript
const [isInitialized, setIsInitialized] = useState(false);
```

---

## 🌸 **SYSTÈME BLOOM INTEGRATION**

### **useSimpleBloom Hook Integration**
```javascript
const {
  initBloom,
  updateBloom,
  render: renderBloom,
  handleResize: handleBloomResize,
  dispose: disposeBloom,
  getExposure: _getBloomExposure,   // Read-only depuis renderer
  bloomSystem  // Exposer référence pour coordination
} = useSimpleBloom();
```

### **Bloom System Setup**
```javascript
// ✅ CORRIGÉ : INITIALISER SIMPLE BLOOM SYSTEM (sans double init)
const bloomSystemInstance = initBloom(scene, camera, renderer);

if (!bloomSystemInstance) {
  console.warn('⚠️ SimpleBloomSystem non initialisé, utilisation du rendu standard');
} else {
  // ✅ COORDINATION : Exposer le bloomSystem pour BloomControlCenter
  window.bloomSystem = bloomSystemInstance;
}
```

**Pattern** : useSimpleBloom delegation + window global coordination

---

## 🎨 **SYSTÈME RENDERER MODERNE**

### **WebGL Renderer Setup**
```javascript
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
  alpha: false
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ✅ PMREM PHASE 1: Configuration tone mapping moderne
renderer.toneMapping = THREE.AgXToneMapping; // 2024 moderne vs LinearToneMapping
renderer.toneMappingExposure = 1.7; // ✅ CORRECTION: Aligner avec Studio Pro + par défaut
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

**Modern Setup** : AgX tone mapping + SRGB + exposure optimisé

---

## 🔆 **SYSTÈME PMREM HDR**

### **PMREMGenerator Configuration**
```javascript
// ✅ PMREM PHASE 1: PMREMGenerator pour environnement HDR
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader(); // Pre-compile pour performance

// ✅ PMREM PHASE 1: Génération environnement HDR basique depuis scène
const pmremRenderTarget = pmremGenerator.fromScene(scene);
scene.environment = pmremRenderTarget.texture; // HDR environnement pour matériaux PBR
```

### **PMREM Global Coordination**
```javascript
// ✅ PMREM PHASE 1: Exposer PMREMGenerator pour coordination avec autres systèmes
window.pmremGenerator = pmremGenerator;

// Cleanup
if (window.pmremGenerator) {
  window.pmremGenerator.dispose();
  delete window.pmremGenerator;
}
```

**Architecture** : PMREM environment pour PBR materials + global coordination

---

## 💡 **SYSTÈME LIGHTING PBR**

### **Ambient Light Studio Pro+**
```javascript
const ambientLight = new THREE.AmbientLight(
  0x404040, // ✅ CORRECTION: Couleur Studio Pro +
  3.5 // ✅ CORRECTION: Intensité Studio Pro +
);
// ✅ Marquer pour PBRLightingController
ambientLight.userData.pbrControllable = true;
scene.add(ambientLight);
```

### **Directional Light Studio Pro+**
```javascript
const directionalLight = new THREE.DirectionalLight(
  0xffffff, // ✅ Couleur Studio Pro +
  5.0 // ✅ CORRECTION: Intensité Studio Pro +
);
const lightPos = V3_CONFIG.lights.directional.position;
directionalLight.position.set(lightPos.x, lightPos.y, lightPos.z);
// ✅ Marquer pour PBRLightingController
directionalLight.userData.pbrControllable = true;
scene.add(directionalLight);
```

### **PBR Lights Access**
```javascript
getLights: useCallback(() => {
  if (!sceneRef.current) return { ambient: null, directional: null };

  let ambient = null, directional = null;
  sceneRef.current.traverse((child) => {
    if (child.isAmbientLight && child.userData.pbrControllable && !ambient) {
      ambient = child;
    }
    if (child.isDirectionalLight && child.userData.pbrControllable && !directional) {
      directional = child;
    }
  });

  return { ambient, directional };
}, [])
```

**Pattern** : userData.pbrControllable marking + accessor method pour controllers

---

## 🎮 **SYSTÈME CONTROLS**

### **OrbitControls Setup**
```javascript
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI;

// Position initiale camera - CAM1 comme origine
camera.position.set(0, 1.4511, 14.2794);
camera.rotation.set(-0.1013, 0, 0);
camera.lookAt(0, 0, 0);
```

**Configuration** : Damping + limits + initial position CAM1

---

## 🔄 **SYSTÈME RENDER LOOP**

### **startRenderLoop - RAF Master**
```javascript
const startRenderLoop = useCallback((updateCallback) => {
  if (!rendererRef.current) return () => {};

  const clock = new THREE.Clock();
  let isRunning = true;

  const animate = () => {
    if (!isRunning) return;

    const delta = clock.getDelta();

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    if (updateCallback) {
      updateCallback(delta); // External systems update
    }

    // ✅ RESTAURÉ : RENDU AVEC SIMPLE BLOOM SYSTEM
    renderBloom();

    animationIdRef.current = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    isRunning = false;
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  };
}, [renderBloom]);
```

**Architecture** : Clock delta + controls + external callback + bloom render + cleanup

---

## 🎨 **SYSTÈME TONE MAPPING**

### **setToneMapping - Dynamic Switching**
```javascript
const setToneMapping = useCallback((toneMappingName) => {
  const toneMapping = TONE_MAPPING_OPTIONS[toneMappingName];
  if (rendererRef.current && toneMapping !== undefined) {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;

    // Changer le tone mapping
    renderer.toneMapping = toneMapping;

    // ✅ PMREM PHASE 1: Régénérer environnement si PMREM actif et tone mapping change
    if (window.pmremGenerator && scene) {
      try {
        const pmremRenderTarget = window.pmremGenerator.fromScene(scene);
        scene.environment = pmremRenderTarget.texture;
      } catch (error) {
        console.warn('⚠️ PMREM: Erreur régénération environnement:', error);
      }
    }

    // Force la recompilation des matériaux
    if (scene) {
      scene.traverse((child) => {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.needsUpdate = true;
            });
          } else {
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }
}, []);
```

### **Tone Mapping Options**
```javascript
const TONE_MAPPING_OPTIONS = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
};
```

**Intelligence** : Dynamic switching + PMREM regeneration + material recompilation

---

## 💫 **SYSTÈME EXPOSURE (V8 CONFLICT RESOLVED)**

### **setExposure - Single Source Truth**
```javascript
const setExposure = useCallback((value) => {
  if (!rendererRef.current) {
    console.warn('⚠️ Renderer non disponible pour setExposure');
    return false;
  }

  // Valider le range (basé sur exemples Three.js officiels)
  const clampedValue = Math.max(0.1, Math.min(2.0, value));

  // ✅ SEULE SOURCE DE VÉRITÉ : Appliquer uniquement au renderer
  rendererRef.current.toneMappingExposure = clampedValue;

  // ✅ CORRECTION CONFLIT #1 : NE PAS appeler setBloomExposure pour éviter triple application
  // Le bloom system utilisera directement la valeur du renderer

  return true;
}, []);
```

### **getExposure - Source Unique**
```javascript
const getExposure = useCallback(() => {
  if (!rendererRef.current) return 1.0;

  // ✅ CORRECTION CONFLIT #1 : Lire directement depuis le renderer (source unique)
  return rendererRef.current.toneMappingExposure;
}, []);
```

**V8 Resolution** : renderer.toneMappingExposure = single source of truth

---

## 🎨 **SYSTÈME BACKGROUND**

### **setBackground - Multiple Types**
```javascript
setBackground: useCallback((type, value) => {
  if (!sceneRef.current) return false;

  const scene = sceneRef.current;

  switch (type) {
    case 'color': {
      const color = typeof value === 'string' ? parseInt(value.replace('#', ''), 16) : value;
      scene.background = new THREE.Color(color);
      break;
    }

    case 'transparent':
      scene.background = null;
      break;

    case 'black':
      scene.background = new THREE.Color(0x000000);
      break;

    case 'white':
      scene.background = new THREE.Color(0xffffff);
      break;

    case 'dark':
      scene.background = new THREE.Color(0x202020);
      break;

    default:
      console.warn(`⚠️ Type de background inconnu: ${type}`);
      return false;
  }

  return true;
}, [])
```

### **getBackground - Current State**
```javascript
getBackground: useCallback(() => {
  if (!sceneRef.current) return null;

  const scene = sceneRef.current;
  if (!scene.background) return { type: 'transparent' };
  if (scene.background.isColor) return {
    type: 'color',
    value: `#${scene.background.getHexString()}`
  };

  return { type: 'unknown' };
}, [])
```

**Pattern** : Type dispatcher + getter avec color extraction

---

## 🌐 **GLOBAL COORDINATION SYSTEM**

### **Window References Setup**
```javascript
// ✅ PHASE 4 FIX: Exposer références globales manquantes pour diagnostic
window.renderer = renderer;
window.camera = camera;
window.controls = controls;
window.bloomSystem = bloomSystemInstance;
window.pmremGenerator = pmremGenerator;
```

### **Cleanup Global**
```javascript
if (window.bloomSystem) {
  delete window.bloomSystem;
}

if (window.pmremGenerator) {
  window.pmremGenerator.dispose();
  delete window.pmremGenerator;
}
```

**Legacy Support** : Global references pour V6 systems + proper cleanup

---

## 🔧 **BLOOM COMPATIBILITY LAYER**

### **Backward Compatibility Functions**
```javascript
const updateBloomSettings = useCallback((param, value) => {
  updateBloom(param, value);
  return true;
}, [updateBloom]);

const getBloomSettings = useCallback(() => {
  // ✅ CORRECTION CONFLIT #2 : Valeurs par défaut, bloom géré par BloomControlCenter
  return {
    threshold: 0.15,
    strength: 0.40,
    radius: 0.4,
    enabled: true
  };
}, []);
```

**Legacy Support** : Backward compatibility pour V6 systems

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Orchestration Complète**
- **Single setup point** : Tous les systèmes Three.js centralisés
- **Modern defaults** : AgX + PMREM + Studio Pro+ lighting
- **Coordination layer** : Global references pour legacy systems
- **Clean initialization** : Setup + validation + error handling

### **2. Bloom Integration Réussie**
- **useSimpleBloom delegation** : Hook composition pattern
- **No double init** : Proper initialization sequence
- **Global coordination** : window.bloomSystem pour BloomControlCenter
- **V8 conflict resolved** : Exposure single source truth

### **3. PBR Lighting System**
- **Studio Pro+ presets** : Professional default values
- **Controllable marking** : userData.pbrControllable
- **Access methods** : getLights() pour controllers
- **PMREM environment** : HDR environment pour materials

### **4. Modern Rendering**
- **AgX tone mapping** : 2024 state-of-the-art
- **PMREM HDR** : Environment mapping automatic
- **Color space** : SRGB output correct
- **Dynamic switching** : Tone mapping + material recompilation

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Global References Coupling**
```javascript
// Window globals partout
window.renderer = renderer;
window.camera = camera;
window.bloomSystem = bloomSystemInstance;
// Couplage fort avec V6 legacy systems
```

### **2. Configuration Hardcoding**
```javascript
// Values hardcodées
renderer.toneMappingExposure = 1.7;
ambientLight.intensity = 3.5;
directionalLight.intensity = 5.0;
// Pas de configuration externe
```

### **3. Single Canvas Assumption**
```javascript
// Hook assume 1 seul canvas
export function useThreeScene(canvasRef) {
  // Pas de support multi-canvas
  // State global partagé
}
```

### **4. Bloom System Coupling**
```javascript
// Dépendance forte useSimpleBloom
const { initBloom, updateBloom, ... } = useSimpleBloom();
// Pas d'abstraction bloom system
```

---

## 🎯 **USAGE PATTERNS**

### **Intégration V3Scene**
```javascript
const {
  scene, renderer, camera, controls, isInitialized,
  startRenderLoop, setExposure, setBackground,
  updateBloomSettings, getLights
} = useThreeScene(canvasRef);

// Start render loop avec systems update
useEffect(() => {
  if (isInitialized) {
    const stopLoop = startRenderLoop((delta) => {
      // Update mixer animations, particles, etc.
      if (mixer) mixer.update(delta);
    });

    return stopLoop;
  }
}, [isInitialized, startRenderLoop]);

// Configure lighting via PBR controller
const lights = getLights();
if (lights.ambient) lights.ambient.intensity = pbrSettings.ambientMultiplier;

// Update bloom settings
updateBloomSettings('threshold', bloomSettings.threshold);

// Control exposure
setExposure(lightingSettings.exposure);
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **ThreeScene Machine**
```javascript
const threeSceneMachine = createMachine({
  id: 'threeScene',
  initial: 'uninitialized',
  context: {
    canvasRef: null,
    scene: null,
    renderer: null,
    camera: null,
    controls: null,
    bloomSystem: null,
    pmremGenerator: null,
    config: {
      renderer: {
        toneMapping: 'AgXToneMapping',
        toneMappingExposure: 1.7,
        outputColorSpace: 'SRGBColorSpace'
      },
      lighting: {
        ambient: { color: 0x404040, intensity: 3.5 },
        directional: { color: 0xffffff, intensity: 5.0 }
      },
      camera: {
        fov: 50,
        position: { x: 0, y: 1.4511, z: 14.2794 }
      }
    }
  },
  states: {
    uninitialized: {
      on: {
        INIT_SCENE: {
          target: 'initializing',
          actions: 'setCanvasRef'
        }
      }
    },
    initializing: {
      invoke: [
        { src: 'initSceneService' },
        { src: 'initRendererService' },
        { src: 'initCameraService' },
        { src: 'initControlsService' },
        { src: 'initLightingService' },
        { src: 'initBloomService' },
        { src: 'initPMREMService' }
      ],
      on: {
        SCENE_READY: 'ready',
        INIT_ERROR: 'error'
      }
    },
    ready: {
      type: 'parallel',
      states: {
        rendering: {
          initial: 'stopped',
          states: {
            stopped: {
              on: { START_RENDER: 'running' }
            },
            running: {
              invoke: {
                src: 'renderLoopService'
              },
              on: { STOP_RENDER: 'stopped' }
            }
          }
        },
        bloom: {
          on: {
            UPDATE_BLOOM: {
              actions: 'updateBloomParameter'
            }
          }
        },
        lighting: {
          on: {
            SET_EXPOSURE: {
              actions: 'setRendererExposure'
            },
            UPDATE_LIGHTING: {
              actions: 'updateLightingParameter'
            }
          }
        },
        background: {
          on: {
            SET_BACKGROUND: {
              actions: 'updateSceneBackground'
            }
          }
        }
      }
    },
    error: {
      on: {
        RETRY_INIT: 'initializing',
        RESET: 'uninitialized'
      }
    }
  }
});
```

### **Services XState**
```javascript
// Service render loop
const renderLoopService = (context) => (callback) => {
  if (!context.renderer) return () => {};

  const clock = new THREE.Clock();
  let isRunning = true;
  let animationId;

  const animate = () => {
    if (!isRunning) return;

    const delta = clock.getDelta();

    if (context.controls) {
      context.controls.update();
    }

    // Send delta to parent machine
    callback('FRAME_UPDATE', { delta });

    if (context.bloomSystem) {
      context.bloomSystem.render();
    }

    animationId = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 384 (hook large)
- **useState** : 1 (isInitialized)
- **useRef** : 5 (scene, renderer, camera, controls, animationId)
- **useCallback** : 8 (core functions + accessors)
- **useSimpleBloom integration** : 1 hook composition
- **Global window references** : 5+ exposées
- **Tone mapping options** : 4 types
- **Background types** : 5 supported
- **PBR lights** : 2 (ambient, directional)
- **PMREM integration** : HDR environment

---

## ✅ **CONCLUSION**

**useThreeScene = Hook orchestrateur Three.js master avec coordination multi-systèmes**

### **Points forts**
- **Orchestration complète** : Scene + renderer + camera + controls + lighting
- **Modern rendering** : AgX + PMREM + SRGB + Studio Pro+ defaults
- **Bloom integration** : useSimpleBloom composition + coordination réussie
- **V8 conflict resolved** : Exposure single source truth
- **PBR system** : Controllable lights + environment mapping
- **Global coordination** : Legacy V6 systems support

### **Points faibles**
- **Global coupling** : window.* references partout
- **Configuration hardcoding** : Values fixes pas configurables
- **Single canvas** : Pas de support multi-canvas
- **Bloom system coupling** : Dépendance forte useSimpleBloom

### **Construction XState**
- **Complexité** : 🔴 ÉLEVÉE
- **Pattern** : Machine parallèle + services orchestrés
- **Benefits** : Configuration flexible + error recovery + services découplés
- **Services** : Init sequence + render loop + parameter updates

**Recommandation** : **CONSTRUIRE vers machine XState complexe** avec services parallèles + **configuration externalisée** + **coordination découplée**

---

**FIN SESSION 19 - useThreeScene.js**
**Durée analyse** : ~35 minutes
**Prochaine session** : useTriggerControls.js