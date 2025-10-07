# 📋 SESSION B16 - DIAGNOSTIC ARCHITECTURAL
## `02_hooks` (2,219L Total)

**Date** : 26 septembre 2025
**Phase** : B - Diagnostic Architectural
**Scope** : Domaine Hooks - Logique métier React + intégration systems
**Criticité** : ÉLEVÉE - God hooks + business logic + coordinateur systèmes
**Verdict XState** : **TRANSFORMATION MAJEURE** - Hooks → Services + Actor coordination

**Potentiel refonte totale** : ⭐⭐⭐⭐⭐ (5/5) - Décomposition complète nécessaire

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Architecture actuelle** : 10 hooks React avec logique métier complexe + coordinations systèmes
**Forces** : Séparation responsabilités par hook, configuration déclarative, intégration Three.js
**Faiblesses** : God hooks (useTempBloomSync 662L), logique métier dans hooks, couplage global
**Verdict XState** : **CANDIDAT CRITIQUE** - Hooks business logic → Actor services + React integration

**Potentiel refonte totale** : ⭐⭐⭐⭐⭐ (5/5) - Transformation architecturale majeure

---

## 📁 STRUCTURE DOMAINE ANALYSÉE

```
hooks/                                   (2,219L total)
├── useTempBloomSync.js                  (662L) - God hook coordination systèmes
├── useThreeScene.js                     (383L) - Scene Three.js + bloom integration
├── useFloatingSpace.js                  (287L) - Logique physique complexe
├── useModelLoader.js                    (236L) - Chargement modèles + matériaux
├── usePerformanceMonitor.js             (163L) - Monitoring performance
├── useCameraFitter.js                   (131L) - Camera positioning algorithmic
├── useSimpleBloom.js                    (103L) - Integration bloom system
├── useRevealManager.js                  (87L)  - Révélation anneaux manager
├── useRobotController.js                (84L)  - Robot controller wrapper
└── useTriggerControls.js                (83L)  - Trigger controls UI
```

### **RÉPARTITION COMPLEXITÉ**
- **God Hook** : useTempBloomSync (662L) = 29.8%
- **Complexe** : useThreeScene (383L), useFloatingSpace (287L), useModelLoader (236L) = 906L (40.8%)
- **Modéré** : 6 hooks restants = 651L (29.4%)

---

## 🏗️ ANALYSE ARCHITECTURALE DÉTAILLÉE

### **useTempBloomSync.js (662L) - GOD HOOK COORDINATION**

#### **🎯 RESPONSABILITÉS IDENTIFIÉES**
1. **Global systems sync** (L20-100) - Zustand → window.* coordination
2. **RevealationSystem sync** (L43-75) - Reveal rings synchronisation
3. **BloomSystem coordination** (L77-90) - Material parameters sync
4. **State verification** (L60-74) - Double-check sync success
5. **Force rendering** (L92-96) - Immediate render triggering
6. **Error handling** (L98-107) - Defensive programming extensive

#### **❌ ANTI-PATTERNS CRITIQUES**

**AP-B16-01: GOD HOOK ANTI-PATTERN**
```javascript
// L1-662 - Single hook avec 6+ responsabilités système
export const useTempBloomSync = (systemsInitialized = false) => {
  // Coordination RevealationSystem + BloomSystem + Rendering + State verification
  // → Violation massive SRP + impossible unit testing
}
```

**AP-B16-02: GLOBAL WINDOW COUPLING MASSIF**
```javascript
// L43, L77, L93-95 - Multiple window.* dependencies
window.revelationSystem, window.sceneStateController, window.renderer,
window.scene, window.camera
// → Fragile runtime dependencies + no dependency injection
```

**AP-B16-03: BUSINESS LOGIC DANS HOOK**
```javascript
// L33-90 - Complex business logic for sync
const performInitialSync = () => { /* 50+ lines business logic */ };
// → Business logic should be in services, not hooks
```

### **useThreeScene.js (383L) - Scene Orchestrateur**

#### **🎯 RESPONSABILITÉS IDENTIFIÉES**
1. **Three.js scene setup** (L15-55) - Renderer + camera + controls
2. **Bloom coordination** (L22-31) - SimpleBloomSystem integration
3. **Tone mapping** (L35-55) - PMREM coordination
4. **Resize handling** (L65-80) - Window resize + bloom sync
5. **Animation loop** (L95-120) - Render loop + controls update
6. **Lifecycle management** (L150-180) - Cleanup + disposal

#### **❌ ANTI-PATTERNS DÉTECTÉS**

**AP-B16-04: HOOK ORCHESTRATEUR COMPLEX**
```javascript
// L1-383 - Hook gérant scene complète Three.js
// Scene setup + bloom + rendering + lifecycle
// → Hook trop lourd, devrait être décomposé en services
```

**AP-B16-05: PMREM COORDINATION TIGHT**
```javascript
// L44-50 - Direct window.pmremGenerator access
if (window.pmremGenerator && scene) {
  const pmremRenderTarget = window.pmremGenerator.fromScene(scene);
}
// → Tight coupling global systems
```

### **useFloatingSpace.js (287L) - Physique Complexe**

#### **🎯 RESPONSABILITÉS IDENTIFIÉES**
1. **Physics calculations** (L70-150) - Repulsion + inertia complex
2. **Mouse interaction** (L45-60) - 3D mouse tracking + raycasting
3. **Anti-vibration** (L45-48) - Stability systems
4. **Configuration reactive** (L13-28) - useState for complex config
5. **Sync data exposure** (L37-43) - Particle system coordination

#### **❌ ANTI-PATTERNS DÉTECTÉS**

**AP-B16-06: PHYSICS ENGINE DANS HOOK**
```javascript
// L70-150+ - Complex physics calculations in React hook
const calculateRepulsion = () => { /* complex vector math */ };
// → Physics logic should be in dedicated service
```

### **useModelLoader.js (236L) - Loader + Material Processing**

#### **🎯 RESPONSABILITÉS IDENTIFIÉES**
1. **GLTF loading** (L52-80) - GLTFLoader + DRACO setup
2. **Material classification** (L17-49) - IRIS/Eye/Arm detection
3. **Material processing** (L120-180) - Emissive + bloom setup
4. **Animation extraction** (L85-110) - Animation clips processing
5. **Progress tracking** (L10-14) - Loading state management

#### **❌ ANTI-PATTERNS DÉTECTÉS**

**AP-B16-07: MATERIAL BUSINESS LOGIC DANS HOOK**
```javascript
// L17-49 - Complex material classification
const isIRISMesh = useCallback((meshName) => { /* business logic */ });
const isEyeMesh = useCallback((meshName) => { /* business logic */ });
// → Business rules should be in services
```

---

## 🔍 ANALYSE COUPLAGES & DÉPENDANCES

### **COUPLAGE EXTERNE (CRITIQUE ❌)**
- **window.* globals** : revelationSystem, sceneStateController, renderer, scene, camera
- **Zustand store** : Direct useSceneStore access dans hooks
- **Three.js deep** : Complex Three.js object manipulation
- **Material constants** : RING_MATERIALS, ARM_MATERIALS_ALL direct imports

### **COUPLAGE INTERNE (ÉLEVÉ ❌)**
- **Cross-hook dependencies** : useSimpleBloom dans useThreeScene
- **Shared configurations** : V3_CONFIG utilisé dans multiple hooks
- **State coordination** : Multiple hooks touchant mêmes systèmes

### **COUPLAGE TEMPOREL (TRÈS ÉLEVÉ ❌)**
- **systemsInitialized dependencies** : Multiple hooks attendent initialisation
- **Animation frames** : Render loops + physics updates
- **Sync timing** : setTimeout + double verification patterns

---

## 📊 MÉTRIQUES QUALITÉ CODE

### **COMPLEXITÉ CYCLOMATIQUE**
```
useTempBloomSync    : 20/10 (CRITIQUE - god hook)
useThreeScene       : 15/10 (TRÈS ÉLEVÉE - orchestrateur)
useFloatingSpace    : 12/10 (ÉLEVÉE - physics complex)
useModelLoader      : 10/10 (ÉLEVÉE - material processing)
Autres hooks        : 6-8/10 (MODÉRÉE)
```

### **SEPARATION OF CONCERNS**
```
Single Responsibility   : 3/10 (Multiple hooks multi-responsabilités)
Open/Closed Principle   : 5/10 (Configuration externe mais logic tight)
Dependency Injection    : 2/10 (Global window access partout)
Interface Segregation   : 6/10 (APIs spécialisées mais trop larges)
```

### **MAINTENABILITÉ**
```
Lisibilité             : 7/10 (Code structuré mais hooks trop longs)
Testabilité            : 2/10 (Global dependencies + complex state)
Évolutivité            : 3/10 (Tight coupling + god hooks)
Documentation          : 8/10 (Comments techniques appropriés)
```

---

## 🎯 PROBLÉMATIQUES XSTATE IDENTIFIÉES

### **P-B16-01: BUSINESS LOGIC DANS REACT HOOKS**
**Impact** : Difficult testing, tight coupling, no reusability
**Code** : Physics calculations, material classification, sync logic in hooks
**Symptômes** : useCallback business logic + complex state management + React-specific

### **P-B16-02: GOD HOOKS ANTI-PATTERN**
**Impact** : Unmaintainable, difficult debugging, multiple responsibilities
**Code** : useTempBloomSync (662L), useThreeScene (383L) monster hooks
**Symptômes** : 6+ responsibilities + global coupling + complex coordination

### **P-B16-03: GLOBAL WINDOW COORDINATION FRAGILE**
**Impact** : Runtime errors, difficult testing, tight coupling
**Code** : window.* access pattern dans multiple hooks
**Symptoms** : Defensive programming + no type safety + initialization dependencies

### **P-B16-04: REACT LIFECYCLE MISUSE**
**Impact** : Performance issues, unnecessary re-renders, complex dependencies
**Code** : useEffect avec complex dependencies + business logic
**Symptoms** : Heavy useEffect + systemsInitialized flags + sync timing

---

## 🚀 POTENTIEL REFONTE TOTALE XSTATE

### **🏆 FORCES POUR XSTATE CONSTRUCTION**

**✅ Business logic** bien identifiée (à extraire vers services)
**✅ État coordination** complex (perfect pour Actor Model)
**✅ System dependencies** (service injection via actors)
**✅ Lifecycle management** (Actor lifecycle vs React lifecycle)
**✅ Event coordination** (cross-system communication)

### **🎯 VISION XSTATE ACTOR MODEL**

#### **TRANSFORMATION HOOKS → SERVICES + REACT INTEGRATION**

**Phase 1 : Extraction Business Logic**
```
useTempBloomSync → SystemCoordinatorActor
useFloatingSpace → PhysicsService
useModelLoader → ModelLoaderService + MaterialService
useThreeScene → SceneService + RenderService
```

**Phase 2 : React Integration Layer**
```
useXStateService(SystemCoordinatorActor) → state + actions
useXStateService(PhysicsService) → physics state + controls
useXStateService(ModelLoaderService) → loading state + model
useXStateService(SceneService) → scene state + controls
```

#### **MACHINE SERVICES SPÉCIALISÉES**

**SystemCoordinatorActor** : Remplace useTempBloomSync
```
States: idle | coordinating | syncing | error
Events: COORDINATE_SYSTEMS | SYNC_STATE | FORCE_RENDER
Guards: systemsReady, hasValidState
Actions: syncRevealation, syncBloom, forceRender
Services: systemSyncService, stateVerificationService
```

**PhysicsService** : Remplace useFloatingSpace logic
```
States: idle | calculating | applying | stable
Events: MOUSE_MOVE | UPDATE_PHYSICS | APPLY_FORCES
Guards: hasValidModel, mouseInBounds
Actions: calculateRepulsion, applyForces, updatePosition
Services: physicsCalculationService
```

**ModelLoaderService** : Remplace useModelLoader logic
```
States: idle | loading | processing | ready | error
Events: LOAD_MODEL | PROCESS_MATERIALS | EXTRACT_ANIMATIONS
Guards: hasValidUrl, canProcess
Actions: loadGLTF, processMaterials, extractAnimations
Services: gltfLoaderService, materialProcessingService
```

### **🔄 PLAN CONSTRUCTION PROGRESSIVE**

**Phase 1** : Extract useTempBloomSync business logic → SystemCoordinatorActor
**Phase 2** : Transform useFloatingSpace physics → PhysicsService
**Phase 3** : Decompose useModelLoader → ModelLoaderService + MaterialService
**Phase 4** : Construire useThreeScene → SceneService + RenderService
**Phase 5** : Create React integration hooks useXStateService()
**Phase 6** : Construire remaining hooks to service-based pattern

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

### **🚨 PRIORITÉ 1 : EXTRACTION BUSINESS LOGIC**
- **Déplacer** toute business logic hors des hooks React
- **Créer** services XState spécialisés par domaine
- **Éliminer** god hooks (useTempBloomSync, useThreeScene)

### **⚡ PRIORITÉ 2 : DÉCOUPLAGE GLOBAL DEPENDENCIES**
- **Remplacer** window.* access par service injection
- **Dependency injection** via Actor services
- **Type-safe** interfaces pour system coordination

### **🔧 PRIORITÉ 3 : REACT INTEGRATION LAYER**
- **Créer** useXStateService() hook pour Actor integration
- **Thin React hooks** qui exposent juste state + actions
- **Separation** React lifecycle vs business logic lifecycle

### **📊 PRIORITÉ 4 : SYSTEM COORDINATION FORMELLE**
- **Actor Model** pour cross-system communication
- **Event-driven** coordination au lieu de direct calls
- **State machines** pour complex coordination logic

---

## 📈 IMPACT REFONTE TOTALE

### **ARCHITECTURE TRANSFORMÉE**
- **God hooks** → Specialized services + thin React integration
- **Business logic** → XState actors with formal states
- **Global coupling** → Service injection + typed interfaces

### **TESTABILITÉ AMÉLIORÉE**
- **Hooks testing** → Service unit testing + React integration testing
- **Business logic** → Isolated actor testing
- **System coordination** → Actor communication testing

### **PERFORMANCE OPTIMISÉE**
- **React re-renders** → Reduced via service-based state
- **Global state** → Optimized Actor state management
- **System coordination** → Event-driven efficiency

---

## 🏁 CONCLUSION

Le domaine **Hooks** présente des **anti-patterns critiques** avec god hooks contenant business logic complexe. La **transformation vers Actor services** avec thin React integration layer représente une **refonte totale majeure** essentielle pour la maintenabilité.

**Transformation architecturale** : 10 hooks business logic → Services XState + React integration hooks.

**Priorité refonte totale** : ⭐⭐⭐⭐⭐ **CRITIQUE** - Anti-patterns majeurs à corriger

---

## 📊 MÉTRIQUES FINALES

```
Lignes analysées       : 2,219L
Fichiers concernés     : 10
Anti-patterns majeurs  : 7
Couplages critiques    : 6
Potentiel XState       : 100% (Transformation nécessaire)
Complexité domaine     : Très élevée (god hooks)
Priorité construction     : CRITIQUE (architecture anti-patterns)
God Hooks identifiés   : 2 (useTempBloomSync 662L, useThreeScene 383L)
```