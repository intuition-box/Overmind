# SESSION 36 : AUDIT pbrSlice.js

## 📊 MÉTRIQUES

**Fichier** : `stores/slices/pbrSlice.js`
**Lignes** : 409
**Complexité** : **TRÈS ÉLEVÉE**
**Architecture** : **Zustand Slice Phase 2** + **Preset System** + **Cross-Domain Sync**
**Pattern** : **Factory Function** + **Preset Definitions** + **Window Global Coupling**

## 🔍 ANALYSE TECHNIQUE

### Structure Phase 2 Preset-Driven

**PBR_PRESET_DEFINITIONS** (L11-88) - Presets PBR complets
```javascript
const PBR_PRESET_DEFINITIONS = {
  studioProPlus: {
    name: 'Studio Pro +',
    ambient: { intensity: 1.0, color: 0x404040 },      // Base reference
    directional: { intensity: 1.0, color: 0xffffff },   // Base reference
    exposure: 1.7,
    toneMapping: 'AgXToneMapping',                       // Three.js constant
    environmentIntensity: 1.1,
    defaultMaterialSettings: { metalness: 0.3, roughness: 1.0 },
    description: 'Studio Pro optimisé - Configuration par défaut'
  },
  chromeShowcase: {
    ambient: { intensity: 0.571, color: 0x404040 },     // 2.0/3.5 = multiplier
    directional: { intensity: 0.6, color: 0xffffff },    // 3.0/5.0 = multiplier
    // ... autres presets: softStudio, dramaticMood
  }
};
```
- **4 presets complets** : studioProPlus (reference), chromeShowcase, softStudio, dramaticMood
- **Multiplier system** : valeurs = multipliers de base (studioProPlus)
- **Multi-domain** : ambient, directional, exposure, toneMapping, materials
- **Comments explicites** : "⚠️ Les valeurs sont des MULTIPLIERS, pas valeurs absolues"

**INITIAL_PBR_STATE** (L93-138) - État synchronisé preset
```javascript
const INITIAL_PBR_STATE = {
  currentPreset: 'studioProPlus',           // Preset actuel

  // Multipliers globaux (1.0 = base Studio Pro+)
  ambientMultiplier: 1.0,                   // ×3.5 base = 3.5 final
  directionalMultiplier: 1.0,               // ×5.0 base = 5.0 final
  customExposure: 1.7,                      // ✅ Exposure initial Studio Pro+

  // 🔥 NOUVEAU: Paramètres rendu avancé (synchronisés preset)
  toneMapping: 'AgXToneMapping',
  environmentIntensity: 1.1,

  // 6 domaines synchronisés avec preset
  materialSettings: { metalness, roughness, targetMaterials },
  hdrBoost: { enabled, multiplier },
  areaLights: { enabled, intensity, width, height },
  environment: { enabled, intensity, rotation },
  advancedLighting: { enabled }
};
```
- **~20 paramètres** synchronisés avec preset
- **6 domaines PBR** : multipliers, materials, hdr, areaLights, environment, advancedLighting
- **Corrections évidentes** : "✅ Valeur Studio Pro+" commentaires partout

## 🎯 ACTIONS BUSINESS SOPHISTIQUÉES

### Actions Cross-Domain (15+ actions)

**1. CRITIQUE: setPbrPreset** (L158-222) - Sync UI + Render
```javascript
setPbrPreset: (presetName) => {
  const presetDef = PBR_PRESET_DEFINITIONS[presetName];

  if (presetDef) {
    // 🔥 SYNC TOTAL: UI + lighting + metadata
    set((state) => ({
      pbr: {
        ...state.pbr,
        currentPreset: presetName,
        ambientMultiplier: presetDef.ambient.intensity,
        directionalMultiplier: presetDef.directional.intensity,
        customExposure: presetDef.exposure,
        toneMapping: presetDef.toneMapping,
        environmentIntensity: presetDef.environmentIntensity,
        // ... tous paramètres preset
      },
      // CROSS-DOMAIN SYNC
      lighting: { ...state.lighting, exposure: presetDef.exposure },
      metadata: { ...state.metadata, currentPreset: presetName, lastModified: Date.now() }
    }), false, `setPbrPreset:${presetName}:withCompleteUISync`);

    // 🔧 BACKUP: Appliquer aussi au rendu Three.js via controller
    const pbrController = window.pbrLightingController;
    if (pbrController && pbrController.applyPreset) {
      console.log(`🎯 SYNC RENDER: Applying preset ${presetName} to Three.js`);
      pbrController.applyPreset(presetName);
    }

    console.log(`✅ COMPLETE SYNC: ${presetName} applied to both UI and render with ALL parameters`);
    return;
  }

  // 🔧 FALLBACK: Si preset inconnu, juste nom
  console.warn(`⚠️ Unknown preset: ${presetName}, applying name only`);
  set((state) => ({ pbr: { ...state.pbr, currentPreset: presetName } }), false, `setPbrPreset:${presetName}:nameOnly`);
}
```
- **CROSS-DOMAIN SYNC** : pbr + lighting + metadata atomique
- **WINDOW GLOBAL COUPLING** : `window.pbrLightingController` access
- **Complete sync** : UI state + Three.js render sync
- **Fallback handling** : preset inconnu = name only
- **Console logging** : extensive debugging traces

**2. Multiplier system** (L240-249)
```javascript
setPbrMultiplier: (type, value) => set((state) => ({
  pbr: { ...state.pbr, [`${type}Multiplier`]: value }
}), false, `setPbrMultiplier:${type}:${value}`),

setPbrMultipliers: (multipliers) => set((state) => ({
  pbr: { ...state.pbr, ...multipliers }
}), false, `setPbrMultipliers:${Object.keys(multipliers).join(',')}`),
```
- **Dynamic property** : `[${type}Multiplier]` computed key
- **Batch operations** : multiple multipliers atomique

**3. HDR Boost sophistiqué** (L278-296)
```javascript
setHdrBoost: (enabled, multiplier = null) => set((state) => ({
  pbr: {
    ...state.pbr,
    hdrBoost: {
      enabled,
      multiplier: multiplier !== null ? multiplier : state.pbr.hdrBoost.multiplier
    }
  }
}), false, `setHdrBoost:${enabled}:${multiplier}`),
```
- **Optional parameter** : multiplier = null preserves existing
- **Conditional logic** : ternary pour préservation valeur

**4. Validation system** (L379-401)
```javascript
validatePbrValues: (parameter, value) => {
  const validations = {
    // 🔥 CORRIGÉ: Réduire amplitude pour réglages plus fins
    ambientMultiplier: { min: 0.1, max: 3.0, type: 'number' }, // ×3.5×20=210 max
    directionalMultiplier: { min: 0.1, max: 2.0, type: 'number' }, // ×5×10=100 max
    customExposure: { min: 0.4, max: 5, type: 'number' },
    metalness: { min: 0.3, max: 1, type: 'number' },
    // ... 8 validation rules total
  };
  // Math.max/min clamping + type validation
}
```
- **8 validation rules** : ranges métier précis
- **Corrections amplitude** : commentaires "🔥 CORRIGÉ" réduction ranges
- **Calculation comments** : multiplier math explained (×3.5×20=210)

## ⚡ PERFORMANCE

### Optimisations et Anti-Patterns
- **Preset definitions static** : évite recalculations
- **Cross-domain atomic** : 3 slices updated atomiquement
- **Window global access** : `window.pbrLightingController` (coupling)
- **Console logging extensive** : debugging performance impact

### Performance Score : **6.5/10**
- ✅ Static preset definitions
- ✅ Batch operations
- ✅ Validation clamping
- ⚠️ Cross-domain atomic updates (heavy)
- ⚠️ Window global coupling
- ⚠️ Extensive console logging

## 🏗️ ARCHITECTURE

### Points Forts
- **Preset system sophistiqué** : 4 presets complets avec multipliers
- **Cross-domain sync** : pbr + lighting + metadata cohérence
- **Multiplier architecture** : base values + multipliers intelligents
- **Complete synchronization** : UI + Three.js render sync
- **Validation system** : 8 rules avec ranges métier
- **Fallback handling** : preset inconnu géré

### Points Faibles Critiques
- **WINDOW GLOBAL COUPLING** : `window.pbrLightingController` = tight coupling
- **Cross-domain violations** : pbrSlice modifie lighting + metadata
- **Console logging pollution** : extensive logs production code
- **Preset definitions bloat** : 80 lignes definitions dans slice
- **Complex preset sync** : 20+ paramètres synchronisés

### Architecture Score : **6/10**
- ✅ Preset system sophistiqué
- ✅ Multiplier architecture intelligente
- ✅ Complete UI/render sync
- ❌ Window global coupling critique
- ❌ Cross-domain violations
- ❌ Console logging pollution

## 🔄 CONSTRUCTION XSTATE

### Recommandations Machines

**PbrMachine** (Machine preset-driven)
```javascript
const pbrMachine = createMachine({
  id: 'pbr',
  initial: 'idle',
  context: {
    currentPreset: 'studioProPlus',
    ambientMultiplier: 1.0,
    directionalMultiplier: 1.0,
    materialSettings: { metalness: 0.3, roughness: 1.0 }
  },
  states: {
    idle: {
      on: {
        APPLY_PRESET: 'applyingPreset',
        UPDATE_MULTIPLIER: { actions: 'updateMultiplier' }
      }
    },
    applyingPreset: {
      entry: 'validatePreset',
      always: [
        { target: 'syncingRender', cond: 'presetValid' },
        { target: 'idle', actions: 'logPresetError' }
      ]
    },
    syncingRender: {
      invoke: {
        src: 'syncRenderService',
        onDone: { target: 'idle', actions: 'confirmSync' },
        onError: { target: 'idle', actions: 'logSyncError' }
      }
    }
  }
});
```

**RenderSyncService** (Service découplé)
```javascript
const renderSyncService = createMachine({
  id: 'renderSync',
  initial: 'idle',
  states: {
    idle: { on: { SYNC: 'syncing' } },
    syncing: {
      invoke: {
        src: 'applyToThreeJs',  // Service externe au lieu window global
        onDone: 'idle'
      }
    }
  }
});
```

### Services et Actions XState
```javascript
services: {
  applyToThreeJs: (context, event) => {
    // Service externe remplace window.pbrLightingController
    return pbrRenderService.applyPreset(event.presetName);
  },
  validatePreset: (context, event) => {
    return PBR_PRESET_DEFINITIONS[event.presetName] ?
      Promise.resolve(PBR_PRESET_DEFINITIONS[event.presetName]) :
      Promise.reject('Invalid preset');
  }
},
guards: {
  presetValid: (context, event) =>
    !!PBR_PRESET_DEFINITIONS[event.presetName]
},
actions: {
  updateMultiplier: assign((context, event) => ({
    [`${event.type}Multiplier`]: validatePbrValues(event.type, event.value)
  })),
  validatePreset: assign((context, event) => ({
    pendingPreset: PBR_PRESET_DEFINITIONS[event.presetName]
  }))
}
```

### Avantages XState
- **États preset application** : `idle → applyingPreset → syncingRender → idle`
- **Services découplés** : render sync externe au lieu window globals
- **Guards validation** : preset validation intégrée
- **Actions with validation** : updateMultiplier avec validation
- **Error handling** : preset + sync errors gérés

### Effort Construction : **TRÈS ÉLEVÉ** (5-6j)
- Window global coupling à découpler
- Cross-domain sync à externaliser services
- Preset system à porter context + actions
- 20+ paramètres à organiser context
- Validation à porter guards

## 📈 ÉVALUATION GLOBALE

### Qualité Code : **6/10**
- Preset system sophistiqué
- Cross-domain sync ambitieux
- Window global coupling problématique
- Console logging pollution

### Maintenabilité : **5.5/10**
- Preset definitions centralised
- Cross-domain violations difficiles maintenir
- Window coupling fragile
- Complex synchronization logic

### Prêt XState : **6/10**
- Preset system = états + context naturels
- Cross-domain à découpler massivement
- Window globals à externaliser services
- Validation portable guards

## 🎯 PRIORITÉ CONSTRUCTION

**RANG** : **1/8** (Priorité maximale - architecture critique)

**Justification** :
- **Window global coupling** = architecture fragile critique
- **Cross-domain sync** = bénéficie enormément services XState découplés
- **Preset system riche** = états machines naturels
- **Performance impact** = synchronization UI + render optimisable XState

**Ordre recommandé** : PREMIER - architecture critique nécessite refonte

## ⚠️ ARCHITECTURE CRITIQUE

### Window Global Coupling
- **`window.pbrLightingController`** = tight coupling fragile
- **Console production logs** = performance + maintainability issues
- **Cross-domain violations** = lighting + metadata modified par pbrSlice

### XState Solution Prioritaire
- **Services découplés** : render sync externe
- **États preset application** : validation → sync → confirmation
- **Guards protection** : preset validation + multiplier ranges
- **Architecture robuste** : découplage window globals + cross-domain