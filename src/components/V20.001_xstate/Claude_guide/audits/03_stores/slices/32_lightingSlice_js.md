# SESSION 32 : AUDIT lightingSlice.js

## 📊 MÉTRIQUES

**Fichier** : `stores/slices/lightingSlice.js`
**Lignes** : 249
**Complexité** : **ÉLEVÉE**
**Architecture** : **Zustand Slice Refonteed** + **Validation System**
**Pattern** : **Factory Function** + **Initial State Constant** + **Business Validation**

## 🔍 ANALYSE TECHNIQUE

### Structure Refonteed avec Initial State

**INITIAL_LIGHTING_STATE** (L9-49) - Constant externe
```javascript
const INITIAL_LIGHTING_STATE = {
  // ❌ SUPPRIMÉ: ambient/directional (doublons avec PBR multipliers)
  exposure: 1.0,
  toneMapping: 5, // ACESFilmicToneMapping par défaut
  shadows: { enabled, type, mapSize, bias, radius, blurSamples },
  fog: { enabled, type, color, near, far, density },
  postProcessing: { bloomIntensity, colorCorrection }
};
```
- **Refonteing évident** : commentaires "❌ SUPPRIMÉ" partout
- **Déduplication architecture** : ambient/directional moved to pbrSlice
- **5 domaines** : exposure, toneMapping, shadows, fog, postProcessing

### État Multi-Domaines (5 sections)

**1. Exposition Globale** (L14)
```javascript
exposure: 1.0  // Exposition scène (0.1-5.0 range)
```

**2. Tone Mapping** (L17)
```javascript
toneMapping: 5  // ACESFilmicToneMapping (Three.js constant)
```

**3. Système Shadows** (L20-27)
```javascript
shadows: {
  enabled: true,        // Ombres globales ON/OFF
  type: 'PCFSoft',     // Type Three.js shadow
  mapSize: 2048,       // Résolution shadow map
  bias: -0.0001,       // Anti-acné shadow
  radius: 1,           // Flou ombres
  blurSamples: 25      // Qualité flou
}
```

**4. Fog System** (L30-37)
```javascript
fog: {
  enabled: false,           // Fog OFF par défaut
  type: 'linear',          // 'linear' | 'exponential'
  color: 0xcccccc,        // Couleur fog hexadécimal
  near: 1, far: 1000,     // Distances fog linear
  density: 0.00025        // Densité fog exponential
}
```

**5. Post-Processing** (L40-48)
```javascript
postProcessing: {
  bloomIntensity: 1.0,  // Intensité bloom global
  colorCorrection: {    // 4 corrections couleur
    brightness: 0, contrast: 0, saturation: 0, hue: 0
  }
}
```

## 🎯 ACTIONS AVANCÉES

### Actions avec Business Logic (12+ actions)

**1. Exposure avec clamps** (L69-74)
```javascript
adjustExposure: (delta) => set((state) => ({
  lighting: {
    ...state.lighting,
    exposure: Math.max(0.1, Math.min(5.0, state.lighting.exposure + delta))
  }
}), false, `adjustExposure:${delta}`),
```
- **Range protection** : 0.1-5.0 hard limits
- **Delta adjustments** : increment/decrement intelligents

**2. Generic setters avec merge** (L94-103, L120-129)
```javascript
setShadows: (enabled, config = {}) => set((state) => ({
  lighting: {
    ...state.lighting,
    shadows: { ...state.lighting.shadows, enabled, ...config }
  }
}), false, `setShadows:${enabled}:${JSON.stringify(config)}`),
```
- **Boolean + config pattern** : enabled + partial config merge
- **JSON debug** : stringify config pour DevTools

**3. BUSINESS LOGIC: applyLightingPreset** (L174-197)
```javascript
applyLightingPreset: (presetName, presetData) => {
  if (!presetData.lighting) {
    console.warn('❌ No lighting data in preset');  // Warning user
    return;  // Early exit
  }

  set((state) => {
    const newLighting = { ...state.lighting };
    // Object.assign pour merge preset
    if (presetData.lighting) {
      Object.assign(newLighting, presetData.lighting);
    }
    // ❌ SUPPRIMÉ: ambient/directional (maintenant dans pbrSlice)
    if (presetData.exposure !== undefined) {
      newLighting.exposure = presetData.exposure;
    }
    return { lighting: newLighting };
  }, false, `applyLightingPreset:${presetName}`);
}
```
- **Validation preset** : guard + console.warn
- **Object.assign merge** : preset data → state
- **Partial application** : exposure optionnel

**4. VALIDATION SYSTEM** (L214-245)
```javascript
validateLightingValues: (parameter, value) => {
  const validations = {
    exposure: { min: 0.1, max: 5.0, type: 'number' },
    intensity: { min: 0, max: 20, type: 'number' },
    mapSize: { min: 256, max: 4096, type: 'number', step: 256 },
    bias: { min: -0.01, max: 0.01, type: 'number' },
    // ... 9 rules total
  };
  // Validation + clamping + step logic
}
```
- **9 validation rules** : min/max/type/step defined
- **Clamping intelligent** : Math.max/min protection
- **Step quantization** : mapSize steps de 256

## ⚡ PERFORMANCE

### Optimisations Business
- **Initial state constant** : évite recréations
- **Range clamping** : protection hardware (mapSize steps)
- **Early returns** : validation guards
- **JSON stringify debug** : DevTools tracing

### Performance Score : **8/10**
- ✅ Initial state constant
- ✅ Range validation hardware-aware
- ✅ Generic setters avec merge partiel
- ✅ Early returns validation
- ⚠️ Object.assign (peut être lourd)

## 🏗️ ARCHITECTURE

### Points Forts
- **Refonteing évident** : déduplication ambient/directional
- **Initial state externalisé** : maintenance centralisée
- **Validation system** : business rules centralisées
- **Generic actions** : setShadows, setFog pattern réutilisable
- **Debug tracing** : JSON stringify configs

### Points Faibles
- **Commentaires refonteing** : "❌ SUPPRIMÉ" partout (maintenance debt)
- **Couplage pbrSlice** : références ambient/directional supprimées
- **Validation externe** : validateLightingValues pas utilisée dans actions
- **Object.assign risqué** : mutation potential dans applyLightingPreset

### Architecture Score : **7.5/10**
- ✅ Refonteing déduplication intelligent
- ✅ Validation system centralisé
- ✅ Generic patterns cohérents
- ⚠️ Commentaires maintenance debt
- ⚠️ Validation pas intégrée actions

## 🔄 CONSTRUCTION XSTATE

### Recommandations Machines

**LightingMachine** (Machine avec validation guards)
```javascript
const lightingMachine = createMachine({
  id: 'lighting',
  initial: 'idle',
  context: INITIAL_LIGHTING_STATE,
  states: {
    idle: {
      on: {
        ADJUST_EXPOSURE: {
          actions: 'adjustExposure',
          cond: 'isValidExposure'
        },
        APPLY_PRESET: 'applying'
      }
    },
    applying: {
      entry: 'validatePreset',
      always: [
        { target: 'idle', cond: 'presetValid', actions: 'applyPreset' },
        { target: 'idle', actions: 'logPresetError' }
      ]
    }
  }
});
```

**ShadowsMachine** (Sous-machine shadows)
```javascript
const shadowsMachine = createMachine({
  id: 'shadows',
  initial: 'disabled',
  states: {
    disabled: { on: { ENABLE: 'enabled' } },
    enabled: {
      on: {
        DISABLE: 'disabled',
        UPDATE_CONFIG: { actions: 'updateShadowConfig' }
      }
    }
  }
});
```

### Guards et Validation XState
```javascript
guards: {
  isValidExposure: (context, event) => {
    const value = context.exposure + event.delta;
    return value >= 0.1 && value <= 5.0;
  },
  presetValid: (context, event) =>
    event.presetData && event.presetData.lighting
},
actions: {
  adjustExposure: assign((context, event) => ({
    exposure: Math.max(0.1, Math.min(5.0, context.exposure + event.delta))
  })),
  validatePreset: assign((context, event) => {
    if (!event.presetData.lighting) {
      console.warn('❌ No lighting data in preset');
    }
    return context;
  })
}
```

### Avantages XState
- **Guards validation** : `isValidExposure` protection ranges
- **État application** : `idle → applying → idle` avec validation
- **Validation centralisée** : guards + actions unified
- **Sub-machines** : shadows, fog, postProcessing modulaires

### Effort Construction : **MOYEN** (3-4j)
- Validation system à porter en guards
- Business logic à externaliser
- Sub-machines à créer

## 📈 ÉVALUATION GLOBALE

### Qualité Code : **7.5/10**
- Refonteing déduplication intelligent
- Validation system sophistiqué
- Generic actions réutilisables
- Maintenance debt commentaires

### Maintenabilité : **7/10**
- Initial state externalisé
- Validation rules centralisées
- Commentaires refonteing temporaires
- Architecture en transition

### Prêt XState : **8/10**
- Validation system portable
- Business logic externalisable
- État transitions évidents
- Guards mapping naturel

## 🎯 PRIORITÉ CONSTRUCTION

**RANG** : **4/8** (Priorité élevée)

**Justification** :
- **Validation system riche** : bénéficie grandement des guards XState
- **Business logic centralisée** : services XState naturels
- **Architecture refonteed** : déjà en transition, XState finalise
- **Performance critique** : shadows + fog impact direct rendering

**Ordre recommandé** : Après particlesSlice/msaaSlice/securitySlice, avant bloomSlice

## 📝 REFONTE INSIGHTS

### Evidence Refonteing Phase 2
- **Déduplication ambient/directional** → moved to pbrSlice
- **Initial state externalisé** → maintenance centralisée
- **Validation system ajouté** → business rules protection
- **Generic patterns** → setShadows/setFog réutilisables

### Architecture en Transition
- Slice **refonteed** mais pas **finalized**
- XState construction **logique** pour finaliser architecture
- Validation system **prêt** pour guards XState