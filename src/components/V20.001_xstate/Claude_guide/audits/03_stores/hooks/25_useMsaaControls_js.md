# 📋 RAPPORT AUDIT : useMsaaControls.js

**Date** : 25/09/2025 - SESSION 25
**Fichier** : `stores/hooks/useMsaaControls.js`
**Taille** : 93 lignes
**Type** : Hook Zustand MSAA Compact (Anti-Aliasing Controls)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- useSceneStore from '../sceneStore.js'
```

### **Imports internes**
```javascript
(Aucun - Hook autonome)
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **MSAA controls** : Multi-Sample Anti-Aliasing + FXAA settings
- **Performance monitoring** : Real-time FPS + render time + GPU load tracking
- **Quality presets** : Adaptive sampling + quality level management
- **Stats analysis** : Performance status + color coding + thresholds
- **FXAA specialized** : Fast Approximate Anti-Aliasing controls

---

## 🏗️ **ARCHITECTURE 3 HOOKS MSAA**

### **1. useMsaaControls - Hook Master**
```javascript
export const useMsaaControls = () => {
  // États individuels
  const msaa = useSceneStore((state) => state.msaa);
  const enabled = useSceneStore((state) => state.msaa.enabled);
  const samples = useSceneStore((state) => state.msaa.samples);
  const fxaa = useSceneStore((state) => state.msaa.fxaa);
  const adaptiveSampling = useSceneStore((state) => state.msaa.adaptiveSampling);
  const currentQuality = useSceneStore((state) => state.msaa.currentQuality);
  const stats = useSceneStore((state) => state.msaa.stats);

  // Actions du store (stables)
  const actions = useSceneStore.getState();

  return {
    // États
    msaa, enabled, samples, fxaa, adaptiveSampling, currentQuality, stats,

    // Actions principales
    setMsaaEnabled: actions.setMsaaEnabled,
    setMsaaSamples: actions.setMsaaSamples,
    setFxaaEnabled: actions.setFxaaEnabled,
    setFxaaProperty: actions.setFxaaProperty,
    setAdaptiveSampling: actions.setAdaptiveSampling,
    setQualityPreset: actions.setQualityPreset,
    updateMsaaStats: actions.updateMsaaStats,
    resetMsaa: actions.resetMsaa
  };
};
```

**Pattern** : Individual selectors + getState() actions pour performance

---

## 🔧 **HOOK FXAA SPÉCIALISÉ**

### **2. useFxaaControls - FXAA Only**
```javascript
export const useFxaaControls = () => {
  const fxaa = useSceneStore((state) => state.msaa.fxaa);
  const actions = useSceneStore.getState();

  return {
    fxaa,
    setEnabled: actions.setFxaaEnabled,
    setProperty: actions.setFxaaProperty,

    // Helpers
    isEnabled: fxaa.enabled,
    threshold: fxaa.threshold,
    iterations: fxaa.iterations
  };
};
```

**Spécialization** : Seulement FXAA controls + helper properties

---

## 📊 **HOOK STATISTICS AVANCÉES**

### **3. useMsaaStats - Performance Analysis**
```javascript
export const useMsaaStats = () => {
  const stats = useSceneStore((state) => state.msaa.stats);
  const updateStats = useSceneStore.getState().updateMsaaStats;

  return {
    stats,
    updateStats,

    // Helpers
    currentFPS: stats.currentFPS,
    renderTime: stats.renderTime,
    gpuLoad: stats.gpuLoad,

    // Performance status
    getPerformanceStatus: () => {
      if (stats.currentFPS >= 58) return 'excellent';
      if (stats.currentFPS >= 45) return 'good';
      if (stats.currentFPS >= 30) return 'average';
      return 'poor';
    },

    getPerformanceColor: () => {
      const status = stats.currentFPS >= 58 ? 'excellent' :
                    stats.currentFPS >= 45 ? 'good' :
                    stats.currentFPS >= 30 ? 'average' : 'poor';

      const colors = {
        excellent: '#00ff88',
        good: '#88ff00',
        average: '#ffaa00',
        poor: '#ff4444'
      };

      return colors[status];
    }
  };
};
```

**Intelligence** : FPS thresholds analysis + color coding automatic + performance status

---

## 🎨 **SYSTÈME PERFORMANCE ANALYSIS**

### **FPS Thresholds Classification**
```javascript
// Performance levels basés sur FPS
>= 58 FPS → 'excellent' → '#00ff88' (vert)
>= 45 FPS → 'good'      → '#88ff00' (vert clair)
>= 30 FPS → 'average'   → '#ffaa00' (orange)
<  30 FPS → 'poor'      → '#ff4444' (rouge)
```

### **Stats Tracking Properties**
```javascript
// Dans msaa.stats
{
  currentFPS: number,    // Real-time FPS
  renderTime: number,    // Frame render time (ms)
  gpuLoad: number        // GPU utilization %
}
```

**Monitoring** : Real-time performance avec color-coded feedback

---

## 🔧 **MSAA CONFIGURATION FEATURES**

### **Expected MSAA State Structure**
```javascript
msaa: {
  enabled: boolean,              // MSAA master switch
  samples: number,              // 1x, 2x, 4x, 8x, 16x samples
  fxaa: {
    enabled: boolean,           // FXAA fallback
    threshold: number,          // Edge detection threshold
    iterations: number          // Quality iterations
  },
  adaptiveSampling: boolean,    // Performance adaptive
  currentQuality: string,       // 'low', 'medium', 'high', 'ultra'
  stats: {
    currentFPS: number,
    renderTime: number,
    gpuLoad: number
  }
}
```

**Configuration** : Complete MSAA + FXAA avec adaptive quality

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Hooks Spécialisés Clean**
- **Master hook** : useMsaaControls pour contrôles complets
- **FXAA specialized** : useFxaaControls pour FXAA seulement
- **Stats focused** : useMsaaStats pour monitoring performance
- **Individual selectors** : Évite re-renders unnecessaires

### **2. Performance Intelligence**
- **Real-time monitoring** : FPS + render time + GPU load
- **Automatic classification** : 4 levels performance avec thresholds
- **Color coding** : Immediate visual feedback avec colors
- **Helper functions** : getPerformanceStatus() + getPerformanceColor()

### **3. Action Stability**
- **getState() pattern** : Actions stables pas re-créées
- **Helper properties** : Direct access isEnabled, threshold, iterations
- **Update functions** : updateMsaaStats pour real-time refresh
- **Reset capability** : resetMsaa pour testing scenarios

### **4. Code Compactness**
- **93 lignes seulement** : Hook compact mais feature-complete
- **3 hooks focused** : Each hook has clear responsibility
- **No unnecessary complexity** : Simple et direct
- **Clear naming** : useMsaaControls, useFxaaControls, useMsaaStats

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Hardcoded Thresholds**
```javascript
// FPS thresholds fixes
if (stats.currentFPS >= 58) return 'excellent';
if (stats.currentFPS >= 45) return 'good';
if (stats.currentFPS >= 30) return 'average';
// Pas configurables selon hardware ou use case
```

### **2. Color Values Hardcoded**
```javascript
// Colors hardcodés
const colors = {
  excellent: '#00ff88',
  good: '#88ff00',
  average: '#ffaa00',
  poor: '#ff4444'
};
// Pas themeable ou configurables
```

### **3. Stats Structure Assumptions**
```javascript
// Assume stats structure
currentFPS: stats.currentFPS,
renderTime: stats.renderTime,
gpuLoad: stats.gpuLoad,
// Pas de validation si properties existent
```

### **4. No GPU Detection Logic**
```javascript
// Pas de détection hardware capabilities
// Pas de recommendations automatiques samples
// Pas d'adaptation selon GPU performance
```

---

## 🎯 **USAGE PATTERNS**

### **Component Integration Examples**
```javascript
// Master MSAA control panel
const MSAAControlPanel = () => {
  const {
    enabled, samples, adaptiveSampling, currentQuality,
    setMsaaEnabled, setMsaaSamples, setAdaptiveSampling, setQualityPreset
  } = useMsaaControls();

  return (
    <div>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setMsaaEnabled(e.target.checked)}
      />
      <select
        value={samples}
        onChange={(e) => setMsaaSamples(parseInt(e.target.value))}
      >
        <option value={1}>No MSAA</option>
        <option value={2}>2x MSAA</option>
        <option value={4}>4x MSAA</option>
        <option value={8}>8x MSAA</option>
        <option value={16}>16x MSAA</option>
      </select>
      <input
        type="checkbox"
        checked={adaptiveSampling}
        onChange={(e) => setAdaptiveSampling(e.target.checked)}
      />
      <select
        value={currentQuality}
        onChange={(e) => setQualityPreset(e.target.value)}
      >
        <option value="low">Low Quality</option>
        <option value="medium">Medium Quality</option>
        <option value="high">High Quality</option>
        <option value="ultra">Ultra Quality</option>
      </select>
    </div>
  );
};

// FXAA-specific component
const FXAAControls = () => {
  const {
    fxaa, isEnabled, threshold, iterations,
    setEnabled, setProperty
  } = useFxaaControls();

  return (
    <div>
      <input
        type="checkbox"
        checked={isEnabled}
        onChange={(e) => setEnabled(e.target.checked)}
      />
      <input
        type="range"
        min="0.1"
        max="0.5"
        step="0.01"
        value={threshold}
        onChange={(e) => setProperty('threshold', parseFloat(e.target.value))}
      />
      <input
        type="range"
        min="1"
        max="12"
        value={iterations}
        onChange={(e) => setProperty('iterations', parseInt(e.target.value))}
      />
    </div>
  );
};

// Performance monitoring component
const PerformanceStats = () => {
  const {
    currentFPS, renderTime, gpuLoad,
    getPerformanceStatus, getPerformanceColor,
    updateStats
  } = useMsaaStats();

  const status = getPerformanceStatus();
  const color = getPerformanceColor();

  useEffect(() => {
    const interval = setInterval(() => {
      updateStats();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [updateStats]);

  return (
    <div>
      <div style={{ color }}>
        <p>FPS: {currentFPS} ({status})</p>
      </div>
      <p>Render Time: {renderTime.toFixed(2)}ms</p>
      <p>GPU Load: {gpuLoad}%</p>
      <div
        style={{
          width: '100px',
          height: '10px',
          backgroundColor: color,
          opacity: currentFPS / 60
        }}
      />
    </div>
  );
};
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **MSAA XState Machine**
```javascript
const msaaMachine = createMachine({
  id: 'msaa',
  initial: 'disabled',
  context: {
    config: {
      enabled: false,
      samples: 1,
      adaptiveSampling: false,
      currentQuality: 'medium'
    },
    fxaa: {
      enabled: false,
      threshold: 0.25,
      iterations: 4
    },
    stats: {
      currentFPS: 60,
      renderTime: 16.67,
      gpuLoad: 0
    },
    performance: {
      thresholds: {
        excellent: 58,
        good: 45,
        average: 30
      },
      colors: {
        excellent: '#00ff88',
        good: '#88ff00',
        average: '#ffaa00',
        poor: '#ff4444'
      }
    }
  },
  states: {
    disabled: {
      on: {
        ENABLE_MSAA: 'enabled'
      }
    },
    enabled: {
      type: 'parallel',
      states: {
        sampling: {
          initial: 'fixed',
          states: {
            fixed: {
              on: {
                ENABLE_ADAPTIVE: 'adaptive'
              }
            },
            adaptive: {
              invoke: {
                src: 'adaptiveSamplingService'
              },
              on: {
                DISABLE_ADAPTIVE: 'fixed',
                ADJUST_SAMPLES: {
                  actions: 'adjustSamplesBasedOnPerformance'
                }
              }
            }
          }
        },
        fxaa: {
          initial: 'disabled',
          states: {
            disabled: {
              on: {
                ENABLE_FXAA: 'enabled'
              }
            },
            enabled: {
              on: {
                DISABLE_FXAA: 'disabled',
                SET_FXAA_PROPERTY: {
                  actions: 'setFxaaProperty'
                }
              }
            }
          }
        },
        monitoring: {
          invoke: {
            src: 'performanceMonitoringService'
          },
          on: {
            UPDATE_STATS: {
              actions: 'updatePerformanceStats'
            }
          }
        }
      },
      on: {
        DISABLE_MSAA: 'disabled',
        SET_SAMPLES: {
          actions: 'setSampleCount'
        },
        SET_QUALITY_PRESET: {
          actions: 'applyQualityPreset'
        }
      }
    }
  },
  actions: {
    setSampleCount: assign({
      config: (context, event) => ({
        ...context.config,
        samples: event.samples
      })
    }),
    adjustSamplesBasedOnPerformance: assign({
      config: (context) => {
        const { currentFPS } = context.stats;
        let newSamples = context.config.samples;

        if (currentFPS < context.performance.thresholds.average && newSamples > 1) {
          newSamples = Math.max(1, newSamples / 2);
        } else if (currentFPS > context.performance.thresholds.good && newSamples < 8) {
          newSamples = Math.min(8, newSamples * 2);
        }

        return {
          ...context.config,
          samples: newSamples
        };
      }
    }),
    updatePerformanceStats: assign({
      stats: (context, event) => ({
        ...context.stats,
        ...event.stats
      })
    }),
    applyQualityPreset: assign({
      config: (context, event) => {
        const presets = {
          low: { samples: 1, adaptiveSampling: false },
          medium: { samples: 2, adaptiveSampling: true },
          high: { samples: 4, adaptiveSampling: true },
          ultra: { samples: 8, adaptiveSampling: false }
        };

        const preset = presets[event.quality] || presets.medium;

        return {
          ...context.config,
          ...preset,
          currentQuality: event.quality
        };
      }
    })
  }
});
```

### **XState Hooks Equivalents**
```javascript
// Hook master avec machine
export const useMsaaControls = () => {
  const [state, send] = useActor(msaaMachine);

  return useMemo(() => ({
    // Config state
    enabled: state.matches('enabled'),
    samples: state.context.config.samples,
    adaptiveSampling: state.context.config.adaptiveSampling,
    currentQuality: state.context.config.currentQuality,

    // FXAA state
    fxaa: state.context.fxaa,

    // Stats
    stats: state.context.stats,

    // Actions
    setMsaaEnabled: (enabled) => send({ type: enabled ? 'ENABLE_MSAA' : 'DISABLE_MSAA' }),
    setMsaaSamples: (samples) => send({ type: 'SET_SAMPLES', samples }),
    setAdaptiveSampling: (enabled) => send({ type: enabled ? 'ENABLE_ADAPTIVE' : 'DISABLE_ADAPTIVE' }),
    setQualityPreset: (quality) => send({ type: 'SET_QUALITY_PRESET', quality })
  }), [state, send]);
};

// Hook stats avec computed values
export const useMsaaStats = () => {
  const [state, send] = useActor(msaaMachine);

  return useMemo(() => {
    const { stats, performance } = state.context;

    const getPerformanceStatus = () => {
      if (stats.currentFPS >= performance.thresholds.excellent) return 'excellent';
      if (stats.currentFPS >= performance.thresholds.good) return 'good';
      if (stats.currentFPS >= performance.thresholds.average) return 'average';
      return 'poor';
    };

    const status = getPerformanceStatus();

    return {
      stats,
      currentFPS: stats.currentFPS,
      renderTime: stats.renderTime,
      gpuLoad: stats.gpuLoad,
      getPerformanceStatus,
      getPerformanceColor: () => performance.colors[status],
      updateStats: (newStats) => send({ type: 'UPDATE_STATS', stats: newStats })
    };
  }, [state, send]);
};

// Service adaptive sampling
const adaptiveSamplingService = (context) => (callback) => {
  const checkPerformance = () => {
    // Monitor performance and adjust
    if (context.stats.currentFPS < context.performance.thresholds.average) {
      callback('ADJUST_SAMPLES');
    }
  };

  const interval = setInterval(checkPerformance, 5000); // Check every 5 seconds

  return () => clearInterval(interval);
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 93 (compact)
- **Hooks exports** : 3 hooks spécialisés
- **Performance features** : Real-time FPS + render time + GPU load
- **Intelligence** : 4 performance levels + color coding + automatic classification
- **Specialization** : MSAA master + FXAA focused + stats monitoring
- **Configuration** : Samples + adaptive + quality presets + FXAA properties
- **Dependencies** : useSceneStore seulement

---

## ✅ **CONCLUSION**

**useMsaaControls.js = Hook MSAA compact 93 lignes avec performance intelligence + 3 hooks spécialisés**

### **Points forts**
- **Architecture clean** : 3 hooks spécialisés avec responsabilités claires
- **Performance intelligence** : Real-time monitoring + 4 levels classification + color coding
- **Specialization** : FXAA dedicated hook + stats monitoring focused
- **Compact size** : 93 lignes feature-complete avec helpers functions

### **Points faibles**
- **Hardcoded thresholds** : FPS levels fixes pas configurables
- **Color values fixed** : Pas themeable ou customizable
- **No GPU detection** : Pas de hardware capabilities detection
- **Stats assumptions** : Structure stats pas validée

### **Construction XState**
- **Complexité** : 🟢 SIMPLE
- **Pattern** : Machine parallèle + services adaptive + monitoring
- **Benefits** : Hardware adaptation + configurable thresholds + automatic quality adjustment
- **Services** : Adaptive sampling + performance monitoring + quality presets

**Recommandation** : **CONSTRUIRE vers machine XState** avec services adaptatifs + **configurable thresholds** + **hardware detection** + **automatic quality adjustment**

---

**FIN SESSION 25 - useMsaaControls.js**
**Durée analyse** : ~20 minutes
**Prochaine session** : useParticlesControls.js