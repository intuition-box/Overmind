# 📋 RAPPORT AUDIT : useRevealManager.js

**Date** : 25/09/2025 - SESSION 16
**Fichier** : `hooks/useRevealManager.js`
**Taille** : 88 lignes
**Type** : Hook Révélation Anneaux Magiques (Spatial Trigger System)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useState, useCallback, useRef } from 'react'
- * as THREE from 'three'
```

### **Imports internes**
```javascript
- { RING_MATERIALS, getMaterialType } from '../utils/materials.js'
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Révélation spatiale** : Anneaux magiques apparaissent selon position trigger
- **Zone detection** : Calculs distance 3D + hauteur pour activation
- **Material switching** : Changement matériaux pour effet bloom
- **Animation system** : Déclenchement animations GLTF anneaux
- **Performance throttling** : Update limité 60fps max

---

## 🔧 **SIGNATURE HOOK**

```javascript
export function useRevealManager() {
  // Return: { createRevealManager, magicRingsInfo, isAnimating }
}
```

**Pattern** : Hook factory → createRevealManager() retourne l'instance manager

---

## 🎛️ **ÉTAT LOCAL (3 useState)**

```javascript
const [magicRingsInfo, setMagicRingsInfo] = useState([]);  // Info anneaux pour UI
const [isAnimating, setIsAnimating] = useState(false);     // Flag animation en cours
const lastUpdateRef = useRef(0);                           // Throttling updates
```

---

## 🏭 **FACTORY PATTERN**

### **createRevealManager Function**
```javascript
const createRevealManager = useCallback((magicRings, forceShowRings) => {
  // magicRings: Array Three.js meshes anneaux
  // forceShowRings: Boolean force visibilité

  const tempVec = new THREE.Vector3(); // Réutilisable pour calculs position

  return {
    updateRevealedRings: (triggerPosition, triggerRadius, triggerHeight) => { /* ... */ },
    animateRings: (animations, mixer) => { /* ... */ }
  };
}, []);
```

**Architecture** : Factory retourne objet avec 2 méthodes principales

---

## 🌟 **SYSTÈME RÉVÉLATION SPATIALE**

### **updateRevealedRings Algorithm**
```javascript
updateRevealedRings: (triggerPosition, triggerRadius, triggerHeight) => {
  // 1. Throttling 60fps
  const currentTime = Date.now();
  if (currentTime - lastUpdateRef.current < 16) return; // ~60fps
  lastUpdateRef.current = currentTime;

  const updatedRings = magicRings.map(ring => {
    // 2. Calcul position mondiale anneau
    ring.getWorldPosition(tempVec);
    const distance = tempVec.distanceTo(triggerPosition);

    // 3. Zone detection 3D (radius + height)
    const isInZone = distance <= triggerRadius &&
                    Math.abs(tempVec.y - triggerPosition.y) <= triggerHeight;

    // 4. Visibilité (zone OU force)
    const shouldShow = forceShowRings || isInZone;
    ring.visible = shouldShow;

    // 5. Material switching pour bloom
    if (shouldShow) {
      const materialType = getMaterialType(ring.material);
      ring.material = RING_MATERIALS[materialType] || RING_MATERIALS.default;
    }

    // 6. Info pour UI debug
    return {
      name: ring.name,
      position: { x: tempVec.x, y: tempVec.y, z: tempVec.z },
      visible: shouldShow,
      distance: distance.toFixed(2)
    };
  });

  setMagicRingsInfo(updatedRings);
}
```

### **Zone Detection 3D**
```
Trigger Zone = Cylindre 3D
- Centre: triggerPosition (Vector3)
- Rayon: triggerRadius (distance XZ)
- Hauteur: triggerHeight (±Y depuis centre)

Condition activation:
- distance <= triggerRadius (plan XZ)
- ET |ringY - triggerY| <= triggerHeight (axe Y)
```

---

## 🎬 **SYSTÈME ANIMATIONS**

### **animateRings Function**
```javascript
animateRings: (animations, mixer) => {
  setIsAnimating(true);

  // 1. Noms animations anneaux hardcodés
  const ringAnimationNames = [
    'Ring_Master',
    'BloomArea2Action',
    'BloomArea3Action',
    'BloomArea4Action',
    'BloomArea5Action',
    'Ring_ExtAction',
    'Ring_IntAction'
  ];

  // 2. Jouer animations avec error handling silencieux
  ringAnimationNames.forEach(animName => {
    const clip = animations.find(clip => clip.name === animName);
    if (clip) {
      try {
        const action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(THREE.LoopOnce);      // Une fois seulement
        action.clampWhenFinished = true;      // Garder dernière frame
        action.play();
      } catch {
        // Silent error handling - pas de log
      }
    }
  });

  // 3. Auto-stop après durée fixe
  setTimeout(() => {
    setIsAnimating(false);
  }, 3000); // 3 secondes hardcodées
}
```

---

## 🎨 **SYSTÈME MATÉRIAUX**

### **Material Switching Logic**
```javascript
// Si anneau doit être visible
if (shouldShow) {
  const materialType = getMaterialType(ring.material);  // Détection type actuel
  ring.material = RING_MATERIALS[materialType] || RING_MATERIALS.default;  // Switch vers bloom
}
```

**Flow** : Material original → getMaterialType() → RING_MATERIALS lookup → bloom material

### **RING_MATERIALS Dependency**
```javascript
// Depuis utils/materials.js
RING_MATERIALS = {
  default: /* Material bloom standard */,
  [materialType]: /* Material bloom spécialisé */
  // etc...
}
```

---

## 📊 **INFO UI EXPORT**

### **magicRingsInfo Structure**
```javascript
// State exporté pour debug panels
[
  {
    name: "Ring_01",                    // Nom mesh
    position: { x: 1.2, y: 0.5, z: 3.1 }, // Position monde
    visible: true,                      // État visibilité
    distance: "2.45"                   // Distance trigger (string)
  },
  // ... autres anneaux
]
```

**Usage** : Debug panels peuvent afficher infos anneaux temps réel

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Performance Optimisée**
- **Throttling 60fps** : Updates limités à 16ms minimum
- **Vector réutilisable** : tempVec évite allocations multiples
- **Early return** : Pas de calculs si throttled
- **Distance cache** : toFixed(2) pour UI seulement

### **2. Zone Detection Robuste**
- **3D cylindrique** : Radius XZ + height Y
- **World coordinates** : getWorldPosition() gère transformations
- **Flexible triggers** : Paramètres radius/height configurables
- **Force override** : forceShowRings bypass spatial logic

### **3. Error Handling Graceful**
- **Silent catch** : Animations errors pas bloquants
- **Material fallback** : RING_MATERIALS.default si type inconnu
- **Null safety** : Vérifications clip existence

### **4. Factory Pattern Clean**
- **Closure capture** : magicRings + forceShowRings encapsulés
- **Method consistency** : 2 méthodes bien définies
- **State management** : Hook gère état global révélation

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Animation Names Hardcodés**
```javascript
// Noms animations fixés dans code
const ringAnimationNames = [
  'Ring_Master',
  'BloomArea2Action',
  // Fragile si noms changent dans GLTF
];
```

### **2. Timeout Animation Fixe**
```javascript
// Durée animation hardcodée
setTimeout(() => {
  setIsAnimating(false);
}, 3000); // Pas configurable, pas sync avec animations réelles
```

### **3. Material Type Coupling**
```javascript
// Dépendance forte getMaterialType + RING_MATERIALS
const materialType = getMaterialType(ring.material);
ring.material = RING_MATERIALS[materialType] || RING_MATERIALS.default;
// Logique externalisée, pas de contrôle local
```

### **4. Single Trigger Point**
```javascript
// Un seul triggerPosition supporté
// Pas de multi-triggers simultanés
// Logique binaire in/out zone
```

---

## 🎯 **USAGE PATTERNS**

### **Intégration V3Scene**
```javascript
const { createRevealManager, magicRingsInfo, isAnimating } = useRevealManager();

useEffect(() => {
  if (magicRings.length > 0) {
    const revealManager = createRevealManager(magicRings, forceShowRings);

    // Dans render loop ou event handler
    revealManager.updateRevealedRings(
      new THREE.Vector3(0, 0, 0),  // triggerPosition
      5.0,                         // triggerRadius
      2.0                          // triggerHeight
    );

    // Sur événement reveal
    revealManager.animateRings(animations, mixer);
  }
}, [magicRings, forceShowRings]);
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **RevealManager Machine**
```javascript
const revealManagerMachine = createMachine({
  id: 'revealManager',
  initial: 'idle',
  context: {
    magicRings: [],
    triggerZone: {
      position: { x: 0, y: 0, z: 0 },
      radius: 5.0,
      height: 2.0
    },
    revealedRings: [],
    forceShowAll: false,
    animationConfig: {
      duration: 3000,
      animationNames: [
        'Ring_Master',
        'BloomArea2Action'
        // Configurable
      ]
    }
  },
  states: {
    idle: {
      on: {
        SET_RINGS: {
          actions: 'setMagicRings'
        },
        UPDATE_TRIGGER: 'checking'
      }
    },
    checking: {
      invoke: {
        src: 'checkRevealZoneService',
        onDone: {
          target: 'idle',
          actions: 'updateRevealedRings'
        }
      },
      after: {
        16: 'checking' // 60fps throttling
      },
      on: {
        TRIGGER_ANIMATION: 'animating'
      }
    },
    animating: {
      invoke: {
        src: 'playRingAnimationsService',
        onDone: 'idle'
      },
      after: {
        [context => context.animationConfig.duration]: 'idle'
      }
    }
  },
  actions: {
    setMagicRings: assign({
      magicRings: (_, event) => event.rings
    }),
    updateRevealedRings: assign({
      revealedRings: (_, event) => event.data.revealedRings
    })
  }
});
```

### **Services XState**
```javascript
// Service zone checking
const checkRevealZoneService = (context, event) => {
  return new Promise((resolve) => {
    const { magicRings, triggerZone, forceShowAll } = context;
    const revealedRings = [];

    magicRings.forEach(ring => {
      const worldPos = new THREE.Vector3();
      ring.getWorldPosition(worldPos);

      const distance = worldPos.distanceTo(triggerZone.position);
      const isInZone = distance <= triggerZone.radius &&
                      Math.abs(worldPos.y - triggerZone.position.y) <= triggerZone.height;

      const shouldShow = forceShowAll || isInZone;
      ring.visible = shouldShow;

      if (shouldShow) {
        // Material switching logic
      }

      revealedRings.push({
        name: ring.name,
        position: worldPos,
        visible: shouldShow,
        distance
      });
    });

    resolve({ revealedRings });
  });
};

// Service animations
const playRingAnimationsService = (context, event) => (callback) => {
  const { animationConfig } = context;

  animationConfig.animationNames.forEach(animName => {
    // Animation logic
  });

  // Auto-cleanup après durée
  const timeoutId = setTimeout(() => {
    callback('ANIMATION_COMPLETE');
  }, animationConfig.duration);

  return () => clearTimeout(timeoutId);
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 88 (compact)
- **useState** : 2 (magicRingsInfo, isAnimating)
- **useRef** : 1 (lastUpdateRef throttling)
- **useCallback** : 1 (createRevealManager factory)
- **Dependencies** : RING_MATERIALS + getMaterialType
- **Animation names** : 7 hardcodés
- **Throttling** : 16ms (60fps)
- **Timeout** : 3000ms fixe

---

## ✅ **CONCLUSION**

**useRevealManager = Hook révélation spatiale compact avec zone detection 3D**

### **Points forts**
- **Zone detection 3D** : Algorithme cylindrique robust
- **Performance optimisée** : Throttling 60fps + vector réutilisable
- **Error handling** : Silent catch animations
- **Factory pattern** : Architecture propre avec closure
- **UI integration** : magicRingsInfo pour debug panels

### **Points faibles**
- **Animation names hardcodés** : Fragile si GLTF change
- **Timeout fixe** : 3000ms pas sync avec animations
- **Material coupling** : Dépendance externe getMaterialType
- **Single trigger** : Un seul point trigger supporté

### **Construction XState**
- **Complexité** : 🟢 SIMPLE
- **Pattern** : Machine states + services 3D
- **Benefits** : Configuration flexible + multi-triggers + timeout dynamique
- **Services** : Zone checking + animations découplés

**Recommandation** : **CONSTRUIRE vers machine XState** simple avec **configuration animations** + **multi-triggers support**

---

**FIN SESSION 16 - useRevealManager.js**
**Durée analyse** : ~25 minutes
**Prochaine session** : useRobotController.js