# 🗺️ SESSION E08 - CONSTRUCTION ROADMAP PLAN CONSTRUCTION

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : Timeline, milestones, dependencies, resource allocation
**Criticité** : HAUTE

---

## 🎯 OBJECTIF SESSION E08

**Mission** : Définir roadmap complète construction Overmind XState v5 avec timeline réaliste.

**Scope** :
1. **Timeline Globale** : Phases 1-5 avec durées estimées
2. **Milestones** : Points de contrôle qualité (checkpoints)
3. **Dependencies** : Ordre impératif tâches (critical path)
4. **Resource Allocation** : Estimation effort développeur
5. **Risk Buffer** : Marges sécurité temps

**Objectif qualité** : Roadmap réaliste, achievable, avec buffer 20-30%

---

## 📅 TIMELINE GLOBALE

### **Vue d'ensemble** :

```
┌────────────────────────────────────────────────────────────────┐
│              OVERMIND XSTATE V5 CONSTRUCTION                   │
│                                                                │
│  Phase 1: Foundation      │████████│ 4 semaines               │
│  Phase 2: Core Actors     │████████████│ 6 semaines           │
│  Phase 3: Features        │████████████████│ 8 semaines       │
│  Phase 4: Testing         │████████│ 4 semaines               │
│  Phase 5: Optimization    │████│ 2 semaines                   │
│                                                                │
│  TOTAL: 24 semaines (6 mois) + 20% buffer = 29 semaines       │
└────────────────────────────────────────────────────────────────┘
```

**Total estimé** : **24 semaines (6 mois)** + **5 semaines buffer** = **29 semaines (~7 mois)**

---

## 🏗️ PHASE 1 : FOUNDATION (SEMAINES 1-4)

### **Objectif** : Infrastructure XState v5 + Three.js de base

**Durée** : 4 semaines

### **Semaine 1 : Project Setup**

**Tasks** :
- ✅ Setup Vite + React 18 + TypeScript
- ✅ Install XState v5 + @xstate/react
- ✅ Install Three.js + loaders (GLTFLoader, DRACOLoader)
- ✅ Configure Vitest + React Testing Library
- ✅ Configure ESLint + Prettier
- ✅ Setup CI/CD GitHub Actions (basic)

**Deliverable** :
- Project buildable (`npm run build`)
- Tests runnable (`npm run test`)
- CI green (build + tests passing)

**Milestone** : ✅ M1 - Project Infrastructure Ready

---

### **Semaine 2 : Root System Actor**

**Tasks** :
- Create `rootSystemMachine.ts` (orchestration)
- Implement Receptionist pattern (actor registry)
- Setup actor spawning/stopping dynamic
- Create basic V3Scene component (canvas + actor)
- Unit tests root system (spawning, registry)

**Deliverable** :
- Root system actor functional
- Actor spawning/stopping validated
- Tests coverage >85%

**Milestone** : ✅ M2 - Root System Actor Working

---

### **Semaine 3 : Scene + Renderer Actors**

**Tasks** :
- Create `sceneActorMachine.ts` (Three.js scene lifecycle)
- Create `rendererActorMachine.ts` (WebGL context)
- Implement `createScene` service (fromPromise)
- Implement `createRenderer` service (fromPromise)
- Handle WebGL context lost recovery
- Unit tests scene + renderer
- Integration test (scene + renderer communication)

**Deliverable** :
- Empty Three.js scene renders on canvas
- Context lost recovery functional
- Tests coverage >85%

**Milestone** : ✅ M3 - Scene Rendering Working

---

### **Semaine 4 : GLB Loader Actor**

**Tasks** :
- Create `glbLoaderMachine.ts` (GLB loading + validation)
- Implement `loadGLBFile` service (484 bones + 29 animations validation)
- Setup DRACOLoader (compression support)
- Progress callback (loading UI feedback)
- Error handling (invalid GLB, network errors)
- Unit tests GLB loader (validation guards)
- Integration test (GLB loaded → scene display)

**Deliverable** :
- Overmind GLB loads and displays (484 bones validated)
- 29 animations extracted
- Loading progress indicator
- Tests coverage >90% (critical)

**Milestone** : ✅ M4 - GLB Loading Working (CRITICAL MILESTONE)

**Risk** : GLB validation issues (484 bones requirement)
**Mitigation** : Early validation test avec vrai modèle Overmind

---

## 🎬 PHASE 2 : CORE ACTORS (SEMAINES 5-10)

### **Objectif** : Actors critiques (animations, camera, bloom, lighting)

**Durée** : 6 semaines

### **Semaine 5 : Animation Controller Actor (Part 1)**

**Tasks** :
- Create `animationControllerMachine.ts`
- Implement `loadAnimationClip` service
- Setup AnimationMixer Three.js
- Basic animation playback (single animation)
- Unit tests animation loading

**Deliverable** :
- Single animation playable
- AnimationMixer integrated
- Tests coverage >85%

---

### **Semaine 6 : Animation Controller Actor (Part 2)**

**Tasks** :
- Implement `crossfadeAnimation` service (fromPromise)
- Crossfade duration configurable (300ms default)
- Animation state machine (idle → playing → crossfading)
- Unit tests crossfade logic
- Integration test (29 animations switchable)

**Deliverable** :
- All 29 animations playable
- Smooth crossfade (300ms)
- Tests coverage >90% (critical)

**Milestone** : ✅ M5 - Animations Working (CRITICAL MILESTONE)

---

### **Semaine 7 : Camera Actor**

**Tasks** :
- Create `cameraActorMachine.ts`
- OrbitControls integration
- Camera presets (front, side, top views)
- Smooth camera transitions
- Unit tests camera

**Deliverable** :
- Camera controllable (orbit)
- Presets functional
- Tests coverage >80%

**Milestone** : ✅ M6 - Camera Controls Working

---

### **Semaine 8-9 : Bloom Effects Actor**

**Tasks** :
- Create `bloomEffectsActorMachine.ts`
- Implement `compileShaders` service (EffectComposer + UnrealBloomPass)
- Implement `updateBloomSettings` service (debounced 50ms)
- Material categorization (bloom groups)
- Bloom threshold/strength/radius controls
- Unit tests bloom actor
- Integration test (bloom visual validation)

**Deliverable** :
- Bloom effects functional
- Settings adjustable (debounced 50ms)
- Material groups working (iris, eyeRings, arms, etc.)
- Tests coverage >85%

**Milestone** : ✅ M7 - Bloom Effects Working

---

### **Semaine 10 : Lighting Controller Actor**

**Tasks** :
- Create `lightingControllerMachine.ts`
- Directional light + ambient light setup
- Lighting presets (studio, dramatic, soft)
- Shadow optimization (selective shadows)
- Unit tests lighting

**Deliverable** :
- Lighting controllable
- Presets functional
- Shadows optimized
- Tests coverage >80%

**Milestone** : ✅ M8 - Lighting Working

---

## ✨ PHASE 3 : FEATURES (SEMAINES 11-18)

### **Objectif** : UI components + features utilisateur

**Durée** : 8 semaines

### **Semaine 11-12 : BloomColorPicker Component** (E13)

**Tasks** :
- Create `bloomColorPickerMachine.ts` (debounced 200ms)
- Implement `applyColorToMaterials` service
- Create `BloomColorPicker.jsx` (pure UI)
- Create `useBloomColorPicker.ts` (custom hook)
- Color format conversion (HTML ↔ hex number)
- SecurityIRISManager integration
- Unit tests (machine + hook + component)
- E2E test (color picker user flow)

**Deliverable** :
- Color picker functional
- Debouncing working (200ms, 92% CPU reduction)
- SecurityIRISManager color applied
- Tests coverage >90% (first XState component)

**Milestone** : ✅ M9 - BloomColorPicker Working (CRITICAL - Premier composant XState)

---

### **Semaine 13-14 : AnimationControlsPanel Component**

**Tasks** :
- Create `AnimationControlsPanel.jsx` (pure UI)
- Create `useAnimationControls.ts` (custom hook)
- Animation list display (29 animations)
- Playback controls (play, pause, stop)
- Crossfade duration slider
- Unit tests (hook + component)
- E2E test (animation controls user flow)

**Deliverable** :
- Animation panel functional
- All 29 animations accessible
- Crossfade duration adjustable
- Tests coverage >85%

**Milestone** : ✅ M10 - Animation Controls Working

---

### **Semaine 15 : BloomControlsPanel Component**

**Tasks** :
- Create `BloomControlsPanel.jsx` (pure UI)
- Create `useBloomControls.ts` (custom hook)
- Threshold/strength/radius sliders
- Debouncing settings (50ms)
- Unit tests (hook + component)

**Deliverable** :
- Bloom controls functional
- Debouncing working (50ms)
- Tests coverage >85%

**Milestone** : ✅ M11 - Bloom Controls Working

---

### **Semaine 16 : PerformanceMonitor Component**

**Tasks** :
- Create `performanceMonitorActorMachine.ts`
- Implement `collectMetrics` service (FPS, draw calls, memory)
- Implement `optimizePerformance` service (auto-optimization)
- Create `PerformanceMonitor.jsx` (metrics display)
- Create `usePerformanceMonitor.ts` (custom hook)
- Unit tests (machine + hook + component)

**Deliverable** :
- Performance monitor functional
- Metrics displayed (FPS, draw calls, memory)
- Auto-optimization triggered (<30 FPS)
- Tests coverage >80%

**Milestone** : ✅ M12 - Performance Monitor Working

---

### **Semaine 17-18 : UI Integration + Polish**

**Tasks** :
- Integrate all panels in V3Scene layout
- Panel visibility toggles
- Responsive design (mobile + desktop)
- Keyboard shortcuts (animations, camera, etc.)
- Loading states (spinners, progress bars)
- Error states (error messages, retry buttons)
- Accessibility (ARIA labels, keyboard navigation)
- Visual polish (CSS, animations)

**Deliverable** :
- Full UI integrated
- Responsive design working
- Accessibility >90% Lighthouse score
- Visual polish complete

**Milestone** : ✅ M13 - Full UI Integration Complete

---

## 🧪 PHASE 4 : TESTING (SEMAINES 19-22)

### **Objectif** : Coverage 80%+ + E2E complet + Visual regression

**Durée** : 4 semaines

### **Semaine 19 : Unit Tests Completion**

**Tasks** :
- Complete unit tests all state machines (target 90%+)
- Complete unit tests all services (target 85%+)
- Complete unit tests all hooks (target 80%+)
- Complete unit tests all components (target 75%+)
- Fix failing tests
- Coverage report analysis

**Deliverable** :
- Unit tests coverage >80% global
- State machines coverage >90%
- All tests green

**Milestone** : ✅ M14 - Unit Tests Complete

---

### **Semaine 20 : Integration Tests**

**Tasks** :
- Actor communication tests (Receptionist pattern)
- Scene lifecycle tests (create → ready → dispose)
- GLB loading integration (load → validate → display)
- Animation integration (load → play → crossfade)
- Bloom integration (compile → update → render)

**Deliverable** :
- Integration tests coverage >70%
- Critical paths tested
- All tests green

**Milestone** : ✅ M15 - Integration Tests Complete

---

### **Semaine 21 : E2E Tests (Playwright)**

**Tasks** :
- Setup Playwright E2E framework
- User flow: Load app → Display model
- User flow: Change animation → Crossfade
- User flow: Change color → Apply
- User flow: Adjust bloom settings
- Performance test: Load time <3s TTI
- Performance test: 60 FPS during animation

**Deliverable** :
- E2E tests all critical user flows
- Performance budgets validated
- All tests green

**Milestone** : ✅ M16 - E2E Tests Complete

---

### **Semaine 22 : Visual Regression + CI/CD**

**Tasks** :
- Setup Playwright visual regression
- Screenshot all UI components
- Screenshot full scene states
- CI/CD pipeline complete (unit + integration + E2E + visual)
- Coverage reports automated (Codecov)
- Lighthouse CI (performance budgets)

**Deliverable** :
- Visual regression tests complete
- CI/CD pipeline green
- Coverage reports automated

**Milestone** : ✅ M17 - Testing Infrastructure Complete

---

## ⚡ PHASE 5 : OPTIMIZATION (SEMAINES 23-24)

### **Objectif** : Bundle size, performance, production readiness

**Durée** : 2 semaines

### **Semaine 23 : Bundle Optimization**

**Tasks** :
- Code splitting (routes + components lazy)
- Tree shaking validation (Three.js, XState, Lodash)
- Bundle analysis (Rollup visualizer)
- Vite production config (gzip, brotli, terser)
- Manual chunks optimization
- Target: Bundle <500KB gzipped

**Deliverable** :
- Bundle size <500KB gzipped (target 300KB)
- Code splitting working
- Tree shaking validated

**Milestone** : ✅ M18 - Bundle Optimized

---

### **Semaine 24 : Runtime Optimization + Production Prep**

**Tasks** :
- GLB Draco compression (15MB → 3MB)
- Texture KTX2 compression (if applicable)
- Render loop optimization (dirty flag)
- Material sharing validation
- Shadow optimization validation
- Production build testing
- Performance validation (Lighthouse >90 score)
- Documentation finale (README, deployment guide)

**Deliverable** :
- GLB compressed (15MB → 3MB)
- Render performance 60 FPS
- Lighthouse score >90
- Production ready

**Milestone** : ✅ M19 - Production Ready (FINAL MILESTONE)

---

## 📊 CRITICAL PATH (Dependencies)

### **Dépendances impératives** :

```
Phase 1: Foundation (Semaines 1-4)
  ↓
  M1 → M2 → M3 → M4 (GLB Loading CRITICAL)

Phase 2: Core Actors (Semaines 5-10)
  M4 → M5 (Animations CRITICAL)
  M4 → M6 (Camera)
  M4 → M7 (Bloom)
  M4 → M8 (Lighting)

Phase 3: Features (Semaines 11-18)
  M7 → M9 (BloomColorPicker dépend Bloom Actor)
  M5 → M10 (AnimationControls dépend Animation Actor)
  M7 → M11 (BloomControls dépend Bloom Actor)

Phase 4: Testing (Semaines 19-22)
  M13 → M14 → M15 → M16 → M17

Phase 5: Optimization (Semaines 23-24)
  M17 → M18 → M19
```

**Critical Milestones** (bloquants) :
- ✅ M4 : GLB Loading (bloque tout Phase 2)
- ✅ M5 : Animations (bloque AnimationControls)
- ✅ M7 : Bloom (bloque BloomColorPicker + BloomControls)
- ✅ M9 : BloomColorPicker (premier composant XState, validation patterns)

---

## 👥 RESOURCE ALLOCATION

### **Estimation effort développeur** :

**1 développeur full-time** :
- 24 semaines développement
- 5 semaines buffer (20%)
- **Total : 29 semaines (~7 mois)**

**2 développeurs** :
- Certaines tâches parallélisables (UI components)
- **Total : ~18 semaines (~4.5 mois)** (réduction 40%)

**Recommandation** : **1 développeur** pour cohérence architecture XState (learning curve importante)

---

## 🎯 MILESTONES SUMMARY

| Milestone | Semaine | Criticité | Deliverable |
|-----------|---------|-----------|-------------|
| M1 | 1 | HAUTE | Project Infrastructure |
| M2 | 2 | HAUTE | Root System Actor |
| M3 | 3 | HAUTE | Scene Rendering |
| M4 | 4 | **CRITIQUE** | GLB Loading (484 bones) |
| M5 | 6 | **CRITIQUE** | Animations (29 NLA) |
| M6 | 7 | MOYENNE | Camera Controls |
| M7 | 9 | HAUTE | Bloom Effects |
| M8 | 10 | MOYENNE | Lighting |
| M9 | 12 | **CRITIQUE** | BloomColorPicker (first XState component) |
| M10 | 14 | HAUTE | Animation Controls |
| M11 | 15 | MOYENNE | Bloom Controls |
| M12 | 16 | MOYENNE | Performance Monitor |
| M13 | 18 | HAUTE | Full UI Integration |
| M14 | 19 | HAUTE | Unit Tests Complete |
| M15 | 20 | MOYENNE | Integration Tests |
| M16 | 21 | HAUTE | E2E Tests |
| M17 | 22 | MOYENNE | CI/CD Complete |
| M18 | 23 | MOYENNE | Bundle Optimized |
| M19 | 24 | **CRITIQUE** | Production Ready |

**Total Milestones** : 19
**Critical Milestones** : 4 (M4, M5, M9, M19)

---

## ⏱️ RISK BUFFER ALLOCATION

### **Buffer par phase** :

| Phase | Durée Base | Buffer 20% | Durée Totale |
|-------|------------|------------|--------------|
| Phase 1 | 4 sem | +1 sem | 5 sem |
| Phase 2 | 6 sem | +1 sem | 7 sem |
| Phase 3 | 8 sem | +2 sem | 10 sem |
| Phase 4 | 4 sem | +1 sem | 5 sem |
| Phase 5 | 2 sem | 0 sem | 2 sem |
| **TOTAL** | **24 sem** | **+5 sem** | **29 sem** |

**Justification buffer** :
- Phase 1-2 : Learning curve XState v5 (nouveau framework)
- Phase 3 : Complexity UI + patterns React/XState
- Phase 4 : Debugging tests, coverage gaps
- Phase 5 : Pas de buffer (optimizations optionnelles)

---

## 🎯 SUCCESS CRITERIA

### **Critères validation finale** :

**Functional** :
- ✅ GLB Overmind loads (484 bones + 29 animations validated)
- ✅ All 29 animations playable with crossfade
- ✅ Bloom effects working (color picker + settings)
- ✅ Camera controls functional (orbit + presets)
- ✅ Performance monitor displays metrics

**Performance** :
- ✅ TTI < 3s (target 1.5s)
- ✅ FCP < 1s
- ✅ 60 FPS constant during animations
- ✅ Bundle < 500KB gzipped (target 300KB)
- ✅ GLB compressed < 5MB (from 15MB)

**Quality** :
- ✅ Test coverage >80% (state machines >90%)
- ✅ All E2E tests green
- ✅ Lighthouse score >90
- ✅ Zero critical bugs
- ✅ Accessibility >90%

**Production** :
- ✅ CI/CD pipeline green
- ✅ Documentation complete
- ✅ Deployment tested (staging + production)

---

## 🎯 PROCHAINES ÉTAPES

✅ **E08 COMPLÉTÉ** - Construction roadmap détaillée

**Roadmap documentée** :
- ✅ Timeline globale (24 semaines + 5 buffer = 29 semaines)
- ✅ 5 phases détaillées (Foundation, Core, Features, Testing, Optimization)
- ✅ 19 milestones (4 critiques)
- ✅ Critical path dependencies
- ✅ Resource allocation (1 dev = 7 mois, 2 devs = 4.5 mois)
- ✅ Risk buffer 20% (5 semaines)
- ✅ Success criteria complets

**Prochaine session** : E09 Risk Mitigation (Risques techniques + Mitigations)

---

**SESSION E08 TERMINÉE** ✅

**Roadmap** : 29 semaines, 19 milestones, 4 critical
**Resource** : 1 développeur full-time (recommandé)
**Buffer** : 20% (5 semaines)

**Prochaine** : E09 Risk Mitigation
