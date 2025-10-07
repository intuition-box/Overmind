# 📋 RAPPORT AUDIT : useRobotController.js

**Date** : 25/09/2025 - SESSION 17
**Fichier** : `hooks/useRobotController.js`
**Taille** : 85 lignes
**Type** : Hook Contrôleur Robot (Animation Crossfading System)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useState, useRef, useCallback } from 'react'
- * as THREE from 'three'
```

### **Imports internes**
```javascript
(Aucun - Hook autonome)
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Animation bipolaire** : Gestion 2 états robot ('Mouv' ↔ 'Pose')
- **Crossfading system** : Transitions fluides between animations
- **Loop management** : Mouv permanent + Pose once + auto-return
- **Ring triggers** : Callback système pour animations anneaux
- **State tracking** : Protection transitions concurrentes

---

## 🔧 **SIGNATURE HOOK**

```javascript
export function useRobotController() {
  // Return: { setupAnimations, triggerTransition, currentAnimation, isTransitioning, onRingAnimationTrigger }
}
```

**Pattern** : Hook factory → setupAnimations() puis contrôle transitions

---

## 🎛️ **ÉTAT LOCAL (2 useState)**

```javascript
const [currentAnimation, setCurrentAnimation] = useState('Mouv');  // État animation courante
const [isTransitioning, setIsTransitioning] = useState(false);     // Flag transition en cours
```

---

## 📊 **SYSTÈME RÉFÉRENCES (3 useRef)**

### **Animation References**
```javascript
const mixerRef = useRef(null);                    // THREE.AnimationMixer instance
const actionsRef = useRef({});                    // Actions cache { actionMouv, actionPose }
const onRingAnimationTrigger = useRef(null);      // Callback externe rings
```

**Architecture** : Refs pour persistence données animation entre renders

---

## 🎬 **SYSTÈME ANIMATIONS**

### **setupAnimations - Configuration GLTF**
```javascript
const setupAnimations = useCallback((animations, mixer) => {
  mixerRef.current = mixer;

  // 1. Extraction clips GLTF
  const mouvClip = animations.find(clip => clip.name === 'Mouv');
  const poseClip = animations.find(clip => clip.name === 'Pose');

  // 2. Setup action Mouv (permanent loop)
  if (mouvClip) {
    actionsRef.current.actionMouv = mixer.clipAction(mouvClip);
    actionsRef.current.actionMouv.setLoop(THREE.LoopRepeat);  // ♾️ Permanent
  }

  // 3. Setup action Pose (once + clamp)
  if (poseClip) {
    actionsRef.current.actionPose = mixer.clipAction(poseClip);
    actionsRef.current.actionPose.setLoop(THREE.LoopOnce);    // ▶️ Une fois
    actionsRef.current.actionPose.clampWhenFinished = true;   // 🔒 Garder last frame

    // 4. Auto-return via event listener
    actionsRef.current.actionPose.getMixer().addEventListener('finished', (e) => {
      if (e.action === actionsRef.current.actionPose) {
        returnToMouv();  // 🔄 Auto return
      }
    });
  }

  // 5. Start Mouv par défaut
  if (actionsRef.current.actionMouv) {
    actionsRef.current.actionMouv.play();
    setCurrentAnimation('Mouv');
  }
}, [returnToMouv]);
```

**Pattern** : Extract → Setup Loop Types → Auto-return → Start Default

---

## 🔄 **SYSTÈME TRANSITIONS**

### **triggerTransition - State Machine Logic**
```javascript
const triggerTransition = useCallback((targetAnimation) => {
  // 1. Guards validation
  if (!actionsRef.current.actionMouv || !actionsRef.current.actionPose) return;
  if (isTransitioning) return; // ⛔ Prevent concurrent transitions

  setIsTransitioning(true);

  // 2. Mouv → Pose transition
  if (targetAnimation === 'Pose' && currentAnimation === 'Mouv') {
    // Crossfade 1 seconde
    actionsRef.current.actionMouv.crossFadeTo(actionsRef.current.actionPose, 1.0, false);
    actionsRef.current.actionPose.reset().play();

    // 🔮 Trigger ring animations
    if (onRingAnimationTrigger.current) {
      onRingAnimationTrigger.current();
    }

    setCurrentAnimation('Pose');
    setTimeout(() => setIsTransitioning(false), 1000); // ⏱️ 1s timeout

  // 3. Pose → Mouv transition
  } else if (targetAnimation === 'Mouv' && currentAnimation === 'Pose') {
    returnToMouv(); // 🔄 Delegate to returnToMouv
  }
}, [currentAnimation, isTransitioning, returnToMouv]);
```

### **returnToMouv - Shared Return Logic**
```javascript
const returnToMouv = useCallback(() => {
  if (!actionsRef.current.actionMouv || !actionsRef.current.actionPose) return;

  // Crossfade back to Mouv
  actionsRef.current.actionPose.crossFadeTo(actionsRef.current.actionMouv, 1.0, false);
  actionsRef.current.actionMouv.reset().play();

  setCurrentAnimation('Mouv');
  setIsTransitioning(false);
}, []);
```

---

## 🔮 **SYSTÈME RING INTEGRATION**

### **Ring Animation Trigger**
```javascript
// Dans triggerTransition Mouv → Pose
if (onRingAnimationTrigger.current) {
  onRingAnimationTrigger.current(); // 🔮 External callback
}
```

### **External Callback Setup**
```javascript
// Usage pattern attendu
const { onRingAnimationTrigger } = useRobotController();

useEffect(() => {
  onRingAnimationTrigger.current = () => {
    // Trigger useRevealManager animations
    revelationManager.animateRings(animations, mixer);
  };
}, [revelationManager]);
```

**Integration** : Callback pattern pour découpler robot ↔ rings

---

## 🛡️ **PROTECTION CONCURRENT TRANSITIONS**

### **Guards System**
```javascript
// 1. Actions validation
if (!actionsRef.current.actionMouv || !actionsRef.current.actionPose) return;

// 2. Transition lock
if (isTransitioning) return; // ⛔ Prevent overlapping

// 3. State validation
if (targetAnimation === 'Pose' && currentAnimation === 'Mouv') {
  // Only valid transition
}
```

**Robustesse** : Prevents invalid states + concurrent transitions

---

## ⏱️ **TIMING MANAGEMENT**

### **Crossfade Duration**
```javascript
// 1.0 seconde crossfade standard
actionMouv.crossFadeTo(actionPose, 1.0, false);
```

### **Transition Timeout**
```javascript
// Libérer lock après 1 seconde
setTimeout(() => setIsTransitioning(false), 1000);
```

### **Auto-return via Event**
```javascript
// Event listener sur mixer pour fin Pose
actionsRef.current.actionPose.getMixer().addEventListener('finished', (e) => {
  if (e.action === actionsRef.current.actionPose) {
    returnToMouv(); // 🔄 Automatic return
  }
});
```

**Architecture** : Event-driven auto-return + timeout fallback

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Animation State Machine**
- **Binary states** : Mouv ↔ Pose bien définis
- **Guards system** : Protection transitions invalides
- **Concurrent protection** : isTransitioning lock
- **Auto-return logic** : Event + manual cleanup

### **2. Crossfading System**
- **Smooth transitions** : THREE.js crossFadeTo native
- **Standardized duration** : 1.0s consistent
- **Loop management** : LoopRepeat vs LoopOnce
- **Frame clamping** : clampWhenFinished preserve last

### **3. External Integration**
- **Ring callback** : Découplage via onRingAnimationTrigger
- **Mixer reference** : Partage mixer entre systèmes
- **GLTF compatibility** : Direct animations[] input
- **Cleanup ready** : Event listeners + refs management

### **4. Code Organization**
- **Single responsibility** : Robot animations seulement
- **Clean API** : 5 exports focused
- **useCallback optimization** : Stable functions references
- **Error resilience** : Guards partout

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Animation Names Hardcodés**
```javascript
// Noms animations fixés
const mouvClip = animations.find(clip => clip.name === 'Mouv');
const poseClip = animations.find(clip => clip.name === 'Pose');
// Fragile si GLTF change de noms
```

### **2. Timeout Hardcodé**
```javascript
// Durée transition fixe
setTimeout(() => setIsTransitioning(false), 1000);
// Pas sync avec vraie durée crossfade
```

### **3. Binary State Limitation**
```javascript
// Seulement 2 états supportés
// Pas extensible pour plus d'animations
// Pattern rigide Mouv ↔ Pose
```

### **4. Ring Coupling**
```javascript
// Couplage conceptuel avec ring system
// Callback hardcodé dans transition Pose
// Pas configurable when to trigger
```

---

## 🎯 **USAGE PATTERNS**

### **Intégration V3Scene**
```javascript
const { setupAnimations, triggerTransition, currentAnimation, onRingAnimationTrigger } = useRobotController();

// Setup après model loaded
useEffect(() => {
  if (animations && mixer) {
    setupAnimations(animations, mixer);
  }
}, [animations, mixer, setupAnimations]);

// Connect ring system
useEffect(() => {
  onRingAnimationTrigger.current = () => {
    revealManager.animateRings(animations, mixer);
  };
}, [revealManager, animations, mixer]);

// UI controls
<button onClick={() => triggerTransition('Pose')}>
  {currentAnimation === 'Mouv' ? 'Switch to Pose' : 'Already in Pose'}
</button>
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **RobotController Machine**
```javascript
const robotControllerMachine = createMachine({
  id: 'robotController',
  initial: 'idle',
  context: {
    mixer: null,
    actions: {
      mouv: null,
      pose: null
    },
    config: {
      crossfadeDuration: 1.0,
      animationNames: {
        mouv: 'Mouv',
        pose: 'Pose'
      }
    }
  },
  states: {
    idle: {
      on: {
        SETUP_ANIMATIONS: {
          target: 'mouv',
          actions: 'setupAnimations'
        }
      }
    },
    mouv: {
      entry: 'startMouvAnimation',
      on: {
        TRIGGER_POSE: 'transitioning_to_pose'
      }
    },
    transitioning_to_pose: {
      entry: ['triggerRingAnimations', 'startPoseTransition'],
      after: {
        1000: 'pose'  // Configurable timeout
      },
      on: {
        FORCE_MOUV: 'transitioning_to_mouv'
      }
    },
    pose: {
      entry: 'startPoseAnimation',
      invoke: {
        src: 'waitForPoseComplete',
        onDone: 'transitioning_to_mouv'
      },
      on: {
        TRIGGER_MOUV: 'transitioning_to_mouv'
      }
    },
    transitioning_to_mouv: {
      entry: 'startMouvTransition',
      after: {
        1000: 'mouv'  // Configurable timeout
      }
    }
  },
  actions: {
    setupAnimations: assign({
      mixer: (_, event) => event.mixer,
      actions: (context, event) => {
        const { animations, mixer } = event;
        const mouvClip = animations.find(clip => clip.name === context.config.animationNames.mouv);
        const poseClip = animations.find(clip => clip.name === context.config.animationNames.pose);

        return {
          mouv: mouvClip ? mixer.clipAction(mouvClip) : null,
          pose: poseClip ? mixer.clipAction(poseClip) : null
        };
      }
    }),
    startMouvAnimation: (context) => {
      if (context.actions.mouv) {
        context.actions.mouv.setLoop(THREE.LoopRepeat);
        context.actions.mouv.reset().play();
      }
    },
    startPoseTransition: (context) => {
      if (context.actions.mouv && context.actions.pose) {
        context.actions.mouv.crossFadeTo(context.actions.pose, context.config.crossfadeDuration, false);
        context.actions.pose.reset().play();
      }
    },
    triggerRingAnimations: () => {
      // Send event to ring system machine
      // or call external service
    }
  }
});
```

### **Services XState**
```javascript
// Service attente fin animation Pose
const waitForPoseCompleteService = (context) => (callback) => {
  const { pose } = context.actions;

  if (!pose) {
    callback('COMPLETE');
    return () => {};
  }

  const handleFinished = (event) => {
    if (event.action === pose) {
      callback('COMPLETE');
    }
  };

  pose.getMixer().addEventListener('finished', handleFinished);

  return () => {
    pose.getMixer().removeEventListener('finished', handleFinished);
  };
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 85 (compact)
- **useState** : 2 (currentAnimation, isTransitioning)
- **useRef** : 3 (mixer, actions, ringCallback)
- **useCallback** : 3 (setupAnimations, triggerTransition, returnToMouv)
- **Animation states** : 2 (Mouv, Pose)
- **Crossfade duration** : 1.0s fixe
- **Event listeners** : 1 (finished)
- **Timeout** : 1 (transition lock)

---

## ✅ **CONCLUSION**

**useRobotController = Hook animation bipolaire compact avec crossfading system**

### **Points forts**
- **State machine logic** : Mouv ↔ Pose bien défini
- **Crossfading system** : Transitions fluides THREE.js
- **Protection concurrent** : Guards + isTransitioning lock
- **Auto-return logic** : Event-driven + manual cleanup
- **Ring integration** : Callback pattern découplé

### **Points faibles**
- **Animation names hardcodés** : 'Mouv'/'Pose' fixes
- **Timeout hardcodé** : 1000ms pas sync avec crossfade
- **Binary limitation** : Seulement 2 états supportés
- **Ring coupling** : Callback forcé sur transition Pose

### **Construction XState**
- **Complexité** : 🟢 SIMPLE
- **Pattern** : State machine + services transitions
- **Benefits** : Configuration flexible + multi-states + timeout sync
- **Services** : waitForPoseComplete découplé

**Recommandation** : **CONSTRUIRE vers machine XState** simple avec **configuration animations** + **multi-states support** + **timeout sync crossfade**

---

**FIN SESSION 17 - useRobotController.js**
**Durée analyse** : ~20 minutes
**Prochaine session** : useSimpleBloom.js