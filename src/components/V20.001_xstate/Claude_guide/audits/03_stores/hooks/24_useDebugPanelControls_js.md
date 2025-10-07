# 📋 RAPPORT AUDIT : useDebugPanelControls.js

**Date** : 25/09/2025 - SESSION 24
**Fichier** : `stores/hooks/useDebugPanelControls.js`
**Taille** : 257 lignes
**Type** : Hook Zustand Debug Panel (Remplacement useState Multiple)

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
- **useState elimination** : Remplace 10+ useState du DebugPanel par Zustand
- **Tab-specific hooks** : Hooks optimisés par onglet (bloom, PBR, lighting, background)
- **Performance optimization** : Individual selectors + shallow equality
- **Action stability** : getState() pour références stables actions
- **Debug utilities** : Advanced debugging + monitoring hooks

---

## 🔄 **CONSTRUCTION PATTERN**

### **AVANT Phase 2 - Multiple useState**
```javascript
// Dans DebugPanel (10+ useState)
const [activeTab, setActiveTab] = useState('groups');
const [exposure, setExposureState] = useState(1.7);
const [globalThreshold, setGlobalThreshold] = useState(0.15);
const [pbrSettings, setPbrSettings] = useState({...});
// etc. 10+ useState...
```

### **APRÈS Phase 2 - 1 Hook Zustand**
```javascript
// Hook unique centralisé
const {
  activeTab, setActiveTab,
  exposure, setExposure,
  threshold, setBloomGlobal,
  pbrSettings, setPbrSettings
} = useDebugPanelControls();
```

**Résultat** : 10+ useState → 1 hook + état centralisé Zustand

---

## 🏗️ **HOOK PRINCIPAL - useDebugPanelControls**

### **Architecture Individual Selectors**
```javascript
export const useDebugPanelControls = () => {
  // ✅ Individual selectors pour éviter re-renders
  const activeTab = useSceneStore((state) => state.metadata.activeTab);
  const showDebug = useSceneStore((state) => state.metadata.showDebug);
  const isCollapsed = useSceneStore((state) => state.metadata.isCollapsed);
  const securityState = useSceneStore((state) => state.metadata.securityState);

  // Bloom state individual
  const bloom = useSceneStore((state) => state.bloom);
  const threshold = useSceneStore((state) => state.bloom.threshold);
  const strength = useSceneStore((state) => state.bloom.strength);
  const radius = useSceneStore((state) => state.bloom.radius);
  const bloomEnabled = useSceneStore((state) => state.bloom.enabled);

  // ✅ Actions stables via getState()
  const actions = useSceneStore.getState();

  return {
    // UI State
    activeTab, showDebug, isCollapsed, securityState,

    // Bloom State
    bloom, threshold, strength, radius, bloomEnabled,

    // Stable Actions
    setActiveTab: actions.setActiveTab,
    setDebugVisibility: actions.setDebugVisibility,
    toggleDebugVisibility: actions.toggleDebugVisibility,
    toggleCollapsed: actions.toggleCollapsed,
    setBloomEnabled: actions.setBloomEnabled,
    setBloomGlobal: actions.setBloomGlobal,
    setBloomGroup: actions.setBloomGroup,
    resetBloom: actions.resetBloom,

    // Computed values
    version: useSceneStore.getState().metadata.version,
    constructionPhase: useSceneStore.getState().metadata.constructionPhase
  };
};
```

**Innovation** : Individual selectors + getState() actions pour performance

---

## 📑 **HOOKS TAB-SPECIFIC (4 hooks)**

### **1. useBloomTabControls - Bloom Optimisé**
```javascript
export const useBloomTabControls = () => useSceneStore((state) => ({
  bloom: state.bloom,
  setBloomEnabled: state.setBloomEnabled,
  setBloomGlobal: state.setBloomGlobal,
  setBloomGroup: state.setBloomGroup,
  resetBloom: state.resetBloom,

  // Valeurs directes pour performance
  threshold: state.bloom.threshold,
  strength: state.bloom.strength,
  radius: state.bloom.radius,
  enabled: state.bloom.enabled,

  // Groupes
  groups: state.bloom.groups
}), shallow);
```

**Performance** : Shallow equality + seulement données bloom

### **2. usePbrTabControls - PBR avec Anti-Loops**
```javascript
export const usePbrTabControls = () => {
  // ✅ FIXED INFINITE LOOPS - Individual selectors
  const pbr = useSceneStore((state) => state.pbr);
  const currentPreset = useSceneStore((state) => state.pbr.currentPreset);
  const ambientMultiplier = useSceneStore((state) => state.pbr.ambientMultiplier);
  const directionalMultiplier = useSceneStore((state) => state.pbr.directionalMultiplier);
  const hdrBoost = useSceneStore((state) => state.pbr.hdrBoost);
  const materialSettings = useSceneStore((state) => state.pbr.materialSettings);

  // ✅ Actions stables via getState()
  const actions = useSceneStore.getState();

  return {
    pbr, currentPreset, ambientMultiplier, directionalMultiplier, hdrBoost, materialSettings,

    // Stable action references
    setPbrPreset: actions.setPbrPreset,
    setPbrMultiplier: actions.setPbrMultiplier,
    setMaterialSetting: actions.setMaterialSetting,
    setHdrBoost: actions.setHdrBoost,
    toggleAdvancedLighting: actions.toggleAdvancedLighting, // ✅ NOUVEAU
    resetPbr: actions.resetPbr
  };
};
```

**Fix** : Individual selectors éliminent infinite loops

### **3. useLightingTabControls - Lighting Simplified**
```javascript
export const useLightingTabControls = () => {
  // Individual selectors
  const lighting = useSceneStore((state) => state.lighting);
  const exposure = useSceneStore((state) => state.lighting.exposure);
  // ❌ SUPPRIMÉ: ambient/directional (maintenant dans pbrSlice multipliers)
  const toneMapping = useSceneStore((state) => state.lighting.toneMapping);

  const actions = useSceneStore.getState();

  return {
    lighting, exposure, toneMapping,

    // Actions
    setExposure: actions.setExposure,
    // ❌ SUPPRIMÉ: setAmbientLight, setDirectionalLight (dans pbrSlice)
    setToneMapping: actions.setToneMapping,
    resetLighting: actions.resetLighting
  };
};
```

**Simplification** : Ambient/directional moved to PBR slice

### **4. useBackgroundTabControls - Background Complete**
```javascript
export const useBackgroundTabControls = () => {
  // Individual selectors
  const background = useSceneStore((state) => state.background);
  const backgroundType = useSceneStore((state) => state.background.type);
  const backgroundColor = useSceneStore((state) => state.background.color);
  const backgroundAlpha = useSceneStore((state) => state.background.alpha);
  const gradient = useSceneStore((state) => state.background.gradient);
  const environment = useSceneStore((state) => state.background.environment);

  const actions = useSceneStore.getState();

  return {
    background, backgroundType, backgroundColor, backgroundAlpha, gradient, environment,

    // Actions
    setBackgroundType: actions.setBackgroundType,
    setBackgroundColor: actions.setBackgroundColor,
    setBackgroundAlpha: actions.setBackgroundAlpha,
    setGradient: actions.setGradient,
    setGradientColors: actions.setGradientColors,
    setEnvironment: actions.setEnvironment,
    setEnvironmentIntensity: actions.setEnvironmentIntensity,
    resetBackground: actions.resetBackground,

    // Utilities
    generateCssBackground: actions.generateCssBackground,
    getEffectiveBackgroundColor: actions.getEffectiveBackgroundColor
  };
};
```

**Complete** : Background full support avec utilities

---

## 🎯 **HOOKS SPECIALIZED (3 hooks)**

### **5. useDebugPanelValues - Read-Only**
```javascript
export const useDebugPanelValues = () => useSceneStore((state) => ({
  bloom: state.bloom,
  pbr: state.pbr,
  lighting: state.lighting,
  background: state.background,
  currentPreset: state.metadata.currentPreset,
  securityState: state.metadata.securityState,
  performanceStats: state.metadata.performanceStats
}), shallow);
```

**Usage** : Components qui affichent sans modifier

### **6. useDebugPanelActions - Write-Only**
```javascript
export const useDebugPanelActions = () => useSceneStore((state) => ({
  // Bloom actions
  setBloomEnabled: state.setBloomEnabled,
  setBloomGlobal: state.setBloomGlobal,
  setBloomGroup: state.setBloomGroup,

  // PBR actions
  setPbrPreset: state.setPbrPreset,
  setPbrMultiplier: state.setPbrMultiplier,
  setHdrBoost: state.setHdrBoost,

  // Lighting actions
  setExposure: state.setExposure,
  // ❌ SUPPRIMÉ: setAmbientLight (maintenant dans pbrSlice)

  // UI actions
  setActiveTab: state.setActiveTab,
  setSecurityState: state.setSecurityState,

  // Global actions
  applyPreset: state.applyPreset,
  resetAll: state.resetAll
}), shallow);
```

**Usage** : Components qui modifient sans afficher

### **7. useDebugPanelDebug - Advanced Debug**
```javascript
export const useDebugPanelDebug = () => useSceneStore((state) => ({
  // Debug utilities
  exportState: state.exportState,
  importState: state.importState,
  createDebugSnapshot: state.createDebugSnapshot,
  generateDebugReport: state.generateDebugReport,

  // Session info
  sessionStats: state.getSessionStats?.() || {},
  timeSinceModified: state.getTimeSinceLastModified?.() || 0,
  isSessionActive: state.isSessionActive?.() || false,

  // Store info
  version: state.metadata.version,
  constructionPhase: state.metadata.constructionPhase,
  storeSize: JSON.stringify(state).length,

  // Performance
  performanceStats: state.metadata.performanceStats,
  updatePerformanceStats: state.updatePerformanceStats
}), shallow);
```

**Advanced** : Debug complet + session monitoring + performance stats

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Performance Excellence**
- **Individual selectors** : Évite re-renders quand autres domaines changent
- **getState() actions** : Références stables pas re-créées à chaque render
- **Shallow equality** : zustand/shallow sur hooks appropriés
- **Tab-specific optimization** : Hooks spécialisés par onglet

### **2. Anti-Patterns Solutions**
- **✅ FIXED: Infinite loops** - Individual selectors éliminent loops
- **✅ Action stability** - getState() pour références stables
- **✅ Selective subscriptions** - Components subscribe seulement nécessaire
- **✅ Read/Write separation** - Hooks spécialisés selon usage

### **3. Construction Success**
- **10+ useState eliminated** : État centralisé Zustand
- **Backward compatibility** : API similaire pour components
- **Gradual construction** : Hooks tab-specific pour construction progressive
- **Debug preservation** : Advanced debug tools maintenus

### **4. Developer Experience**
- **Hook variety** : 7 hooks pour différents use cases
- **Clear naming** : useBloomTabControls, useDebugPanelValues
- **Documentation** : Comments avant/après construction
- **Error handling** : Optional chaining ?.() pour safety

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Action References Pattern**
```javascript
// getState() appelé à chaque render
const actions = useSceneStore.getState();
// Pas optimal, pourrait être memoized
// Mais necessary pour stable references
```

### **2. Architecture Coupling**
```javascript
// Strong coupling avec structure store
state.metadata.activeTab
state.bloom.threshold
state.pbr.currentPreset
// Breaking changes si store refonteisé
```

### **3. Performance Calculation in Hook**
```javascript
// JSON.stringify dans useDebugPanelDebug
storeSize: JSON.stringify(state).length,
// Expensive calculation à chaque subscription
// Devrait être memoized ou computed elsewhere
```

### **4. Optional Chaining Defensive**
```javascript
// Beaucoup de ?.() suggesting incomplete methods
sessionStats: state.getSessionStats?.() || {},
timeSinceModified: state.getTimeSinceLastModified?.() || 0,
// Indicates missing implementations
```

---

## 🎯 **USAGE PATTERNS**

### **Component Integration Examples**
```javascript
// Main DebugPanel usage
const DebugPanel = () => {
  const {
    activeTab, setActiveTab,
    showDebug, toggleDebugVisibility,
    isCollapsed, toggleCollapsed,
    bloom, setBloomEnabled
  } = useDebugPanelControls();

  return (
    <div className={`debug-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <button onClick={toggleDebugVisibility}>
        {showDebug ? 'Hide' : 'Show'} Debug
      </button>

      <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'bloom' && <BloomControls bloom={bloom} setEnabled={setBloomEnabled} />}
    </div>
  );
};

// Tab-specific component
const BloomTab = () => {
  const {
    bloom, threshold, strength, radius, enabled,
    setBloomEnabled, setBloomGlobal, resetBloom
  } = useBloomTabControls();

  return (
    <div>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setBloomEnabled(e.target.checked)}
      />
      <input
        value={threshold}
        onChange={(e) => setBloomGlobal('threshold', parseFloat(e.target.value))}
      />
      <input
        value={strength}
        onChange={(e) => setBloomGlobal('strength', parseFloat(e.target.value))}
      />
      <button onClick={resetBloom}>Reset Bloom</button>
    </div>
  );
};

// Debug component
const DebugTools = () => {
  const {
    exportState, createDebugSnapshot,
    version, storeSize, sessionStats
  } = useDebugPanelDebug();

  return (
    <div>
      <p>Version: {version}</p>
      <p>Store Size: {storeSize} chars</p>
      <p>Session: {JSON.stringify(sessionStats)}</p>
      <button onClick={exportState}>Export State</button>
      <button onClick={createDebugSnapshot}>Debug Snapshot</button>
    </div>
  );
};

// Read-only display component
const StateDisplay = () => {
  const {
    bloom, pbr, lighting, currentPreset, performanceStats
  } = useDebugPanelValues();

  return (
    <div>
      <p>Preset: {currentPreset}</p>
      <p>Bloom: {bloom.enabled ? 'On' : 'Off'}</p>
      <p>PBR: {pbr.currentPreset}</p>
      <p>Exposure: {lighting.exposure}</p>
      <p>Performance: {JSON.stringify(performanceStats)}</p>
    </div>
  );
};
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **DebugPanel XState Machine**
```javascript
const debugPanelMachine = createMachine({
  id: 'debugPanel',
  type: 'parallel',
  context: {
    ui: {
      activeTab: 'groups',
      showDebug: true,
      isCollapsed: false,
      securityState: 'normal'
    },
    // Domain states managed by other machines
  },
  states: {
    ui: {
      initial: 'visible',
      states: {
        visible: {
          on: {
            TOGGLE_DEBUG: 'hidden',
            SET_ACTIVE_TAB: {
              actions: 'setActiveTab'
            },
            TOGGLE_COLLAPSED: {
              actions: 'toggleCollapsed'
            }
          }
        },
        hidden: {
          on: {
            TOGGLE_DEBUG: 'visible'
          }
        }
      }
    },
    tabs: {
      type: 'parallel',
      states: {
        bloomTab: {
          invoke: { src: bloomTabMachine }
        },
        pbrTab: {
          invoke: { src: pbrTabMachine }
        },
        lightingTab: {
          invoke: { src: lightingTabMachine }
        },
        backgroundTab: {
          invoke: { src: backgroundTabMachine }
        }
      }
    },
    debug: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            EXPORT_STATE: 'exporting',
            CREATE_SNAPSHOT: 'snapshotting',
            UPDATE_STATS: {
              actions: 'updatePerformanceStats'
            }
          }
        },
        exporting: {
          invoke: {
            src: 'exportStateService',
            onDone: 'idle'
          }
        },
        snapshotting: {
          invoke: {
            src: 'createSnapshotService',
            onDone: 'idle'
          }
        }
      }
    }
  },
  actions: {
    setActiveTab: assign({
      ui: (context, event) => ({
        ...context.ui,
        activeTab: event.tab
      })
    }),
    toggleCollapsed: assign({
      ui: (context) => ({
        ...context.ui,
        isCollapsed: !context.ui.isCollapsed
      })
    })
  }
});
```

### **XState Hooks Equivalents**
```javascript
// Hook principal avec machine parallèle
export const useDebugPanelControls = () => {
  const [state, send] = useActor(debugPanelMachine);

  return useMemo(() => ({
    // UI State
    activeTab: state.context.ui.activeTab,
    showDebug: state.matches('ui.visible'),
    isCollapsed: state.context.ui.isCollapsed,

    // Actions
    setActiveTab: (tab) => send({ type: 'SET_ACTIVE_TAB', tab }),
    toggleDebugVisibility: () => send({ type: 'TOGGLE_DEBUG' }),
    toggleCollapsed: () => send({ type: 'TOGGLE_COLLAPSED' }),

    // Tab states from parallel machines
    bloomTab: useSelector(state, (state) => state.children.tabs.children.bloomTab),
    pbrTab: useSelector(state, (state) => state.children.tabs.children.pbrTab)
  }), [state, send]);
};

// Tab-specific hooks avec machines dédiées
export const useBloomTabControls = () => {
  const [state, send] = useActor(bloomTabMachine);
  return useBloomMachineHook(state, send);
};

// Debug hook avec services
export const useDebugPanelDebug = () => {
  const [state, send] = useActor(debugPanelMachine);

  return useMemo(() => ({
    exportState: () => send({ type: 'EXPORT_STATE' }),
    createSnapshot: () => send({ type: 'CREATE_SNAPSHOT' }),
    updateStats: () => send({ type: 'UPDATE_STATS' }),

    // Computed values avec selectors
    version: useSelector(state, (state) => state.context.metadata.version),
    storeSize: useSelector(state, (state) => JSON.stringify(state.context).length),
    isExporting: state.matches('debug.exporting')
  }), [state, send]);
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 257 (hook substantial)
- **Hooks exports** : 7 hooks spécialisés
- **useState eliminated** : 10+ useState → 1 hook centralisé
- **Performance optimizations** : Individual selectors + getState() actions + shallow equality
- **Tab-specific hooks** : 4 hooks par onglet debug
- **Construction success** : Complete useState → Zustand conversion
- **Dependencies** : useSceneStore + zustand/shallow

---

## ✅ **CONCLUSION**

**useDebugPanelControls.js = Construction useState → Zustand réussie avec 7 hooks spécialisés + performance fixes**

### **Points forts**
- **Construction complete** : 10+ useState → hooks Zustand centralisés
- **Performance excellence** : Individual selectors + stable action references + shallow equality
- **Anti-patterns fixed** : Infinite loops eliminated + action stability + selective subscriptions
- **Hook variety** : 7 hooks pour différents use cases (main, tabs, read-only, actions, debug)

### **Points faibles**
- **getState() pattern** : Actions re-fetched à chaque render (necessary pour stability)
- **Store coupling** : Strong coupling avec structure store
- **Performance calculations** : JSON.stringify expensive dans hook
- **Optional chaining** : Defensive coding suggests incomplete implementations

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Pattern** : Machine parallèle + tab machines + services
- **Benefits** : Type safety + proper memoization + service isolation + error recovery
- **Architecture** : Multi-machine coordination + selector optimization

**Recommandation** : **CONSTRUIRE vers machines XState parallèles** avec tab machines + **service isolation** + **proper memoization** + **type safety**

---

**FIN SESSION 24 - useDebugPanelControls.js**
**Durée analyse** : ~30 minutes
**Prochaine session** : useMsaaControls.js