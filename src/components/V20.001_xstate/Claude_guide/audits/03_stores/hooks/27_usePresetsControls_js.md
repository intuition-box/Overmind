# 📋 RAPPORT AUDIT : usePresetsControls.js

**Date** : 25/09/2025 - SESSION 27
**Fichier** : `stores/hooks/usePresetsControls.js`
**Taille** : 155 lignes
**Type** : Hook Zustand Presets Advanced (Legacy Conversion + Registry Management)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- useSceneStore from '../sceneStore.js'
- { shallow } from 'zustand/shallow'
```

### **Imports internes**
```javascript
- { PRESET_REGISTRY } from '../../utils/presets.js'
```

---

## 🎯 **OBJECTIF HOOK**

### **Fonctions principales**
- **Presets management** : Application + historique + validation + metadata tracking
- **Legacy conversion** : Convert legacy presets → Zustand actions
- **Registry integration** : PRESET_REGISTRY access + available presets listing
- **Cross-domain application** : Bloom + PBR + Lighting + Background + Security
- **Import/Export** : State serialization + preset sharing

---

## 🏗️ **ARCHITECTURE HOOK UNIQUE**

### **usePresetsControls - Hook Master**
```javascript
export const usePresetsControls = () => {
  // Individual selectors pour performance
  const currentPreset = useSceneStore((state) => state.metadata.currentPreset);
  const lastPresetApplied = useSceneStore((state) => state.metadata.lastPresetApplied);
  const isPresetModified = useSceneStore((state) => state.metadata.isPresetModified);
  const presetHistory = useSceneStore((state) => state.metadata.presetHistory);

  // Actions stables
  const actions = useSceneStore.getState();

  return {
    // État presets
    currentPreset, lastPresetApplied, isPresetModified, presetHistory,

    // Actions principales
    applyPreset: actions.applyPreset,
    clearCurrentPreset: actions.clearCurrentPreset,
    markPresetModified: actions.markPresetModified,

    // Export/Import
    exportState: actions.exportState,
    importState: actions.importState,

    // Extended helpers + Legacy conversion
    // ... (complex logic)
  };
};
```

**Pattern** : Single hook avec extensive helpers + legacy conversion

---

## 📚 **PRESET REGISTRY INTEGRATION**

### **getAvailablePresets - Registry Access**
```javascript
getAvailablePresets: () => {
  return Object.entries(PRESET_REGISTRY).map(([key, preset]) => ({
    key,
    name: preset.name || key,
    description: preset.description || '',
    securityMode: preset.securityMode || null
  }));
}
```

### **Helper Functions**
```javascript
isPresetActive: (presetName) => currentPreset === presetName,

getPresetInfo: (presetName) => PRESET_REGISTRY[presetName] || null,
```

**Registry** : External PRESET_REGISTRY avec structured access

---

## 🔄 **LEGACY PRESET CONVERSION**

### **applyLegacyPreset - Cross-Domain Application**
```javascript
applyLegacyPreset: (presetName) => {
  const legacyPreset = PRESET_REGISTRY[presetName];
  if (!legacyPreset) {
    console.warn(`❌ Preset not found: ${presetName}`);
    return false;
  }

  console.log(`🎨 Applying legacy preset: ${presetName}`, legacyPreset);

  try {
    // 1. Appliquer Bloom (4 properties)
    if (legacyPreset.bloom) {
      actions.setBloomEnabled(legacyPreset.bloom.enabled ?? true);
      actions.setBloomGlobal('threshold', legacyPreset.bloom.threshold ?? 0);
      actions.setBloomGlobal('strength', legacyPreset.bloom.strength ?? 0.17);
      actions.setBloomGlobal('radius', legacyPreset.bloom.radius ?? 0.4);
    }

    // 2. Appliquer BloomGroups (4 properties per group)
    if (legacyPreset.bloomGroups) {
      Object.entries(legacyPreset.bloomGroups).forEach(([groupName, groupSettings]) => {
        if (groupSettings.threshold !== undefined) {
          actions.setBloomGroup(groupName, 'threshold', groupSettings.threshold);
        }
        if (groupSettings.strength !== undefined) {
          actions.setBloomGroup(groupName, 'strength', groupSettings.strength);
        }
        if (groupSettings.radius !== undefined) {
          actions.setBloomGroup(groupName, 'radius', groupSettings.radius);
        }
        if (groupSettings.emissiveIntensity !== undefined) {
          actions.setBloomGroup(groupName, 'emissiveIntensity', groupSettings.emissiveIntensity);
        }
      });
    }

    // 3. Appliquer PBR (preset + multipliers)
    if (legacyPreset.pbrPreset) {
      actions.setPbrPreset(legacyPreset.pbrPreset);
    }
    if (legacyPreset.pbrMultipliers) {
      if (legacyPreset.pbrMultipliers.ambientMultiplier !== undefined) {
        actions.setPbrMultiplier('ambient', legacyPreset.pbrMultipliers.ambientMultiplier);
      }
      if (legacyPreset.pbrMultipliers.directionalMultiplier !== undefined) {
        actions.setPbrMultiplier('directional', legacyPreset.pbrMultipliers.directionalMultiplier);
      }
    }

    // 4. Appliquer Lighting (exposure + ambient + directional)
    if (legacyPreset.exposure !== undefined) {
      actions.setExposure(legacyPreset.exposure);
    }
    if (legacyPreset.ambient) {
      if (legacyPreset.ambient.color !== undefined) {
        actions.setAmbientLight('color', legacyPreset.ambient.color);
      }
      if (legacyPreset.ambient.intensity !== undefined) {
        actions.setAmbientLight('intensity', legacyPreset.ambient.intensity);
      }
    }
    if (legacyPreset.directional) {
      if (legacyPreset.directional.color !== undefined) {
        actions.setDirectionalLight('color', legacyPreset.directional.color);
      }
      if (legacyPreset.directional.intensity !== undefined) {
        actions.setDirectionalLight('intensity', legacyPreset.directional.intensity);
      }
    }

    // 5. Appliquer Background (type + color + alpha)
    if (legacyPreset.backgroundType) {
      actions.setBackgroundType(legacyPreset.backgroundType);
    }
    if (legacyPreset.background) {
      if (legacyPreset.background.color) {
        actions.setBackgroundColor(legacyPreset.background.color);
      }
      if (legacyPreset.background.alpha !== undefined) {
        actions.setBackgroundAlpha(legacyPreset.background.alpha);
      }
    }

    // 6. Appliquer Security
    if (legacyPreset.securityMode) {
      actions.setSecurityMode(legacyPreset.securityMode);
    }

    // 7. Mettre à jour metadata
    actions.setCurrentPreset(presetName);

    console.log(`✅ Legacy preset ${presetName} applied successfully`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to apply legacy preset ${presetName}:`, error);
    return false;
  }
}
```

**Complexity** : Cross-domain preset application avec 6 domains + error handling

---

## 🎨 **PRESET DOMAINS SUPPORTED**

### **1. Bloom System**
- **enabled** : Master bloom switch
- **threshold, strength, radius** : Global bloom parameters
- **bloomGroups** : Per-group settings (iris, eyeRings, etc.)

### **2. PBR System**
- **pbrPreset** : Named PBR preset
- **ambientMultiplier, directionalMultiplier** : Light multipliers

### **3. Lighting System**
- **exposure** : Camera exposure
- **ambient** : Ambient light color + intensity
- **directional** : Directional light color + intensity

### **4. Background System**
- **backgroundType** : color, gradient, environment
- **background.color, background.alpha** : Background properties

### **5. Security System**
- **securityMode** : Security state configuration

### **6. Metadata System**
- **currentPreset** : Active preset tracking
- **presetHistory** : Application history

**Coverage** : 6 complete domains avec cross-domain coordination

---

## ✅ **AVANTAGES ARCHITECTURE**

### **1. Legacy Bridge Excellence**
- **Complete conversion** : Legacy presets → Zustand actions automatique
- **6 domains support** : Bloom + PBR + Lighting + Background + Security + Metadata
- **Error handling** : Try-catch avec detailed logging + return boolean success
- **Backward compatibility** : Legacy presets work seamlessly

### **2. Registry Integration**
- **External registry** : PRESET_REGISTRY separation concerns
- **Helper functions** : getAvailablePresets(), isPresetActive(), getPresetInfo()
- **Structured access** : Key + name + description + securityMode extraction
- **Validation** : Preset existence check avec warning

### **3. Preset Management Complete**
- **State tracking** : currentPreset + lastPresetApplied + isPresetModified + history
- **Import/Export** : State serialization + sharing capabilities
- **Modification tracking** : markPresetModified pour user modifications
- **Clear operations** : clearCurrentPreset pour reset state

### **4. Developer Experience**
- **Extensive logging** : Console feedback apply process + success/error
- **Return values** : Boolean success pour programmatic handling
- **Performance optimized** : Individual selectors + getState() actions
- **Single hook** : All preset operations centralized

---

## ⚠️ **LIMITATIONS IDENTIFIÉES**

### **1. Monolithic applyLegacyPreset**
```javascript
// 100+ lignes dans single function
applyLegacyPreset: (presetName) => {
  // 6 domains × multiple properties = complex logic
  // Hard to test, maintain, debug
  // No modular breakdown
}
```

### **2. Hard-Coded Domain Knowledge**
```javascript
// Domain-specific actions hardcoded
actions.setBloomEnabled(legacyPreset.bloom.enabled ?? true);
actions.setPbrPreset(legacyPreset.pbrPreset);
actions.setExposure(legacyPreset.exposure);
// Tight coupling avec store action names
```

### **3. No Preset Validation**
```javascript
// Pas de schema validation preset structure
// Pas de type checking properties
// Runtime errors si preset malformed
// Silent failures possible avec undefined checks
```

### **4. Registry External Dependency**
```javascript
// PRESET_REGISTRY import externe
// Pas de fallback si registry unavailable
// No dynamic preset loading
// Static registry assumption
```

---

## 🎯 **USAGE PATTERNS**

### **Component Integration Examples**
```javascript
// Preset selector component
const PresetSelector = () => {
  const {
    currentPreset, getAvailablePresets, isPresetActive,
    applyPreset, applyLegacyPreset
  } = usePresetsControls();

  const availablePresets = getAvailablePresets();

  return (
    <div>
      <h3>Current Preset: {currentPreset || 'None'}</h3>
      <div>
        {availablePresets.map(preset => (
          <button
            key={preset.key}
            className={isPresetActive(preset.key) ? 'active' : ''}
            onClick={() => applyLegacyPreset(preset.key)}
          >
            {preset.name}
            {preset.description && <small>{preset.description}</small>}
          </button>
        ))}
      </div>
    </div>
  );
};

// Preset management panel
const PresetManager = () => {
  const {
    currentPreset, isPresetModified, presetHistory,
    exportState, importState, clearCurrentPreset,
    markPresetModified
  } = usePresetsControls();

  const handleExport = async () => {
    const state = exportState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preset-${currentPreset || 'custom'}.json`;
    a.click();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      importState(imported);
      console.log('Preset imported successfully');
    } catch (error) {
      console.error('Failed to import preset:', error);
    }
  };

  return (
    <div>
      <div>
        <p>Active Preset: {currentPreset}</p>
        {isPresetModified && <span className="modified">Modified</span>}
      </div>

      <div>
        <button onClick={handleExport}>Export Current State</button>
        <input type="file" accept=".json" onChange={handleImport} />
        <button onClick={clearCurrentPreset}>Clear Preset</button>
      </div>

      <div>
        <h4>History ({presetHistory?.length || 0})</h4>
        {presetHistory?.map((entry, i) => (
          <div key={i}>
            {entry.presetName} - {new Date(entry.timestamp).toLocaleString()}
          </div>
        ))}
      </div>

      <button onClick={() => markPresetModified()}>
        Mark as Modified
      </button>
    </div>
  );
};

// Preset info display
const PresetInfo = ({ presetName }) => {
  const { getPresetInfo, isPresetActive } = usePresetsControls();
  const info = getPresetInfo(presetName);

  if (!info) return <p>Preset not found</p>;

  return (
    <div className={isPresetActive(presetName) ? 'active-preset' : ''}>
      <h3>{info.name || presetName}</h3>
      <p>{info.description}</p>
      {info.securityMode && (
        <span className="security-mode">Security: {info.securityMode}</span>
      )}
      <div>
        <h4>Domains:</h4>
        <ul>
          {info.bloom && <li>Bloom: ✓</li>}
          {info.pbrPreset && <li>PBR: {info.pbrPreset}</li>}
          {info.exposure !== undefined && <li>Exposure: {info.exposure}</li>}
          {info.backgroundType && <li>Background: {info.backgroundType}</li>}
          {info.securityMode && <li>Security: {info.securityMode}</li>}
        </ul>
      </div>
    </div>
  );
};
```

---

## 🎯 **RECOMMANDATIONS POUR XSTATE**

### **Presets XState Machine**
```javascript
const presetsMachine = createMachine({
  id: 'presets',
  initial: 'idle',
  context: {
    currentPreset: null,
    lastApplied: null,
    isModified: false,
    history: [],
    registry: null,
    validationErrors: []
  },
  states: {
    idle: {
      on: {
        LOAD_REGISTRY: {
          target: 'loadingRegistry',
          actions: 'setRegistrySource'
        },
        APPLY_PRESET: {
          target: 'applyingPreset',
          actions: 'setTargetPreset'
        },
        EXPORT_STATE: 'exporting',
        IMPORT_STATE: 'importing'
      }
    },
    loadingRegistry: {
      invoke: {
        src: 'loadPresetRegistryService',
        onDone: {
          target: 'ready',
          actions: 'setRegistry'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    ready: {
      on: {
        APPLY_PRESET: {
          target: 'applyingPreset',
          actions: 'setTargetPreset'
        },
        CLEAR_PRESET: {
          actions: 'clearCurrentPreset'
        },
        MARK_MODIFIED: {
          actions: 'markAsModified'
        },
        EXPORT_STATE: 'exporting',
        IMPORT_STATE: 'importing'
      }
    },
    applyingPreset: {
      initial: 'validating',
      states: {
        validating: {
          invoke: {
            src: 'validatePresetService',
            onDone: {
              target: 'applying',
              actions: 'setValidationResult'
            },
            onError: {
              target: 'failed',
              actions: 'setValidationErrors'
            }
          }
        },
        applying: {
          type: 'parallel',
          states: {
            bloom: {
              invoke: { src: 'applyBloomPresetService' }
            },
            pbr: {
              invoke: { src: 'applyPbrPresetService' }
            },
            lighting: {
              invoke: { src: 'applyLightingPresetService' }
            },
            background: {
              invoke: { src: 'applyBackgroundPresetService' }
            },
            security: {
              invoke: { src: 'applySecurityPresetService' }
            }
          },
          onDone: {
            target: 'success',
            actions: ['updateCurrentPreset', 'addToHistory']
          }
        },
        success: {
          after: {
            1000: '#presets.ready'
          }
        },
        failed: {
          on: {
            RETRY: 'validating',
            CANCEL: '#presets.ready'
          }
        }
      }
    },
    exporting: {
      invoke: {
        src: 'exportStateService',
        onDone: {
          target: 'ready',
          actions: 'handleExportSuccess'
        }
      }
    },
    importing: {
      invoke: {
        src: 'importStateService',
        onDone: {
          target: 'ready',
          actions: 'handleImportSuccess'
        },
        onError: {
          target: 'ready',
          actions: 'handleImportError'
        }
      }
    },
    error: {
      on: {
        RETRY: 'loadingRegistry',
        RESET: 'idle'
      }
    }
  },
  actions: {
    updateCurrentPreset: assign({
      currentPreset: (context, event) => event.presetName,
      lastApplied: (context, event) => event.presetName,
      isModified: false
    }),
    addToHistory: assign({
      history: (context, event) => [
        ...context.history,
        {
          presetName: event.presetName,
          timestamp: Date.now(),
          domains: event.appliedDomains
        }
      ].slice(-10) // Keep last 10
    }),
    markAsModified: assign({
      isModified: true
    })
  }
});
```

### **XState Services Modular**
```javascript
// Service validation preset
const validatePresetService = (context, event) => {
  return new Promise((resolve, reject) => {
    const { targetPreset } = context;
    const preset = context.registry[targetPreset];

    if (!preset) {
      reject(new Error(`Preset not found: ${targetPreset}`));
      return;
    }

    // Schema validation
    const errors = [];
    if (preset.bloom && typeof preset.bloom.enabled !== 'boolean') {
      errors.push('bloom.enabled must be boolean');
    }
    if (preset.exposure && (preset.exposure < 0.1 || preset.exposure > 3.0)) {
      errors.push('exposure must be between 0.1 and 3.0');
    }

    if (errors.length > 0) {
      reject(new Error(`Validation errors: ${errors.join(', ')}`));
    } else {
      resolve({ preset, validationPassed: true });
    }
  });
};

// Service application bloom modular
const applyBloomPresetService = (context, event) => {
  return new Promise((resolve, reject) => {
    try {
      const { preset } = event.data;
      const bloomActions = [];

      if (preset.bloom) {
        if (preset.bloom.enabled !== undefined) {
          bloomActions.push(['setBloomEnabled', preset.bloom.enabled]);
        }
        if (preset.bloom.threshold !== undefined) {
          bloomActions.push(['setBloomGlobal', 'threshold', preset.bloom.threshold]);
        }
        // ... autres bloom properties
      }

      // Apply bloom groups
      if (preset.bloomGroups) {
        Object.entries(preset.bloomGroups).forEach(([groupName, settings]) => {
          Object.entries(settings).forEach(([prop, value]) => {
            bloomActions.push(['setBloomGroup', groupName, prop, value]);
          });
        });
      }

      resolve({ domain: 'bloom', actionsApplied: bloomActions });
    } catch (error) {
      reject(error);
    }
  });
};
```

### **XState Hooks Equivalents**
```javascript
// Hook master avec machine
export const usePresetsControls = () => {
  const [state, send] = useActor(presetsMachine);

  return useMemo(() => ({
    // State
    currentPreset: state.context.currentPreset,
    isModified: state.context.isModified,
    history: state.context.history,
    isReady: state.matches('ready'),
    isApplying: state.matches('applyingPreset'),

    // Actions
    loadRegistry: (source) => send({ type: 'LOAD_REGISTRY', source }),
    applyPreset: (presetName) => send({ type: 'APPLY_PRESET', presetName }),
    clearPreset: () => send({ type: 'CLEAR_PRESET' }),
    markModified: () => send({ type: 'MARK_MODIFIED' }),
    exportState: () => send({ type: 'EXPORT_STATE' }),
    importState: (data) => send({ type: 'IMPORT_STATE', data }),

    // Helpers
    getAvailablePresets: () => {
      return state.context.registry ?
        Object.keys(state.context.registry).map(key => ({
          key,
          ...state.context.registry[key]
        })) : [];
    },
    isPresetActive: (presetName) => state.context.currentPreset === presetName
  }), [state, send]);
};
```

---

## 📊 **MÉTRIQUES**

- **Lignes** : 155 (substantial)
- **Domains supported** : 6 (Bloom + PBR + Lighting + Background + Security + Metadata)
- **Legacy conversion** : Complete cross-domain application
- **External dependencies** : PRESET_REGISTRY + shallow
- **Error handling** : Try-catch + boolean returns + console logging
- **Helper functions** : 4 (getAvailablePresets, isPresetActive, getPresetInfo, applyLegacyPreset)
- **Import/Export** : State serialization support

---

## ✅ **CONCLUSION**

**usePresetsControls.js = Hook presets advanced 155 lignes avec legacy conversion + 6 domains support + registry integration**

### **Points forts**
- **Legacy bridge excellence** : Complete conversion legacy presets → Zustand actions
- **Cross-domain support** : 6 complete domains avec coordination
- **Registry integration** : External PRESET_REGISTRY avec structured access + helpers
- **Complete management** : Apply + history + modification tracking + import/export

### **Points faibles**
- **Monolithic applyLegacyPreset** : 100+ lignes complex logic hard to maintain
- **Hard-coded domain knowledge** : Tight coupling avec store action names
- **No preset validation** : Schema validation missing + runtime errors possible
- **Registry dependency** : Static registry assumption + no dynamic loading

### **Construction XState**
- **Complexité** : 🔴 ÉLEVÉE
- **Pattern** : Machine parallèle + services modular + validation pipeline
- **Benefits** : Schema validation + modular application + error recovery + parallel processing
- **Services** : Validation + domain-specific application + import/export + registry loading

**Recommandation** : **CONSTRUIRE vers machine XState complexe** avec services modular + **schema validation** + **parallel domain application** + **error recovery pipeline**

---

**FIN SESSION 27 - usePresetsControls.js**
**Durée analyse** : ~30 minutes
**Prochaine session** : useSecurityControls.js (dernier hook!)