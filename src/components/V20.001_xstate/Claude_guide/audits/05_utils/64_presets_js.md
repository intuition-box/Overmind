# SESSION 64 : AUDIT presets.js

## 📊 MÉTRIQUES

**Fichier** : `utils/presets.js`
**Lignes** : 266
**Complexité** : **MODÉRÉE-HAUTE**
**Architecture** : **Preset System Manager**
**Pattern** : **Preset Registry** + **Application Function** + **Query API**

## 🔍 ANALYSE TECHNIQUE

### Preset System Manager

```javascript
// 🎯 PRESETS SYSTÈME - Configuration par mode sécurité + thème
// Basé sur la capture de paramètres du système DebugPanel

// ⚪ PRESET BLANC (capturé le 2025-09-11)
export const BLANC_DARK_PRESET = {
  name: "blanc_dark",
  description: "Mode Blanc (Normal) - Thème sombre",
  securityMode: "NORMAL",
  timestamp: "2025-09-11T06:41:10.016Z",
  /* ... 164 lignes configuration complète ... */
};
```

### Responsabilités Spécialisées (6 domaines)

1. **Preset Definition** - Configuration complète BLANC_DARK_PRESET (164 lignes)
2. **Registry Management** - PRESET_REGISTRY avec clés organisées (3 lignes)
3. **Query API** - getPresetByMode() avec sélection mode+theme (4 lignes)
4. **Application Engine** - applyPreset() avec handlers multiples (54 lignes)
5. **Discovery API** - getAvailablePresets() pour listing (8 lignes)
6. **Error Handling** - Try/catch avec logging dans applyPreset

### Preset Structure Analysis (164 lignes)

**Configuration complète avec 13 domaines :**

```javascript
export const BLANC_DARK_PRESET = {
  // Métadonnées
  name: "blanc_dark",
  securityMode: "NORMAL",
  timestamp: "2025-09-11T06:41:10.016Z",

  // Rendu (5 paramètres)
  exposure: 1,
  toneMapping: 5,
  defaultMaterialSettings: { metalness: 0.3, roughness: 1 },

  // Bloom système (26 paramètres)
  bloom: { enabled: true, threshold: 0, strength: 0.17, radius: 0.4 },
  bloomGroups: {
    iris: { threshold: 0.3, strength: 0.8, radius: 0.4 },
    eyeRings: { threshold: 0.4, strength: 0.6, radius: 0.3 },
    revealRings: { threshold: 0.43, strength: 0.4, radius: 0.36 }
  },

  // Matériaux (20 paramètres)
  materials: {
    global: { metalness: 0.3, roughness: 1 },
    groups: {
      iris: { emissive: 65416, emissiveIntensity: 1.4 },
      eyeRings: { emissive: 4491519, emissiveIntensity: 1.8 },
      /* ... */
    }
  },

  // Caméra (10 paramètres)
  camera: {
    position: { x: 1.804, y: 1.445, z: 13.437 },
    rotation: { x: -0.107, y: 0.132, z: 0.014 },
    fov: 85, zoom: 1
  },

  // Particules (19 paramètres)
  particles: {
    enabled: true, particleCount: 400,
    arcs: { enabled: true, count: 15, intensity: 5 },
    mouseRepulsion: { enabled: true, radius: 3, force: 0.05 }
  }
};
```

### Application Engine (54 lignes)

```javascript
/**
 * Appliquer un preset à tous les systèmes
 */
export function applyPreset(preset, handlers) {
  if (!preset) return false;

  try {
    // Bloom système
    if (preset.groups && handlers.onColorBloomChange) {
      handlers.onColorBloomChange('global', 'threshold', preset.groups.globalThreshold);
      Object.entries(preset.groups.bloomValues).forEach(([groupName, values]) => {
        Object.entries(values).forEach(([param, value]) => {
          handlers.onColorBloomChange(groupName, param, value);
        });
      });
    }

    // PBR Lighting
    if (preset.pbr && handlers.pbrLightingController) {
      const controller = handlers.pbrLightingController;
      controller.applyPreset(preset.pbr.currentPreset);
      controller.applyHDRBoost(preset.pbr.hdrBoost.enabled);
    }

    // Background + MSAA
    if (preset.background && handlers.setBackground) {
      handlers.setBackground(preset.background.type, preset.background.color);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur application preset:', error);
    return false;
  }
}
```

## ⚡ PERFORMANCE

### Performance Issues Modérés

1. **Large Object in Memory** - BLANC_DARK_PRESET 164 lignes en mémoire
2. **Deep Object Traversal** - Object.entries() nested dans applyPreset()
3. **Handler Coupling** - Multiple handler calls per preset application
4. **No Lazy Loading** - Tout preset chargé immédiatement
5. **Registry Linear Search** - getPresetByMode() avec clé string simple

### Performance Concerns
```javascript
// ❌ Deep nested iteration
Object.entries(preset.groups.bloomValues).forEach(([groupName, values]) => {
  Object.entries(values).forEach(([param, value]) => {
    handlers.onColorBloomChange(groupName, param, value); // Multiple calls
  });
});

// ❌ Handler coupling with optional chaining abuse
system.setMSAAEnabled?.(preset.msaa.enabled);
system.updateMSAASamples?.(preset.msaa.samples);
system.setFXAAEnabled?.(preset.msaa.fxaaEnabled);
```

### Performance Score : **7/10**
- ✅ Registry efficient pour small dataset
- ✅ Static objects, pas de runtime computation
- ❌ Deep object traversal
- ❌ Multiple handler calls per application

## 🏗️ ARCHITECTURE

### Points Forts
- ✅ **Registry Pattern** - PRESET_REGISTRY centralisé
- ✅ **Query API** - getPresetByMode() avec paramètres flexibles
- ✅ **Application Engine** - applyPreset() avec handlers
- ✅ **Discovery API** - getAvailablePresets() pour UI
- ✅ **Error Handling** - Try/catch avec logging
- ✅ **Timestamp Tracking** - Preset versioning

### Points Faibles
- ❌ **Single Preset Only** - Registry avec 1 seul preset
- ❌ **Handler Coupling** - applyPreset() couplé aux handlers spécifiques
- ❌ **No Validation** - Pas de validation preset schema
- ❌ **Complex Preset Structure** - 164 lignes nested object
- ⚠️ **Template System Missing** - getAvailablePresets() check template mais aucun template

### Architecture Issues
```javascript
// ❌ Registry avec 1 seul preset
export const PRESET_REGISTRY = {
  'blanc_dark': BLANC_DARK_PRESET // Seul preset
};

// ❌ Handler coupling spécifique
if (preset.groups && handlers.onColorBloomChange) { // Specific coupling
if (preset.pbr && handlers.pbrLightingController) { // Specific coupling

// ❌ Dead code - template check
isTemplate: preset.name.includes('TEMPLATE') // Aucun template exist
```

### Architecture Score : **6/10**
- ✅ **Registry pattern clean**
- ✅ **API design good**
- ❌ **Single preset limitation**
- ❌ **Handler coupling critique**

## 🔄 CONSTRUCTION XSTATE

### Recommandations XState
```javascript
// Preset system → XState context + services
const PresetSystemMachine = createMachine({
  id: 'presetSystem',
  initial: 'idle',
  context: {
    currentPreset: null,
    registry: PRESET_REGISTRY,
    lastApplied: null
  },
  states: {
    idle: {
      on: {
        APPLY_PRESET: {
          target: 'applying',
          actions: 'setCurrentPreset'
        }
      }
    },
    applying: {
      invoke: {
        src: 'applyPresetService',
        onDone: {
          target: 'applied',
          actions: 'setLastApplied'
        },
        onError: {
          target: 'error',
          actions: 'logError'
        }
      }
    },
    applied: {
      on: {
        APPLY_PRESET: 'applying'
      }
    },
    error: {
      on: {
        RETRY: 'applying',
        RESET: 'idle'
      }
    }
  }
});

// Services découplés
const services = {
  applyPresetService: (context, event) => {
    return applyPresetAsync(context.currentPreset, event.handlers);
  }
};
```

### Construction Complexity : **MODÉRÉE**
- **Handler coupling découplage** nécessaire
- **Async preset application** avec XState services
- **Error state management** avec XState
- **Registry management** compatible immédiatement

### Effort Construction : **2-3 semaines** (Handler découplage + async services)

## 📈 ÉVALUATION GLOBALE

### Qualité Code : **6/10**
- ✅ **Registry pattern clean**
- ✅ **API design cohérent**
- ❌ **Single preset limitation**
- ❌ **Handler coupling fort**

### Maintenabilité : **6/10**
- ✅ **Preset structure extensible**
- ✅ **Error handling present**
- ❌ **Handler dependencies coupling**
- ❌ **No schema validation**

### Prêt XState : **6/10**
- ✅ **Registry compatible**
- ❌ **Handler coupling découplage requis**
- ❌ **Async services adaptation**

## 🎯 PRIORITÉ CONSTRUCTION

**RANG** : **12/23** (MODÉRÉE)

**Justification** : **Preset system manager** avec registry pattern clean mais souffrant de handler coupling critique et structure single-preset. Construction modérée nécessaire pour découplage handlers XState.

**Issues Critiques** :
- Handler coupling spécifique (onColorBloomChange, pbrLightingController)
- Registry avec 1 seul preset seulement
- Deep object traversal dans applyPreset
- No schema validation

**Actions Nécessaires** :
1. **Handler découplage** avec injection dependencies
2. **Async preset application** XState services
3. **Registry expansion** multi-presets
4. **Schema validation** ajout

**Action** : Construction modérée - Découpler handlers + async services pour architecture XState propre