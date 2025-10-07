# 🏛️ SESSION F01 - ARCHITECTURE FINALE VISION CIBLE

**Date** : 1 octobre 2025
**Phase** : F - Vision Cible
**Focus** : Architecture finale système Overmind XState v5 (vision complète)
**Criticité** : HAUTE

---

## 🎯 OBJECTIF SESSION F01

**Mission** : Décrire architecture finale du système Overmind une fois construction complète.

**Vision** : Système production-ready, performant, maintenable, scalable.

**Scope** :
1. **Architecture Globale** : Vue d'ensemble système complet
2. **Layers Architecture** : Actor Model, Services, UI, Three.js
3. **Data Flow** : Comment les données circulent
4. **Communication Patterns** : Inter-actors, React-XState
5. **File Structure** : Organisation code finale

**Objectif qualité** : Architecture claire, découplée, testable, documentée

---

## 🏗️ ARCHITECTURE GLOBALE

### **Vue d'ensemble système** :

```
┌─────────────────────────────────────────────────────────────────┐
│                    OVERMIND XSTATE V5 SYSTEM                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      UI LAYER (React 18)                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │ │
│  │  │ Animation   │  │   Bloom     │  │ Performance │      │ │
│  │  │  Controls   │  │  Controls   │  │   Monitor   │      │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │ │
│  │         │                │                │              │ │
│  │         └────────────────┼────────────────┘              │ │
│  │                          │                                │ │
│  │                    ┌─────▼─────┐                         │ │
│  │                    │  Hooks    │ (useActorRef + Selector)│ │
│  │                    └─────┬─────┘                         │ │
│  └──────────────────────────┼───────────────────────────────┘ │
│                             │                                 │
│  ┌──────────────────────────▼───────────────────────────────┐ │
│  │              ACTOR MODEL LAYER (XState v5)               │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │           ROOT SYSTEM ACTOR                      │   │ │
│  │  │         (Receptionist Pattern)                   │   │ │
│  │  └───┬──────────────────────────────────────────┬───┘   │ │
│  │      │                                          │       │ │
│  │  ┌───▼────┐  ┌────────┐  ┌────────┐  ┌────────▼───┐   │ │
│  │  │ Scene  │  │  GLB   │  │ Anim   │  │   Bloom    │   │ │
│  │  │ Actor  │  │ Loader │  │ Ctrl   │  │   Actor    │   │ │
│  │  └───┬────┘  └───┬────┘  └───┬────┘  └────┬───────┘   │ │
│  │      │           │           │            │            │ │
│  └──────┼───────────┼───────────┼────────────┼────────────┘ │
│         │           │           │            │              │
│  ┌──────▼───────────▼───────────▼────────────▼────────────┐ │
│  │           SERVICES LAYER (fromPromise)                 │ │
│  │                                                        │ │
│  │  loadGLB  │ createScene │ crossfade │ compileShaders │ │
│  └──────┬───────────┬───────────┬────────────┬───────────┘ │
│         │           │           │            │             │
│  ┌──────▼───────────▼───────────▼────────────▼───────────┐ │
│  │              THREE.JS LAYER                           │ │
│  │                                                       │ │
│  │  Scene │ Renderer │ GLTFLoader │ Mixer │ Composer   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 LAYERS ARCHITECTURE

### **Layer 1 : UI Layer (React 18)**

**Responsabilité** : Interface utilisateur pure, aucune logique business

**Components** :
- `V3Scene.tsx` : Root component (canvas + panels layout)
- `AnimationControlsPanel/` : Contrôle 29 animations + crossfade
- `BloomColorPicker/` : Sélection couleur IRIS debounced 200ms
- `BloomControlsPanel/` : Threshold/strength/radius debounced 50ms
- `PerformanceMonitor/` : Metrics temps réel (FPS, draw calls, memory)

**Caractéristiques** :
- ✅ Pure presentational components (zero business logic)
- ✅ PropTypes validation
- ✅ CSS modules (scoped styling)
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ Responsive design (mobile + desktop)

---

### **Layer 2 : Hooks Layer (React ↔ XState Bridge)**

**Responsabilité** : Bridge entre React components et XState actors

**Custom Hooks** :
- `useActorRef()` : Actor creation + persistence
- `useSelector()` : Selective subscriptions (92% re-renders reduction)
- `useCallback()` : Memoized callbacks (stable refs)
- `useBloomColorPicker()` : BloomColorPicker state + actions
- `useAnimationControls()` : Animation state + actions
- `useBloomControls()` : Bloom settings state + actions
- `usePerformanceMonitor()` : Performance metrics state

**Caractéristiques** :
- ✅ TypeScript types complets
- ✅ JSDoc documentation
- ✅ Performance optimized (selective re-renders)
- ✅ Testable (renderHook)

---

### **Layer 3 : Actor Model Layer (XState v5)**

**Responsabilité** : Business logic, state management, orchestration

**Actors (12 total)** :

#### **Root System Actor** (Orchestration)
- Registry actors (Receptionist pattern)
- Spawn/stop actors dynamic
- System-wide events coordination

#### **Core Actors** :
1. **Scene Actor** : Three.js scene lifecycle
2. **GLB Loader Actor** : 484 bones + 29 animations validation
3. **Animation Controller Actor** : NLA mixer + crossfade 300ms
4. **Renderer Actor** : WebGL context + context lost recovery
5. **Camera Actor** : OrbitControls + presets
6. **Bloom Effects Actor** : Shaders + post-processing
7. **Lighting Controller Actor** : Lights + shadows

#### **Feature Actors** :
8. **BloomColorPicker Actor** : Color selection debounced 200ms
9. **Performance Monitor Actor** : Metrics + auto-optimization
10. **Particle Spawner Actor** : Particles system
11. **State Coordinator Actor** : State synchronization

**Caractéristiques** :
- ✅ setup() API XState v5
- ✅ TypeScript types complets (context, events, input, output)
- ✅ fromPromise actors (services async)
- ✅ Guards + Actions typed
- ✅ Zero coupling (Receptionist pattern)
- ✅ Unit tests coverage >90%

---

### **Layer 4 : Services Layer (fromPromise)**

**Responsabilité** : Opérations asynchrones (I/O, Three.js, calculs)

**Services (13 total)** :

**Three.js Services** :
- `loadGLBFile()` : Load + validate GLB (484 bones, 29 animations)
- `createScene()` : Create Three.js scene
- `disposeScene()` : Cleanup resources (geometry, materials, textures)
- `createRenderer()` : WebGL renderer + capabilities
- `handleContextLost()` : WebGL context recovery

**Animation Services** :
- `crossfadeAnimation()` : Crossfade duration 300ms
- `loadAnimationClip()` : Lazy load animation

**Bloom Services** :
- `compileShaders()` : EffectComposer + UnrealBloomPass
- `updateBloomSettings()` : Debounced 50ms
- `applyColorToMaterials()` : Debounced 200ms

**Performance Services** :
- `collectMetrics()` : FPS, draw calls, memory
- `optimizePerformance()` : Auto-optimization (<30 FPS)
- `cloneMaterials()` : SecurityIRISManager integration

**Caractéristiques** :
- ✅ fromPromise pattern XState v5
- ✅ TypeScript types (Input + Output)
- ✅ Error handling (try/catch, onError)
- ✅ Performance timing (monitoring)
- ✅ Unit tests coverage >85%

---

### **Layer 5 : Three.js Layer**

**Responsabilité** : Rendu 3D, animations, effets

**Three.js Objects** :
- `Scene` : Container 3D objects
- `WebGLRenderer` : Rendu WebGL
- `PerspectiveCamera` : Caméra 3D
- `GLTFLoader` + `DRACOLoader` : Chargement GLB compressé
- `AnimationMixer` : 29 animations NLA
- `EffectComposer` + `UnrealBloomPass` : Post-processing bloom
- `OrbitControls` : Contrôle caméra
- `DirectionalLight` + `AmbientLight` : Éclairage

**Caractéristiques** :
- ✅ 484 bones model (immutable pour animations NLA)
- ✅ 29 animations validated
- ✅ Bloom effects (threshold, strength, radius)
- ✅ Material sharing (50% memory reduction)
- ✅ Disposal pattern (memory leaks prevention)
- ✅ Performance target : 60 FPS constant

---

## 🔄 DATA FLOW ARCHITECTURE

### **Flow Example : User Change Animation**

```
1. USER INTERACTION
   ↓
   User clicks "Walk" animation button
   ↓

2. UI LAYER (React)
   ↓
   AnimationControlsPanel.tsx
   onClick={() => onPlayAnimation('Walk')}
   ↓

3. HOOKS LAYER
   ↓
   useAnimationControls.ts
   handlePlayAnimation('Walk')
   actorRef.send({ type: 'PLAY', animationName: 'Walk' })
   ↓

4. ACTOR LAYER (XState)
   ↓
   animationControllerMachine.ts
   State: playing → crossfading
   ↓

5. SERVICES LAYER
   ↓
   crossfadeAnimation service (fromPromise)
   - fromAction.crossFadeTo(toAction, 300ms)
   - setTimeout 300ms
   ↓

6. THREE.JS LAYER
   ↓
   AnimationMixer.update(delta)
   Crossfade visual smooth 300ms
   ↓

7. FEEDBACK TO UI
   ↓
   Actor state: crossfading → playing
   ↓
   useSelector detects state change
   ↓
   Component re-renders (isCrossfading: false)
   ↓
   UI shows "Walk" active
```

**Temps total** : ~300ms (crossfade duration)
**Re-renders** : 2 (minimal grâce useSelector)

---

## 📁 FILE STRUCTURE FINALE

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Router (legacy vs xstate)
│
├── components/                       # UI Layer (React 18)
│   ├── V3Scene.tsx                  # Root component
│   │
│   ├── AnimationControlsPanel/
│   │   ├── AnimationControlsPanel.tsx      # Pure UI
│   │   ├── AnimationControlsPanelContainer.tsx
│   │   └── AnimationControlsPanel.css
│   │
│   ├── BloomColorPicker/
│   │   ├── BloomColorPicker.tsx
│   │   ├── BloomColorPickerContainer.tsx
│   │   └── BloomColorPicker.css
│   │
│   ├── BloomControlsPanel/
│   │   ├── BloomControlsPanel.tsx
│   │   ├── BloomControlsPanelContainer.tsx
│   │   └── BloomControlsPanel.css
│   │
│   └── PerformanceMonitor/
│       ├── PerformanceMonitor.tsx
│       ├── PerformanceMonitorContainer.tsx
│       └── PerformanceMonitor.css
│
├── hooks/                            # Hooks Layer (React ↔ XState)
│   ├── useActorRef.ts
│   ├── useSelector.ts
│   ├── useBloomColorPicker.ts
│   ├── useAnimationControls.ts
│   ├── useBloomControls.ts
│   └── usePerformanceMonitor.ts
│
├── machines/                         # Actor Layer (XState v5)
│   ├── rootSystemMachine.ts         # Orchestration
│   ├── sceneActorMachine.ts
│   ├── glbLoaderMachine.ts
│   ├── animationControllerMachine.ts
│   ├── rendererActorMachine.ts
│   ├── cameraActorMachine.ts
│   ├── bloomEffectsActorMachine.ts
│   ├── lightingControllerMachine.ts
│   ├── bloomColorPickerMachine.ts
│   ├── performanceMonitorActorMachine.ts
│   ├── particleSpawnerMachine.ts
│   └── stateCoordinatorMachine.ts
│
├── services/                         # Services Layer (fromPromise)
│   ├── glb/
│   │   ├── loadGLBFile.ts
│   │   └── cloneMaterials.ts
│   ├── scene/
│   │   ├── createScene.ts
│   │   └── disposeScene.ts
│   ├── renderer/
│   │   ├── createRenderer.ts
│   │   └── handleContextLost.ts
│   ├── animation/
│   │   ├── crossfadeAnimation.ts
│   │   └── loadAnimationClip.ts
│   ├── bloom/
│   │   ├── compileShaders.ts
│   │   ├── updateBloomSettings.ts
│   │   └── applyColorToMaterials.ts
│   └── performance/
│       ├── collectMetrics.ts
│       └── optimizePerformance.ts
│
├── utils/                            # Utilities
│   ├── colorConversion.ts           # HTML ↔ hex
│   ├── disposeObject.ts             # Three.js disposal
│   └── constants.ts                 # Global constants
│
├── types/                            # TypeScript types
│   ├── actors.ts
│   ├── services.ts
│   └── three.ts
│
├── monitoring/                       # Monitoring (production)
│   ├── sentry.ts
│   ├── webVitals.ts
│   └── customMetrics.ts
│
└── __tests__/                        # Tests
    ├── machines/
    ├── services/
    ├── hooks/
    ├── components/
    └── integration/
```

**Total fichiers** : ~60 fichiers
**Total lignes** : ~15,000 lignes code (estimation)

---

## 🎯 COMMUNICATION PATTERNS

### **Pattern 1 : Receptionist (Actor Discovery)**

```typescript
// Root system actor (registry)
const rootSystemMachine = setup({
  types: {
    context: {} as {
      actors: Map<string, AnyActorRef>
    }
  }
}).createMachine({
  context: {
    actors: new Map()
  },

  states: {
    ready: {
      on: {
        REGISTER_ACTOR: {
          actions: assign({
            actors: ({ context, event }) => {
              context.actors.set(event.id, event.actorRef);
              return context.actors;
            }
          })
        }
      }
    }
  }
});

// Get actor from registry
const sceneActor = rootActor.system.get('scene');
sceneActor.send({ type: 'ADD_OBJECT', object });
```

---

### **Pattern 2 : Event-Driven Communication**

```typescript
// Actor A sends event to Actor B (via root)
rootActor.send({
  type: 'FORWARD_TO_SCENE',
  payload: { type: 'MODEL_LOADED', model }
});

// Actor B subscribes to events
rootActor.system.get('scene')?.subscribe((state) => {
  if (state.event.type === 'MODEL_LOADED') {
    // Handle model loaded
  }
});
```

---

### **Pattern 3 : React → XState (useActorRef + useSelector)**

```typescript
// Custom hook
const { handleColorChange } = useBloomColorPicker({
  securityManager,
  onApplyColor: (color) => console.log(color)
});

// Component
<input
  type="color"
  onChange={(e) => handleColorChange(e.target.value)}
/>
```

---

## 🎯 PRINCIPES ARCHITECTURE

### **1. Separation of Concerns**

- ✅ **UI Layer** : Presentation only (zero business logic)
- ✅ **Hooks Layer** : React ↔ XState bridge
- ✅ **Actor Layer** : Business logic + state management
- ✅ **Services Layer** : Async operations (I/O)
- ✅ **Three.js Layer** : 3D rendering

---

### **2. Zero Coupling**

- ✅ Actors communicate via events (not direct references)
- ✅ Components receive props (not actor refs)
- ✅ Services are pure functions (no side effects in guards)

---

### **3. Testability**

- ✅ Actors testable en isolation (mock services)
- ✅ Services testable en isolation (fromPromise)
- ✅ Hooks testable (renderHook)
- ✅ Components testable (React Testing Library)

---

### **4. Performance**

- ✅ useSelector granular (92% re-renders reduction)
- ✅ Debouncing (200ms color, 50ms bloom)
- ✅ Material sharing (50% memory)
- ✅ Dirty flag rendering (CPU/GPU idle)

---

## 🎯 PROCHAINES ÉTAPES

✅ **F01 COMPLÉTÉ** - Architecture Finale

**Architecture définie** :
- ✅ 5 layers (UI, Hooks, Actors, Services, Three.js)
- ✅ 12 actors XState v5
- ✅ 13 services fromPromise
- ✅ Communication patterns (Receptionist, Event-driven)
- ✅ File structure finale (~60 fichiers)

**Prochaine** : F02 Actor Ecosystem

---

**SESSION F01 TERMINÉE** ✅
