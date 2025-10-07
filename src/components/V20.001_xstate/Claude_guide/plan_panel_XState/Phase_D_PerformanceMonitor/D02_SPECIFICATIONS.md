# 📋 PHASE D - SPÉCIFICATIONS : PerformanceMonitor

**Date** : 3 octobre 2025
**Objectif** : Définir EXACTEMENT l'architecture de performanceMonitor

---

## 🎯 ARCHITECTURE

### **performanceMonitor : Machine XState v5**

```typescript
interface PerformanceContext {
  renderer: THREE.WebGLRenderer | null;

  // Métriques
  fps: number;
  frameTime: number;           // ms
  memory: {
    used: number;              // MB
    limit: number;             // MB
  };
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;

  // État
  enabled: boolean;
  updateInterval: number;      // ms entre updates (default: 1000)

  // FPS tracking
  lastUpdateTime: number;
  frameCount: number;
}
```

---

## 🔧 CONTEXTE COMPLET

```typescript
export interface PerformanceContext {
  renderer: THREE.WebGLRenderer | null;

  // Métriques courantes
  fps: number;
  frameTime: number;
  memory: {
    used: number;
    limit: number;
  };
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;

  // Configuration
  enabled: boolean;
  updateInterval: number;

  // Tracking interne
  lastUpdateTime: number;
  frameCount: number;
}
```

---

## 🔧 VALEURS PAR DÉFAUT

```typescript
context: {
  renderer: null,

  fps: 60,
  frameTime: 16.67,
  memory: { used: 0, limit: 0 },
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  programs: 0,

  enabled: true,
  updateInterval: 1000,  // Update every second

  lastUpdateTime: 0,
  frameCount: 0
}
```

---

## 🔧 ÉVÉNEMENTS

```typescript
export type PerformanceEvents =
  // Initialisation
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }

  // Contrôle
  | { type: 'ENABLE' }
  | { type: 'DISABLE' }
  | { type: 'TOGGLE' }

  // Update métriques (appelé chaque frame)
  | { type: 'TICK'; timestamp: number; frameTime: number }

  // Configuration
  | { type: 'SET_UPDATE_INTERVAL'; interval: number };
```

---

## 🎬 ACTIONS

### **Action : updateStats**

```typescript
actions: {
  updateStats: ({ context, event }) => {
    if (!context.enabled || !context.renderer) return;
    if (event.type !== 'TICK') return;

    const now = event.timestamp;
    const delta = now - context.lastUpdateTime;

    // Update every updateInterval ms
    if (delta >= context.updateInterval) {
      // Calculate FPS
      const fps = Math.round((context.frameCount * 1000) / delta);
      context.fps = fps;

      // Frame time (average)
      context.frameTime = delta / context.frameCount;

      // Memory
      if (performance.memory) {
        context.memory.used = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        context.memory.limit = Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024));
      }

      // Renderer info
      const info = context.renderer.info;
      context.drawCalls = info.render.calls;
      context.triangles = info.render.triangles;
      context.geometries = info.memory.geometries;
      context.textures = info.memory.textures;
      context.programs = info.programs?.length || 0;

      // Reset counters
      context.frameCount = 0;
      context.lastUpdateTime = now;

      console.log(`[PerformanceMonitor] FPS: ${fps}, Frame: ${context.frameTime.toFixed(2)}ms, Draws: ${context.drawCalls}`);
    }

    // Increment frame count
    context.frameCount++;
  }
}
```

---

### **Action : resetCounters**

```typescript
actions: {
  resetCounters: ({ context }) => {
    context.frameCount = 0;
    context.lastUpdateTime = performance.now();
  }
}
```

---

## 🔧 GUARDS

### **Guard : isEnabled**

```typescript
guards: {
  isEnabled: ({ context }) => context.enabled
}
```

---

## 🔄 FLUX D'UTILISATION

### **Cas 1 : Tick chaque frame**

```
┌──────────────────┐
│ Render Loop      │ → requestAnimationFrame()
└────────┬─────────┘
         │
         ↓ Event: TICK({ timestamp: now, frameTime: 16.67 })
┌────────┴─────────┐
│ performanceMonitor│
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: updateStats
┌────────┴─────────┐
│ Check delta      │ → delta >= updateInterval ?
└────────┬─────────┘
         │
         ↓ YES (every 1s)
┌────────┴─────────┐
│ Calculate FPS    │ → fps = (frameCount * 1000) / delta
│ Read renderer    │ → drawCalls, triangles, etc.
│ Read memory      │ → usedJSHeapSize
└────────┬─────────┘
         │
         ↓ Action: assign new values
┌────────┴─────────┐
│ Context updated  │ → UI re-renders avec nouvelles valeurs
└──────────────────┘
```

---

### **Cas 2 : Toggle enabled**

```
┌──────────────────┐
│ UI: Toggle       │ → Utilisateur clique toggle
│ [✅ Enabled]     │
└────────┬─────────┘
         │
         ↓ Event: TOGGLE
┌────────┴─────────┐
│ performanceMonitor│
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ enabled: !context.enabled })
┌────────┴─────────┐
│ enabled = false  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ TICK events      │ → updateStats ne fait rien (guard)
│ ignored          │
└──────────────────┘
```

---

## 🎨 UI ATTENDUE

### **Overlay (PerformanceOverlay.tsx)**

```typescript
// xstate-v5/components/PerformanceOverlay.tsx
import { usePerformance } from '../hooks/usePerformance';

export function PerformanceOverlay() {
  const { fps, frameTime, memory, drawCalls, triangles, enabled, toggle } = usePerformance();

  if (!enabled) return null;

  return (
    <div className="performance-overlay">
      <div className="performance-header">
        <span>⚡ Performance</span>
        <button onClick={toggle}>×</button>
      </div>
      <div className="performance-stats">
        <div className={`stat ${getFPSColor(fps)}`}>
          <span className="label">FPS:</span>
          <span className="value">{fps}</span>
        </div>
        <div className="stat">
          <span className="label">Frame:</span>
          <span className="value">{frameTime.toFixed(2)} ms</span>
        </div>
        <div className="stat">
          <span className="label">Memory:</span>
          <span className="value">{memory.used} MB</span>
        </div>
        <div className="stat">
          <span className="label">Draws:</span>
          <span className="value">{drawCalls}</span>
        </div>
        <div className="stat">
          <span className="label">Tris:</span>
          <span className="value">{formatNumber(triangles)}</span>
        </div>
      </div>
    </div>
  );
}

function getFPSColor(fps: number): string {
  if (fps >= 55) return 'green';
  if (fps >= 30) return 'yellow';
  return 'red';
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
```

---

### **CSS**

```css
.performance-overlay {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  min-width: 180px;
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 4px;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat {
  display: flex;
  justify-content: space-between;
}

.stat .label {
  color: #aaa;
}

.stat .value {
  font-weight: bold;
}

.stat.green .value { color: #4ade80; }
.stat.yellow .value { color: #fbbf24; }
.stat.red .value { color: #f87171; }
```

---

## 🔧 HOOK : usePerformance.ts

```typescript
// xstate-v5/hooks/usePerformance.ts
import { useSelector, useActorRef } from '@xstate/react';
import { performanceMonitor } from '../actors/performance/performanceMonitor';

export function usePerformance() {
  const actorRef = useActorRef(performanceMonitor);

  const fps = useSelector(actorRef, (state) => state.context.fps);
  const frameTime = useSelector(actorRef, (state) => state.context.frameTime);
  const memory = useSelector(actorRef, (state) => state.context.memory);
  const drawCalls = useSelector(actorRef, (state) => state.context.drawCalls);
  const triangles = useSelector(actorRef, (state) => state.context.triangles);
  const geometries = useSelector(actorRef, (state) => state.context.geometries);
  const textures = useSelector(actorRef, (state) => state.context.textures);
  const programs = useSelector(actorRef, (state) => state.context.programs);
  const enabled = useSelector(actorRef, (state) => state.context.enabled);

  const toggle = () => {
    actorRef.send({ type: 'TOGGLE' });
  };

  const enable = () => {
    actorRef.send({ type: 'ENABLE' });
  };

  const disable = () => {
    actorRef.send({ type: 'DISABLE' });
  };

  const tick = (timestamp: number, frameTime: number) => {
    actorRef.send({ type: 'TICK', timestamp, frameTime });
  };

  return {
    fps,
    frameTime,
    memory,
    drawCalls,
    triangles,
    geometries,
    textures,
    programs,
    enabled,
    toggle,
    enable,
    disable,
    tick
  };
}
```

---

## 🔄 INTÉGRATION RENDER LOOP

```typescript
// Dans le component Three.js principal
import { usePerformance } from '../xstate-v5/hooks/usePerformance';

function ThreeCanvas() {
  const { tick } = usePerformance();

  useFrame((state, delta) => {
    const now = performance.now();
    const frameTime = delta * 1000;  // Convert to ms

    // Update performance stats
    tick(now, frameTime);

    // Render
    renderer.render(scene, camera);
  });

  return <Canvas>...</Canvas>;
}
```

---

## ✅ CRITÈRES DE VALIDATION

### **Fonctionnel**
- ✅ FPS calculé correctement (update every 1s)
- ✅ Frame time mesuré en ms
- ✅ Memory usage affiché (si disponible)
- ✅ Renderer info (draws, triangles, geometries, textures)
- ✅ Toggle enabled/disabled fonctionne
- ✅ Overlay visible en coin supérieur gauche

### **Technique**
- ✅ TICK event appelé chaque frame
- ✅ Update interval respecté (1000ms)
- ✅ Vérification `performance.memory` availability
- ✅ Pas de mutation directe du context
- ✅ FPS color (green/yellow/red) selon valeur

### **Performance**
- ✅ Impact < 0.5ms par frame
- ✅ Pas de memory leak
- ✅ Pas de re-renders inutiles

---

## ➡️ PROCHAINE ÉTAPE

**Voir [D03_CODE_EXTENSION.md](D03_CODE_EXTENSION.md)** pour le code complet.

---

**FIN SPÉCIFICATIONS PHASE D**
