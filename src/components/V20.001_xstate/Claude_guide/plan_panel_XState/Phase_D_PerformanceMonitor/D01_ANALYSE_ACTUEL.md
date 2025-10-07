# 🔍 PHASE D - ANALYSE ACTUEL : PerformanceMonitor

**Date** : 3 octobre 2025
**Objectif** : Analyser l'état actuel du monitoring de performance

---

## 📊 ÉTAT ACTUEL

### **Fichier existant : performanceMonitor.ts ?**

**Statut** : ❓ **À VÉRIFIER**

Il faut vérifier si un système de monitoring existe déjà dans le projet.

---

## 🔍 CE QUE V6 ZUSTAND AVAIT

D'après la recherche GPT approfondie, V6 avait un PerformanceMonitor avec :

### **Métriques collectées**
```typescript
{
  fps: number;           // Frames per second (0-60+)
  frameTime: number;     // Milliseconds par frame (16.67ms = 60fps)
  memory: {
    used: number;        // MB utilisés
    limit: number;       // MB limite (si disponible)
  };
  drawCalls: number;     // Nombre d'appels de rendu
  triangles: number;     // Nombre de triangles rendus
  geometries: number;    // Nombre de géométries en mémoire
  textures: number;      // Nombre de textures en mémoire
}
```

---

### **Affichage UI**

V6 avait un petit panneau de stats :

```
┌─────────────────────┐
│ ⚡ Performance      │
├─────────────────────┤
│ FPS:      60        │
│ Frame:    16.67 ms  │
│ Memory:   120 MB    │
│ Draws:    45        │
│ Tris:     12.5K     │
└─────────────────────┘
```

**Position** : Coin supérieur gauche de l'écran (overlay transparent)

---

## 🎯 FONCTIONNALITÉS V6

### **1. FPS Counter**

```typescript
let lastTime = performance.now();
let frames = 0;
let fps = 60;

function updateFPS() {
  frames++;
  const now = performance.now();
  const delta = now - lastTime;

  if (delta >= 1000) {  // Update every second
    fps = Math.round((frames * 1000) / delta);
    frames = 0;
    lastTime = now;
  }
}
```

---

### **2. Memory Usage**

```typescript
// ⚠️ NAVIGATEUR SEULEMENT : Chrome/Edge
if (performance.memory) {
  const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
  const limitMB = performance.memory.jsHeapSizeLimit / (1024 * 1024);
}
```

**Note** : `performance.memory` n'existe que dans Chrome/Edge (pas Firefox/Safari)

---

### **3. Renderer Info**

```typescript
// Three.js renderer.info
const info = renderer.info;

drawCalls = info.render.calls;
triangles = info.render.triangles;
geometries = info.memory.geometries;
textures = info.memory.textures;
```

---

### **4. Frame Time**

```typescript
// Temps pour render une frame
const frameStart = performance.now();
renderer.render(scene, camera);
const frameEnd = performance.now();
const frameTime = frameEnd - frameStart;
```

---

## ⚠️ CONTRAINTES TECHNIQUES

### **1. performance.memory pas universel**

```typescript
// ✅ Chrome/Edge
if (performance.memory) {
  console.log('Memory:', performance.memory.usedJSHeapSize);
}

// ❌ Firefox/Safari
// performance.memory = undefined
```

**Solution** : Vérifier disponibilité avant utilisation

---

### **2. renderer.info réinitialisé à chaque frame**

```typescript
// ❌ PAS OK : Lire après render
renderer.render(scene, camera);
console.log(renderer.info.render.calls);  // Déjà réinitialisé à 0

// ✅ OK : Lire avant reset
const calls = renderer.info.render.calls;
renderer.render(scene, camera);
console.log(calls);  // Valeur de la frame précédente
```

---

### **3. Performance impact**

Collecter des stats a un coût :
- `performance.now()` : ~0.001ms (négligeable)
- `renderer.info` : ~0.01ms (négligeable)
- `performance.memory` : ~0.1ms (petit impact)

**Total** : < 0.2ms par frame (acceptable)

---

## 🔧 ARCHITECTURE XState v5

### **Option A : Machine séparée (performanceMonitor.machine.ts)**

```typescript
interface PerformanceContext {
  fps: number;
  frameTime: number;
  memory: { used: number; limit: number };
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  enabled: boolean;
}
```

**Avantages** :
- ✅ Séparation des préoccupations
- ✅ Peut être activé/désactivé facilement
- ✅ Pas de pollution du applicationMachine

**Inconvénients** :
- ❌ Doit être spawn dans applicationMachine
- ❌ Un acteur de plus

---

### **Option B : Service réutilisable (pas de machine)**

```typescript
// xstate-v5/services/performance/collectStats.ts
export function collectPerformanceStats(renderer: THREE.WebGLRenderer) {
  return {
    fps: calculateFPS(),
    frameTime: measureFrameTime(),
    memory: getMemoryUsage(),
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures
  };
}
```

**Avantages** :
- ✅ Simple, pas de machine supplémentaire
- ✅ Appelé dans la boucle de rendu
- ✅ Léger

**Inconvénients** :
- ❌ Pas de state management
- ❌ Doit être géré manuellement

---

## 📊 RECOMMANDATION

**Option A (Machine séparée)** est meilleure car :

1. **Cohérence** : Tout passe par XState v5
2. **State management** : enabled/disabled facile
3. **React intégration** : Hook `usePerformance()` simple
4. **Actor pattern** : Spawn dans applicationMachine

---

## 🎨 UI ATTENDUE

### **Variante 1 : Overlay coin supérieur gauche**

```
┌─────────────────────┐
│ ⚡ Performance      │
├─────────────────────┤
│ FPS:      60        │ ← Vert si > 55, jaune 30-55, rouge < 30
│ Frame:    16.67 ms  │
│ Memory:   120 MB    │
│ Draws:    45        │
│ Tris:     12.5K     │
│ Geos:     8         │
│ Textures: 12        │
└─────────────────────┘
```

---

### **Variante 2 : Intégré dans ControlPanel (Tab Debug)**

```
┌─────────────────────────────────────────┐
│ 🐛 Debug / Performance                  │
├─────────────────────────────────────────┤
│                                         │
│ ⚡ Performance Monitor                  │
│ [✅ Enabled]                            │
│                                         │
│ FPS:           60                       │
│ Frame Time:    16.67 ms                 │
│ Memory Used:   120 MB / 512 MB          │
│ Draw Calls:    45                       │
│ Triangles:     12,500                   │
│ Geometries:    8                        │
│ Textures:      12                       │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🔧 Renderer Info                       │
│ Programs:      15                       │
│ Lines:         0                        │
│ Points:        0                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📋 VALEURS PAR DÉFAUT

```typescript
context: {
  fps: 60,
  frameTime: 16.67,
  memory: { used: 0, limit: 0 },
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  enabled: true  // Activé par défaut
}
```

---

## ✅ RÉCAPITULATIF

### **Ce qui existe**
❓ À vérifier (peut-être rien)

### **Ce qu'il faut créer**
1. ✅ `performanceMonitor.machine.ts` avec context
2. ✅ Service `collectStats.ts` pour collecter métriques
3. ✅ Service `calculateFPS.ts` pour FPS counter
4. ✅ Hook `usePerformance.ts`
5. ✅ Component `PerformanceOverlay.tsx` (UI overlay)
6. ✅ Intégration dans applicationMachine (spawn)

---

## ➡️ PROCHAINE ÉTAPE

**Voir [D02_SPECIFICATIONS.md](D02_SPECIFICATIONS.md)** pour l'architecture complète.

---

**FIN ANALYSE PHASE D**
