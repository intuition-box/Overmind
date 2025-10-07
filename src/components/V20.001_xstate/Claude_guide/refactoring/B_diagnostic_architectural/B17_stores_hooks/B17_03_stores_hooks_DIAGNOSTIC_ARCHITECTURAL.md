# 📋 SESSION B17 - DIAGNOSTIC ARCHITECTURAL
## `03_stores/hooks` (858L Total)

**Date** : 26 septembre 2025
**Phase** : B - Diagnostic Architectural
**Scope** : Domaine Stores/Hooks - Sélecteurs Zustand spécialisés + UI bindings
**Criticité** : MODÉRÉE - Hooks sélecteurs propres avec patterns optimisés
**Verdict XState** : **BONNE TRANSITION** - Sélecteurs → Actor state + React integration

**Potentiel refonte totale** : ⭐⭐⭐⭐☆ (4/5) - Architecture déjà correcte, construction nouveau système via XState

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Architecture actuelle** : 6 hooks sélecteurs Zustand spécialisés par domaine UI
**Forces** : Pattern sélecteurs propres, shallow equality, actions stables, séparation domaines
**Faiblesses** : Couplage Zustand direct, pas de state validation, logique UI dispersée
**Verdict XState** : **BONNE BASE** - Hooks sélecteurs → Actor state selectors + validation

**Potentiel refonte totale** : ⭐⭐⭐⭐☆ (4/5) - Construction nouveau système basé sur architecture existante correcte

---

## 📁 STRUCTURE DOMAINE ANALYSÉE

```
stores/hooks/                            (858L total)
├── useDebugPanelControls.js             (256L) - Hub central debug panel
├── useBloomControls.js                  (235L) - Sélecteurs bloom + groupes
├── usePresetsControls.js                (154L) - Gestion presets + historique
├── useMsaaControls.js                   (92L)  - Anti-aliasing controls
├── useSecurityControls.js               (67L)  - Security states + presets
└── useParticlesControls.js              (54L)  - Particles + arcs controls
```

### **RÉPARTITION COMPLEXITÉ**
- **Hub central** : useDebugPanelControls (256L) = 29.8%
- **Spécialisés** : useBloomControls (235L), usePresetsControls (154L) = 389L (45.3%)
- **Simples** : 3 hooks restants = 213L (24.9%)

---

## 🏗️ ANALYSE ARCHITECTURALE DÉTAILLÉE

### **useDebugPanelControls.js (256L) - Hub Central Debug**

#### **🎯 Responsabilités Identifiées**
1. **UI state selectors** (L22-27) - activeTab, showDebug, isCollapsed
2. **Bloom state aggregation** (L29-34) - Bloom state + actions
3. **Actions exposure** (L54-61) - Stable action references
4. **Specialized hooks** (L69-85) - Tab-specific optimized selectors
5. **Computed values** (L63-66) - Version + construction phase

#### **✅ POINTS POSITIFS**
- **Actions stability** : `useSceneStore.getState()` pour éviter re-renders
- **Specialized hooks** : useBloomTabControls pour granularité
- **Clean separation** : UI state vs business state bien séparé
- **Performance optimization** : Sélecteurs individuels granulaires
- **Documentation** : Excellent before/after comparison

#### **❌ ANTI-PATTERNS DÉTECTÉS**

**AP-B17-01: ZUSTAND COUPLING DIRECT**
```javascript
// L24-34 - Direct Zustand store coupling
const activeTab = useSceneStore((state) => state.metadata.activeTab);
const bloom = useSceneStore((state) => state.bloom);
// → Tight coupling to Zustand implementation
```

**AP-B17-02: COMPUTED VALUES SANS MEMOIZATION**
```javascript
// L63-66 - Computed values recalculated each render
version: useSceneStore.getState().metadata.version,
developmentPhase: useSceneStore.getState().metadata.developmentPhase
// → No memoization, recalculated every render
```

### **useBloomControls.js (235L) - Sélecteurs Bloom Spécialisés**

#### **🎯 Responsabilités Identifiées**
1. **Main bloom selector** (L13-33) - Complete bloom state + actions
2. **Global bloom controls** (L40-53) - Global parameters only
3. **Group-specific controls** (L60-85) - Individual group selectors
4. **Batch operations** (L140-160) - Multiple groups batch updates
5. **Error handling** (L65-78) - Graceful group not found handling

#### **✅ POINTS POSITIFS**
- **Shallow equality** : Explicit shallow comparison optimization
- **Granular selectors** : useBloomGlobalControls + useBloomGroupControls
- **Error resilience** : Graceful handling missing groups
- **Batch operations** : Efficient multi-parameter updates
- **Performance focused** : Targeted selectors évitent re-renders

#### **❌ ANTI-PATTERNS DÉTECTÉS**

**AP-B17-03: VALIDATION LOGIC DANS HOOKS**
```javascript
// L65-78 - Business logic validation in hook
if (!group) {
  console.warn(`❌ Bloom group "${groupName}" not found`);
  return { /* default object */ };
}
// → Validation should be in state layer
```

### **usePresetsControls.js (154L) - Gestion Presets Complexe**

#### **🎯 Responsabilités Identifiées**
1. **Preset state selectors** (L14-22) - Current + history + modification
2. **Actions exposure** (L32-38) - Apply/clear/mark modified
3. **Export/import** (L37-38) - State serialization
4. **Helpers extended** (L41-65) - Preset utilities + validation
5. **PRESET_REGISTRY integration** (L8, L42) - External registry coupling

#### **✅ POINTS POSITIVES**
- **Clean state selection** : Granular preset state selectors
- **Utility helpers** : Rich helper functions for preset management
- **History tracking** : Preset application history maintained
- **Import/export** : State persistence capabilities

#### **❌ ANTI-PATTERNS DÉTECTÉS**

**AP-B17-04: EXTERNAL REGISTRY COUPLING**
```javascript
// L8, L42-47 - Direct external registry import
import { PRESET_REGISTRY } from '../../utils/presets.js';
getAvailablePresets: () => Object.entries(PRESET_REGISTRY)
// → Tight coupling external configuration
```

**AP-B17-05: BUSINESS LOGIC DANS HELPERS**
```javascript
// L52-65 - Complex business logic in hook helpers
hasUnsavedChanges: () => { /* complex comparison logic */ },
validatePreset: (presetData) => { /* validation rules */ }
// → Business logic should be in services
```

### **Hooks Simples (3 fichiers - 213L) - Patterns Optimisés**

#### **useMsaaControls.js (92L), useSecurityControls.js (67L), useParticlesControls.js (54L)**

#### **✅ ARCHITECTURE EXCELLENTE**
- **Single responsibility** parfaite par domaine
- **Granular selectors** : États individuels + actions groupées
- **Specialized variants** : useFxaaControls, useSecurityPresets, useArcsControls
- **Helper functions** : Computed values + status helpers
- **Performance optimized** : Minimal re-render surfaces

#### **❌ ANTI-PATTERNS MINEURS**

**AP-B17-06: HELPER LOGIC DUPLICATION**
```javascript
// useMsaaControls.js L71-91 - Helper logic in multiple files
getPerformanceStatus: () => { /* status calculation */ }
// → Similar patterns across multiple hooks
```

---

## 🔍 ANALYSE COUPLAGES & DÉPENDANCES

### **COUPLAGE EXTERNE (Modéré ⚠️)**
- **Zustand direct** : useSceneStore coupling dans tous les hooks
- **External config** : PRESET_REGISTRY import (usePresetsControls)
- **Shallow utility** : zustand/shallow import pattern

### **COUPLAGE INTERNE (Faible ✅)**
- **Domain separation** : Hooks bien isolés par domaine
- **Action stability** : Pattern getState() consistent
- **No cross-dependencies** : Hooks indépendants entre eux

### **COUPLAGE TEMPOREL (Faible ✅)**
- **React lifecycle** : Standard React hooks patterns
- **State synchronization** : Zustand reactivity handled properly
- **No complex timing** : Sélecteurs synchrones simples

---

## 📊 MÉTRIQUES QUALITÉ CODE

### **COMPLEXITÉ CYCLOMATIQUE**
```
useDebugPanelControls  : 8/10 (Modérée - hub central mais bien structuré)
useBloomControls       : 7/10 (Modérée - multiple sélecteurs spécialisés)
usePresetsControls     : 9/10 (Modérée-élevée - helpers complex)
Hooks simples          : 4-5/10 (Faible - patterns optimisés)
```

### **SEPARATION OF CONCERNS**
```
Single Responsibility   : 8/10 (Hooks spécialisés par domaine)
Open/Closed Principle   : 7/10 (Extensible via configuration)
Dependency Injection    : 6/10 (Zustand coupling mais clean)
Interface Segregation   : 9/10 (Granular selectors excellents)
```

### **MAINTENABILITÉ**
```
Lisibilité             : 9/10 (Code très clair, patterns cohérents)
Testabilité            : 7/10 (React Testing Library friendly)
Évolutivité            : 8/10 (Architecture modulaire)
Documentation          : 9/10 (Excellent commenting + examples)
```

---

## 🎯 PROBLÉMATIQUES XSTATE IDENTIFIÉES

### **P-B17-01: ZUSTAND COUPLING SANS ABSTRACTION**
**Impact** : Difficulté de construction du nouveau système, vendor lock-in
**Code** : useSceneStore direct access dans tous hooks
**Symptômes** : Store implementation leaking into React layer

### **P-B17-02: STATE VALIDATION DISPERSÉE**
**Impact** : Inconsistent validation, difficult maintenance
**Code** : Group validation, preset validation in multiple hooks
**Symptômes** : Business rules in UI layer + duplication

### **P-B17-03: HELPER LOGIC SANS SERVICES**
**Impact** : Code duplication, difficult testing
**Code** : Performance status, preset validation, computed helpers
**Symptoms** : Business logic in hooks instead of services

### **P-B17-04: NO STATE MACHINE BENEFITS**
**Impact** : Missing state validation, no state visualization
**Code** : Simple boolean/string states without FSM
**Symptoms** : Manual state management without guards/transitions

---

## 🚀 POTENTIEL REFONTE TOTALE XSTATE

### **🏆 FORCES POUR CONSTRUCTION NOUVEAU SYSTÈME XSTATE**

**✅ Architecture sélecteurs** déjà correcte (pattern préservé)
**✅ Domain separation** claire (transformation Actor directe)
**✅ Action stability** patterns (Actor action references)
**✅ Helper functions** (services layer natural)
**✅ Granular selection** (Actor state selectors)

### **🎯 VISION XSTATE ACTOR MODEL**

#### **TRANSFORMATION : HOOKS SELECTORS → ACTOR STATE + REACT INTEGRATION**

**Phase 1 : Actor State Layer**
```
useDebugPanelControls → DebugPanelActor state selectors
useBloomControls → BloomActor state selectors + group actors
usePresetsControls → PresetManagerActor state selectors
useMsaaControls → PostProcessingActor.msaa state selectors
```

**Phase 2 : React Integration Layer**
```
useActorState(DebugPanelActor, (state) => state.context.activeTab)
useActorState(BloomActor, (state) => state.context.globalSettings)
useActorActions(PresetManagerActor) → { applyPreset, validatePreset }
```

#### **ACTOR STATE SELECTORS PATTERN**

**DebugPanelActor**
```
States: idle | configuring | applying
Context: {
  activeTab: 'groups',
  showDebug: true,
  isCollapsed: false,
  securityState: 'NORMAL'
}
Actions: setActiveTab, toggleDebug, toggleCollapsed
Guards: isValidTab, canToggle
```

**BloomActor + BloomGroupActors**
```
BloomActor {
  States: idle | updating | batch_updating
  Context: { globalSettings: {}, groups: Map<string, BloomGroupActor> }
}

BloomGroupActor {
  States: idle | updating | validating | error
  Context: { threshold: 0.15, strength: 1.0, emissive: '#00ff88' }
  Guards: isValidValue, canUpdate
}
```

### **🔄 PLAN CONSTRUCTION PROGRESSIVE**

**Phase 1** : Extract helper logic → Services (validation, computation)
**Phase 2** : Transform simple hooks → Actor state selectors (particles, security)
**Phase 3** : Complex hooks → Actor composition (bloom groups, presets)
**Phase 4** : Central hub → Orchestrator actor (debug panel)
**Phase 5** : React integration layer → useActorState hooks

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

### **🚨 PRIORITÉ 1 : EXTRACT BUSINESS LOGIC TO SERVICES**
- **Déplacer** validation logic, helpers, computed values hors hooks
- **Créer** services layer pour business rules
- **Hooks** deviennent pure UI state selectors

### **⚡ PRIORITÉ 2 : ABSTRACT ZUSTAND COUPLING**
- **Créer** abstraction layer entre hooks et state management
- **useActorState()** pattern pour découpler implementation
- **Prepare** construction nouveau système Zustand → XState actors

### **🔧 PRIORITÉ 3 : STATE VALIDATION FORMELLE**
- **Remplacer** manual validation par Actor guards
- **Formaliser** state transitions avec XState machines
- **Centralize** validation rules dans Actor definitions

### **📊 PRIORITÉ 4 : SPECIALIZED ACTOR DECOMPOSITION**
- **BloomGroupActors** pour individual group management
- **PresetManagerActor** avec history + validation formelle
- **PostProcessingActor** pour MSAA + effects coordination

---

## 📈 IMPACT REFONTE TOTALE

### **ARCHITECTURE AMÉLIORÉE**
- **Hooks layer** : Pure UI selectors → Business logic extracted
- **State validation** : Manual checks → Actor guards + transitions
- **Helper functions** : Hooks helpers → Services layer

### **MAINTENABILITÉ AMÉLIORÉE**
- **Testing** : Hooks UI testing + Service logic testing séparés
- **Business rules** : Centralized dans Actor definitions
- **State visualization** : XState Inspector pour debugging

### **PERFORMANCE OPTIMISÉE**
- **Re-render optimization** : Actor state granularity
- **Memoization** : Actor context memoization
- **State coordination** : Actor communication efficiency

---

## 🏁 CONCLUSION

Le domaine **Stores/Hooks** présente une **architecture déjà correcte** avec patterns sélecteurs propres et optimisations performance. La **refonte totale XState** améliorerait la **validation formelle**, l'**abstraction state management**, et l'**extraction business logic** sans changer les patterns fondamentaux.

**Évolution naturelle** : Hooks sélecteurs → Actor state selectors + services layer + React integration.

**Priorité refonte totale** : ⭐⭐⭐⭐☆ **HAUTE** - Construction nouveau système basé sur architecture existante

---

## 📊 MÉTRIQUES FINALES

```
Lignes analysées       : 858L
Fichiers concernés     : 6
Anti-patterns majeurs  : 6 (mineurs)
Couplages critiques    : 2
Potentiel XState       : 80% (Bonne base existante)
Complexité domaine     : Modérée (sélecteurs optimisés)
Priorité construction  : HAUTE (nouveau système avec patterns améliorés)
Architecture actuelle  : CORRECTE (patterns React optimisés)
```