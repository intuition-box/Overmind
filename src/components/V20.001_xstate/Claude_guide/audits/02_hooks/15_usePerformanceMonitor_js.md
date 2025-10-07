# 📋 RAPPORT AUDIT : usePerformanceMonitor.js

**Date** : 25/09/2025 - SESSION 15
**Fichier** : `hooks/usePerformanceMonitor.js`
**Taille** : 164 lignes
**Type** : Hook Performance Monitoring (Real-time FPS + MSAA Impact)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- { useState, useEffect, useRef, useCallback } from 'react'
```

### **Imports internes**
```javascript
(Aucun - Hook autonome)
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Monitoring FPS temps réel** : Performance.now() based FPS calculation
- **Impact MSAA tracking** : Mesure impact anti-aliasing sur performance
- **Statistics averaging** : Moyennes mobiles + variance + stabilité
- **Performance recommendations** : Évaluation automatique + conseils
- **Real-time RAF loop** : RequestAnimationFrame monitoring continu

---

## 🔧 **SIGNATURE HOOK**

```javascript
export function usePerformanceMonitor() {
  // Return: { stats, updateSamples, resetStats, getPerformanceImpact, getPerformanceStatus }
}
```

**Pattern** : Hook autonome, démarrage automatique monitoring

---

## 🎛️ **ÉTAT LOCAL (1 useState)**

### **Stats Object Complexe**
```javascript
const [stats, setStats] = useState({
  fps: 0,                    // FPS instantané
  averageFps: 0,             // FPS moyen
  frameTime: 0,              // Temps frame instantané (ms)
  averageFrameTime: 0,       // Temps frame moyen (ms)
  minFps: Infinity,          // FPS minimum
  maxFps: 0,                 // FPS maximum
  gpuMemory: 0,             // GPU memory (unused)
  samples: 0,               // MSAA samples count
  isStable: true            // Stabilité performance (variance <10%)
});
```

---

## 📊 **SYSTÈME RÉFÉRENCES (6 useRef)**

### **Timing & Counters**
```javascript
const lastTimeRef = useRef(performance.now());     // Timestamp dernière mesure
const frameCountRef = useRef(0);                   // Compteur frames
const animationIdRef = useRef();                   // RAF ID pour cleanup
const startTimeRef = useRef(performance.now());    // Timestamp démarrage
```

### **History Arrays**
```javascript
const frameTimesRef = useRef([]);                  // Historique frame times
const fpsHistoryRef = useRef([]);                  // Historique FPS values
```

**Ring Buffer Pattern** : Taille fixe SAMPLE_SIZE (60) avec shift()

---

## ⚙️ **CONFIGURATION MONITORING**

### **Constants de Performance**
```javascript
const SAMPLE_SIZE = 60;        // Échantillons moyennes mobiles (1 seconde à 60fps)
const UPDATE_INTERVAL = 10;    // Frames entre mises à jour stats (6fps update rate)
```

**Optimisation** : Update stats seulement toutes les 10 frames → 6fps update rate pour UI

---

## 🔄 **ALGORITHME MONITORING**

### **Core Function: updatePerformanceStats**
```javascript
const updatePerformanceStats = useCallback(() => {
  const now = performance.now();
  const deltaTime = now - lastTimeRef.current;

  if (deltaTime > 0) {
    // 1. Calculs instantanés
    const currentFps = 1000 / deltaTime;
    const currentFrameTime = deltaTime;

    // 2. Ring buffer historiques
    fpsHistoryRef.current.push(currentFps);
    frameTimesRef.current.push(currentFrameTime);

    // Maintenir taille échantillon
    if (fpsHistoryRef.current.length > SAMPLE_SIZE) {
      fpsHistoryRef.current.shift();
      frameTimesRef.current.shift();
    }

    frameCountRef.current++;

    // 3. Update stats toutes les N frames
    if (frameCountRef.current % UPDATE_INTERVAL === 0) {
      const avgFps = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const minFps = Math.min(...fpsHistoryRef.current);
      const maxFps = Math.max(...fpsHistoryRef.current);

      // 4. Calcul stabilité (variance FPS)
      const fpsVariance = fpsHistoryRef.current.reduce((sum, fps) => sum + Math.pow(fps - avgFps, 2), 0) / fpsHistoryRef.current.length;
      const fpsStdDev = Math.sqrt(fpsVariance);
      const isStable = (fpsStdDev / avgFps) < 0.1; // <10% variance = stable

      setStats(prev => ({
        ...prev,
        fps: Math.round(currentFps),
        averageFps: Math.round(avgFps),
        frameTime: Math.round(currentFrameTime * 100) / 100,
        averageFrameTime: Math.round(avgFrameTime * 100) / 100,
        minFps: Math.round(minFps),
        maxFps: Math.round(maxFps),
        isStable
      }));
    }
  }

  lastTimeRef.current = now;
}, []);
```

---

## 🎮 **SYSTÈME MSAA IMPACT**

### **getPerformanceImpact Function**
```javascript
const getPerformanceImpact = useCallback((newSamples, currentSamples = 1) => {
  // Impact empirique MSAA sur performance
  const impactMap = {
    1: 1.0,   // Baseline (no MSAA)
    2: 0.85,  // ~15% impact
    4: 0.70,  // ~30% impact
    8: 0.55,  // ~45% impact
    16: 0.40  // ~60% impact
  };

  const currentImpact = impactMap[currentSamples] || 1.0;
  const newImpact = impactMap[newSamples] || 1.0;
  const relativeChange = (newImpact / currentImpact - 1) * 100;

  return {
    estimatedFpsChange: relativeChange,
    impactLevel: newSamples <= 4 ? 'low' : newSamples <= 8 ? 'medium' : 'high',
    recommendation: newSamples <= 4 ? 'Recommended for most systems' :
                   newSamples <= 8 ? 'Good for high-end systems' :
                   'Only for very powerful GPUs'
  };
}, []);
```

**Intelligence** : Recommandations automatiques selon samples MSAA

---

## 📈 **SYSTÈME ÉVALUATION PERFORMANCE**

### **getPerformanceStatus Function**
```javascript
const getPerformanceStatus = useCallback(() => {
  const { averageFps } = stats;

  if (averageFps > 55) {
    return { status: 'excellent', color: '#4CAF50', message: 'Performance excellente' };
  } else if (averageFps > 40) {
    return { status: 'good', color: '#FF9800', message: 'Performance correcte' };
  } else if (averageFps > 25) {
    return { status: 'poor', color: '#FF5722', message: 'Performance faible' };
  } else {
    return { status: 'critical', color: '#f44336', message: 'Performance critique' };
  }
}, [stats]);
```

**Color Coding** : Vert > Orange > Rouge selon seuils FPS

---

## ⚡ **RAF MONITORING LOOP**

### **useEffect Auto-Start**
```javascript
useEffect(() => {
  const monitor = () => {
    updatePerformanceStats();
    animationIdRef.current = requestAnimationFrame(monitor);
  };

  animationIdRef.current = requestAnimationFrame(monitor);

  return () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };
}, [updatePerformanceStats]);
```

**Pattern** : Auto-démarrage + cleanup automatique

---

## 🔧 **API PUBLIQUE**

### **updateSamples - MSAA Sync**
```javascript
const updateSamples = useCallback((samples) => {
  setStats(prev => ({ ...prev, samples }));
}, []);
```

### **resetStats - Reset Complet**
```javascript
const resetStats = useCallback(() => {
  fpsHistoryRef.current = [];
  frameTimesRef.current = [];
  frameCountRef.current = 0;
  startTimeRef.current = performance.now();
  setStats(prev => ({
    ...prev,
    minFps: Infinity,
    maxFps: 0,
    averageFps: 0,
    averageFrameTime: 0
  }));
}, []);
```

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Performance Optimisée**
- **RAF natif** : Performance.now() précision microseconde
- **Update throttling** : Stats update toutes les 10 frames seulement
- **Ring buffer** : Taille fixe SAMPLE_SIZE évite memory leaks
- **Math optimized** : Calculs moyenne avec reduce() efficient

### **2. Statistiques Robustes**
- **Moyennes mobiles** : 60 échantillons = 1 seconde données
- **Min/Max tracking** : Détection pics performance
- **Variance calculation** : Stabilité performance (écart-type)
- **Round precision** : Arrondi pour UI lisible

### **3. Intelligence MSAA**
- **Impact empirique** : Values réalistes performance GPU
- **Recommendations** : Conseils automatiques selon hardware
- **Relative changes** : Calculs différentiels impact
- **Level categorization** : low/medium/high classification

### **4. Developer Experience**
- **Auto-start monitoring** : Démarrage transparent
- **Clean API** : 5 functions exposées seulement
- **Status helpers** : Color coding + messages
- **Reset capability** : Testing scenarios

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. MSAA Impact Hardcodé**
```javascript
// Values empiriques fixes
const impactMap = {
  1: 1.0,   // Baseline
  2: 0.85,  // 15% impact
  4: 0.70,  // 30% impact
  // Pas d'adaptation hardware spécifique
}
```

### **2. GPU Memory Unused**
```javascript
const [stats, setStats] = useState({
  gpuMemory: 0,  // Property déclarée mais jamais utilisée
  // Pas de vraie mesure GPU memory
});
```

### **3. Update Interval Fixed**
```javascript
// UPDATE_INTERVAL = 10 hardcodé
// Pas configurable selon besoins
// 6fps update rate pas optimale tous cas
```

### **4. RAF Global Impact**
```javascript
// RAF loop permanent même si hook pas utilisé
// Pas de conditional start/stop
// Impact performance si multiple instances
```

---

## 🎯 **USAGE PATTERNS**

### **Intégration MSAAControlsPanel**
```javascript
const { stats, updateSamples, getPerformanceImpact, getPerformanceStatus } = usePerformanceMonitor();

// Sync MSAA samples
useEffect(() => {
  updateSamples(msaaSettings.samples);
}, [msaaSettings.samples, updateSamples]);

// Display performance
const status = getPerformanceStatus();
const impact = getPerformanceImpact(newSamples, currentSamples);
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **PerformanceMonitor Machine**
```javascript
const performanceMonitorMachine = createMachine({
  id: 'performanceMonitor',
  initial: 'idle',
  context: {
    stats: {
      fps: 0,
      averageFps: 0,
      frameTime: 0,
      isStable: true
    },
    config: {
      sampleSize: 60,
      updateInterval: 10
    },
    history: {
      fpsHistory: [],
      frameTimeHistory: []
    }
  },
  states: {
    idle: {
      on: {
        START_MONITORING: 'monitoring'
      }
    },
    monitoring: {
      invoke: {
        src: 'performanceMonitoringService',
        onDone: 'idle',
        onError: 'error'
      },
      on: {
        STOP_MONITORING: 'idle',
        UPDATE_STATS: {
          actions: 'updatePerformanceStats'
        },
        UPDATE_SAMPLES: {
          actions: 'updateMsaaSamples'
        },
        RESET_STATS: {
          actions: 'resetAllStats'
        }
      }
    },
    error: {
      on: {
        RETRY: 'monitoring',
        STOP_MONITORING: 'idle'
      }
    }
  },
  actions: {
    updatePerformanceStats: assign({
      stats: (context, event) => ({
        ...context.stats,
        ...event.stats
      })
    }),
    updateMsaaSamples: assign({
      stats: (context, event) => ({
        ...context.stats,
        samples: event.samples
      })
    }),
    resetAllStats: assign({
      stats: (context) => ({
        ...context.stats,
        fps: 0,
        averageFps: 0,
        minFps: Infinity,
        maxFps: 0
      }),
      history: {
        fpsHistory: [],
        frameTimeHistory: []
      }
    })
  }
});
```

### **Performance Monitoring Service**
```javascript
const performanceMonitoringService = (context, event) => (callback) => {
  let animationId;
  let lastTime = performance.now();
  let frameCount = 0;
  const { sampleSize, updateInterval } = context.config;

  const monitor = () => {
    const now = performance.now();
    const deltaTime = now - lastTime;

    if (deltaTime > 0) {
      const currentFps = 1000 / deltaTime;
      const currentFrameTime = deltaTime;

      // Update context history via callback
      callback('UPDATE_STATS', {
        stats: {
          fps: Math.round(currentFps),
          frameTime: Math.round(currentFrameTime * 100) / 100
        }
      });

      frameCount++;

      // Detailed stats calculation every N frames
      if (frameCount % updateInterval === 0) {
        // Calculate averages, variance, etc.
        // callback('UPDATE_DETAILED_STATS', { detailedStats })
      }
    }

    lastTime = now;
    animationId = requestAnimationFrame(monitor);
  };

  animationId = requestAnimationFrame(monitor);

  // Cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 164 (taille modérée)
- **useState** : 1 (stats object complexe)
- **useRef** : 6 (timing + historiques)
- **useCallback** : 4 (updateStats, updateSamples, resetStats, getters)
- **useEffect** : 1 (RAF loop auto-start)
- **Constants** : 2 (SAMPLE_SIZE, UPDATE_INTERVAL)
- **RAF permanent** : Oui (auto-start monitoring)

---

## ✅ **CONCLUSION**

**usePerformanceMonitor = Hook monitoring performance sophistiqué avec intelligence MSAA**

### **Points forts**
- **Précision élevée** : Performance.now() + RAF natif
- **Statistiques robustes** : Moyennes mobiles + variance + stabilité
- **Intelligence MSAA** : Impact estimation + recommendations
- **Performance optimisée** : Update throttling + ring buffer
- **Developer UX** : Auto-start + clean API + status helpers

### **Points faibles**
- **MSAA hardcodé** : Values empiriques fixes
- **GPU memory unused** : Property déclarée non utilisée
- **Config fixed** : Update interval non configurable
- **RAF global** : Loop permanent même si inutilisé

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Pattern** : Machine monitoring + service RAF
- **Benefits** : Conditional start/stop + config flexibility
- **Services** : RAF monitoring découplé

**Recommandation** : **CONSTRUIRE vers service XState** avec start/stop conditional + **configuration flexible** + **vraie mesure GPU memory**

---

**FIN SESSION 15 - usePerformanceMonitor.js**
**Durée analyse** : ~30 minutes
**Prochaine session** : useRevealManager.js