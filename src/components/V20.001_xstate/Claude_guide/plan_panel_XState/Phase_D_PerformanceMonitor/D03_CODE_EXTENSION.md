# 💻 PHASE D - CODE : PerformanceMonitor

**Date** : 3 octobre 2025
**Objectif** : Code complet pour créer PerformanceMonitor

---

## 📁 FICHIERS À CRÉER

### **1. Créer : performanceMonitor.ts** (machine)
### **2. Créer : usePerformance.ts** (hook)
### **3. Créer : PerformanceOverlay.tsx** (UI component)
### **4. Créer : performanceOverlay.css** (styles)

---

## 1️⃣ CRÉER : performanceMonitor.ts

**Chemin** : `xstate-v5/actors/performance/performanceMonitor.ts`

```typescript
// xstate-v5/actors/performance/performanceMonitor.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';

export interface PerformanceContext {
  renderer: THREE.WebGLRenderer | null;

  // Métriques
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

  // Tracking
  lastUpdateTime: number;
  frameCount: number;
}

export type PerformanceEvents =
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }
  | { type: 'ENABLE' }
  | { type: 'DISABLE' }
  | { type: 'TOGGLE' }
  | { type: 'TICK'; timestamp: number; frameTime: number }
  | { type: 'SET_UPDATE_INTERVAL'; interval: number };

export const performanceMonitor = setup({
  types: {} as {
    context: PerformanceContext;
    events: PerformanceEvents;
  },
  guards: {
    isEnabled: ({ context }) => context.enabled
  },
  actions: {
    updateStats: assign(({ context, event }) => {
      if (!context.enabled || !context.renderer) return {};
      if (event.type !== 'TICK') return {};

      const now = event.timestamp;
      const delta = now - context.lastUpdateTime;

      // Update every updateInterval ms
      if (delta >= context.updateInterval) {
        // Calculate FPS
        const fps = Math.round((context.frameCount * 1000) / delta);

        // Frame time (average)
        const frameTime = delta / context.frameCount;

        // Memory (Chrome/Edge only)
        let memoryUsed = 0;
        let memoryLimit = 0;
        if (performance.memory) {
          memoryUsed = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
          memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024));
        }

        // Renderer info
        const info = context.renderer.info;
        const drawCalls = info.render.calls;
        const triangles = info.render.triangles;
        const geometries = info.memory.geometries;
        const textures = info.memory.textures;
        const programs = info.programs?.length || 0;

        console.log(`[PerformanceMonitor] FPS: ${fps}, Frame: ${frameTime.toFixed(2)}ms, Draws: ${drawCalls}, Tris: ${triangles}`);

        return {
          fps,
          frameTime,
          memory: { used: memoryUsed, limit: memoryLimit },
          drawCalls,
          triangles,
          geometries,
          textures,
          programs,
          frameCount: 0,
          lastUpdateTime: now
        };
      } else {
        // Just increment frame count
        return {
          frameCount: context.frameCount + 1
        };
      }
    }),

    resetCounters: assign({
      frameCount: 0,
      lastUpdateTime: () => performance.now()
    })
  }
}).createMachine({
  id: 'performance',
  initial: 'idle',
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
    updateInterval: 1000,

    lastUpdateTime: 0,
    frameCount: 0
  },
  states: {
    idle: {
      on: {
        SET_RENDERER: {
          target: 'ready',
          actions: [
            assign({ renderer: ({ event }) => event.renderer }),
            'resetCounters'
          ]
        }
      }
    },
    ready: {
      on: {
        ENABLE: {
          actions: [
            assign({ enabled: true }),
            'resetCounters'
          ]
        },
        DISABLE: {
          actions: assign({ enabled: false })
        },
        TOGGLE: {
          actions: [
            assign({ enabled: ({ context }) => !context.enabled }),
            'resetCounters'
          ]
        },
        TICK: {
          actions: 'updateStats'
        },
        SET_UPDATE_INTERVAL: {
          actions: assign({ updateInterval: ({ event }) => event.interval })
        }
      }
    }
  }
});
```

---

## 2️⃣ CRÉER : usePerformance.ts

**Chemin** : `xstate-v5/hooks/usePerformance.ts`

```typescript
// xstate-v5/hooks/usePerformance.ts
import { useSelector, useActorRef } from '@xstate/react';
import { performanceMonitor } from '../actors/performance/performanceMonitor';

export function usePerformance() {
  const actorRef = useActorRef(performanceMonitor);

  // Métriques
  const fps = useSelector(actorRef, (state) => state.context.fps);
  const frameTime = useSelector(actorRef, (state) => state.context.frameTime);
  const memory = useSelector(actorRef, (state) => state.context.memory);
  const drawCalls = useSelector(actorRef, (state) => state.context.drawCalls);
  const triangles = useSelector(actorRef, (state) => state.context.triangles);
  const geometries = useSelector(actorRef, (state) => state.context.geometries);
  const textures = useSelector(actorRef, (state) => state.context.textures);
  const programs = useSelector(actorRef, (state) => state.context.programs);

  // Configuration
  const enabled = useSelector(actorRef, (state) => state.context.enabled);

  // Actions
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

  const setUpdateInterval = (interval: number) => {
    actorRef.send({ type: 'SET_UPDATE_INTERVAL', interval });
  };

  return {
    // State
    fps,
    frameTime,
    memory,
    drawCalls,
    triangles,
    geometries,
    textures,
    programs,
    enabled,

    // Actions
    toggle,
    enable,
    disable,
    tick,
    setUpdateInterval
  };
}
```

---

## 3️⃣ CRÉER : PerformanceOverlay.tsx

**Chemin** : `xstate-v5/components/PerformanceOverlay.tsx`

```typescript
// xstate-v5/components/PerformanceOverlay.tsx
import React from 'react';
import { usePerformance } from '../hooks/usePerformance';
import './performanceOverlay.css';

export function PerformanceOverlay() {
  const {
    fps,
    frameTime,
    memory,
    drawCalls,
    triangles,
    geometries,
    textures,
    programs,
    enabled,
    toggle
  } = usePerformance();

  if (!enabled) return null;

  return (
    <div className="performance-overlay">
      <div className="performance-header">
        <span>⚡ Performance</span>
        <button onClick={toggle} className="close-btn">×</button>
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
        {memory.limit > 0 && (
          <div className="stat">
            <span className="label">Memory:</span>
            <span className="value">{memory.used} MB</span>
          </div>
        )}
        <div className="stat">
          <span className="label">Draws:</span>
          <span className="value">{drawCalls}</span>
        </div>
        <div className="stat">
          <span className="label">Tris:</span>
          <span className="value">{formatNumber(triangles)}</span>
        </div>
        <div className="stat">
          <span className="label">Geos:</span>
          <span className="value">{geometries}</span>
        </div>
        <div className="stat">
          <span className="label">Textures:</span>
          <span className="value">{textures}</span>
        </div>
        <div className="stat">
          <span className="label">Programs:</span>
          <span className="value">{programs}</span>
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
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
```

---

## 4️⃣ CRÉER : performanceOverlay.css

**Chemin** : `xstate-v5/components/performanceOverlay.css`

```css
/* xstate-v5/components/performanceOverlay.css */

.performance-overlay {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  z-index: 9999;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 6px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.stat .label {
  color: #aaa;
  margin-right: 10px;
}

.stat .value {
  font-weight: bold;
  text-align: right;
}

/* FPS color coding */
.stat.green .value {
  color: #4ade80;
}

.stat.yellow .value {
  color: #fbbf24;
}

.stat.red .value {
  color: #f87171;
}
```

---

## 5️⃣ INTÉGRATION RENDER LOOP

**Dans votre component Three.js principal** :

```typescript
// Example: ThreeCanvas.tsx
import { useFrame } from '@react-three/fiber';
import { usePerformance } from '../xstate-v5/hooks/usePerformance';

export function ThreeCanvas() {
  const { tick } = usePerformance();

  useFrame((state, delta) => {
    const now = performance.now();
    const frameTime = delta * 1000;  // Convert to ms

    // Update performance stats
    tick(now, frameTime);

    // Your render logic...
  });

  return (
    <>
      <PerformanceOverlay />
      {/* Your 3D scene */}
    </>
  );
}
```

---

## 6️⃣ SPAWN DANS applicationMachine

**Si vous avez un applicationMachine** :

```typescript
// xstate-v5/actors/application/applicationMachine.ts
import { performanceMonitor } from '../performance/performanceMonitor';

export const applicationMachine = setup({
  actors: {
    performanceMonitor
  }
}).createMachine({
  context: ({ spawn }) => ({
    performanceRef: spawn(performanceMonitor, { systemId: 'performance' })
  })
});
```

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] `performanceMonitor.ts` créé avec machine complète
- [ ] `usePerformance.ts` créé (hook)
- [ ] `PerformanceOverlay.tsx` créé (UI component)
- [ ] `performanceOverlay.css` créé (styles)
- [ ] TICK event appelé dans render loop
- [ ] TypeScript compile sans erreurs
- [ ] Imports corrects (THREE, xstate, React)
- [ ] Console.log présents pour debug
- [ ] FPS color coding fonctionne

---

## ➡️ PROCHAINE ÉTAPE

**Voir [D04_TESTS.md](D04_TESTS.md)** pour tester le code.

---

**FIN CODE PHASE D**
