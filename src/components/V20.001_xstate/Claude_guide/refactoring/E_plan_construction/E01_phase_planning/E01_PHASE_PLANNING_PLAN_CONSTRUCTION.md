# 🗺️ SESSION E01 - PHASE PLANNING

**Date** : 30 septembre 2025
**Phase** : E - Plan Construction
**Focus** : Planification phases construction système Overmind XState v5
**Criticité** : URGENTE

---

## 🎯 OBJECTIF SESSION E01

**Mission** : Élaborer le **plan de construction par phases** du système Overmind XState v5, avec priorités, dépendances, timing et milestones clairs.

**Rappel fondamental** : **REFONTE TOTALE** = Construction nouveau système from scratch (PAS migration, PAS refactoring).

---

## 📊 SYNTHÈSE VALIDATION PHASES B→C→D

### **INPUTS VALIDÉS POUR PLANIFICATION**

#### **Phase B - Problèmes identifiés** :
- **SceneStateController** : 827L God Object single point failure
- **useTempBloomSync** : 663L God Hook
- **484 bones** : Performance impossibilité 60 FPS
- **Memory leaks** : GPU + CPU fuites critiques
- **Scene.traverse()** : O(n) abuse bottleneck

#### **Phase C - Patterns découverts** :
- **Receptionist Pattern** : Communication 484 actors via systemId
- **Actor decomposition** : God Objects → Specialized Actors
- **LOD System** : Geometry/textures/effects (484 bones immutable pour NLA)
- **Layers System** : O(1) vs O(n) révolutionnaire
- **Memory Pooling** : 70-90% allocation reduction

#### **Phase D - Validation (87% confiance)** :
- ✅ **Performance gains** : 10-50x (Layers) + 80-90% (Bundle)
- ✅ **Architecture** : 100% coupling elimination
- ✅ **Cognitive** : 70-80% complexity reduction
- ⚠️ **Mobile** : Viable avec constraints (30 FPS @ 50 bones)
- ✅ **Browser** : Excellent modern stack (95%+ support)

---

## 🏗️ ARCHITECTURE PHASES CONSTRUCTION

### **STRATÉGIE CONSTRUCTION : BOTTOM-UP FOUNDATION-FIRST**

**Principe** : Construire fondations solides XState AVANT features complexes.

```
PHASE 1 : Foundation (Actor System Core)
    ↓
PHASE 2 : God Objects Decomposition
    ↓
PHASE 3 : Performance & Rendering
    ↓
PHASE 4 : Features & Integration
    ↓
PHASE 5 : Polish & Optimization
```

---

## 📋 PHASE 1 - FOUNDATION (4-6 semaines)

### **OBJECTIF**
Établir architecture Actor XState v5 + infrastructure core avant toute feature.

### **COMPOSANTS CRITIQUES**

#### **1.1 - Actor System Setup** (Semaine 1-2)
```javascript
const phase1_1 = {
  deliverables: [
    "Root Actor System Machine",
    "Actor Registry + Discovery (systemId)",
    "Event Bus Infrastructure",
    "Actor Lifecycle Management"
  ],

  priority: "CRITIQUE",

  dependencies: [],

  validation: {
    unit: "Actor creation + communication tests",
    integration: "Multi-actor coordination test",
    performance: "Event overhead < 1ms"
  },

  risks: [
    "XState v5 API learning curve",
    "systemId coordination complexity",
    "Event typing TypeScript overhead"
  ]
};
```

**Livrables** :
- ✅ Root System Actor avec spawn capabilities
- ✅ Actor Registry service (systemId lookup)
- ✅ Event communication infrastructure
- ✅ Actor lifecycle hooks (start/stop/error)

**Success Criteria** :
- [ ] 10 test actors créés + communication validated
- [ ] systemId discovery functional
- [ ] Event batching operational
- [ ] Performance < 1ms overhead

---

#### **1.2 - Core State Machines** (Semaine 2-3)
```javascript
const phase1_2 = {
  deliverables: [
    "Application State Machine (root)",
    "Scene State Machine (Three.js lifecycle)",
    "Loading State Machine (GLB + assets)",
    "Error Boundary State Machine"
  ],

  priority: "CRITIQUE",

  dependencies: ["1.1 Actor System Setup"],

  validation: {
    stateDiagrams: "XState Visualizer validation",
    transitions: "All states + guards tested",
    errorHandling: "Error escalation tested"
  },

  patterns: [
    "Higher-order guards composition",
    "Context partitioning HOT/WARM/COLD",
    "Deep persistence ready"
  ]
};
```

**Livrables** :
- ✅ Application root state machine
- ✅ Scene lifecycle state machine
- ✅ Loading state machine (progressive)
- ✅ Error boundary state machine

**Success Criteria** :
- [ ] XState Visualizer diagrams validated
- [ ] All state transitions tested
- [ ] Error handling comprehensive
- [ ] Context partitioning operational

---

#### **1.3 - Three.js Integration Layer** (Semaine 3-4)
```javascript
const phase1_3 = {
  deliverables: [
    "Scene Actor (Three.js orchestration)",
    "Camera Actor (OrbitControls integration)",
    "Renderer Actor (WebGL context management)",
    "WEBGL_lose_context monitoring"
  ],

  priority: "HAUTE",

  dependencies: ["1.2 Core State Machines"],

  threeJsPatterns: [
    "Scene initialization service",
    "Renderer dispose patterns",
    "Context loss recovery",
    "RAF coordination Actor-driven"
  ],

  validation: {
    rendering: "Basic scene renders 60 FPS",
    context: "Context loss recovery tested",
    cleanup: "Proper disposal no leaks"
  }
};
```

**Livrables** :
- ✅ Scene Actor (Three.js orchestration)
- ✅ Camera Actor + OrbitControls
- ✅ Renderer Actor + context monitoring
- ✅ RAF coordination event-driven

**Success Criteria** :
- [ ] Basic Three.js scene renders
- [ ] 60 FPS stable empty scene
- [ ] Context loss recovery works
- [ ] Proper cleanup validated

---

#### **1.4 - GLB Loading Actor** (Semaine 4-6)
```javascript
const phase1_4 = {
  deliverables: [
    "GLB Loader Actor (484 bones model)",
    "Progressive loading service",
    "Asset Registry Actor",
    "LOD System foundation (geometry/textures/effects)"
  ],

  priority: "HAUTE",

  dependencies: ["1.3 Three.js Integration"],

  overmindSpecific: {
    model: "eye_484bones_29animations.glb",
    bonesCount: 484, // IMMUTABLE for 29 NLA animations
    animationsCount: 29,
    lodLevels: {
      geometry: ["100%", "60%", "30%"],
      textures: [2048, 1024, 512],
      effects: ["full", "partial", "disabled"]
    }
  },

  validation: {
    loading: "GLB loads < 5s",
    bones: "484 bones detected + immutable",
    animations: "29 NLA animations functional",
    lod: "LOD quality switching functional"
  }
};
```

**Livrables** :
- ✅ GLB Loader Actor service
- ✅ 484 bones model loading
- ✅ 29 animations extraction
- ✅ LOD system foundation

**Success Criteria** :
- [ ] Model loads successfully
- [ ] 484 bones accessible
- [ ] 29 animations enumerated
- [ ] LOD levels prepared

---

### **PHASE 1 - MILESTONES**

| Milestone | Critère Success | Date Target |
|-----------|----------------|-------------|
| **M1.1** | Actor System operational | Semaine 2 |
| **M1.2** | State machines validated | Semaine 3 |
| **M1.3** | Three.js renders basic scene | Semaine 4 |
| **M1.4** | GLB 484 bones loaded | Semaine 6 |

**Livrable Phase 1** : **Foundation Actor System fonctionnel** avec GLB 484 bones chargé.

---

## 📋 PHASE 2 - GOD OBJECTS DECOMPOSITION (4-6 semaines)

### **OBJECTIF**
Remplacer SceneStateController + useTempBloomSync par architecture Actor spécialisée.

### **COMPOSANTS CRITIQUES**

#### **2.1 - SceneStateController Decomposition** (Semaine 7-9)
```javascript
const phase2_1 = {
  target: "SceneStateController 827L → 6-8 Specialized Actors",

  actors: [
    "AnimationControllerActor (29 animations)",
    "BloomEffectsActor (bloom configuration)",
    "LightingControllerActor (PBR lighting)",
    "CameraControllerActor (view management)",
    "PerformanceMonitorActor (FPS tracking)",
    "StateCoordinatorActor (cross-actor sync)"
  ],

  priority: "CRITIQUE",

  dependencies: ["Phase 1 Complete"],

  decompositionStrategy: {
    principle: "Single Responsibility per Actor",
    communication: "Receptionist Pattern systemId",
    coupling: "Zero direct references",
    events: "Event-driven coordination only"
  },

  validation: {
    actors: "Each Actor tested isolated",
    coordination: "Multi-actor scenarios tested",
    performance: "No performance regression",
    features: "All SceneStateController features preserved"
  }
};
```

**Livrables** :
- ✅ 6-8 Specialized Actors opérationnels
- ✅ SceneStateController legacy removed
- ✅ Event communication validated
- ✅ Feature parity confirmed

**Success Criteria** :
- [ ] Toutes features SceneStateController preserved
- [ ] Performance égale ou meilleure
- [ ] Zero coupling entre Actors
- [ ] Tests isolation passed

---

#### **2.2 - useTempBloomSync Elimination** (Semaine 9-11)
```javascript
const phase2_2 = {
  target: "useTempBloomSync 663L → 4-6 Specialized Hooks",

  hooks: [
    "useBloomActor (bloom state subscription)",
    "useAnimationActor (animation control)",
    "useLightingActor (lighting state)",
    "useCameraActor (camera state)",
    "usePerformanceActor (FPS monitoring)"
  ],

  priority: "CRITIQUE",

  dependencies: ["2.1 SceneStateController Decomposition"],

  reactPatterns: {
    hook: "useActorRef per Actor",
    subscription: "Selective state updates",
    cleanup: "Automatic useEffect cleanup",
    reRenders: "Minimal re-renders optimized"
  },

  validation: {
    hooks: "Each hook tested isolated",
    reRenders: "Re-render count < 50% current",
    features: "All bloom sync features preserved",
    performance: "No UI lag"
  }
};
```

**Livrables** :
- ✅ 4-6 Specialized hooks
- ✅ useTempBloomSync removed
- ✅ Re-renders optimized
- ✅ Feature parity validated

**Success Criteria** :
- [ ] All bloom features working
- [ ] Re-renders reduced 40-60%
- [ ] UI responsive maintained
- [ ] Hook tests passed

---

#### **2.3 - ParticleSystemV2 Actor Parallelization** (Semaine 11-12)
```javascript
const phase2_3 = {
  target: "ParticleSystemV2 2,523L → Specialized Particle Actors",

  actors: [
    "ParticleSpawnerActor (particle creation)",
    "ParticleUpdateActor (position updates)",
    "ParticleRendererActor (draw coordination)",
    "ParticlePoolActor (memory pooling)"
  ],

  priority: "HAUTE",

  dependencies: ["2.1 SceneStateController Decomposition"],

  performanceTargets: {
    particles: "1000 particles @ 60 FPS",
    pooling: "70-90% allocation reduction",
    parallelization: "Actor coordination < 1ms",
    memoryFootprint: "< 64MB particles"
  },

  validation: {
    performance: "1000 particles 60 FPS stable",
    pooling: "Memory allocation reduced",
    coordination: "Actors sync correctly",
    visual: "Particle effects preserved"
  }
};
```

**Livrables** :
- ✅ Particle Actor system
- ✅ Memory pooling active
- ✅ 1000 particles @ 60 FPS
- ✅ Visual effects preserved

**Success Criteria** :
- [ ] Performance target met
- [ ] Memory pooling validated
- [ ] Visual quality maintained
- [ ] Actor coordination smooth

---

### **PHASE 2 - MILESTONES**

| Milestone | Critère Success | Date Target |
|-----------|----------------|-------------|
| **M2.1** | SceneStateController eliminated | Semaine 9 |
| **M2.2** | useTempBloomSync removed | Semaine 11 |
| **M2.3** | Particle system optimized | Semaine 12 |

**Livrable Phase 2** : **God Objects éliminés** + Architecture Actor spécialisée opérationnelle.

---

## 📋 PHASE 3 - PERFORMANCE & RENDERING (3-4 semaines)

### **OBJECTIF**
Implémenter optimizations révolutionnaires validées Phase D (Layers, LOD, Memory Pooling).

### **COMPOSANTS CRITIQUES**

#### **3.1 - Layers System Implementation** (Semaine 13-14)
```javascript
const phase3_1 = {
  target: "scene.traverse() O(n) → Layers O(1)",

  deliverables: [
    "Layers Organization System",
    "Layer-based Actor assignment",
    "GPU culling optimization",
    "Draw call reduction"
  ],

  priority: "RÉVOLUTIONNAIRE",

  dependencies: ["Phase 2 Complete"],

  performanceGain: "10-50x validated Phase D",

  implementation: {
    layers: [
      "Layer 0: 484 bones model",
      "Layer 1: Particle effects",
      "Layer 2: Debug UI",
      "Layer 3: Helper objects"
    ],
    integration: "Actor-driven layer management",
    optimization: "GPU culling + batching"
  },

  validation: {
    performance: "scene.traverse() eliminated",
    fps: "60 FPS maintained 484 bones",
    gain: "10x minimum performance improvement",
    visual: "Rendering identical output"
  }
};
```

**Livrables** :
- ✅ Layers system operational
- ✅ scene.traverse() eliminated
- ✅ 10x+ performance gain
- ✅ 60 FPS stable

**Success Criteria** :
- [ ] Zero scene.traverse() calls
- [ ] Performance gain ≥10x
- [ ] Visual output unchanged
- [ ] 60 FPS stable 484 bones

---

#### **3.2 - LOD System Geometry/Textures/Effects** (Semaine 14-15)
**⚠️ CORRIGÉ 1 OCT 2025** : 484 bones IMMUTABLE

```javascript
const phase3_2 = {
  target: "484 bones mobile viable via LOD geometry/textures/effects",

  lodLevels: {
    desktop: "484 bones + 100% geometry + 2048 textures + effects",
    integrated: "484 bones + 60% geometry + 1024 textures + effects",
    mobile: "484 bones + 30% geometry + 512 textures + partial effects",
    lowEnd: "484 bones + 15% geometry + 256 textures + no effects"
  },

  priority: "OBLIGATOIRE",

  dependencies: ["1.4 GLB Loading", "3.1 Layers System"],

  implementation: {
    detection: "GPU capability runtime probing",
    switching: "Distance + performance adaptive",
    fallback: "CPU skinning guarantee",
    visual: "Smooth LOD transitions"
  },

  validation: {
    desktop: "484 bones 60 FPS",
    mobile: "50 bones 30 FPS",
    switching: "LOD transitions smooth",
    fallback: "CPU skinning works"
  }
};
```

**Livrables** :
- ✅ LOD geometry vertices (100%→60%→30%→15%)
- ✅ LOD textures (2048→1024→512→256)
- ✅ LOD effects (full→partial→disabled)
- ✅ 484 bones immutable (NLA animations)
- ✅ Adaptive switching
- ✅ CPU skinning fallback automatic

**Success Criteria** :
- [ ] Desktop 60 FPS @ 484 bones + full quality
- [ ] Mobile 30 FPS @ 484 bones + reduced quality
- [ ] LOD transitions smooth
- [ ] CPU fallback reliable

---

#### **3.3 - Memory Pooling System** (Semaine 15-16)
```javascript
const phase3_3 = {
  target: "70-90% allocation reduction validated",

  pools: [
    "Bone matrices pool (484 × 16 floats)",
    "Particle buffer pool (circular)",
    "Texture atlas pool",
    "Geometry buffer pool"
  ],

  priority: "CRITIQUE",

  dependencies: ["2.3 Particle System", "3.2 LOD System"],

  implementation: {
    strategy: "Object pooling + buffer reuse",
    allocation: "Pre-allocated pools",
    recycling: "Automatic disposal + reuse",
    monitoring: "Pool usage metrics"
  },

  validation: {
    allocations: "70-90% reduction measured",
    gcPauses: "≤5ms pauses max",
    memory: "Stable footprint over time",
    leaks: "Zero leaks 10min test"
  }
};
```

**Livrables** :
- ✅ Memory pooling active
- ✅ 70-90% allocation reduction
- ✅ GC pauses ≤5ms
- ✅ Zero leaks validated

**Success Criteria** :
- [ ] Allocation reduction measured
- [ ] GC pauses minimal
- [ ] Memory stable long-term
- [ ] No memory leaks

---

### **PHASE 3 - MILESTONES**

| Milestone | Critère Success | Date Target |
|-----------|----------------|-------------|
| **M3.1** | Layers system 10x gain | Semaine 14 |
| **M3.2** | LOD mobile viable | Semaine 15 |
| **M3.3** | Memory pooling active | Semaine 16 |

**Livrable Phase 3** : **Performance révolutionnaire** 60 FPS desktop + 30 FPS mobile.

---

## 📋 PHASE 4 - FEATURES & INTEGRATION (3-4 semaines)

### **OBJECTIF**
Reconstruire features Overmind existantes sur architecture Actor solide.

### **COMPOSANTS CRITIQUES**

#### **4.1 - Debug Panel Actor-Driven** (Semaine 17-18)
```javascript
const phase4_1 = {
  target: "Debug Panel unified Actor-driven",

  features: [
    "Animation controls (29 animations)",
    "Bloom effects configuration",
    "Lighting PBR controls",
    "Performance metrics display",
    "LOD level visualization"
  ],

  priority: "HAUTE",

  dependencies: ["Phase 2 Complete"],

  uiPatterns: {
    architecture: "Pure React UI + Actor state",
    hooks: "useActorRef selective subscriptions",
    updates: "Event-driven state changes",
    performance: "Minimal re-renders optimized"
  },

  validation: {
    features: "All legacy debug features preserved",
    performance: "UI responsive < 16ms updates",
    integration: "All Actors controllable",
    ux: "Improved usability vs legacy"
  }
};
```

**Livrables** :
- ✅ Debug Panel Actor-integrated
- ✅ All features operational
- ✅ UI responsive maintained
- ✅ UX improved

**Success Criteria** :
- [ ] Feature parity vs legacy
- [ ] UI updates < 16ms
- [ ] All Actors controlled
- [ ] User feedback positive

---

#### **4.2 - Export Configuration Feature** (Semaine 18-19)
```javascript
const phase4_2 = {
  target: "Export Overmind configuration",

  exportFormats: [
    "JSON configuration state",
    "Animation timeline export",
    "Material settings export",
    "Camera preset export"
  ],

  priority: "MODÉRÉE",

  dependencies: ["4.1 Debug Panel"],

  implementation: {
    serialization: "Actor state serialization",
    format: "JSON structured export",
    import: "Configuration restore feature",
    validation: "Export/import roundtrip tested"
  },

  validation: {
    export: "Configuration exports correctly",
    import: "Configuration restores accurately",
    formats: "All export formats functional",
    roundtrip: "Export→Import preserves state"
  }
};
```

**Livrables** :
- ✅ Export configuration feature
- ✅ Multiple formats supported
- ✅ Import/restore functional
- ✅ Roundtrip validated

**Success Criteria** :
- [ ] Export works all formats
- [ ] Import restores state
- [ ] Roundtrip accurate
- [ ] Feature documented

---

#### **4.3 - Integration Testing Suite** (Semaine 19-20)
```javascript
const phase4_3 = {
  target: "Comprehensive integration tests",

  testSuites: [
    "Actor coordination E2E tests",
    "Performance regression tests",
    "UI interaction Playwright tests",
    "WebGL rendering validation tests"
  ],

  priority: "HAUTE",

  dependencies: ["Phase 4.1-4.2 Complete"],

  testingStack: {
    e2e: "Playwright + XState testing",
    performance: "Chrome DevTools benchmarks",
    visual: "Screenshot regression tests",
    ci: "GitHub Actions automation"
  },

  validation: {
    coverage: "≥70% test coverage",
    e2e: "All user flows tested",
    performance: "Regression tests passing",
    ci: "Automated pipeline green"
  }
};
```

**Livrables** :
- ✅ Integration test suite
- ✅ ≥70% coverage
- ✅ E2E tests operational
- ✅ CI pipeline automated

**Success Criteria** :
- [ ] Test coverage ≥70%
- [ ] All E2E tests pass
- [ ] Performance validated
- [ ] CI automation working

---

### **PHASE 4 - MILESTONES**

| Milestone | Critère Success | Date Target |
|-----------|----------------|-------------|
| **M4.1** | Debug Panel operational | Semaine 18 |
| **M4.2** | Export feature complete | Semaine 19 |
| **M4.3** | Integration tests green | Semaine 20 |

**Livrable Phase 4** : **Features Overmind complètes** + tests comprehensive.

---

## 📋 PHASE 5 - POLISH & OPTIMIZATION (2-3 semaines)

### **OBJECTIF**
Finalization, optimization, documentation, et préparation production.

### **COMPOSANTS CRITIQUES**

#### **5.1 - Bundle Optimization** (Semaine 21)
```javascript
const phase5_1 = {
  target: "80-90% bundle reduction validated",

  optimizations: [
    "Actor code splitting (dynamic imports)",
    "Tree shaking optimization",
    "Production build optimization",
    "Asset compression (Draco + KTX2)"
  ],

  priority: "HAUTE",

  performanceTargets: {
    bundleReduction: "80-90% initial bundle",
    loadTime: "< 5s initial load",
    codeSplitting: "Per-actor chunks",
    compression: "Asset compression 75%"
  },

  validation: {
    bundle: "Bundle analyzer confirms reduction",
    load: "Load time < 5s measured",
    splitting: "Chunks load on-demand",
    performance: "No runtime regression"
  }
};
```

**Livrables** :
- ✅ Bundle optimized 80-90%
- ✅ Code splitting operational
- ✅ Load time < 5s
- ✅ Assets compressed

**Success Criteria** :
- [ ] Bundle reduction confirmed
- [ ] Load time target met
- [ ] Code splitting works
- [ ] Assets optimized

---

#### **5.2 - Documentation & Training** (Semaine 22)
```javascript
const phase5_2 = {
  target: "Complete documentation + team training",

  deliverables: [
    "Architecture documentation",
    "Actor API reference",
    "Development guide",
    "Troubleshooting guide",
    "Team training sessions"
  ],

  priority: "MODÉRÉE",

  documentation: {
    architecture: "System architecture diagrams",
    apis: "Actor API documentation",
    guides: "Developer onboarding guides",
    examples: "Code examples + patterns",
    training: "Team workshop sessions"
  },

  validation: {
    docs: "Documentation complete + reviewed",
    training: "Team training completed",
    feedback: "Team confidence ≥80%",
    reference: "API docs accessible"
  }
};
```

**Livrables** :
- ✅ Documentation complète
- ✅ Team training done
- ✅ Guides opérationnels
- ✅ Examples disponibles

**Success Criteria** :
- [ ] Docs complete reviewed
- [ ] Training sessions done
- [ ] Team confidence ≥80%
- [ ] Reference accessible

---

#### **5.3 - Production Readiness** (Semaine 22-23)
```javascript
const phase5_3 = {
  target: "Production deployment ready",

  checklist: [
    "Performance benchmarks passed",
    "Security audit completed",
    "Browser compatibility validated",
    "Mobile performance acceptable",
    "Monitoring + alerts setup",
    "Rollback plan documented"
  ],

  priority: "CRITIQUE",

  productionCriteria: {
    performance: "60 FPS desktop + 30 FPS mobile",
    security: "Security audit green",
    compatibility: "95%+ browsers supported",
    monitoring: "Real-time metrics active",
    rollback: "Rollback plan tested"
  },

  validation: {
    benchmarks: "All performance targets met",
    security: "Security checklist complete",
    compatibility: "Browser matrix passed",
    deployment: "Staging deployment successful",
    rollback: "Rollback procedure validated"
  }
};
```

**Livrables** :
- ✅ Production checklist complete
- ✅ Performance validated
- ✅ Security cleared
- ✅ Deployment ready

**Success Criteria** :
- [ ] All benchmarks passed
- [ ] Security audit green
- [ ] Compatibility confirmed
- [ ] Rollback tested

---

### **PHASE 5 - MILESTONES**

| Milestone | Critère Success | Date Target |
|-----------|----------------|-------------|
| **M5.1** | Bundle optimized | Semaine 21 |
| **M5.2** | Documentation complete | Semaine 22 |
| **M5.3** | Production ready | Semaine 23 |

**Livrable Phase 5** : **Système Overmind XState v5 production-ready** ! 🎉

---

## 📊 ROADMAP GLOBALE

### **TIMELINE COMPLÈTE**

| Phase | Durée | Semaines | Criticité | Status |
|-------|-------|----------|-----------|--------|
| **Phase 1** | Foundation | S1-S6 | CRITIQUE | ⏳ À démarrer |
| **Phase 2** | God Objects | S7-S12 | CRITIQUE | ⏳ Après Phase 1 |
| **Phase 3** | Performance | S13-S16 | HAUTE | ⏳ Après Phase 2 |
| **Phase 4** | Features | S17-S20 | HAUTE | ⏳ Après Phase 3 |
| **Phase 5** | Polish | S21-S23 | MODÉRÉE | ⏳ Après Phase 4 |

**Durée totale estimée** : **23 semaines (~5.5 mois)**

### **DÉPENDANCES CRITIQUES**

```
Phase 1 (Foundation)
    └─→ Phase 2 (God Objects)
           └─→ Phase 3 (Performance)
                  └─→ Phase 4 (Features)
                         └─→ Phase 5 (Polish)
```

**Blocage cascade** : Chaque phase dépend de la précédente.

---

## 🎯 SUCCESS METRICS GLOBAUX

### **PERFORMANCE TARGETS**

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| **Desktop FPS** | Variable | 60 stable | Layers + LOD |
| **Mobile FPS** | Impossible | 30 stable | LOD aggressive |
| **Bundle size** | Large | -80-90% | Code splitting |
| **Load time** | Slow | < 5s | Progressive |
| **Memory** | Leaks | Stable | Pooling |
| **GC pauses** | >50ms | ≤5ms | Pooling |

### **ARCHITECTURE TARGETS**

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| **God Objects** | 2+ | Zero | Actor decomposition |
| **Coupling** | Tight | Zero | Event-driven |
| **Complexity** | High | -70-80% | Actor isolation |
| **Test coverage** | Low | ≥70% | Integration suite |
| **Circular deps** | Present | Zero | Event communication |

### **DEVELOPER TARGETS**

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| **Debugging** | Hard | Easy | XState Inspector |
| **Maintenance** | Complex | Simple | Actor boundaries |
| **Testing** | Difficult | Isolated | Actor tests |
| **Onboarding** | Slow | Fast | Documentation |

---

## ⚠️ RISQUES IDENTIFIÉS

### **RISQUES TECHNIQUES**

1. **XState v5 Learning Curve** (HAUTE)
   - **Impact** : Ralentissement développement
   - **Mitigation** : Formation équipe + pair programming
   - **Contingency** : Experts XState externes si nécessaire

2. **484 Bones Performance Mobile** (HAUTE)
   - **Impact** : Mobile non viable
   - **Mitigation** : LOD system + CPU fallback
   - **Contingency** : Feature flags desktop-only

3. **Actor Coordination Complexity** (MODÉRÉE)
   - **Impact** : Bugs coordination difficiles
   - **Mitigation** : XState Inspector + event logging
   - **Contingency** : Simplification architecture si nécessaire

### **RISQUES PLANNING**

1. **Under-estimation Durée** (MODÉRÉE)
   - **Impact** : Timeline dépassement
   - **Mitigation** : Buffer 20% par phase
   - **Contingency** : Phase 5 réduction scope

2. **Dépendances Bloquantes** (MODÉRÉE)
   - **Impact** : Phase suivante bloquée
   - **Mitigation** : Parallel workstreams si possible
   - **Contingency** : Phase prioritization adjustment

---

## 🚀 PROCHAINES ÉTAPES

### **ACTIONS IMMÉDIATES**

1. **Validation plan** : Review + approval équipe
2. **Environment setup** : Dev environment + tooling
3. **Team formation** : XState v5 training kickoff
4. **Phase 1 kickoff** : Actor System Setup démarrage

### **SESSIONS E SUIVANTES**

- **E02** : Actor Decomposition détaillé (SceneStateController → Actors)
- **E03** : State Machine Design (Application + Scene + Loading machines)
- **E04** : Service Extraction (Three.js + GLB + Asset services)

---

**SESSION E01 TERMINÉE** ✅

**Livrable** : **Plan phases construction 5 phases / 23 semaines** avec milestones + risks + metrics

**Confiance** : Basée sur validation Phase D (87%) + patterns éprouvés Phase C

**Prochaine** : E02 - Actor Decomposition (détail architecture Actor)