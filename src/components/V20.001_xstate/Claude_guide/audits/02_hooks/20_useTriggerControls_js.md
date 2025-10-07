# 📋 RAPPORT AUDIT : useTriggerControls.js

**Date** : 25/09/2025 - SESSION 20
**Fichier** : `hooks/useTriggerControls.js`
**Taille** : 84 lignes
**Type** : Hook Contrôles Trigger Zone (Keyboard 3D Navigation)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useState, useRef, useCallback, useEffect } from 'react'
```

### **Imports internes**
```javascript
- { V3_CONFIG } from '../utils/config.js'
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Keyboard navigation** : Contrôles ZQSD + AE + RF pour zone 3D
- **Trigger zone control** : Position (X,Y,Z) + radius modification
- **Speed modes** : Normal + fast (Shift modifier)
- **Enable/disable** : Toggle global pour contrôles
- **Real-time update** : Paramètres zone temps réel

---

## 🔧 **SIGNATURE HOOK**

```javascript
export function useTriggerControls() {
  // Return: { zoneParams, setZoneParams, updateZone, setIsEnabled }
}
```

**Pattern** : Hook contrôleur spatial avec keyboard input

---

## 🎛️ **ÉTAT LOCAL (2 useState + 1 useRef)**

### **Zone Parameters State**
```javascript
const [zoneParams, setZoneParams] = useState(V3_CONFIG.revelation);
const [isEnabled, setIsEnabled] = useState(true);
```

### **Keyboard State Tracking**
```javascript
const keyStateRef = useRef({
  z: false, s: false, q: false, d: false,  // ZQSD movement
  a: false, e: false,                      // AE vertical
  r: false, f: false,                      // RF size
  shift: false                             // Speed modifier
});
```

**Architecture** : Config-based initialization + ref-based keyboard tracking

---

## ⌨️ **SYSTÈME KEYBOARD INPUT**

### **Key Mapping System**
```javascript
// ZQSD - Horizontal movement (centerX, centerZ)
// AE   - Vertical movement (centerY)
// RF   - Size control (radius)
// Shift - Speed modifier (fast/normal)

const mappedKeys = ['z', 's', 'q', 'd', 'a', 'e', 'r', 'f', 'shift'];
```

### **handleKeyDown - State Tracking**
```javascript
const handleKeyDown = useCallback((event) => {
  if (!isEnabled) return;

  const key = event.key.toLowerCase();
  if (key in keyStateRef.current) {
    keyStateRef.current[key] = true;
    event.preventDefault(); // Prevent browser defaults
  }
}, [isEnabled]);
```

### **handleKeyUp - State Release**
```javascript
const handleKeyUp = useCallback((event) => {
  if (!isEnabled) return;

  const key = event.key.toLowerCase();
  if (key in keyStateRef.current) {
    keyStateRef.current[key] = false;
    event.preventDefault();
  }
}, [isEnabled]);
```

**Pattern** : Key state persistence + preventDefault + enabled guard

---

## 🎮 **SYSTÈME EVENT LISTENERS**

### **Global Keyboard Listener Setup**
```javascript
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [handleKeyDown, handleKeyUp]);
```

**Pattern** : Global window listeners + proper cleanup

---

## 🎯 **SYSTÈME ZONE UPDATE**

### **updateZone - Core Movement Logic**
```javascript
const updateZone = useCallback(() => {
  if (!isEnabled) return;

  // Speed calculation with shift modifier
  const speed = keyStateRef.current.shift ?
    V3_CONFIG.controls.moveSpeed.fast :
    V3_CONFIG.controls.moveSpeed.normal;

  let hasChanged = false;

  setZoneParams(prev => {
    let newParams = { ...prev };

    // Déplacements ZQSD (horizontal plane)
    if (keyStateRef.current.z) { newParams.centerZ -= speed; hasChanged = true; }
    if (keyStateRef.current.s) { newParams.centerZ += speed; hasChanged = true; }
    if (keyStateRef.current.q) { newParams.centerX -= speed; hasChanged = true; }
    if (keyStateRef.current.d) { newParams.centerX += speed; hasChanged = true; }

    // Haut/Bas AE (vertical axis)
    if (keyStateRef.current.a) { newParams.centerY += speed; hasChanged = true; }
    if (keyStateRef.current.e) { newParams.centerY -= speed; hasChanged = true; }

    // Taille RF (radius with limits)
    if (keyStateRef.current.r && newParams.radius < V3_CONFIG.controls.limits.maxSize) {
      newParams.radius = Math.min(
        newParams.radius + V3_CONFIG.controls.sizeSpeed,
        V3_CONFIG.controls.limits.maxSize
      );
      hasChanged = true;
    }

    if (keyStateRef.current.f && newParams.radius > V3_CONFIG.controls.limits.minSize) {
      newParams.radius = Math.max(
        newParams.radius - V3_CONFIG.controls.sizeSpeed,
        V3_CONFIG.controls.limits.minSize
      );
      hasChanged = true;
    }

    // Performance: Only update if changed
    return hasChanged ? newParams : prev;
  });
}, [isEnabled]);
```

**Intelligence** :
- Speed modulation (shift modifier)
- Boundary checking (radius limits)
- Performance optimization (hasChanged check)
- 3D spatial navigation (X, Y, Z + radius)

---

## 🔧 **CONFIGURATION V3_CONFIG**

### **Expected Config Structure**
```javascript
V3_CONFIG = {
  revelation: {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    radius: 5.0
  },
  controls: {
    moveSpeed: {
      normal: 0.1,
      fast: 0.3
    },
    sizeSpeed: 0.05,
    limits: {
      minSize: 0.5,
      maxSize: 20.0
    }
  }
}
```

**Configuration** : External config pour speeds, limits, initial values

---

## 📚 **API PUBLIQUE**

```javascript
return {
  zoneParams,      // Current zone parameters (centerX, centerY, centerZ, radius)
  setZoneParams,   // Direct zone parameters setter
  updateZone,      // Manual zone update trigger
  setIsEnabled     // Enable/disable controls
};
```

**Exports** : State + setters + update trigger + enable control

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Keyboard Handling Robust**
- **State persistence** : keyStateRef pour multi-key combinations
- **preventDefault** : Éviter browser default behaviors
- **Global listeners** : Window-level capture
- **Proper cleanup** : Event listeners removal

### **2. 3D Navigation Intuitive**
- **ZQSD mapping** : Standard gaming controls
- **Vertical AE** : Separate Y-axis control
- **Size RF** : Radius modification
- **Speed modifier** : Shift pour fast mode

### **3. Performance Optimized**
- **hasChanged check** : Update seulement si nécessaire
- **Ref-based state** : Pas de re-render sur key events
- **Config-driven** : External configuration
- **Boundary checking** : Prevent invalid values

### **4. Enable/Disable System**
- **Global toggle** : isEnabled pour tous les contrôles
- **Guard clauses** : Pas d'action si disabled
- **Clean state** : Consistent behavior

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Manual Update Required**
```javascript
// updateZone() doit être appelée manuellement
// Pas de auto-update sur key state change
// Parent component doit orchestrer updates
```

### **2. Key Mapping Hardcodé**
```javascript
// Keys fixes : z, s, q, d, a, e, r, f, shift
// Pas de customization clavier
// Pas de support autres layouts (WASD, etc.)
```

### **3. No Key Repeat Handling**
```javascript
// Pas de gestion repeat automatique
// Depends on external RAF loop pour continuous movement
// Key state mais pas de update automatique
```

### **4. Single Zone Assumption**
```javascript
// Hook assume 1 seule zone trigger
// Pas de multi-zones simultanées
// State global partagé
```

---

## 🎯 **USAGE PATTERNS**

### **Intégration V3Scene**
```javascript
const { zoneParams, updateZone, setIsEnabled } = useTriggerControls();

// Update loop integration
useEffect(() => {
  const updateLoop = () => {
    updateZone(); // Update zone based on current key states
    requestAnimationFrame(updateLoop);
  };
  updateLoop();
}, [updateZone]);

// Use zone params for revelation system
useEffect(() => {
  if (revealManager) {
    const triggerPosition = new THREE.Vector3(
      zoneParams.centerX,
      zoneParams.centerY,
      zoneParams.centerZ
    );
    revealManager.updateRevealedRings(
      triggerPosition,
      zoneParams.radius,
      zoneParams.height || 2.0
    );
  }
}, [zoneParams, revealManager]);

// Enable/disable based on UI state
useEffect(() => {
  setIsEnabled(!isUIFocused);
}, [isUIFocused, setIsEnabled]);
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **TriggerControls Machine**
```javascript
const triggerControlsMachine = createMachine({
  id: 'triggerControls',
  initial: 'disabled',
  context: {
    zoneParams: {
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      radius: 5.0
    },
    keyState: {
      z: false, s: false, q: false, d: false,
      a: false, e: false, r: false, f: false,
      shift: false
    },
    config: {
      moveSpeed: { normal: 0.1, fast: 0.3 },
      sizeSpeed: 0.05,
      limits: { minSize: 0.5, maxSize: 20.0 }
    }
  },
  states: {
    disabled: {
      on: {
        ENABLE: 'enabled'
      }
    },
    enabled: {
      type: 'parallel',
      states: {
        keyboardListener: {
          invoke: {
            src: 'keyboardListenerService'
          },
          on: {
            KEY_DOWN: {
              actions: 'setKeyDown'
            },
            KEY_UP: {
              actions: 'setKeyUp'
            }
          }
        },
        zoneUpdater: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                UPDATE_ZONE: 'updating'
              }
            },
            updating: {
              entry: 'updateZoneParameters',
              always: 'idle'
            }
          }
        }
      },
      on: {
        DISABLE: 'disabled',
        SET_ZONE_PARAMS: {
          actions: 'setZoneParameters'
        }
      }
    }
  },
  actions: {
    setKeyDown: assign({
      keyState: (context, event) => ({
        ...context.keyState,
        [event.key]: true
      })
    }),
    setKeyUp: assign({
      keyState: (context, event) => ({
        ...context.keyState,
        [event.key]: false
      })
    }),
    updateZoneParameters: assign({
      zoneParams: (context) => {
        const { keyState, config, zoneParams } = context;
        const speed = keyState.shift ? config.moveSpeed.fast : config.moveSpeed.normal;

        let newParams = { ...zoneParams };

        // Movement calculations
        if (keyState.z) newParams.centerZ -= speed;
        if (keyState.s) newParams.centerZ += speed;
        if (keyState.q) newParams.centerX -= speed;
        if (keyState.d) newParams.centerX += speed;
        if (keyState.a) newParams.centerY += speed;
        if (keyState.e) newParams.centerY -= speed;

        // Radius with limits
        if (keyState.r && newParams.radius < config.limits.maxSize) {
          newParams.radius = Math.min(newParams.radius + config.sizeSpeed, config.limits.maxSize);
        }
        if (keyState.f && newParams.radius > config.limits.minSize) {
          newParams.radius = Math.max(newParams.radius - config.sizeSpeed, config.limits.minSize);
        }

        return newParams;
      }
    }),
    setZoneParameters: assign({
      zoneParams: (_, event) => event.params
    })
  }
});
```

### **Services XState**
```javascript
// Service keyboard listener
const keyboardListenerService = (context, event) => (callback) => {
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    const validKeys = ['z', 's', 'q', 'd', 'a', 'e', 'r', 'f', 'shift'];

    if (validKeys.includes(key)) {
      event.preventDefault();
      callback('KEY_DOWN', { key });
    }
  };

  const handleKeyUp = (event) => {
    const key = event.key.toLowerCase();
    const validKeys = ['z', 's', 'q', 'd', 'a', 'e', 'r', 'f', 'shift'];

    if (validKeys.includes(key)) {
      event.preventDefault();
      callback('KEY_UP', { key });
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
};

// Service continuous update
const continuousUpdateService = (context) => (callback) => {
  let animationId;

  const update = () => {
    callback('UPDATE_ZONE');
    animationId = requestAnimationFrame(update);
  };

  animationId = requestAnimationFrame(update);

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 84 (compact)
- **useState** : 2 (zoneParams, isEnabled)
- **useRef** : 1 (keyState tracking)
- **useCallback** : 3 (keyDown, keyUp, updateZone)
- **useEffect** : 1 (keyboard listeners)
- **Keys tracked** : 9 (ZQSD + AE + RF + shift)
- **V3_CONFIG dependencies** : revelation + controls config
- **API exports** : 4 functions

---

## ✅ **CONCLUSION**

**useTriggerControls = Hook keyboard navigation compact pour zone trigger 3D**

### **Points forts**
- **Keyboard handling robust** : Multi-key + preventDefault + cleanup
- **3D navigation intuitive** : ZQSD + vertical + size controls
- **Performance optimized** : hasChanged check + ref-based state
- **Configuration externe** : V3_CONFIG driven
- **Enable/disable system** : Global toggle clean

### **Points faibles**
- **Manual update required** : Pas de auto-update sur key change
- **Key mapping hardcodé** : Pas de customization
- **No key repeat** : Depends external RAF loop
- **Single zone** : Pas de multi-zones support

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Pattern** : Machine parallèle + services keyboard + update
- **Benefits** : Auto-update + key customization + multi-zones
- **Services** : Keyboard listener + continuous updater découplés

**Recommandation** : **CONSTRUIRE vers machine XState** avec services keyboard + **auto-update continuous** + **key mapping configurable**

---

**FIN SESSION 20 - useTriggerControls.js**
**Durée analyse** : ~25 minutes
**Prochaine session** : useCameraFitter.js