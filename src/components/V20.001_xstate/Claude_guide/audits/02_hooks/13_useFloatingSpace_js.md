# 📋 RAPPORT AUDIT : useFloatingSpace.js

**Date** : 25/09/2025 - SESSION 13
**Fichier** : `hooks/useFloatingSpace.js`
**Taille** : 288 lignes
**Type** : Hook Interaction 3D (Mouse → Model Repulsion)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useRef, useCallback, useState } from 'react'
- * as THREE from 'three'
```

### **Imports internes**
```javascript
(Aucun - Hook autonome)
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonction principale**
- **Répulsion 3D** : Modèle 3D "fuit" la souris en temps réel
- **Interaction naturelle** : Effet floating/repulsion mouse-driven
- **Système particules sync** : Direction flux communiquée aux particules
- **Camera positions** : Presets camera prédéfinis
- **Anti-vibration** : Système stabilisation mouvement

---

## 🔧 **SIGNATURE HOOK**

```javascript
export const useFloatingSpace = ({
  model,                    // Three.js Object3D modèle
  mouse,                   // Position souris { x, y }
  camera,                  // Three.js Camera
  enabled = true,          // Enable/disable effect
  config: userConfig = {}, // Configuration override
  onSyncDataChange = null  // Callback sync particules
})
```

---

## 🎛️ **CONFIGURATION SYSTÈME**

### **Config par défaut (useState)**
```javascript
const [config, setConfig] = useState({
  enabled: true,
  sphereRadius: Math.min(window.innerWidth, window.innerHeight), // Responsive viewport
  repulsionStrength: 3.0,      // Force répulsion
  inertia: 0.010,              // Inertie mouvement
  falloffPower: 1.0,           // Courbe falloff distance
  centerOffset: { x: 0, y: 0, z: 0 }, // Offset centre détection
  deadZone: 0.15,              // Zone morte centre (anti-vibration)
  updateThreshold: 0.02,       // Seuil update minimum
  debugMode: false,
  originPosition: { x: 0, y: 0, z: 0 }, // Position repos modèle
  minMovement: 0.05,           // Mouvement minimum requis
  smoothingFactor: 0.95        // Facteur lissage stabilisation
})
```

**Pattern réactif** : `useState` pour config modifiable en temps réel

---

## 🔄 **ARCHITECTURE SYSTÈME**

### **useRef State (7 refs)**
```javascript
// Positions 3D
const irisPositionRef = useRef(new THREE.Vector3())      // Centre détection (iris/tête)
const currentOffsetRef = useRef(new THREE.Vector3())     // Offset actuel modèle
const targetOffsetRef = useRef(new THREE.Vector3())      // Offset cible

// Three.js Tools
const raycasterRef = useRef(new THREE.Raycaster())       // Raycast souris → plan 3D
const planeRef = useRef(new THREE.Plane())              // Plan intersection 3D

// Sync Data particules
const syncDataRef = useRef({
  direction: new THREE.Vector3(0, 0, -1),  // Direction flux
  intensity: 0,                            // Intensité 0-1
  isActive: false,                         // État actif
  timestamp: 0                            // Timestamp dernière update
})

// Anti-vibration
const lastMouseRef = useRef({ x: 0, y: 0 })             // Dernière position souris
const stableCountRef = useRef(0)                        // Compteur stabilité

// Debug Info
const debugRef = useRef({
  sphereCenter: new THREE.Vector3(),
  mouseDirection: new THREE.Vector3(),
  currentOffset: new THREE.Vector3(),
  effectStrength: 0,
  updateTime: 0,
  centerDetected: false
})
```

---

## 🎯 **ALGORITHME RÉPULSION (3 phases)**

### **Phase 1 : Détection Centre (detectIrisPosition)**
```javascript
const detectIrisPosition = () => {
  if (!model) return false

  // 1. Chercher iris/œil dans hiérarchie modèle
  const iris = model.getObjectByName('IRIS') ||
               model.getObjectByName('Anneaux_Eye_Int') ||
               model.getObjectByName('Eye')

  if (iris) {
    iris.getWorldPosition(irisPositionRef.current)
    irisPositionRef.current.add(new THREE.Vector3(config.centerOffset))
    return true
  }

  // 2. Fallback : centre bounding box + offset tête
  const box = new THREE.Box3().setFromObject(model)
  box.getCenter(irisPositionRef.current)
  irisPositionRef.current.y += 1.0 // Approximation hauteur tête
  return true
}
```

### **Phase 2 : Calcul Répulsion (calculateRepulsion)**
```javascript
const calculateRepulsion = (mouseNormalized) => {
  // 1. Créer plan 3D perpendiculaire à camera, centré sur iris
  const cameraDirection = new THREE.Vector3()
  camera.getWorldDirection(cameraDirection)
  planeRef.current.setFromNormalAndCoplanarPoint(cameraDirection, irisPositionRef.current)

  // 2. Raycast souris vers plan 3D
  raycasterRef.current.setFromCamera(mouseNormalized, camera)
  const intersection = raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionPoint)

  if (!intersection) return new THREE.Vector3(0, 0, 0)

  // 3. Calculer vecteur répulsion (iris → souris inversé)
  const repulsionVector = new THREE.Vector3()
  repulsionVector.subVectors(irisPositionRef.current, intersectionPoint)

  const distance = repulsionVector.length()

  // 4. Dead zone anti-vibration centre
  if (distance < config.deadZone) {
    return new THREE.Vector3(0, 0, 0)
  }

  // 5. Normaliser + appliquer falloff courbe
  repulsionVector.normalize()
  const normalizedDistance = Math.min(distance / config.sphereRadius, 1.0)
  const falloffStrength = Math.pow(1 - normalizedDistance, config.falloffPower)
  const effectiveStrength = falloffStrength * config.repulsionStrength

  repulsionVector.multiplyScalar(effectiveStrength)
  return repulsionVector
}
```

### **Phase 3 : Application Mouvement (update)**
```javascript
const update = useCallback(() => {
  // 1. Détection centre valide
  const hasValidCenter = detectIrisPosition()
  if (!hasValidCenter) return

  // 2. Anti-vibration : check mouvement souris
  const mouseDelta = Math.abs(mouse.x - lastMouseRef.current.x) + Math.abs(mouse.y - lastMouseRef.current.y)
  if (mouseDelta < 0.001) {
    stableCountRef.current++
    // Réduction progressive si souris stable > 1sec
    if (stableCountRef.current > 60) {
      currentOffsetRef.current.multiplyScalar(0.98)
    }
  }

  // 3. Calcul répulsion cible avec limite magnitude
  const targetRepulsion = calculateRepulsion(new THREE.Vector2(mouse.x, mouse.y))
  if (targetRepulsion.length() > 2.0) {
    targetRepulsion.normalize().multiplyScalar(2.0)
  }

  // 4. Double lissage inertie
  targetOffsetRef.current.lerp(targetRepulsion, 0.5) // Lissage cible

  const deltaMovement = targetOffsetRef.current.distanceTo(currentOffsetRef.current)
  if (deltaMovement > config.minMovement) {
    currentOffsetRef.current.lerp(targetOffsetRef.current, config.inertia)
  } else if (deltaMovement < config.minMovement * 0.5) {
    currentOffsetRef.current.multiplyScalar(config.smoothingFactor)
  }

  // 5. Application position modèle avec arrondi anti-fluctuation
  if (currentOffsetRef.current.length() > config.updateThreshold) {
    const roundedX = Math.round((config.originPosition.x + currentOffsetRef.current.x) * 1000) / 1000
    const roundedY = Math.round((config.originPosition.y + currentOffsetRef.current.y) * 1000) / 1000
    const roundedZ = Math.round((config.originPosition.z + currentOffsetRef.current.z) * 1000) / 1000

    model.position.set(roundedX, roundedY, roundedZ)
  }
}, [enabled, model, mouse.x, mouse.y, config])
```

---

## 🎨 **SYSTÈME PARTICULES SYNC**

### **Direction Flux Calculation**
```javascript
const calculateParticleFlowDirection = useCallback(() => {
  if (!currentOffsetRef.current || currentOffsetRef.current.length() < config.updateThreshold) {
    return new THREE.Vector3(0, 0, -1) // Direction défaut
  }

  // Direction opposée à répulsion = flux "fuit" dans même direction
  const flowDirection = currentOffsetRef.current.clone().normalize()
  return flowDirection
}, [config.updateThreshold])
```

### **Sync Data Communication**
```javascript
// Dans update() - Communication avec particules système
if (onSyncDataChange) {
  const newDirection = calculateParticleFlowDirection()
  const newIntensity = debugRef.current.effectStrength
  const timestamp = performance.now()

  // Update seulement si changement significatif
  if (newDirection.distanceTo(syncDataRef.current.direction) > 0.01 ||
      Math.abs(newIntensity - syncDataRef.current.intensity) > 0.05 ||
      timestamp - syncDataRef.current.timestamp > 16) { // Min 60fps

    syncDataRef.current.direction.copy(newDirection)
    syncDataRef.current.intensity = newIntensity
    syncDataRef.current.isActive = newIntensity > 0.01
    syncDataRef.current.timestamp = timestamp

    onSyncDataChange(syncDataRef.current)
  }
}
```

---

## 📷 **CAMERA PRESETS SYSTÈME**

### **Positions prédéfinies**
```javascript
const CAMERA_POSITIONS = {
  cam1: {
    position: { x: 0, y: 1.4511, z: 14.2794 },
    rotation: { x: -0.1013, y: 0, z: 0 }
  },
  cam2: {
    position: { x: 0, y: 2.0779, z: 20.4477 },
    rotation: { x: -0.1013, y: 0, z: 0 }
  }
}
```

### **Camera Control Functions**
```javascript
const goToCameraPosition1 = useCallback(() => {
  const target = CAMERA_POSITIONS.cam1
  camera.position.set(target.position.x, target.position.y, target.position.z)
  camera.rotation.set(target.rotation.x, target.rotation.y, target.rotation.z)
}, [camera])

const goToCameraPosition2 = useCallback(() => {
  const target = CAMERA_POSITIONS.cam2
  camera.position.set(target.position.x, target.position.y, target.position.z)
  camera.rotation.set(target.rotation.x, target.rotation.y, target.rotation.z)
}, [camera])
```

---

## 🔧 **API PUBLIQUE**

### **Return Object**
```javascript
return {
  isActive: enabled && !!model,           // État activation
  currentOffset: currentOffsetRef.current, // Offset actuel Vector3
  effectStrength: debugRef.current.effectStrength, // Force effet 0-1
  setParameters,                          // Modifier config temps réel
  debug: debugRef.current,                // Infos debug complètes
  update,                                // Function update render loop
  config: config,                        // Config actuelle
  goToCameraPosition1,                   // Camera preset 1
  goToCameraPosition2,                   // Camera preset 2
  syncData: syncDataRef.current          // Données sync particules
}
```

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Système Anti-Vibration Sophistiqué**
- **Dead zone centre** : Évite vibrations autour iris
- **Mouvement minimum** : Seuil activation anti-micro-corrections
- **Stabilité souris** : Réduction progressive si souris immobile
- **Double lissage** : Target + current avec inertie

### **2. Performance Optimisée**
- **Update threshold** : Pas d'application si changement insignifiant
- **Arrondi positions** : Anti-fluctuations micro-pixels
- **Sync throttling** : Communication particules limitée 60fps
- **Magnitude limiting** : Prévention sauts extrêmes

### **3. Détection Intelligente Centre**
- **Hiérarchie names** : IRIS → Anneaux_Eye_Int → Eye
- **Fallback robuste** : Bounding box + offset tête
- **World position** : Gestion transformations nested

### **4. Architecture Modulaire**
- **Config réactive** : useState pour modification temps réel
- **API claire** : Interface simple et complète
- **Particules sync** : Communication découplée
- **Camera presets** : Outils développeur intégrés

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Hardcoded Camera Presets**
```javascript
// Positions fixes dans le code
const CAMERA_POSITIONS = {
  cam1: { position: { x: 0, y: 1.4511, z: 14.2794 } }
  // Pas configurable, pas d'animation smooth
}
```

### **2. Magic Numbers Configuration**
```javascript
// Valeurs empiriques non documentées
deadZone: 0.15,              // Pourquoi 0.15 ?
updateThreshold: 0.02,       // Pourquoi 0.02 ?
minMovement: 0.05,           // Basé sur quoi ?
smoothingFactor: 0.95        // Optimisation empirique
```

### **3. Model Names Dependency**
```javascript
// Noms hardcodés dans hiérarchie
const iris = model.getObjectByName('IRIS') ||
             model.getObjectByName('Anneaux_Eye_Int') ||
             model.getObjectByName('Eye')
// Fragile si noms changent dans modèle 3D
```

### **4. Global Window Responsiveness**
```javascript
// Viewport size hardcodé
sphereRadius: Math.min(window.innerWidth, window.innerHeight)
// Pas de resize listener, valeur figée
```

---

## 🎯 **USAGE PATTERNS**

### **Integration dans scene**
```javascript
const { floatingSpace, triggerFloat } = useFloatingSpace({
  model: model,
  mouse: mousePosition,
  camera: camera,
  enabled: floatingSpaceEnabled,
  onSyncDataChange: (syncData) => {
    // Sync avec particules system
    particleSystem.updateFlowDirection(syncData.direction, syncData.intensity)
  }
})

// Dans render loop
useEffect(() => {
  const animate = () => {
    floatingSpace.update() // Update répulsion
    // autres updates...
  }
  animate()
}, [])
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **FloatingSpace Machine**
```javascript
const floatingSpaceMachine = createMachine({
  id: 'floatingSpace',
  initial: 'disabled',
  context: {
    enabled: false,
    config: {
      repulsionStrength: 3.0,
      inertia: 0.010,
      deadZone: 0.15
      // Configuration centralisée
    },
    currentOffset: { x: 0, y: 0, z: 0 },
    mousePosition: { x: 0, y: 0 },
    syncData: {
      direction: { x: 0, y: 0, z: -1 },
      intensity: 0,
      isActive: false
    }
  },
  states: {
    disabled: {
      on: {
        ENABLE: 'enabled'
      }
    },
    enabled: {
      initial: 'idle',
      on: {
        DISABLE: 'disabled',
        UPDATE_MOUSE: {
          actions: 'updateMousePosition'
        },
        UPDATE_CONFIG: {
          actions: 'updateConfiguration'
        }
      },
      states: {
        idle: {
          on: {
            MOUSE_MOVED: 'calculating'
          }
        },
        calculating: {
          invoke: {
            src: 'calculateRepulsionService',
            onDone: {
              target: 'applying',
              actions: 'setTargetRepulsion'
            }
          }
        },
        applying: {
          invoke: {
            src: 'applyMovementService',
            onDone: 'idle',
            onError: 'idle'
          },
          after: {
            16: 'idle' // 60fps cycle
          }
        }
      }
    }
  },
  actions: {
    updateMousePosition: assign({
      mousePosition: (_, event) => event.position
    }),
    updateConfiguration: assign({
      config: (context, event) => ({ ...context.config, ...event.config })
    }),
    setTargetRepulsion: assign({
      targetOffset: (_, event) => event.data.repulsionVector
    })
  }
})
```

### **Services XState**
```javascript
// Service calcul répulsion
const calculateRepulsionService = (context, event) => {
  return new Promise((resolve) => {
    const repulsionVector = calculateRepulsion(
      context.mousePosition,
      context.config
    )
    resolve({ repulsionVector })
  })
}

// Service application mouvement
const applyMovementService = (context, event) => (callback) => {
  // Application Three.js
  if (window.model && context.currentOffset) {
    window.model.position.set(
      context.config.originPosition.x + context.currentOffset.x,
      context.config.originPosition.y + context.currentOffset.y,
      context.config.originPosition.z + context.currentOffset.z
    )
  }

  // Communication particules
  callback('SYNC_PARTICLES', {
    direction: context.syncData.direction,
    intensity: context.syncData.intensity
  })

  return () => {} // Cleanup
}
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 288 (taille raisonnable)
- **useRef** : 7 refs (positions 3D + tools)
- **useState** : 1 (config réactive)
- **useCallback** : 5 callbacks optimisés
- **Three.js objects** : Vector3, Raycaster, Plane
- **Magic numbers** : ~10 valeurs empiriques
- **Performance** : 60fps updates avec throttling
- **API publique** : 10 propriétés exposées

---

## ✅ **CONCLUSION**

**useFloatingSpace = Hook interaction 3D bien conçu avec système anti-vibration sophistiqué**

### **Points forts**
- **UX naturelle** : Répulsion mouse → model fluide
- **Anti-vibration avancé** : Dead zone + smoothing + thresholding
- **Performance optimisée** : Update throttling + magnitude limiting
- **Communication découplée** : Sync particules via callback
- **API complète** : Config réactive + debug + camera presets

### **Points faibles**
- **Magic numbers** : Valeurs empiriques non documentées
- **Hardcoded dependencies** : Model names, camera presets
- **Global window usage** : Viewport size non réactif
- **No resize handling** : Pas d'adaptation responsive

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Pattern** : Machine states + services pour calculs
- **Services** : calculateRepulsion + applyMovement découplés
- **Communication** : Events pour sync particules

**Recommandation** : **CONSTRUIRE vers machine XState** avec services pour logique 3D + **conserver** patterns anti-vibration

---

**FIN SESSION 13 - useFloatingSpace.js**
**Durée analyse** : ~35 minutes
**Prochaine session** : useModelLoader.js