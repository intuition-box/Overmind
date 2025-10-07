# 💾 C09 - MEMORY MANAGEMENT

**Date recherche** : 29 septembre 2025
**Session** : C09 - Memory Management
**Objectif** : Patterns gestion mémoire XState v5 + Three.js pour Overmind
**Status** : ✅ **RECHERCHE COMPLÉTÉE**
**Audit** : 30 septembre 2025 - ENRICHI v5 + GPU LEAKS 2025

---

## 🎯 QUESTIONS MEMORY MANAGEMENT CRITIQUES

### **Q1: XSTATE MEMORY LEAK PREVENTION**
**Question** : Patterns pour éviter memory leaks avec actors/services ?
**Contexte** : Multiple spawned actors, event listeners, subscriptions
**Impact** : Browser memory growth + eventual crash + GC pressure

### **Q2: THREE.JS RESOURCE DISPOSAL**
**Question** : Stratégies disposal textures/geometries/materials ?
**Contexte** : Eye model 484 bones + textures + bloom effects
**Objectif** : GPU memory <512MB + clean disposal + no leaks

### **Q3: ACTOR CLEANUP PATTERNS**
**Question** : Lifecycle management spawned actors XState ?
**Contexte** : RAF service, particle actors, animation actors
**Impact** : Memory accumulation + orphaned actors + subscriptions

### **Q4: GARBAGE COLLECTION OPTIMIZATION**
**Question** : Patterns pour GC-friendly code dans render loop ?
**Contexte** : 60 FPS constraint + object pooling + array management
**Objectif** : Minimize GC pauses + smooth performance

---

## ✅ RÉSULTATS RECHERCHE CONSOLIDÉS

### **TROUVAILLES CLÉS**

#### **1. XSTATE V5 ACTOR CLEANUP - DEEP PERSISTENCE**
**Source** : Stately.ai docs + StudyRaid + Recherche 2025
**Finding** : **Automatic cleanup amélioré + deep persistence impact**
- **Deep persistence v5** : Actors recursively persisted (tout l'arbre)
- **Automatic cleanup** : Parent state exit → automatic child actor stop
- **Root actor stop()** : Cascade stop de tout l'actor system
- **stopChild modern** : `stopChild('child')` + context reference cleanup
- **Memory amplification** : Deep persistence = plus de mémoire par actor tree
- **Performance cost** : 200k elements = very low performance (validation 2025)

#### **2. THREE.JS GPU LEAKS - 2025 REALITY CHECK**
**Source** : Medium 2025 + Three.js forum + GPU crash cases
**Finding** : **2GB GPU leak en 3 minutes possible - patterns critiques**
- **Classic leak case** : 2GB GPU memory devoured en <3 minutes documenté
- **Disposal order** : `scene.remove()` → `geometry.dispose()` → `material.dispose()` → `texture.dispose()`
- **WebGL context leaks** : renderer.dispose() obligatoire SPA navigation
- **GPU context exhaustion** : WEBGL_lose_context monitoring nécessaire
- **Material arrays** : Check `Array.isArray(material)` avant disposal
- **Renderer cleanup** : `renderer.dispose()` pour complete shutdown
- **GPU tracking** : `renderer.info.memory` pour monitoring
- **Eye model impact** : 484 bones + textures = high GPU pressure sans disposal

#### **3. JAVASCRIPT GC OPTIMIZATION**
**Source** : Chrome DevTools docs + Performance blogs + Stack Overflow
**Finding** : **Object pooling + pre-allocation patterns critiques 60 FPS**
- **Object pooling** : Réutiliser vs new objects (reduce GC stutter 50ms→10ms)
- **Pre-allocation** : BufferGeometry arrays, Vector3 pools
- **GC timing** : Profile avec Chrome timeline, éviter allocations dans RAF loop
- **Memory monitoring** : `performance.memory` API pour real-time tracking
- **Particle systems** : Pool pattern essentiel pour 1000+ particles

#### **4. WEAKREF/FINALIZATIONREGISTRY**
**Source** : MDN + Modern JS patterns + Browser compatibility
**Finding** : **Utile pour caches avancés mais comportement non-déterministe**
- **WeakRef** : Cache patterns où objets peuvent être GC'd
- **FinalizationRegistry** : Cleanup callbacks mais timing imprévisible
- **Compatibility** : Chrome/Firefox/Safari récents OK
- **Production** : Préférer explicit cleanup pour predictable behavior
- **Overmind usage** : Exploration pour texture caching, pas mission-critical

#### **5. MEMORY PRESSURE DETECTION**
**Source** : Performance monitoring + Chrome memory API
**Finding** : **Proactive monitoring avec thresholds + automated cleanup**
- **Detection** : `performance.memory.usedJSHeapSize` monitoring
- **Thresholds** : 256MB normal, 512MB warning, >1GB cleanup trigger
- **GPU tracking** : `renderer.info.memory.textures` + geometries count
- **Response patterns** : Deferred cleanup vs immediate disposal
- **Auto-cleanup** : XState machine pour memory pressure response

---

## 🔍 PATTERNS MEMORY MANAGEMENT VALIDÉS

### **PATTERN 1: XSTATE ACTOR LIFECYCLE**

**Use case Overmind** : Clean spawned actors management

```javascript
// Overmind Actor Lifecycle Management
const actorLifecycleMachine = createMachine({
  context: {
    actors: new Map(),
    subscriptions: new Map(),
    maxActors: 100
  },

  on: {
    SPAWN_ACTOR: {
      guard: ({ context }) => context.actors.size < context.maxActors,
      actions: [
        assign({
          actors: ({ context, spawn, event }) => {
            const actor = spawn(event.machine, {
              id: event.id,
              input: event.input
            });

            const newActors = new Map(context.actors);
            newActors.set(event.id, actor);
            return newActors;
          },
          subscriptions: ({ context, event }) => {
            const actor = context.actors.get(event.id);
            const subscription = actor.subscribe({
              next: (state) => {
                // Handle state updates
              },
              error: (err) => {
                console.error(`Actor ${event.id} error:`, err);
              },
              complete: () => {
                // Auto-cleanup on complete
                send({ type: 'CLEANUP_ACTOR', id: event.id });
              }
            });

            const newSubs = new Map(context.subscriptions);
            newSubs.set(event.id, subscription);
            return newSubs;
          }
        })
      ]
    },

    CLEANUP_ACTOR: {
      actions: [
        ({ context, event }) => {
          // Unsubscribe first
          const subscription = context.subscriptions.get(event.id);
          if (subscription) {
            subscription.unsubscribe();
          }

          // Stop actor
          const actor = context.actors.get(event.id);
          if (actor) {
            actor.stop();
          }
        },
        assign({
          actors: ({ context, event }) => {
            const newActors = new Map(context.actors);
            newActors.delete(event.id);
            return newActors;
          },
          subscriptions: ({ context, event }) => {
            const newSubs = new Map(context.subscriptions);
            newSubs.delete(event.id);
            return newSubs;
          }
        })
      ]
    },

    CLEANUP_ALL: {
      actions: [
        ({ context }) => {
          // Cleanup all subscriptions
          context.subscriptions.forEach((sub) => sub.unsubscribe());
          // Stop all actors
          context.actors.forEach((actor) => actor.stop());
        },
        assign({
          actors: () => new Map(),
          subscriptions: () => new Map()
        })
      ]
    }
  },

  exit: [
    // Cleanup on machine exit
    ({ context }) => {
      context.subscriptions.forEach((sub) => sub.unsubscribe());
      context.actors.forEach((actor) => actor.stop());
    }
  ]
});
```

### **PATTERN 2: THREE.JS GPU LEAK PREVENTION 2025**

**Use case Overmind** : 484 bones model + GPU leak prevention

```javascript
// Overmind Three.js Resource Manager
class ResourceManager {
  constructor() {
    this.textures = new Map();
    this.geometries = new Map();
    this.materials = new Map();
    this.meshes = new Map();
    this.disposeQueue = [];
  }

  addTexture(id, texture) {
    this.textures.set(id, {
      resource: texture,
      refCount: 1,
      size: this.calculateTextureSize(texture)
    });
  }

  addGeometry(id, geometry) {
    this.geometries.set(id, {
      resource: geometry,
      refCount: 1,
      size: this.calculateGeometrySize(geometry)
    });
  }

  addMaterial(id, material) {
    this.materials.set(id, {
      resource: material,
      refCount: 1,
      textures: this.extractTextureIds(material)
    });
  }

  incrementRef(type, id) {
    const collection = this[`${type}s`];
    if (collection.has(id)) {
      collection.get(id).refCount++;
    }
  }

  decrementRef(type, id) {
    const collection = this[`${type}s`];
    if (collection.has(id)) {
      const item = collection.get(id);
      item.refCount--;

      if (item.refCount <= 0) {
        this.disposeQueue.push({ type, id });
      }
    }
  }

  processDisposeQueue() {
    while (this.disposeQueue.length > 0) {
      const { type, id } = this.disposeQueue.shift();
      this.disposeResource(type, id);
    }
  }

  disposeResource(type, id) {
    const collection = this[`${type}s`];
    const item = collection.get(id);

    if (!item) return;

    switch(type) {
      case 'texture':
        item.resource.dispose();
        break;

      case 'geometry':
        item.resource.dispose();
        break;

      case 'material':
        // Dispose material textures first
        if (item.textures) {
          item.textures.forEach(texId => {
            this.decrementRef('texture', texId);
          });
        }
        item.resource.dispose();
        break;
    }

    collection.delete(id);
  }

  calculateTextureSize(texture) {
    const width = texture.image?.width || texture.mipmaps?.[0]?.width || 0;
    const height = texture.image?.height || texture.mipmaps?.[0]?.height || 0;
    const bytesPerPixel = 4; // RGBA
    return width * height * bytesPerPixel;
  }

  calculateGeometrySize(geometry) {
    let size = 0;
    for (const key in geometry.attributes) {
      const attribute = geometry.attributes[key];
      size += attribute.array.byteLength;
    }
    if (geometry.index) {
      size += geometry.index.array.byteLength;
    }
    return size;
  }

  getMemoryUsage() {
    let textureMemory = 0;
    let geometryMemory = 0;

    this.textures.forEach(item => {
      textureMemory += item.size;
    });

    this.geometries.forEach(item => {
      geometryMemory += item.size;
    });

    return {
      textures: textureMemory,
      geometries: geometryMemory,
      total: textureMemory + geometryMemory,
      counts: {
        textures: this.textures.size,
        geometries: this.geometries.size,
        materials: this.materials.size
      }
    };
  }

  disposeAll() {
    // Dispose in correct order
    this.materials.forEach((item, id) => this.disposeResource('material', id));
    this.geometries.forEach((item, id) => this.disposeResource('geometry', id));
    this.textures.forEach((item, id) => this.disposeResource('texture', id));

    this.textures.clear();
    this.geometries.clear();
    this.materials.clear();
    this.meshes.clear();
    this.disposeQueue = [];
  }
}
```

### **PATTERN 3: OBJECT POOLING**

**Use case Overmind** : Particle systems + temporary objects

```javascript
// Overmind Object Pool Pattern
class ObjectPool {
  constructor(factory, reset, maxSize = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    this.available = [];
    this.inUse = new Set();
    this.created = 0;
  }

  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else if (this.created < this.maxSize) {
      obj = this.factory();
      this.created++;
    } else {
      console.warn('Object pool exhausted');
      return null;
    }

    this.inUse.add(obj);
    this.reset(obj);
    return obj;
  }

  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.available.push(obj);
    }
  }

  releaseAll() {
    this.inUse.forEach(obj => {
      this.available.push(obj);
    });
    this.inUse.clear();
  }

  dispose() {
    this.available = [];
    this.inUse.clear();
    this.created = 0;
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.created,
      utilization: this.inUse.size / this.created
    };
  }
}

// Usage for particles
const particlePool = new ObjectPool(
  // Factory
  () => ({
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lifetime: 0,
    active: false
  }),
  // Reset
  (particle) => {
    particle.position.set(0, 0, 0);
    particle.velocity.set(0, 0, 0);
    particle.lifetime = 1.0;
    particle.active = true;
  },
  10000 // Max particles
);
```

### **PATTERN 4: MEMORY MONITORING**

**Use case Overmind** : Real-time memory tracking

```javascript
// Overmind Memory Monitor
const memoryMonitorMachine = createMachine({
  context: {
    memoryStats: {
      jsHeap: 0,
      gpuTextures: 0,
      gpuGeometries: 0,
      actors: 0,
      subscriptions: 0
    },
    thresholds: {
      jsHeap: 512 * 1024 * 1024, // 512MB
      gpuTotal: 512 * 1024 * 1024, // 512MB
      actors: 100
    },
    monitoring: false,
    intervalId: null
  },

  initial: 'idle',
  states: {
    idle: {
      on: {
        START_MONITORING: 'monitoring'
      }
    },

    monitoring: {
      entry: [
        assign({
          monitoring: true,
          intervalId: () => {
            return setInterval(() => {
              send({ type: 'UPDATE_MEMORY_STATS' });
            }, 1000); // Check every second
          }
        })
      ],

      on: {
        UPDATE_MEMORY_STATS: {
          actions: [
            assign({
              memoryStats: ({ context }) => {
                const stats = {
                  jsHeap: performance.memory?.usedJSHeapSize || 0,
                  gpuTextures: 0,
                  gpuGeometries: 0,
                  actors: 0,
                  subscriptions: 0
                };

                // Get Three.js stats
                if (window.renderer) {
                  stats.gpuTextures = window.renderer.info.memory.textures;
                  stats.gpuGeometries = window.renderer.info.memory.geometries;
                }

                // Get XState stats
                if (window.actorSystem) {
                  stats.actors = window.actorSystem.actors.size;
                  stats.subscriptions = window.actorSystem.subscriptions.size;
                }

                return stats;
              }
            }),

            // Check thresholds
            choose([
              {
                guard: ({ context }) =>
                  context.memoryStats.jsHeap > context.thresholds.jsHeap,
                actions: send({ type: 'MEMORY_WARNING', level: 'critical' })
              },
              {
                guard: ({ context }) =>
                  context.memoryStats.jsHeap > context.thresholds.jsHeap * 0.8,
                actions: send({ type: 'MEMORY_WARNING', level: 'high' })
              }
            ])
          ]
        },

        MEMORY_WARNING: {
          actions: [
            'logMemoryWarning',
            choose([
              {
                guard: ({ event }) => event.level === 'critical',
                actions: send({ type: 'TRIGGER_CLEANUP' })
              }
            ])
          ]
        },

        TRIGGER_CLEANUP: 'cleaning'
      },

      exit: [
        ({ context }) => {
          if (context.intervalId) {
            clearInterval(context.intervalId);
          }
        },
        assign({
          monitoring: false,
          intervalId: null
        })
      ]
    },

    cleaning: {
      entry: [
        'performGarbageCollection',
        'disposeUnusedResources',
        'compactActors'
      ],
      on: {
        CLEANUP_COMPLETE: 'monitoring'
      }
    }
  }
}, {
  actions: {
    performGarbageCollection: () => {
      // Trigger manual GC if available (Chrome with --expose-gc flag)
      if (typeof gc !== 'undefined') {
        gc();
      }
    },

    disposeUnusedResources: () => {
      // Dispose Three.js resources
      if (window.resourceManager) {
        window.resourceManager.processDisposeQueue();
      }
    },

    compactActors: () => {
      // Clean up stopped actors
      if (window.actorSystem) {
        window.actorSystem.cleanupStoppedActors();
      }
    }
  }
});
```

---

## 📊 MEMORY MANAGEMENT STRATEGIES

### **JAVASCRIPT HEAP**
- **Target** : <256MB steady state
- **Spikes** : <512MB during loading
- **GC frequency** : <1 per second
- **Object allocation** : Pool reusable objects

### **GPU MEMORY**
- **Textures** : <256MB total
- **Geometries** : <128MB total
- **Uniforms** : <32MB
- **Frame buffers** : <96MB

---

## 🎯 QUESTIONS POUR RECHERCHE

### **DESIGN QUESTIONS**

1. **Reference Counting** : Manual vs WeakRef/FinalizationRegistry ?
2. **Disposal Timing** : Immediate vs deferred cleanup ?
3. **Memory Pressure** : Detection strategies + response patterns ?
4. **Pool Sizing** : Dynamic vs fixed pool sizes ?

### **IMPLEMENTATION QUESTIONS**

1. **XState Cleanup** : Best practices actor disposal ?
2. **Three.js Disposal** : Order dependencies + timing ?
3. **Event Listeners** : Tracking + cleanup patterns ?
4. **Performance Impact** : Memory monitoring overhead ?

---

## 📈 RESEARCH TARGETS

### **PRIORITY 1: ACTOR LIFECYCLE**
- Spawned actor cleanup
- Subscription management
- Event listener tracking
- Memory leak detection

### **PRIORITY 2: GPU RESOURCES**
- Texture disposal patterns
- Geometry management
- Material lifecycle
- Render target cleanup

### **PRIORITY 3: OBJECT POOLING**
- Pool design patterns
- Size management
- Reset strategies
- Performance impact

### **PRIORITY 4: MONITORING**
- Memory profiling tools
- Leak detection
- Automated cleanup
- Threshold management

---

## 💡 QUESTIONS SPÉCIFIQUES OVERMIND

1. **Eye Model Memory** : 484 bones + textures optimal loading ?
2. **Particle Pool Size** : Dynamic adjustment based on memory ?
3. **Debug Panel Memory** : React component lifecycle impact ?
4. **Configuration Export** : Memory usage during serialization ?
5. **Scene Transitions** : Resource swap strategies ?

---

---

## 💡 LESSONS LEARNED

### **DO's - Memory Management**
- ✅ Use `stopChild()` + `assign({ ref: undefined })` pour cleanup XState actors
- ✅ Implement `type: 'final'` states pour automatic cleanup
- ✅ Return cleanup functions dans fromCallback services
- ✅ Call `dispose()` sur geometry/material/texture dans correct order
- ✅ Use object pooling pour particle systems + temporary objects
- ✅ Monitor memory avec `performance.memory` + `renderer.info.memory`
- ✅ Profile GC avec Chrome DevTools pour identifier bottlenecks

### **DON'Ts - Memory Management**
- ❌ Spawn actors sans explicit cleanup (guaranteed memory leaks)
- ❌ Forget `scene.remove()` avant `dispose()` calls
- ❌ Create new objects dans RAF loop (GC stutter)
- ❌ Ignore material arrays lors disposal (GPU memory leak)
- ❌ Rely sur WeakRef/FinalizationRegistry pour critical cleanup
- ❌ Leave event listeners sans removeEventListener
- ❌ Skip memory monitoring en production

### **OVERMIND-SPECIFIC GUIDELINES**
- **484 bones** : ✅ IMMUTABLE (NLA animations) + geometry/texture LOD + batch disposal
- **Particle systems** : Pool size 1000+ avec acquire/release pattern
- **Debug panel** : React useEffect cleanup pour event listeners
- **GLB export** : Temporary memory spikes monitoring + cleanup
- **Scene transitions** : Deferred cleanup pour smooth transitions
- **GPU budget** : <512MB total avec automated pressure response

---

## 📊 MEMORY BUDGET OVERMIND

### **JAVASCRIPT HEAP TARGETS**
- **Steady state** : <256MB
- **Loading spikes** : <512MB
- **Warning threshold** : 768MB
- **Critical cleanup** : >1GB

### **GPU MEMORY TARGETS**
- **Textures** : <256MB (with texture LOD 2048→1024→512)
- **Geometries** : <128MB (484 bones immutable + geometry LOD vertices)
- **Materials** : <64MB
- **Render targets** : <64MB (bloom effects)

### **PERFORMANCE TARGETS**
- **GC frequency** : <1 per second
- **GC duration** : <16ms (1 frame budget)
- **Object allocation** : <1MB per frame
- **Memory growth** : <50MB per minute

---

---

## 🎯 DÉCOUVERTES AUDIT C09 (ENRICHISSEMENT 2025)

### **✅ COHÉRENCES VALIDÉES**
- XState actor cleanup patterns stopChild() toujours corrects
- Three.js disposal order scene.remove() → dispose() valide
- Object pooling pour 60 FPS performance toujours pertinent
- Memory pressure thresholds concepts solides

### **🔧 CORRECTIONS CRITIQUES APPLIQUÉES**
- **Deep persistence v5** : Recursive actor persistence impact mémoire major
- **Automatic cleanup** : Parent exit → automatic child stop amélioré
- **GPU leaks reality** : 2GB en 3 minutes cases documentés 2025
- **WebGL context** : renderer.dispose() + forceContextLoss() obligatoire

### **➕ ENRICHISSEMENTS 2025**
- **WEBGL_lose_context** : Extension monitoring pour context exhaustion
- **SPA patterns** : Renderer persistence vs disposal cross-navigation
- **484 bones memory** : Bone attributes disposal + skinning data cleanup
- **Memory thresholds** : 512MB→1GB→2GB graduated response
- **Actor system cascade** : Root actor stop() = tout le système cleanup

### **⚠️ AVERTISSEMENTS CRITIQUES 484 BONES**
- **Deep persistence overhead** : 484 actors recursively persisted = major memory
- **GPU exhaustion risk** : Context loss monitoring OBLIGATOIRE
- **Bone data disposal** : skinIndex/skinWeight attributes cleanup requis
- **Performance degradation** : XState 200k elements = very low performance

### **🚀 PATTERNS OVERMIND SPÉCIALISÉS**
- **484 bone actors** : Individual cleanup avec bone-specific disposal
- **GPU leak prevention** : WebGL state reset + comprehensive texture disposal
- **Memory pressure system** : XState machine pour automated cleanup responses
- **Context loss recovery** : Graceful degradation + emergency cleanup
- **SPA navigation** : Renderer lifecycle management patterns

### **📈 CONFIANCE UPDATED**
- **Actor cleanup v5** : 95% (automatic cleanup amélioré)
- **GPU memory management** : 85% (⚠️ 2GB leaks documented)
- **484 bones memory** : 70% (deep persistence + bone data overhead)
- **Monitoring tools** : 90% (WEBGL_lose_context + modern APIs)

**STATUS** : ✅ **C09 AUDITÉ + GPU REALITY CHECK** - Memory patterns enrichis 2025
**CRITICAL** : GPU context monitoring OBLIGATOIRE pour 484 bones
**NEXT** : C10 - Testing Strategies