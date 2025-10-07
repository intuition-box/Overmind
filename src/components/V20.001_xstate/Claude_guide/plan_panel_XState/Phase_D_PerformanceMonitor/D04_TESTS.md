# ✅ PHASE D - TESTS : Validation PerformanceMonitor

**Date** : 3 octobre 2025
**Objectif** : Tester que PerformanceMonitor fonctionne correctement

---

## 🎯 STRATÉGIE DE TESTS

### **1. Tests Console (rapide, sans UI)**
### **2. Tests Manuels UI**
### **3. Tests Unitaires (optionnel)**

---

## 1️⃣ TESTS CONSOLE (SANS UI)

### **Test 1 : Machine démarre correctement**

```typescript
// Dans console navigateur (DevTools)
import { createActor } from 'xstate';
import { performanceMonitor } from './xstate-v5/actors/performance/performanceMonitor';

const actor = createActor(performanceMonitor);
actor.start();

console.log('Initial state:', actor.getSnapshot().value);
// Attendu: "idle"

console.log('Initial context:', actor.getSnapshot().context);
// Attendu: { fps: 60, enabled: true, frameCount: 0, ... }
```

**✅ SUCCÈS SI** :
- State = `idle`
- `enabled` = true
- `fps` = 60
- `updateInterval` = 1000

---

### **Test 2 : SET_RENDERER passe en ready**

```typescript
import * as THREE from 'three';
const testRenderer = new THREE.WebGLRenderer();

actor.send({ type: 'SET_RENDERER', renderer: testRenderer });

console.log('State:', actor.getSnapshot().value);
// Attendu: "ready"

console.log('Renderer set:', actor.getSnapshot().context.renderer !== null);
// Attendu: true

console.log('Counters reset:', actor.getSnapshot().context.lastUpdateTime > 0);
// Attendu: true
```

**✅ SUCCÈS SI** :
- State passe de `idle` à `ready`
- `context.renderer` contient le renderer
- `lastUpdateTime` > 0
- `frameCount` = 0

---

### **Test 3 : TOGGLE change enabled**

```typescript
console.log('Enabled before:', actor.getSnapshot().context.enabled);
// Attendu: true

actor.send({ type: 'TOGGLE' });

console.log('Enabled after:', actor.getSnapshot().context.enabled);
// Attendu: false

actor.send({ type: 'TOGGLE' });

console.log('Enabled after 2nd toggle:', actor.getSnapshot().context.enabled);
// Attendu: true
```

**✅ SUCCÈS SI** :
- Toggle change `enabled` de true → false → true
- Counters réinitialisés après toggle ON

---

### **Test 4 : TICK incrémente frameCount**

```typescript
const before = actor.getSnapshot().context.frameCount;

actor.send({ type: 'TICK', timestamp: performance.now(), frameTime: 16.67 });

const after = actor.getSnapshot().context.frameCount;

console.log('Frame count increased:', after > before);
// Attendu: true
```

**✅ SUCCÈS SI** :
- `frameCount` incrémente de 1 après chaque TICK

---

### **Test 5 : Update après 1000ms**

```typescript
// Simuler 60 frames sur 1 seconde
const startTime = performance.now();

for (let i = 0; i < 60; i++) {
  const timestamp = startTime + (i * 16.67);
  actor.send({ type: 'TICK', timestamp, frameTime: 16.67 });
}

const ctx = actor.getSnapshot().context;

console.log('FPS calculated:', ctx.fps);
// Attendu: ~60

console.log('Frame count reset:', ctx.frameCount);
// Attendu: 0 (reset after update)
```

**✅ SUCCÈS SI** :
- FPS calculé = ~60
- `frameCount` réinitialisé à 0 après update
- Console affiche : `[PerformanceMonitor] FPS: 60, Frame: 16.67ms, ...`

---

### **Test 6 : Disabled ignore TICK**

```typescript
actor.send({ type: 'DISABLE' });

const beforeFPS = actor.getSnapshot().context.fps;

// Send 60 frames
for (let i = 0; i < 60; i++) {
  actor.send({ type: 'TICK', timestamp: performance.now(), frameTime: 16.67 });
}

const afterFPS = actor.getSnapshot().context.fps;

console.log('FPS unchanged when disabled:', beforeFPS === afterFPS);
// Attendu: true
```

**✅ SUCCÈS SI** :
- FPS ne change pas quand `enabled = false`
- Pas de console.log de PerformanceMonitor

---

### **Test 7 : Renderer info collecté**

```typescript
// (Suite du test 2)
actor.send({ type: 'ENABLE' });

// Simuler 60 frames
const startTime = performance.now();
for (let i = 0; i < 60; i++) {
  actor.send({ type: 'TICK', timestamp: startTime + (i * 16.67), frameTime: 16.67 });
}

const ctx = actor.getSnapshot().context;

console.log('Draw calls:', ctx.drawCalls);
console.log('Triangles:', ctx.triangles);
console.log('Geometries:', ctx.geometries);
console.log('Textures:', ctx.textures);
// Attendu: Valeurs de renderer.info
```

**✅ SUCCÈS SI** :
- `drawCalls` >= 0
- `triangles` >= 0
- `geometries` >= 0
- `textures` >= 0

---

### **Test 8 : Memory collecté (Chrome only)**

```typescript
const ctx = actor.getSnapshot().context;

if (performance.memory) {
  console.log('Memory used:', ctx.memory.used);
  console.log('Memory limit:', ctx.memory.limit);
  // Attendu: Valeurs > 0
} else {
  console.log('performance.memory not available (Firefox/Safari)');
  console.log('Memory used:', ctx.memory.used);
  // Attendu: 0
}
```

**✅ SUCCÈS SI** :
- **Chrome/Edge** : `memory.used` > 0, `memory.limit` > 0
- **Firefox/Safari** : `memory.used` = 0, `memory.limit` = 0 (pas d'erreur)

---

## 2️⃣ TESTS MANUELS UI

### **Test UI 1 : Overlay visible**
1. Lancer l'application
2. **Attendu** : Overlay performance visible en coin supérieur gauche
3. Vérifier que FPS s'affiche et s'update

### **Test UI 2 : FPS color coding**
1. Observer le FPS
2. **Si FPS >= 55** : Valeur en vert
3. **Si FPS 30-55** : Valeur en jaune
4. **Si FPS < 30** : Valeur en rouge

### **Test UI 3 : Toggle fermeture**
1. Cliquer sur le bouton "×" dans l'overlay
2. **Attendu** : Overlay disparaît
3. Vérifier que TICK events sont toujours ignorés (enabled = false)

### **Test UI 4 : Métriques s'actualisent**
1. Observer les valeurs pendant 3 secondes
2. **Attendu** :
   - FPS s'update chaque seconde
   - Frame time s'update chaque seconde
   - Draw calls change selon la scène

### **Test UI 5 : Memory affichée (Chrome)**
1. Ouvrir dans Chrome
2. **Attendu** : Ligne "Memory: XX MB" visible
3. Ouvrir dans Firefox
4. **Attendu** : Ligne "Memory" absente (pas d'erreur)

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `xstate-v5/tests/performanceMonitor.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { performanceMonitor } from '../actors/performance/performanceMonitor';
import * as THREE from 'three';

describe('performanceMonitor', () => {
  it('devrait démarrer en état idle', () => {
    const actor = createActor(performanceMonitor);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.enabled).toBe(true);
  });

  it('devrait passer en ready après SET_RENDERER', () => {
    const actor = createActor(performanceMonitor);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });

    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.renderer).toBe(renderer);
  });

  it('devrait toggle enabled', () => {
    const actor = createActor(performanceMonitor);
    actor.start();

    const initial = actor.getSnapshot().context.enabled;

    actor.send({ type: 'TOGGLE' });

    expect(actor.getSnapshot().context.enabled).toBe(!initial);
  });

  it('devrait incrémenter frameCount sur TICK', () => {
    const actor = createActor(performanceMonitor);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });

    const before = actor.getSnapshot().context.frameCount;

    actor.send({ type: 'TICK', timestamp: performance.now(), frameTime: 16.67 });

    const after = actor.getSnapshot().context.frameCount;

    expect(after).toBeGreaterThan(before);
  });

  it('devrait calculer FPS après 1000ms', () => {
    const actor = createActor(performanceMonitor);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });

    const startTime = performance.now();

    // Simulate 60 frames over 1 second
    for (let i = 0; i < 60; i++) {
      actor.send({ type: 'TICK', timestamp: startTime + (i * 16.67), frameTime: 16.67 });
    }

    const ctx = actor.getSnapshot().context;

    expect(ctx.fps).toBeGreaterThan(0);
    expect(ctx.frameCount).toBe(0); // Reset after update
  });

  it('devrait ignorer TICK quand disabled', () => {
    const actor = createActor(performanceMonitor);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });
    actor.send({ type: 'DISABLE' });

    const beforeFPS = actor.getSnapshot().context.fps;

    actor.send({ type: 'TICK', timestamp: performance.now(), frameTime: 16.67 });

    const afterFPS = actor.getSnapshot().context.fps;

    expect(afterFPS).toBe(beforeFPS);
  });
});
```

**Exécuter** : `npm run test`

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] Machine démarre en état `idle`, enabled = true
- [ ] SET_RENDERER passe en `ready` et réinitialise counters
- [ ] TOGGLE change enabled true/false
- [ ] TICK incrémente frameCount
- [ ] FPS calculé correctement après 1000ms
- [ ] Frame time calculé (average)
- [ ] Memory collectée (si disponible)
- [ ] Renderer info collecté (draws, triangles, geos, textures)
- [ ] Disabled ignore TICK events
- [ ] Overlay visible en coin supérieur gauche

### **Technique**
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur console navigateur
- [ ] Vérification `performance.memory` availability
- [ ] Pas de mutation directe du context
- [ ] Console.log présents pour debug
- [ ] FPS color coding (green/yellow/red)

### **Performance**
- [ ] Impact < 0.5ms par frame
- [ ] Pas de memory leaks
- [ ] Pas de re-renders inutiles
- [ ] Update interval respecté (1000ms)

---

## 🐛 BUGS POTENTIELS À SURVEILLER

### **Bug 1 : Division par zéro**
**Symptôme** : FPS = Infinity ou NaN
**Cause** : `frameCount = 0` lors du calcul FPS
**Solution** : Vérifier `frameCount > 0` avant calcul

### **Bug 2 : performance.memory undefined**
**Symptôme** : Erreur "Cannot read property 'usedJSHeapSize' of undefined"
**Cause** : `performance.memory` pas disponible (Firefox/Safari)
**Solution** : Vérifier `if (performance.memory)` avant accès

### **Bug 3 : renderer.info.programs undefined**
**Symptôme** : Erreur "Cannot read property 'length' of undefined"
**Cause** : `renderer.info.programs` pas toujours disponible
**Solution** : Utiliser `info.programs?.length || 0`

### **Bug 4 : Counters pas réinitialisés après toggle**
**Symptôme** : FPS faux après réactivation
**Cause** : `lastUpdateTime` pas reset
**Solution** : Appeler `resetCounters` action après TOGGLE/ENABLE

### **Bug 5 : FPS stuck à 60**
**Symptôme** : FPS toujours 60 même si lag
**Cause** : frameTime pas utilisé, ou update interval trop court
**Solution** : S'assurer que delta >= updateInterval

---

## ✅ CRITÈRES DE SUCCÈS

**Phase D validée SI** :
- ✅ Tous les tests console passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console navigateur
- ✅ FPS calculé correctement et s'update chaque seconde
- ✅ Overlay visible avec toutes métriques
- ✅ Toggle enable/disable fonctionne
- ✅ performance.memory géré correctement (Chrome vs Firefox)
- ✅ FPS color coding fonctionne

---

## ➡️ PROCHAINE ÉTAPE

**Si Phase D validée** → Passer à Phase G (effectsMachine) ou Phase H (sceneMachine)

---

**FIN TESTS PHASE D**
