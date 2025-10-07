# 📋 RAPPORT AUDIT : sceneStore.js

**Date** : 25/09/2025 - SESSION 22 (PHASE 3 START)
**Fichier** : `stores/sceneStore.js`
**Taille** : 296 lignes
**Type** : Store Zustand Master (8 Slices + Middleware + Actions Globales)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { create } from 'zustand'
- { devtools, persist } from 'zustand/middleware'
```

### **Imports internes**
```javascript
// 8 Slices spécialisés
- { createBloomSlice } from './slices/bloomSlice.js'
- { createPbrSlice } from './slices/pbrSlice.js'
- { createLightingSlice } from './slices/lightingSlice.js'
- { createBackgroundSlice } from './slices/backgroundSlice.js'
- { createMetadataSlice } from './slices/metadataSlice.js'
- { createParticlesSlice } from './slices/particlesSlice.js'
- { createSecuritySlice } from './slices/securitySlice.js'
- { createMsaaSlice } from './slices/msaaSlice.js'

// Middleware custom
- { logger, useDebugLogger } from './middleware/logger.js'
```

---

## 🎯 **OBJECTIF STORE**

### **Fonctions principales**
- **Store master Zustand** : Orchestration 8 slices spécialisés
- **Middleware stack** : DevTools + Persist + Logger custom
- **Actions globales** : Preset application + Reset + Import/Export
- **Development tools** : Debug snapshots + performance stats
- **Global exposition** : Window references pour legacy V6 systems

---

## 🏗️ **ARCHITECTURE MIDDLEWARE**

### **Middleware Stack (3 layers)**
```javascript
const useSceneStore = create()(
  devtools(              // Layer 3: Redux DevTools integration
    persist(             // Layer 2: LocalStorage persistence
      logger(            // Layer 1: Custom logging middleware
        (set, get, api) => ({ /* Store logic */ })
      )
    )
  )
);
```

**Stack Order** : Logger → Persist → DevTools → Store Core

---

## 🎛️ **SLICES COMPOSITION**

### **8 Slices Spécialisés**
```javascript
// === TOUS LES SLICES PHASE 2+ ===
...createBloomSlice(set, get, api),      // Bloom effects + groups
...createPbrSlice(set, get, api),        // PBR materials + HDR
...createLightingSlice(set, get, api),   // Lighting + exposure
...createBackgroundSlice(set, get, api), // Background types + gradient
...createMetadataSlice(set, get, api),   // Version + performance + UI state
...createParticlesSlice(set, get, api),  // Particles + arcs
...createSecuritySlice(set, get, api),   // Security state + transitions
...createMsaaSlice(set, get, api),       // Anti-aliasing settings
```

**Pattern** : Slice composition avec factory functions (set, get, api) injection

---

## 🌐 **ACTIONS GLOBALES**

### **applyPreset - Preset System Master**
```javascript
applyPreset: (presetName, presetData) => {
  console.log(`🎯 Applying complete preset: ${presetName}`);

  set((state) => {
    const newState = { ...state };

    // Appliquer bloom si présent
    if (presetData.bloom) {
      newState.bloom = { ...state.bloom, ...presetData.bloom };
    }

    // Appliquer bloomGroups si présent
    if (presetData.bloomGroups) {
      newState.bloom = {
        ...newState.bloom,
        groups: { ...newState.bloom.groups, ...presetData.bloomGroups }
      };
    }

    // Appliquer PBR + lighting + background...
    // [Complex preset application logic]

    // Update metadata
    newState.metadata = {
      ...state.metadata,
      currentPreset: presetName,
      lastPresetApplied: presetName,
      lastModified: Date.now(),
      isPresetModified: false
    };

    return newState;
  }, false, `applyPreset:${presetName}`);
}
```

**Intelligence** : Cross-slice preset application avec metadata tracking

### **resetAll - Global Reset**
```javascript
resetAll: () => {
  console.log('🔄 Resetting all store slices...');

  const actions = get();
  actions.resetBloom();
  actions.resetPbr();
  actions.resetLighting();
  actions.resetBackground();

  set((state) => ({
    ...state,
    metadata: {
      ...state.metadata,
      currentPreset: null,
      lastPresetApplied: null,
      isPresetModified: false,
      lastModified: Date.now()
    }
  }), false, 'resetAll');
}
```

**Pattern** : Delegate reset to individual slices + metadata cleanup

### **Import/Export System**
```javascript
exportState: () => {
  const state = get();
  return {
    version: state.metadata.version,
    constructionPhase: state.metadata.constructionPhase,
    bloom: state.bloom,
    pbr: state.pbr,
    lighting: state.lighting,
    background: state.background,
    metadata: { /* filtered metadata */ },
    exportedAt: new Date().toISOString()
  };
},

importState: (importedState) => {
  console.log('📥 Importing complete state...', importedState);

  set((state) => ({
    ...state,
    bloom: importedState.bloom || state.bloom,
    pbr: importedState.pbr || state.pbr,
    lighting: importedState.lighting || state.lighting,
    background: importedState.background || state.background,
    metadata: {
      ...state.metadata,
      currentPreset: importedState.metadata?.currentPreset || null,
      lastModified: Date.now(),
      imported: true
    }
  }), false, 'importState');
}
```

**Features** : Full state serialization + versioning + metadata preservation

---

## 💾 **SYSTÈME PERSISTENCE**

### **Persist Configuration**
```javascript
persist(
  /* store logic */,
  {
    name: 'v197-scene-storage-phase2',
    version: 2,
    partialize: (state) => ({
      // Ne persister que les données importantes, pas les métadonnées techniques
      bloom: state.bloom,
      pbr: state.pbr,
      lighting: state.lighting,
      background: state.background,
      metadata: {
        activeTab: state.metadata.activeTab,
        securityState: state.metadata.securityState,
        currentPreset: state.metadata.currentPreset,
        userPreferences: state.metadata.userPreferences
      }
    }),
    migrate: (persistedState, version) => {
      console.log(`🔄 Migrating store from version ${version} to 2`);
      return persistedState;
    }
  }
)
```

**Features** :
- **Partialize** : Only persist important data (exclude performance stats)
- **Versioning** : Construction system pour breaking changes
- **Named storage** : Separate localStorage key

---

## 🛠️ **DÉVELOPPEMENT TOOLS**

### **createDebugSnapshot - Debug Utility**
```javascript
createDebugSnapshot: () => {
  const state = get();
  const actions = get();

  return {
    timestamp: new Date().toISOString(),
    version: state.metadata.version,
    sessionStats: actions.getSessionStats(),
    performanceStats: state.metadata.performanceStats,
    storeSize: JSON.stringify(state).length,
    bloom: {
      enabled: state.bloom.enabled,
      threshold: state.bloom.threshold,
      strength: state.bloom.strength,
      groupsCount: Object.keys(state.bloom.groups).length
    },
    pbr: {
      currentPreset: state.pbr.currentPreset,
      hdrEnabled: state.pbr.hdrBoost.enabled
    },
    lighting: {
      exposure: state.lighting.exposure,
      ambientIntensity: state.lighting.ambient.intensity
    },
    ui: {
      activeTab: state.metadata.activeTab,
      currentPreset: state.metadata.currentPreset
    }
  };
}
```

**Usage** : Comprehensive debugging snapshot for issue tracking

---

## 🌐 **GLOBAL EXPOSITION**

### **Window References for Legacy**
```javascript
// === EXPOSITION GLOBALE POUR SYSTEMS ===
if (typeof window !== 'undefined') {
  window.useSceneStore = useSceneStore;
  window.debugSceneStore = useSceneStore;
}
```

**Legacy Support** : Global access pour V6 systems compatibility

### **Development Setup**
```javascript
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.log(
    '%c🚀 Zustand SceneStore Phase 1 Initialized',
    'color: #4CAF50; font-weight: bold; font-size: 14px;'
  );

  const initialState = useSceneStore.getState();
  console.log('📋 Initial state:', {
    version: initialState.metadata.version,
    bloomEnabled: initialState.bloom.enabled,
    bloomThreshold: initialState.bloom.threshold,
    groupsCount: Object.keys(initialState.bloom.groups).length
  });

  if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.warn('⚠️ Redux DevTools extension non détectée.');
  }
}
```

**Development UX** : Colored console logs + DevTools detection + initial state logging

---

## 🔧 **UTILITY FUNCTIONS**

### **forceResetRevealRings - Specific Fix**
```javascript
forceResetRevealRings: () => {
  console.log('🔧 Forcing reveal rings reset to initial state');
  set((state) => ({
    bloom: {
      ...state.bloom,
      groups: {
        ...state.bloom.groups,
        revealRings: {
          ...state.bloom.groups.revealRings,
          forceVisible: false // Force à false
        }
      }
    }
  }), false, 'forceResetRevealRings');
}
```

**Context** : Specific utility pour reset reveal rings state (debug purpose)

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Middleware Stack Sophistiqué**
- **DevTools integration** : Redux DevTools pour debugging
- **Persistence** : LocalStorage avec partialize + construction
- **Logger custom** : Actions tracking + performance metrics
- **Development mode** : Enhanced debugging in dev only

### **2. Slices Composition Clean**
- **Separation concerns** : 8 slices spécialisés bien séparés
- **Factory pattern** : createSlice(set, get, api) injection
- **No coupling** : Slices indépendants dans leurs domaines
- **Spread composition** : ...createSlice() pattern propre

### **3. Actions Globales Intelligentes**
- **Cross-slice operations** : applyPreset across multiple slices
- **Delegate pattern** : resetAll → individual slice resets
- **Metadata tracking** : lastModified, currentPreset, isPresetModified
- **Import/export** : Full state serialization avec versioning

### **4. Development Experience**
- **Debug snapshots** : createDebugSnapshot() comprehensive
- **Console styling** : Colored logs pour better UX
- **DevTools detection** : Warning si Redux DevTools manquant
- **Initial state logging** : Development feedback immediate

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Global Window Coupling**
```javascript
// Window globals encore présents
if (typeof window !== 'undefined') {
  window.useSceneStore = useSceneStore;
  window.debugSceneStore = useSceneStore;
}
// Legacy support mais coupling problématique
```

### **2. Actions Complexity**
```javascript
// applyPreset function très complex (67 lignes)
// Multiple nested conditions pour chaque slice
// Pas de validation preset schema
// Error handling minimal
```

### **3. Import State Sans Validation**
```javascript
importState: (importedState) => {
  // Pas de validation schema importedState
  // Merge direct sans type checking
  // Potential corruption si bad data
}
```

### **4. DevTools Environment Coupling**
```javascript
// DevTools seulement en development
enabled: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
// Pas de toggle runtime
// Hard coupling environment variables
```

---

## 🎯 **USAGE PATTERNS**

### **Intégration Components**
```javascript
// Dans components
import useSceneStore from '../stores/sceneStore.js';

const MyComponent = () => {
  // Access specific slice data
  const bloom = useSceneStore(state => state.bloom);
  const setBoomThreshold = useSceneStore(state => state.setBloomThreshold);

  // Global actions
  const applyPreset = useSceneStore(state => state.applyPreset);
  const resetAll = useSceneStore(state => state.resetAll);

  // Development utilities
  const createSnapshot = useSceneStore(state => state.createDebugSnapshot);

  return (
    <div>
      <button onClick={() => applyPreset('studio', studioPreset)}>Studio</button>
      <button onClick={() => resetAll()}>Reset All</button>
      <button onClick={() => console.log(createSnapshot())}>Debug Snapshot</button>
    </div>
  );
};
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **SceneStore Machine Architecture**
```javascript
const sceneStoreMachine = createMachine({
  id: 'sceneStore',
  type: 'parallel',
  context: {
    // Centralized context for all domains
    bloom: { /* bloom state */ },
    pbr: { /* pbr state */ },
    lighting: { /* lighting state */ },
    background: { /* background state */ },
    metadata: { /* metadata state */ },
    particles: { /* particles state */ },
    security: { /* security state */ },
    msaa: { /* msaa state */ }
  },
  states: {
    // Parallel machines pour chaque domain
    bloomMachine: {
      invoke: { src: 'bloomService' }
    },
    pbrMachine: {
      invoke: { src: 'pbrService' }
    },
    lightingMachine: {
      invoke: { src: 'lightingService' }
    },
    backgroundMachine: {
      invoke: { src: 'backgroundService' }
    },
    metadataMachine: {
      invoke: { src: 'metadataService' }
    },
    particlesMachine: {
      invoke: { src: 'particlesService' }
    },
    securityMachine: {
      invoke: { src: 'securityService' }
    },
    msaaMachine: {
      invoke: { src: 'msaaService' }
    },

    // Global operations
    globalOperations: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            APPLY_PRESET: 'applyingPreset',
            RESET_ALL: 'resettingAll',
            IMPORT_STATE: 'importingState',
            EXPORT_STATE: 'exportingState'
          }
        },
        applyingPreset: {
          invoke: {
            src: 'applyPresetService',
            onDone: 'idle',
            onError: 'error'
          }
        },
        resettingAll: {
          invoke: {
            src: 'resetAllService',
            onDone: 'idle'
          }
        },
        importingState: {
          invoke: {
            src: 'importStateService',
            onDone: 'idle',
            onError: 'error'
          }
        },
        exportingState: {
          invoke: {
            src: 'exportStateService',
            onDone: 'idle'
          }
        },
        error: {
          on: {
            RETRY: 'idle',
            RESET: 'resettingAll'
          }
        }
      }
    }
  },

  // Global actions cross-domain
  actions: {
    applyPresetToAll: (context, event) => {
      // Send events to all parallel machines
      const { presetName, presetData } = event;

      // Broadcast to relevant machines
      if (presetData.bloom) {
        send('APPLY_BLOOM_PRESET', { data: presetData.bloom }, { to: 'bloomMachine' });
      }
      if (presetData.pbr) {
        send('APPLY_PBR_PRESET', { data: presetData.pbr }, { to: 'pbrMachine' });
      }
      // ... autres domains
    },

    resetAllDomains: (context, event) => {
      // Send reset to all machines
      send('RESET', {}, { to: 'bloomMachine' });
      send('RESET', {}, { to: 'pbrMachine' });
      // ... autres resets
    }
  }
});
```

### **Services XState**
```javascript
// Service apply preset avec validation
const applyPresetService = (context, event) => {
  return new Promise((resolve, reject) => {
    try {
      const { presetName, presetData } = event;

      // 1. Validate preset schema
      if (!validatePresetSchema(presetData)) {
        reject(new Error(`Invalid preset schema: ${presetName}`));
        return;
      }

      // 2. Apply atomically
      const newContext = applyPresetToContext(context, presetData);

      // 3. Update metadata
      newContext.metadata = {
        ...newContext.metadata,
        currentPreset: presetName,
        lastPresetApplied: presetName,
        lastModified: Date.now(),
        isPresetModified: false
      };

      resolve(newContext);

    } catch (error) {
      reject(error);
    }
  });
};

// Service persistence avec validation
const persistenceService = (context) => (callback) => {
  // Auto-persist context changes
  const unsubscribe = subscribe(context, (newContext) => {
    try {
      const serialized = serializeForPersistence(newContext);
      localStorage.setItem('xstate-scene-store', JSON.stringify(serialized));
    } catch (error) {
      callback('PERSISTENCE_ERROR', { error });
    }
  });

  return () => unsubscribe();
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 296 (store master taille modérée)
- **Slices** : 8 slices composed
- **Middleware** : 3 layers (logger + persist + devtools)
- **Global actions** : 6 (applyPreset, resetAll, import/export, debug)
- **Dependencies** : 10 imports (8 slices + 2 middleware)
- **Window globals** : 2 (useSceneStore, debugSceneStore)
- **Environment checks** : 2 (window, NODE_ENV)
- **Console logs** : 5+ development feedback

---

## ✅ **CONCLUSION**

**sceneStore.js = Store Zustand master sophisticated avec middleware stack + slices composition**

### **Points forts**
- **Architecture slices** : 8 domaines bien séparés avec composition clean
- **Middleware stack** : DevTools + persistence + logging sophistiqués
- **Actions globales** : Cross-slice operations avec preset system
- **Development UX** : Debug snapshots + colored logs + DevTools integration
- **Import/export** : State serialization avec versioning

### **Points faibles**
- **Global window coupling** : Legacy support mais problématique
- **Actions complexity** : applyPreset 67 lignes complex
- **No validation** : Import state sans schema validation
- **Environment coupling** : DevTools hard-coded development only

### **Construction XState**
- **Complexité** : 🔴 ÉLEVÉE
- **Pattern** : Machine parallèle + services cross-domain
- **Benefits** : Schema validation + error recovery + testing + performance
- **Services** : Preset application + persistence + import/export + debugging

**Recommandation** : **CONSTRUIRE vers machine XState parallèle** avec services validation + **élimination window globals** + **error handling robuste**

---

**FIN SESSION 22 - sceneStore.js**
**Durée analyse** : ~35 minutes
**Prochaine session** : hooks/ (Zustand hooks)