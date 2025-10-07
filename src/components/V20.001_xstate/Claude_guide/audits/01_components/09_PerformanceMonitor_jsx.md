# 📋 RAPPORT AUDIT : PerformanceMonitor.jsx

**Date** : 25/09/2025 - SESSION 9
**Fichier** : `components/PerformanceMonitor.jsx`
**Taille** : 274 lignes
**Type** : Component Monitoring Performance (Autonome + Visualisation)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- React, { useState, useEffect, useRef }
```

### **Imports internes**
```javascript
(Aucun - Composant totalement autonome)
```

---

## 🎯 **OBJECTIF COMPOSANT**

### **Fonctions principales**
- **Monitoring FPS** : Affichage FPS en temps réel + historique
- **Frame Time Tracking** : Temps de rendu par frame + moyenne
- **GPU Memory Simulation** : Usage mémoire GPU simulé + variations
- **Sparklines Interactives** : Graphiques mini avec hover zoom
- **Interface Collapse/Expand** : Mode compact vs détaillé

---

## 🔧 **PROPS INTERFACE (1 prop)**

```javascript
PerformanceMonitor({
  performanceStats = {}  // Objet stats depuis parent
})

// Structure performanceStats attendue:
{
  fps: number,         // FPS instantané
  frameTime: number    // Temps frame (ms)
}
```

---

## 🎛️ **ÉTAT LOCAL (5 useState)**

### **1. UI State (2 états)**
```javascript
const [isExpanded, setIsExpanded] = useState(true);       // Panel expand/collapse
const [hoveredMetric, setHoveredMetric] = useState(null); // Métrique hovered ('fps'|'frameTime'|'gpuMem')
```

### **2. History Arrays (3 historiques × 30 valeurs)**
```javascript
const [fpsHistory, setFpsHistory] = useState([]);         // Historique FPS (30 derniers)
const [frameTimeHistory, setFrameTimeHistory] = useState([]); // Historique frame time (30 derniers)
const [gpuMemHistory, setGpuMemHistory] = useState([]);   // Historique GPU memory (30 derniers)
```

---

## 📊 **SYSTÈME SPARKLINES**

### **drawSparkline Function**
```javascript
const drawSparkline = (canvas, data, color) => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Normalisation dynamique min/max
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue;

  // Dessin ligne avec marge 10%
  const margin = height * 0.1;
  const graphHeight = height - (margin * 2);

  // Path SVG-like avec Canvas
  data.forEach((value, index) => {
    const x = index * (width / (data.length - 1));
    const normalizedValue = range > 0 ? (value - minValue) / range : 0.5;
    const y = margin + graphHeight - (normalizedValue * graphHeight);
    // ctx.lineTo(x, y)...
  });
};
```

### **SparkLine Component**
```javascript
const SparkLine = ({ data, color, maxValue, isHovered }) => {
  const sparkRef = useRef(null);

  // Canvas size dynamique selon hover
  width: isHovered ? 120 : 60,
  height: isHovered ? 40 : 20,

  // Styles interactifs
  border: isHovered ? '2px solid ' + color : '1px solid rgba(255,255,255,0.1)',
  boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
  transition: 'all 0.3s ease'
};
```

---

## 🔄 **DATA PROCESSING**

### **History Management useEffect**
```javascript
useEffect(() => {
  // FPS History Update
  if (performanceStats.fps) {
    setFpsHistory(prev => {
      const newHistory = [...prev, performanceStats.fps];
      return newHistory.slice(-30); // Ring buffer 30 valeurs
    });
  }

  // Frame Time History Update
  if (performanceStats.frameTime) {
    setFrameTimeHistory(prev => {
      const newHistory = [...prev, performanceStats.frameTime];
      return newHistory.slice(-30);
    });
  }

  // GPU Memory SIMULATION
  const baseMemory = 120;
  const variation = Math.sin(Date.now() / 1000) * 15; // Sinusoïde
  const fpsImpact = (performanceStats.fps || 60) > 55 ? 0 : 10; // FPS bas = plus mémoire
  const currentGpuMem = baseMemory + variation + fpsImpact;

  setGpuMemHistory(prev => {
    const newHistory = [...prev, Math.round(currentGpuMem)];
    return newHistory.slice(-30);
  });
}, [performanceStats.fps, performanceStats.frameTime]);
```

### **Average Calculations**
```javascript
// FPS Moyenne
const avgFps = fpsHistory.length > 0
  ? Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length)
  : 0;

// Frame Time Moyenne
const avgFrameTime = frameTimeHistory.length > 0
  ? Math.round((frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length) * 10) / 10
  : 0;
```

---

## 🎨 **INTERFACE UTILISATEUR**

### **Positioning & Layout**
```javascript
position: 'fixed',
bottom: '10px', right: '10px',  // Coin bas-droite
width: isExpanded ? '240px' : '80px',
height: isExpanded ? '200px' : '30px',
zIndex: 9999,                   // Top-level
backdropFilter: 'blur(10px)'    // Modern glassmorphism
```

### **Design System**
- **Background** : `rgba(0, 0, 0, 0.9)` (Dark opaque)
- **Border** : `rgba(76, 175, 80, 0.5)` (Vert performance)
- **FPS Color** : `#4CAF50` (Vert)
- **Frame Time Color** : `#FF9800` (Orange)
- **GPU Memory Color** : `#2196F3` (Bleu)

### **States UI (2 modes)**

#### **Collapsed Mode**
```javascript
// Minimal: 80×30px
Header: "📊 {fps} FPS"
Button: "+" (expand)
```

#### **Expanded Mode**
```javascript
// Full: 240×200px
Header: "📊 Performance Monitor" + "−" button
Hint: "📈 Survol une métrique pour agrandir le graphique"

// 3 Métriques avec sparklines
FPS: {current} (moy: {average}) + sparkline vert
Frame Time: {current}ms (moy: {average}) + sparkline orange
GPU Mem: ~{current}MB + sparkline bleu
```

### **Hover Interactions**
```javascript
// Hover sur métrique
onMouseEnter={() => setHoveredMetric('fps')}
// → Sparkline 60×20 → 120×40
// → Background alpha 0.1 → 0.2
// → Scale 1.0 → 1.02
// → Border + boxShadow
```

---

## 🔧 **FONCTIONNALITÉS AVANCÉES**

### **1. GPU Memory Simulation Réaliste**
```javascript
// Simulation basée sur performance
const baseMemory = 120;                              // 120MB baseline
const variation = Math.sin(Date.now() / 1000) * 15; // ±15MB oscillation
const fpsImpact = fps > 55 ? 0 : 10;                // +10MB si FPS bas
// Total: 105-145MB réaliste
```

### **2. Ring Buffer History**
```javascript
// Optimisation mémoire
newHistory.slice(-30); // Garde seulement 30 dernières valeurs
// Évite memory leak sur longue durée
```

### **3. Canvas Sparklines Performance**
```javascript
// Canvas API pour graphiques fluides
// Pas de SVG/DOM = performance optimale
// Normalisation dynamique min/max pour meilleur rendu
// Margin 10% pour éviter clipping
```

### **4. Responsive Hover UX**
```javascript
// Hover → zoom sparkline + highlight
// Visual feedback immédiat
// Smooth transitions 0.3s
```

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Autonomie Complète**
- 1 seule prop (`performanceStats`)
- Zéro dépendance externe
- Self-contained UI + logic

### **2. UX Excellence**
- Collapse/expand intelligent
- Sparklines interactives
- Smooth animations
- Glassmorphism moderne

### **3. Performance Optimisée**
- Ring buffer (30 valeurs max)
- Canvas rendering (pas DOM)
- Debounce naturel via parent

### **4. Data Intelligence**
- GPU simulation réaliste
- Moyennes calculées
- FPS impact correlation

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. GPU Memory Fake**
```javascript
// Simulation Math.sin() pas vraie mesure GPU
const variation = Math.sin(Date.now() / 1000) * 15;
// Utile pour demo mais pas production monitoring
```

### **2. Data Dependency**
```javascript
// Assume parent fournit performanceStats régulièrement
// Pas de fallback si parent ne push plus de data
// Pas de cleanup si composant unmount
```

### **3. Canvas Cleanup Missing**
```javascript
// Pas de cleanup canvas contexts
// Potential memory leaks si nombreux re-renders
// drawSparkline appelé à chaque data change
```

### **4. Fixed Position**
```javascript
// position: 'fixed' bottom-right hardcodé
// Pas configurable via props
// Peut overlapper autres éléments UI
```

---

## 🎯 **USAGE DANS ÉCOSYSTÈME**

### **Intégration MSAAControlsPanel**
```javascript
// MSAAControlsPanel calcule stats et pass au PerformanceMonitor
const [performanceStats, setPerformanceStats] = useState({});

const updatePerformanceStats = (stats) => {
  setPerformanceStats(stats);
};

return (
  <>
    <MSAAControlsPanel onPerformanceUpdate={updatePerformanceStats} />
    <PerformanceMonitor performanceStats={performanceStats} />
  </>
);
```

### **Data Flow**
```
RAF Loop (MSAAControlsPanel) → FPS Calculation → onPerformanceUpdate callback
                                                 ↓
                                           PerformanceMonitor → sparklines update
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **Performance Machine XState**
```javascript
const performanceMachine = createMachine({
  id: 'performance',
  initial: 'monitoring',
  context: {
    isExpanded: true,
    hoveredMetric: null,
    fpsHistory: [],
    frameTimeHistory: [],
    gpuMemHistory: [],
    currentStats: { fps: 0, frameTime: 0 }
  },
  states: {
    monitoring: {
      on: {
        TOGGLE_EXPAND: { actions: 'toggleExpanded' },
        HOVER_METRIC: { actions: 'setHoveredMetric' },
        UPDATE_STATS: { actions: 'updateStats' },
        CLEAR_HOVER: { actions: 'clearHover' }
      }
    }
  },
  actions: {
    toggleExpanded: assign({
      isExpanded: (context) => !context.isExpanded
    }),
    setHoveredMetric: assign({
      hoveredMetric: (_, event) => event.metric
    }),
    updateStats: assign({
      currentStats: (_, event) => event.stats,
      fpsHistory: (context, event) => [
        ...context.fpsHistory,
        event.stats.fps
      ].slice(-30),
      frameTimeHistory: (context, event) => [
        ...context.frameTimeHistory,
        event.stats.frameTime
      ].slice(-30)
    })
  }
});
```

### **PerformanceMonitorXState**
```javascript
const PerformanceMonitorXState = ({ performanceStats }) => {
  const [state, send] = useMachine(performanceMachine);

  // Auto-update depuis props
  useEffect(() => {
    if (performanceStats.fps || performanceStats.frameTime) {
      send('UPDATE_STATS', { stats: performanceStats });
    }
  }, [performanceStats]);

  // Plus de 5 useState locaux
  // Plus de useEffect history management
  // State centralisé dans machine

  return (
    <PerformanceMonitorUI
      state={state}
      onToggleExpand={() => send('TOGGLE_EXPAND')}
      onHoverMetric={(metric) => send('HOVER_METRIC', { metric })}
      onClearHover={() => send('CLEAR_HOVER')}
    />
  );
};
```

### **Service pour Sparklines**
```javascript
// Service XState pour Canvas management
const sparklineService = (context, event) => (callback) => {
  const updateSparklines = () => {
    // Canvas drawing logic
    drawSparkline(canvas, context.fpsHistory, '#4CAF50');
    // etc...
  };

  updateSparklines();

  // Cleanup function
  return () => {
    // Canvas cleanup
  };
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 274
- **Props** : 1 (performanceStats)
- **useState** : 5 (isExpanded, hoveredMetric, 3 histories)
- **useRef** : 1 (sparkline canvas)
- **Canvas Usage** : Custom sparklines
- **History Size** : 30 valeurs × 3 métriques = 90 valeurs max
- **Position** : Fixed bottom-right
- **Animations** : Smooth transitions 0.3s

---

## ✅ **CONCLUSION**

**PerformanceMonitor = Composant monitoring autonome avec visualisation sparklines avancée**

### **Points forts**
- Interface utilisateur excellente (collapse/expand + hover zoom)
- Sparklines Canvas performantes
- Data management intelligent (ring buffer)
- Design moderne (glassmorphism + material colors)

### **Points faibles**
- GPU memory simulation fake (pas vraie mesure)
- Position fixed hardcodée
- Canvas cleanup manquant
- Dépendance forte sur parent data regularity

### **Construction XState**
- **Complexité** : 🟡 MOYENNE
- **Réutilisabilité** : 🟢 ÉLEVÉE
- **UX Value** : 🟢 EXCELLENTE

**Recommandation** : **CONSTRUIRE avec machine XState** pour state management + **CONSERVER** sparklines Canvas + UX patterns

---

**FIN SESSION 9 - PerformanceMonitor.jsx**
**Durée analyse** : ~30 minutes
**Prochaine session** : TestPhase2Integration.jsx