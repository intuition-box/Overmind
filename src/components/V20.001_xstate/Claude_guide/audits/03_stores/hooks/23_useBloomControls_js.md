# 📋 RAPPORT AUDIT : useBloomControls.js

**Date** : 25/09/2025 - SESSION 23
**Fichier** : `stores/hooks/useBloomControls.js`
**Taille** : 236 lignes
**Type** : Hook Zustand Bloom Spécialisé (7 Hooks Bloom)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- useSceneStore from '../sceneStore.js'
- { shallow } from 'zustand/shallow'
```

### **Imports internes**
```javascript
(Aucun - Hook autonome)
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Accès bloom granulaire** : 7 hooks spécialisés pour différents use cases
- **Performance optimization** : Shallow equality + sélection précise
- **Validation robuste** : Parameterized hooks avec fallback safe
- **Debug utilities** : Development tools avec NODE_ENV guards
- **Statistical hooks** : Calculs live performance + groups analysis

---

## 🏗️ **ARCHITECTURE 7 HOOKS BLOOM**

### **1. useBloomControls - Hook Master**
```javascript
export const useBloomControls = () => {
  return useSceneStore((state) => ({
    // === ÉTAT BLOOM ===
    bloom: state.bloom,

    // === ACTIONS GLOBALES ===
    setBloomEnabled: state.setBloomEnabled,
    setBloomGlobal: state.setBloomGlobal,
    setBloomGlobalBatch: state.setBloomGlobalBatch,

    // === ACTIONS GROUPES ===
    setBloomGroup: state.setBloomGroup,
    setBloomGroupBatch: state.setBloomGroupBatch,
    resetBloomGroup: state.resetBloomGroup,

    // === ACTIONS AVANCÉES ===
    resetBloom: state.resetBloom,
    applyBloomPreset: state.applyBloomPreset,
    getBloomState: state.getBloomState,
    validateBloomValues: state.validateBloomValues
  }), shallow);
};
```

**Pattern** : Hook complet avec shallow equality pour éviter re-renders

---

## ⚡ **HOOKS PERFORMANCE OPTIMISÉS**

### **2. useBloomGlobalControls - Global Only**
```javascript
export const useBloomGlobalControls = () => {
  return useSceneStore((state) => ({
    enabled: state.bloom.enabled,
    threshold: state.bloom.threshold,
    strength: state.bloom.strength,
    radius: state.bloom.radius,

    setEnabled: state.setBloomEnabled,
    setThreshold: (value) => state.setBloomGlobal('threshold', value),
    setStrength: (value) => state.setBloomGlobal('strength', value),
    setRadius: (value) => state.setBloomGlobal('radius', value),

    setBatch: state.setBloomGlobalBatch
  }));
};
```

**Optimisation** : Seulement les contrôles globaux, ignore les groups

### **3. useBloomGroupControls - Parameterized avec Validation**
```javascript
export const useBloomGroupControls = (groupName) => {
  return useSceneStore((state) => {
    const group = state.bloom.groups[groupName];

    if (!group) {
      console.warn(`❌ Bloom group "${groupName}" not found`);
      return {
        threshold: 0,
        strength: 0,
        radius: 0,
        emissiveIntensity: 0,
        setThreshold: () => {},
        setStrength: () => {},
        setRadius: () => {},
        setEmissiveIntensity: () => {},
        setBatch: () => {},
        reset: () => {}
      };
    }

    return {
      threshold: group.threshold,
      strength: group.strength,
      radius: group.radius,
      emissiveIntensity: group.emissiveIntensity,

      setThreshold: (value) => state.setBloomGroup(groupName, 'threshold', value),
      setStrength: (value) => state.setBloomGroup(groupName, 'strength', value),
      setRadius: (value) => state.setBloomGroup(groupName, 'radius', value),
      setEmissiveIntensity: (value) => state.setBloomGroup(groupName, 'emissiveIntensity', value),

      setBatch: (updates) => state.setBloomGroupBatch(groupName, updates),
      reset: () => state.resetBloomGroup(groupName)
    };
  });
};
```

**Innovation** : Validation groupe + fallback safe functions + console warning

---

## 📊 **HOOK STATISTIQUES CALCULÉES**

### **4. useBloomStats - Live Calculations**
```javascript
export const useBloomStats = () => {
  return useSceneStore((state) => {
    const { bloom } = state;

    // Calculs statistiques
    const activeGroups = Object.entries(bloom.groups).filter(
      ([, group]) => group.strength > 0
    );

    const averageThreshold = activeGroups.length > 0
      ? activeGroups.reduce((sum, [, group]) => sum + group.threshold, 0) / activeGroups.length
      : 0;

    const totalIntensity = bloom.strength +
      activeGroups.reduce((sum, [, group]) => sum + (group.strength * group.emissiveIntensity || 0), 0);

    return {
      isEnabled: bloom.enabled,
      globalIntensity: bloom.strength * (1 - bloom.threshold),
      activeGroupsCount: activeGroups.length,
      totalGroupsCount: Object.keys(bloom.groups).length,
      averageThreshold: parseFloat(averageThreshold.toFixed(3)),
      totalIntensity: parseFloat(totalIntensity.toFixed(3)),
      isHighPerformanceMode: bloom.strength < 0.3 && bloom.threshold > 0.5,
      activeGroups: activeGroups.map(([name]) => name)
    };
  });
};
```

**Intelligence** : Statistiques live avec calculs performance + high-performance mode detection

---

## 🧪 **HOOK DEBUG DEVELOPMENT**

### **5. useBloomDebug - Development Tools**
```javascript
export const useBloomDebug = () => {
  const store = useSceneStore();

  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'development') {
    return {
      logBloomState: () => {},
      exportBloomState: () => {},
      validateAllBloom: () => true
    };
  }

  return {
    /**
     * Logger état bloom actuel
     */
    logBloomState: () => {
      const state = store.getState();
      console.group('🌟 Bloom State Debug');
      console.log('Global:', {
        enabled: state.bloom.enabled,
        threshold: state.bloom.threshold,
        strength: state.bloom.strength,
        radius: state.bloom.radius
      });
      console.log('Groups:', state.bloom.groups);
      console.groupEnd();
    },

    /**
     * Exporter état bloom pour copier/coller
     */
    exportBloomState: () => {
      const bloomState = store.getState().getBloomState();
      const json = JSON.stringify(bloomState, null, 2);
      navigator.clipboard?.writeText(json);
      console.log('📋 Bloom state exported to clipboard:', bloomState);
      return json;
    },

    /**
     * Valider tous les paramètres bloom
     */
    validateAllBloom: () => {
      const state = store.getState();
      const { validateBloomValues } = state;
      let isValid = true;

      // Validation global
      ['threshold', 'strength', 'radius'].forEach(param => {
        const validated = validateBloomValues(param, state.bloom[param]);
        if (validated !== state.bloom[param]) {
          console.warn(`❌ Invalid global ${param}: ${state.bloom[param]} → ${validated}`);
          isValid = false;
        }
      });

      // Validation groupes
      Object.entries(state.bloom.groups).forEach(([groupName, group]) => {
        Object.entries(group).forEach(([param, value]) => {
          const validated = validateBloomValues(param, value);
          if (validated !== value) {
            console.warn(`❌ Invalid ${groupName}.${param}: ${value} → ${validated}`);
            isValid = false;
          }
        });
      });

      if (isValid) {
        console.log('✅ All bloom values are valid');
      }

      return isValid;
    }
  };
};
```

**Development UX** : NODE_ENV guards + clipboard export + validation complète + colored console

---

## 🔄 **HOOKS READ/WRITE SEPARATION**

### **6. useBloomValues - Read Only**
```javascript
export const useBloomValues = () => useSceneStore((state) => ({
  bloom: state.bloom,
  threshold: state.bloom.threshold,
  strength: state.bloom.strength,
  radius: state.bloom.radius,
  enabled: state.bloom.enabled,
  groups: state.bloom.groups
}), shallow);
```

### **7. useBloomActions - Actions Only**
```javascript
export const useBloomActions = () => useSceneStore((state) => ({
  setBloomEnabled: state.setBloomEnabled,
  setBloomGlobal: state.setBloomGlobal,
  setBloomGroup: state.setBloomGroup,
  resetBloom: state.resetBloom,
  applyBloomPreset: state.applyBloomPreset
}), shallow);
```

**Pattern** : Separation claire read vs write pour performance optimization

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Granularité Excellence**
- **7 hooks spécialisés** : Master, global, groups, stats, debug, values, actions
- **Use case optimization** : Hook parfait pour chaque besoin
- **Parameter validation** : useBloomGroupControls avec fallback safe
- **Shallow equality** : Performance optimization avec zustand/shallow

### **2. Performance Intelligence**
- **Selective subscriptions** : Components subscribe seulement aux données nécessaires
- **Live calculations** : useBloomStats avec calculs temps réel
- **High-performance detection** : Automatic performance mode detection
- **Batch operations** : setBloomGlobalBatch pour updates multiples

### **3. Development Experience**
- **Debug tools** : NODE_ENV guards + console grouping + clipboard export
- **Validation comprehensive** : validateAllBloom avec warnings détaillées
- **Error handling** : Console warnings + fallback functions
- **Development safety** : Debug hooks disabled en production

### **4. Code Organization**
- **Single file** : 7 hooks bloom dans 1 fichier logique
- **Consistent patterns** : Naming + structure uniforme
- **JSDoc documentation** : Comments explicatives
- **Export organization** : 7 named exports clear

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. No TypeScript Safety**
```javascript
// useBloomGroupControls(groupName) sans validation TypeScript
// Runtime validation seulement avec console.warn
// Pas de type safety pour parameter values
```

### **2. Debug Hook Production Risk**
```javascript
// NODE_ENV check mais pas bulletproof
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'development')
// Potential console.log leaks si environment mal configuré
```

### **3. Clipboard API Assumption**
```javascript
// navigator.clipboard?.writeText(json);
// Pas de fallback si clipboard API pas disponible
// Silent failure sans user feedback
```

### **4. Store Coupling**
```javascript
// Direct coupling avec useSceneStore structure
// Pas d'abstraction si store structure change
// Breaking changes si slice bloom refonteisé
```

---

## 🎯 **USAGE PATTERNS**

### **Component Integration Examples**
```javascript
// Master hook pour control panel
const BloomControlPanel = () => {
  const { bloom, setBloomEnabled, setBloomGlobal } = useBloomControls();

  return (
    <div>
      <input
        type="checkbox"
        checked={bloom.enabled}
        onChange={(e) => setBloomEnabled(e.target.checked)}
      />
      <input
        value={bloom.threshold}
        onChange={(e) => setBloomGlobal('threshold', parseFloat(e.target.value))}
      />
    </div>
  );
};

// Group-specific component
const BloomGroupControl = ({ groupName }) => {
  const {
    threshold, strength, setThreshold, setStrength, setBatch, reset
  } = useBloomGroupControls(groupName);

  return (
    <div>
      <h3>{groupName}</h3>
      <input value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
      <input value={strength} onChange={(e) => setStrength(parseFloat(e.target.value))} />
      <button onClick={() => setBatch({ threshold: 0.5, strength: 1.0 })}>Preset</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

// Statistics display
const BloomStats = () => {
  const {
    activeGroupsCount, totalIntensity, isHighPerformanceMode, activeGroups
  } = useBloomStats();

  return (
    <div>
      <p>Active Groups: {activeGroupsCount}</p>
      <p>Total Intensity: {totalIntensity}</p>
      <p>Performance Mode: {isHighPerformanceMode ? 'High' : 'Normal'}</p>
      <p>Active: {activeGroups.join(', ')}</p>
    </div>
  );
};

// Debug panel
const BloomDebugPanel = () => {
  const { logBloomState, exportBloomState, validateAllBloom } = useBloomDebug();

  return (
    <div>
      <button onClick={logBloomState}>Log State</button>
      <button onClick={exportBloomState}>Export State</button>
      <button onClick={validateAllBloom}>Validate All</button>
    </div>
  );
};
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **BloomControls XState Machine**
```javascript
const bloomControlsMachine = createMachine({
  id: 'bloomControls',
  initial: 'idle',
  context: {
    bloom: {
      enabled: true,
      threshold: 0.15,
      strength: 0.4,
      radius: 0.4,
      groups: {
        iris: { threshold: 0.1, strength: 0.8, emissiveIntensity: 1.0 },
        eyeRings: { threshold: 0.2, strength: 0.6, emissiveIntensity: 0.8 }
        // ... autres groups
      }
    },
    stats: {
      activeGroupsCount: 0,
      totalIntensity: 0,
      isHighPerformanceMode: false
    },
    validation: {
      isValid: true,
      errors: []
    }
  },
  states: {
    idle: {
      on: {
        SET_ENABLED: {
          actions: 'setBloomEnabled'
        },
        SET_GLOBAL: {
          actions: 'setBloomGlobal'
        },
        SET_GLOBAL_BATCH: {
          actions: 'setBloomGlobalBatch'
        },
        SET_GROUP: {
          actions: 'setBloomGroup'
        },
        SET_GROUP_BATCH: {
          actions: 'setBloomGroupBatch'
        },
        RESET_BLOOM: {
          actions: 'resetBloom'
        },
        RESET_GROUP: {
          actions: 'resetBloomGroup'
        },
        APPLY_PRESET: 'applyingPreset',
        VALIDATE_ALL: 'validating',
        EXPORT_STATE: 'exporting'
      },
      always: {
        actions: 'updateStats'
      }
    },
    applyingPreset: {
      invoke: {
        src: 'applyBloomPresetService',
        onDone: 'idle',
        onError: {
          target: 'idle',
          actions: 'setError'
        }
      }
    },
    validating: {
      invoke: {
        src: 'validateBloomService',
        onDone: {
          target: 'idle',
          actions: 'setValidation'
        }
      }
    },
    exporting: {
      invoke: {
        src: 'exportBloomService',
        onDone: 'idle'
      }
    }
  },
  actions: {
    setBloomEnabled: assign({
      bloom: (context, event) => ({
        ...context.bloom,
        enabled: event.enabled
      })
    }),
    setBloomGlobal: assign({
      bloom: (context, event) => ({
        ...context.bloom,
        [event.property]: event.value
      })
    }),
    setBloomGroup: assign({
      bloom: (context, event) => ({
        ...context.bloom,
        groups: {
          ...context.bloom.groups,
          [event.groupName]: {
            ...context.bloom.groups[event.groupName],
            [event.property]: event.value
          }
        }
      })
    }),
    updateStats: assign({
      stats: (context) => {
        const activeGroups = Object.entries(context.bloom.groups).filter(
          ([, group]) => group.strength > 0
        );

        const totalIntensity = context.bloom.strength +
          activeGroups.reduce((sum, [, group]) => sum + (group.strength * group.emissiveIntensity || 0), 0);

        return {
          activeGroupsCount: activeGroups.length,
          totalIntensity: parseFloat(totalIntensity.toFixed(3)),
          isHighPerformanceMode: context.bloom.strength < 0.3 && context.bloom.threshold > 0.5
        };
      }
    })
  }
});
```

### **XState Hooks Equivalents**
```javascript
// Hook master avec useActor
export const useBloomControls = () => {
  const [state, send] = useActor(bloomControlsMachine);

  return useMemo(() => ({
    bloom: state.context.bloom,
    stats: state.context.stats,
    setBloomEnabled: (enabled) => send({ type: 'SET_ENABLED', enabled }),
    setBloomGlobal: (property, value) => send({ type: 'SET_GLOBAL', property, value }),
    setBloomGroup: (groupName, property, value) => send({ type: 'SET_GROUP', groupName, property, value }),
    resetBloom: () => send({ type: 'RESET_BLOOM' }),
    applyPreset: (preset) => send({ type: 'APPLY_PRESET', preset })
  }), [state, send]);
};

// Hook stats avec useSelector
export const useBloomStats = () => {
  const [state] = useActor(bloomControlsMachine);
  return useSelector(state, (state) => state.context.stats);
};

// Hook debug avec development guard
export const useBloomDebug = () => {
  const [state, send] = useActor(bloomControlsMachine);

  return useMemo(() => {
    if (process.env.NODE_ENV !== 'development') {
      return { logState: () => {}, exportState: () => {}, validateAll: () => {} };
    }

    return {
      logState: () => console.log('🌟 Bloom State:', state.context.bloom),
      exportState: () => send({ type: 'EXPORT_STATE' }),
      validateAll: () => send({ type: 'VALIDATE_ALL' })
    };
  }, [state, send]);
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 236 (hook substantial)
- **Hooks exports** : 7 hooks spécialisés
- **Performance features** : Shallow equality + selective subscriptions + batch operations
- **Debug features** : NODE_ENV guards + clipboard export + validation + console grouping
- **Validation** : Parameter validation + fallback safe + warnings
- **Statistical calculations** : 8 live stats calculés
- **Dependencies** : useSceneStore + zustand/shallow

---

## ✅ **CONCLUSION**

**useBloomControls.js = Hook Zustand bloom excellence avec 7 hooks spécialisés + performance + debug tools**

### **Points forts**
- **Architecture granulaire** : 7 hooks pour différents use cases optimaux
- **Performance excellence** : Shallow equality + selective subscriptions + live stats
- **Development tools** : Debug hooks avec NODE_ENV guards + comprehensive validation
- **Innovation patterns** : Read/write separation + parameterized validation + statistical hooks

### **Points faibles**
- **No TypeScript** : Runtime validation seulement sans type safety
- **Debug production risk** : NODE_ENV check pas bulletproof
- **Clipboard assumption** : Pas de fallback si API pas disponible
- **Store coupling** : Direct coupling structure useSceneStore

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Pattern** : Machine bloom + useActor hooks + useSelector optimization
- **Benefits** : Type safety + automatic memoization + state validation + error recovery
- **Services** : Preset application + validation + export découplés

**Recommandation** : **CONSTRUIRE vers machine XState bloom** avec useActor + useSelector + **type safety** + **error recovery** + **services découplés**

---

**FIN SESSION 23 - useBloomControls.js**
**Durée analyse** : ~25 minutes
**Prochaine session** : useDebugPanelControls.js