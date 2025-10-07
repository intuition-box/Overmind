# 📋 RAPPORT AUDIT : useParticlesControls.js

**Date** : 25/09/2025 - SESSION 26
**Fichier** : `stores/hooks/useParticlesControls.js`
**Taille** : 55 lignes
**Type** : Hook Zustand Particles Ultra-Compact (Particles + Arcs Controls)

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
- **Particles system** : Count + size + color + animation controls
- **Electric arcs** : Arc connections + properties + enable/disable
- **Individual selectors** : Performance optimized subscriptions
- **Minimal footprint** : 55 lignes ultra-compact feature-complete
- **Action stability** : getState() pattern pour références stables

---

## 🏗️ **ARCHITECTURE 2 HOOKS PARTICLES**

### **1. useParticlesControls - Hook Master**
```javascript
export const useParticlesControls = () => {
  // États individuels pour éviter re-renders
  const particles = useSceneStore((state) => state.particles);
  const enabled = useSceneStore((state) => state.particles.enabled);
  const count = useSceneStore((state) => state.particles.count);
  const size = useSceneStore((state) => state.particles.size);
  const color = useSceneStore((state) => state.particles.color);

  // Arcs
  const arcs = useSceneStore((state) => state.particles.arcs);
  const arcsEnabled = useSceneStore((state) => state.particles.arcs.enabled);

  // Animation
  const animation = useSceneStore((state) => state.particles.animation);

  // Actions du store (stables, pas de re-render)
  const actions = useSceneStore.getState();

  return {
    // États
    particles, enabled, count, size, color, arcs, arcsEnabled, animation,

    // Actions principales
    setParticlesEnabled: actions.setParticlesEnabled,
    setParticlesCount: actions.setParticlesCount,
    setParticlesColor: actions.setParticlesColor,
    setArcsEnabled: actions.setArcsEnabled,
    setArcsProperty: actions.setArcsProperty,
    setAnimationProperty: actions.setAnimationProperty,
    resetParticles: actions.resetParticles
  };
};
```

**Pattern** : Individual selectors + getState() actions standard

---

## ⚡ **HOOK ARCS SPÉCIALISÉ**

### **2. useArcsControls - Arcs Only**
```javascript
export const useArcsControls = () => {
  const arcs = useSceneStore((state) => state.particles.arcs);
  const actions = useSceneStore.getState();

  return {
    arcs,
    setEnabled: actions.setArcsEnabled,
    setProperty: actions.setArcsProperty
  };
};
```

**Minimalism** : 9 lignes seulement pour arcs controls spécialisés

---

## 🎨 **PARTICLES SYSTEM FEATURES**

### **Expected Particles State Structure**
```javascript
particles: {
  enabled: boolean,        // Master particles switch
  count: number,          // Particle count (100-10000)
  size: number,           // Particle size (0.1-5.0)
  color: string,          // Particle color hex

  arcs: {
    enabled: boolean,     // Electric arcs between particles
    intensity: number,    // Arc brightness
    connectionDistance: number,  // Max distance for connections
    color: string,        // Arc color
    flickerSpeed: number  // Animation speed
  },

  animation: {
    speed: number,        // Movement speed
    direction: string,    // Movement pattern
    turbulence: number    // Chaos factor
  }
}
```

**Features** : Complete particles + arcs + animation system

---

## 🔌 **ELECTRIC ARCS SYSTEM**

### **Arc Properties**
- **intensity** : Arc brightness/visibility
- **connectionDistance** : Range for particle connections
- **color** : Arc line color (different from particles)
- **flickerSpeed** : Animation speed for electric effect

### **Arcs Logic**
```javascript
// In Three.js render loop (conceptual)
if (arcs.enabled) {
  particles.forEach((particle, i) => {
    particles.slice(i + 1).forEach(otherParticle => {
      const distance = particle.position.distanceTo(otherParticle.position);
      if (distance <= arcs.connectionDistance) {
        drawArc(particle.position, otherParticle.position, {
          intensity: arcs.intensity,
          color: arcs.color,
          flicker: arcs.flickerSpeed
        });
      }
    });
  });
}
```

**Intelligence** : Distance-based connections avec electric effects

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Ultra-Compact Excellence**
- **55 lignes total** : Most compact hook yet feature-complete
- **2 hooks focused** : Master + specialized arcs
- **Individual selectors** : Performance optimized
- **Clean separation** : Particles vs arcs responsibilities clear

### **2. Performance Optimized**
- **Individual selectors** : particles.enabled, particles.count, etc.
- **Stable actions** : getState() pattern consistent
- **Selective subscriptions** : Components subscribe seulement needed data
- **No unnecessary nesting** : Direct property access

### **3. Feature Complete**
- **Particles full control** : Enabled + count + size + color + animation
- **Arcs system** : Electric connections with distance-based logic
- **Animation support** : Speed + direction + turbulence parameters
- **Reset capability** : resetParticles pour testing scenarios

### **4. Developer Friendly**
- **Clear naming** : useParticlesControls, useArcsControls
- **Logical grouping** : Related properties together
- **Action consistency** : setParticlesEnabled, setArcsEnabled pattern
- **Comments helpful** : "éviter re-renders", "stables" annotations

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. No Validation Logic**
```javascript
// Actions without validation
setParticlesCount: actions.setParticlesCount,
setParticlesColor: actions.setParticlesColor,
// No min/max count validation
// No color format validation
```

### **2. No Performance Monitoring**
```javascript
// Particles peuvent être performance-intensive
// Pas de monitoring impact GPU/FPS
// Pas de adaptive count based on performance
// Pas de warnings high particle counts
```

### **3. Limited Animation Controls**
```javascript
// Animation properties basic
const animation = useSceneStore((state) => state.particles.animation);
// Pas de animation presets
// Pas de animation curves/easing
// Pas de physics integration
```

### **4. Arcs Calculations Assumptions**
```javascript
// useArcsControls assume arcs calculations handled elsewhere
// Hook provides controls mais pas logic
// Distance calculations not in hook scope
```

---

## 🎯 **USAGE PATTERNS**

### **Component Integration Examples**
```javascript
// Master particles control panel
const ParticlesControlPanel = () => {
  const {
    enabled, count, size, color, arcsEnabled,
    setParticlesEnabled, setParticlesCount, setParticlesColor, setArcsEnabled
  } = useParticlesControls();

  return (
    <div>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setParticlesEnabled(e.target.checked)}
      />
      <input
        type="range"
        min="100"
        max="10000"
        value={count}
        onChange={(e) => setParticlesCount(parseInt(e.target.value))}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setParticlesColor(e.target.value)}
      />
      <input
        type="checkbox"
        checked={arcsEnabled}
        onChange={(e) => setArcsEnabled(e.target.checked)}
      />
    </div>
  );
};

// Arcs-specific component
const ArcsControls = () => {
  const { arcs, setEnabled, setProperty } = useArcsControls();

  return (
    <div>
      <input
        type="checkbox"
        checked={arcs.enabled}
        onChange={(e) => setEnabled(e.target.checked)}
      />
      <input
        type="range"
        min="0.1"
        max="2.0"
        step="0.1"
        value={arcs.intensity}
        onChange={(e) => setProperty('intensity', parseFloat(e.target.value))}
      />
      <input
        type="range"
        min="1"
        max="20"
        value={arcs.connectionDistance}
        onChange={(e) => setProperty('connectionDistance', parseFloat(e.target.value))}
      />
      <input
        type="color"
        value={arcs.color}
        onChange={(e) => setProperty('color', e.target.value)}
      />
      <input
        type="range"
        min="0.1"
        max="5.0"
        step="0.1"
        value={arcs.flickerSpeed}
        onChange={(e) => setProperty('flickerSpeed', parseFloat(e.target.value))}
      />
    </div>
  );
};

// Performance-aware particles display
const ParticlesWithPerformance = () => {
  const { enabled, count, setParticlesCount } = useParticlesControls();
  const [currentFPS, setCurrentFPS] = useState(60);

  useEffect(() => {
    // Monitor FPS and adjust particle count
    const monitorPerformance = () => {
      // Get FPS from performance monitoring
      const fps = getAverageFPS();
      setCurrentFPS(fps);

      // Auto-adjust particle count based on performance
      if (fps < 30 && count > 1000) {
        setParticlesCount(Math.max(100, count - 500));
        console.warn('Reducing particles due to low FPS');
      } else if (fps > 55 && count < 5000) {
        setParticlesCount(Math.min(10000, count + 200));
        console.log('Increasing particles - good performance');
      }
    };

    const interval = setInterval(monitorPerformance, 2000);
    return () => clearInterval(interval);
  }, [count, setParticlesCount]);

  return (
    <div>
      <p>Particles: {count} (FPS: {currentFPS})</p>
      <p style={{ color: currentFPS < 30 ? 'red' : 'green' }}>
        Performance: {currentFPS >= 55 ? 'Excellent' : currentFPS >= 30 ? 'Good' : 'Poor'}
      </p>
    </div>
  );
};
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **Particles XState Machine**
```javascript
const particlesMachine = createMachine({
  id: 'particles',
  initial: 'disabled',
  context: {
    particles: {
      enabled: false,
      count: 1000,
      size: 1.0,
      color: '#ffffff'
    },
    arcs: {
      enabled: false,
      intensity: 1.0,
      connectionDistance: 5.0,
      color: '#00ffff',
      flickerSpeed: 2.0
    },
    animation: {
      speed: 1.0,
      direction: 'random',
      turbulence: 0.5
    },
    performance: {
      monitoring: true,
      autoAdjust: false,
      fpsThreshold: 30,
      maxCount: 10000,
      minCount: 100
    }
  },
  states: {
    disabled: {
      on: {
        ENABLE_PARTICLES: 'enabled'
      }
    },
    enabled: {
      type: 'parallel',
      states: {
        particles: {
          initial: 'active',
          states: {
            active: {
              on: {
                SET_COUNT: {
                  actions: 'setParticleCount',
                  cond: 'isValidCount'
                },
                SET_COLOR: {
                  actions: 'setParticleColor',
                  cond: 'isValidColor'
                },
                SET_SIZE: {
                  actions: 'setParticleSize',
                  cond: 'isValidSize'
                }
              }
            }
          }
        },
        arcs: {
          initial: 'disabled',
          states: {
            disabled: {
              on: {
                ENABLE_ARCS: 'enabled'
              }
            },
            enabled: {
              on: {
                DISABLE_ARCS: 'disabled',
                SET_ARC_PROPERTY: {
                  actions: 'setArcProperty'
                }
              }
            }
          }
        },
        performance: {
          invoke: {
            src: 'performanceMonitoringService',
            onError: {
              actions: 'logPerformanceError'
            }
          },
          on: {
            PERFORMANCE_UPDATE: {
              actions: 'updatePerformanceStats'
            },
            AUTO_ADJUST: {
              actions: 'adjustParticleCountForPerformance',
              cond: 'shouldAutoAdjust'
            }
          }
        }
      },
      on: {
        DISABLE_PARTICLES: 'disabled',
        RESET_PARTICLES: {
          actions: 'resetToDefaults'
        }
      }
    }
  },
  guards: {
    isValidCount: (context, event) => {
      return event.count >= context.performance.minCount &&
             event.count <= context.performance.maxCount;
    },
    isValidColor: (context, event) => {
      return /^#[0-9A-F]{6}$/i.test(event.color);
    },
    isValidSize: (context, event) => {
      return event.size >= 0.1 && event.size <= 5.0;
    },
    shouldAutoAdjust: (context, event) => {
      return context.performance.autoAdjust && event.fps < context.performance.fpsThreshold;
    }
  },
  actions: {
    setParticleCount: assign({
      particles: (context, event) => ({
        ...context.particles,
        count: event.count
      })
    }),
    adjustParticleCountForPerformance: assign({
      particles: (context, event) => {
        const currentCount = context.particles.count;
        const adjustment = event.fps < 20 ? -500 : event.fps < 30 ? -200 : 0;
        const newCount = Math.max(
          context.performance.minCount,
          Math.min(context.performance.maxCount, currentCount + adjustment)
        );

        return {
          ...context.particles,
          count: newCount
        };
      }
    }),
    setArcProperty: assign({
      arcs: (context, event) => ({
        ...context.arcs,
        [event.property]: event.value
      })
    })
  }
});
```

### **XState Hooks Equivalents**
```javascript
// Hook master avec machine
export const useParticlesControls = () => {
  const [state, send] = useActor(particlesMachine);

  return useMemo(() => ({
    // Particles state
    particles: state.context.particles,
    enabled: state.matches('enabled'),
    count: state.context.particles.count,
    size: state.context.particles.size,
    color: state.context.particles.color,

    // Arcs state
    arcs: state.context.arcs,
    arcsEnabled: state.matches('enabled.arcs.enabled'),

    // Actions with validation
    setParticlesEnabled: (enabled) => send({ type: enabled ? 'ENABLE_PARTICLES' : 'DISABLE_PARTICLES' }),
    setParticlesCount: (count) => send({ type: 'SET_COUNT', count }),
    setParticlesColor: (color) => send({ type: 'SET_COLOR', color }),
    setArcsEnabled: (enabled) => send({ type: enabled ? 'ENABLE_ARCS' : 'DISABLE_ARCS' }),
    setArcsProperty: (property, value) => send({ type: 'SET_ARC_PROPERTY', property, value }),
    resetParticles: () => send({ type: 'RESET_PARTICLES' })
  }), [state, send]);
};

// Hook arcs spécialisé
export const useArcsControls = () => {
  const [state, send] = useActor(particlesMachine);

  return useMemo(() => ({
    arcs: state.context.arcs,
    enabled: state.matches('enabled.arcs.enabled'),
    setEnabled: (enabled) => send({ type: enabled ? 'ENABLE_ARCS' : 'DISABLE_ARCS' }),
    setProperty: (property, value) => send({ type: 'SET_ARC_PROPERTY', property, value })
  }), [state, send]);
};

// Service performance monitoring
const performanceMonitoringService = (context) => (callback) => {
  if (!context.performance.monitoring) return () => {};

  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 60;

  const measurePerformance = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      callback('PERFORMANCE_UPDATE', { fps });

      if (context.performance.autoAdjust && fps < context.performance.fpsThreshold) {
        callback('AUTO_ADJUST', { fps });
      }

      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measurePerformance);
  };

  requestAnimationFrame(measurePerformance);

  return () => {
    // Cleanup if needed
  };
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 55 (ultra-compact)
- **Hooks exports** : 2 hooks (master + specialized)
- **Features** : Particles + arcs + animation complete
- **Performance** : Individual selectors + stable actions
- **Validation** : None (limitation)
- **Monitoring** : None (limitation)
- **Dependencies** : useSceneStore seulement

---

## ✅ **CONCLUSION**

**useParticlesControls.js = Hook particles ultra-compact 55 lignes avec arcs system + clean architecture**

### **Points forts**
- **Ultra-compact excellence** : 55 lignes feature-complete most efficient
- **Clean architecture** : 2 hooks focused avec responsibilities clear
- **Performance optimized** : Individual selectors + stable actions pattern
- **Feature complete** : Particles + arcs + animation full system

### **Points faibles**
- **No validation** : Count/color/size pas validés
- **No performance monitoring** : Pas de FPS impact tracking
- **Limited animation** : Basic properties sans presets ou physics
- **Arcs logic external** : Distance calculations handled elsewhere

### **Construction XState**
- **Complexité** : 🟢 SIMPLE
- **Pattern** : Machine parallèle + guards validation + performance monitoring
- **Benefits** : Validation automatic + performance adaptation + error recovery
- **Services** : Performance monitoring + auto-adjustment + physics integration

**Recommandation** : **CONSTRUIRE vers machine XState** avec validation guards + **performance monitoring service** + **auto-adjustment** + **physics integration**

---

**FIN SESSION 26 - useParticlesControls.js**
**Durée analyse** : ~20 minutes
**Prochaine session** : usePresetsControls.js