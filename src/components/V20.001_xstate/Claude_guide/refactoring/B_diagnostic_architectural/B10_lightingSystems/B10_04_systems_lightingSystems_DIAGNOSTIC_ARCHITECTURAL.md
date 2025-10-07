# 🏗️ SESSION B10 - DIAGNOSTIC ARCHITECTURAL LIGHTINGSYSTEMS DOMAIN

**Entité** : `04_systems/lightingSystems/`
**Focus** : Domaine lighting systems complet
**Date** : 26 septembre 2025
**Passe** : B - Diagnostic Architectural

---

## 🎯 OBJECTIF SESSION B10

**Mission** : Analyser le **DOMAINE LIGHTINGSYSTEMS** complet - système éclairage avancé

**Focus domaine** :
- ✅ Analyse domain lightingSystems/ complet
- ✅ WorldEnvironmentController.js + autres fichiers
- ✅ Architecture lighting coordination
- ✅ Integration PBRLightingController (déjà analysé B07)

**Base** : Sessions S10-S12 + PBRLightingController (B07)

---

## 📁 STRUCTURE LIGHTINGSYSTEMS DOMAIN

### **FICHIERS IDENTIFIÉS**
```
04_systems/lightingSystems/
├── PBRLightingController.js     (1,443L) - Monolithic lighting (analysé B07)
├── WorldEnvironmentController.js (442L)  - HDR orchestrator
├── useLightingControls.js       (178L)  - Lighting presets hook
├── LightingControlPanel.jsx     (267L)  - UI controls React
└── lightingUtils.js             (124L)  - Lighting utilities
──────────────────────────────────────────────────────────────────
TOTAL LIGHTINGSYSTEMS          2,454L
```

**Note** : PBRLightingController (1,443L) déjà analysé en B07 - focus sur autres composants

---

## 🌍 WORLDENVIRONMENTCONTROLLER ANALYSE DÉTAILLÉE

### **RESPONSABILITÉS ARCHITECTURALES**

#### **1. HDR ENVIRONMENT ORCHESTRATION**
- **HDRI Management** : High Dynamic Range Image loading + caching
- **Environment Presets** : Multiple HDR environment configurations
- **Background Control** : Scene background + environment coordination
- **PMREM Generation** : Pre-filtered Mipmap Radiance Environment Maps

#### **2. LIGHTING INTEGRATION**
- **IBL Coordination** : Image-Based Lighting integration
- **PBR Integration** : Integration avec PBRLightingController
- **Material Synchronization** : Environment reflection updates
- **Tone Mapping Coordination** : HDR → LDR pipeline

#### **3. PERFORMANCE OPTIMIZATION**
- **HDR Caching** : Environment map caching system
- **Lazy Loading** : On-demand HDR environment loading
- **Quality Scaling** : Dynamic environment quality
- **Memory Management** : HDR texture lifecycle

### **IMPLÉMENTATION ARCHITECTURE ANALYSIS**

#### **CONSTRUCTION + HDR SETUP (Lines 1-80)**
```javascript
// WorldEnvironmentController.js - Lines 1-80
class WorldEnvironmentController {
  constructor(scene, renderer, pbrLightingController) {
    // ❌ DEPENDENCY ON PBR CONTROLLER
    this.scene = scene;
    this.renderer = renderer;
    this.pbrLightingController = pbrLightingController;

    // ❌ HDR LOADING INFRASTRUCTURE
    this.hdrLoader = new THREE.RGBELoader();
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.textureCache = new Map();

    // ❌ ENVIRONMENT PRESETS SYSTEM
    this.environmentPresets = {
      studio: {
        path: '/assets/environments/studio.hdr',
        intensity: 1.0,
        rotation: 0,
        backgroundIntensity: 0.5,
        backgroundBlur: 0
      },
      outdoor: {
        path: '/assets/environments/outdoor.hdr',
        intensity: 0.8,
        rotation: Math.PI * 0.25,
        backgroundIntensity: 1.0,
        backgroundBlur: 0.1
      },
      night: {
        path: '/assets/environments/night.hdr',
        intensity: 0.3,
        rotation: 0,
        backgroundIntensity: 0.8,
        backgroundBlur: 0.2
      },
      sunset: {
        path: '/assets/environments/sunset.hdr',
        intensity: 1.2,
        rotation: Math.PI * 0.5,
        backgroundIntensity: 1.2,
        backgroundBlur: 0
      },
      industrial: {
        path: '/assets/environments/industrial.hdr',
        intensity: 0.9,
        rotation: 0,
        backgroundIntensity: 0.7,
        backgroundBlur: 0.3
      }
    };

    // ❌ STATE MANAGEMENT
    this.currentEnvironment = null;
    this.currentPreset = 'studio';
    this.isLoading = false;
    this.loadingQueue = [];

    // ❌ PERFORMANCE TRACKING
    this.performanceMetrics = {
      loadTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      memoryUsage: 0
    };

    // ❌ INITIALIZATION
    this.initializeDefaultEnvironment();
  }
}
```

#### **HDR LOADING SYSTEM (Lines 81-200)**
```javascript
// Lines 81-200 (HDR Loading - 120 lignes)
async loadEnvironment(presetName) {
  // ❌ LOADING QUEUE MANAGEMENT
  if (this.isLoading) {
    this.loadingQueue.push(presetName);
    return;
  }

  const preset = this.environmentPresets[presetName];
  if (!preset) {
    console.error(`Environment preset '${presetName}' not found`);
    return;
  }

  this.isLoading = true;
  const startTime = performance.now();

  try {
    // ❌ CACHE CHECK
    let envMap = this.textureCache.get(preset.path);

    if (envMap) {
      // ✅ Cache hit
      this.performanceMetrics.cacheHits++;
      this.applyEnvironment(envMap, preset);
    } else {
      // ❌ Cache miss - Load HDR
      this.performanceMetrics.cacheMisses++;
      envMap = await this.loadHDRTexture(preset.path);

      // ❌ PMREM GENERATION - Expensive operation
      const pmremTexture = this.pmremGenerator.fromEquirectangular(envMap);
      envMap.dispose(); // Cleanup original

      // ❌ CACHE STORAGE
      this.textureCache.set(preset.path, pmremTexture.texture);
      this.applyEnvironment(pmremTexture.texture, preset);
    }

    // ❌ STATE UPDATE
    this.currentEnvironment = envMap;
    this.currentPreset = presetName;

    // ❌ PERFORMANCE METRICS
    this.performanceMetrics.loadTime = performance.now() - startTime;
    this.updateMemoryUsage();

  } catch (error) {
    console.error('Failed to load environment:', error);
    this.handleLoadingError(error, presetName);
  } finally {
    this.isLoading = false;
    this.processLoadingQueue();
  }
}

loadHDRTexture(path) {
  // ❌ PROMISE-BASED HDR LOADING
  return new Promise((resolve, reject) => {
    this.hdrLoader.load(
      path,
      (texture) => {
        // ❌ TEXTURE CONFIGURATION
        texture.mapping = THREE.EquirectangularReflectionMapping;
        resolve(texture);
      },
      (progress) => {
        // ❌ LOADING PROGRESS in main thread
        const percentage = (progress.loaded / progress.total) * 100;
        this.dispatchLoadingProgress(percentage, path);
      },
      (error) => {
        console.error(`Failed to load HDR texture: ${path}`, error);
        reject(error);
      }
    );
  });
}

applyEnvironment(envMap, preset) {
  // ❌ SCENE ENVIRONMENT APPLICATION
  this.scene.environment = envMap;
  this.scene.background = envMap;

  // ❌ ENVIRONMENT INTENSITY
  if (this.scene.environment) {
    this.scene.environment.intensity = preset.intensity;
  }

  // ❌ BACKGROUND CONFIGURATION
  if (this.scene.background) {
    this.scene.background.intensity = preset.backgroundIntensity;

    // Background rotation
    if (preset.rotation !== 0) {
      this.rotateEnvironment(preset.rotation);
    }

    // Background blur
    if (preset.backgroundBlur > 0) {
      this.applyBackgroundBlur(preset.backgroundBlur);
    }
  }

  // ❌ INTEGRATION WITH PBR LIGHTING
  if (this.pbrLightingController) {
    this.pbrLightingController.onEnvironmentChanged(envMap, preset);
  }

  // ❌ SIDE EFFECT - Event dispatch
  this.dispatchEnvironmentChanged(preset);
}
```

#### **ENVIRONMENT MANIPULATION (Lines 201-320)**
```javascript
// Lines 201-320 (Environment Manipulation - 120 lignes)
rotateEnvironment(rotation) {
  // ❌ ENVIRONMENT ROTATION via matrix
  if (this.scene.environment) {
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(rotation);

    // ❌ MATRIX APPLICATION
    this.scene.environment.matrix = rotationMatrix;
    this.scene.environment.matrixAutoUpdate = false;
  }

  if (this.scene.background) {
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(rotation);

    this.scene.background.matrix = rotationMatrix;
    this.scene.background.matrixAutoUpdate = false;
  }
}

applyBackgroundBlur(blurAmount) {
  // ❌ BACKGROUND BLUR IMPLEMENTATION
  if (this.scene.background && blurAmount > 0) {
    // Create blurred version of environment map
    const blurredTexture = this.createBlurredEnvironment(this.scene.background, blurAmount);

    // Apply blurred texture as background
    this.scene.background = blurredTexture;
  }
}

createBlurredEnvironment(envMap, blurAmount) {
  // ❌ BLUR GENERATION - Expensive operation
  const blurSteps = Math.ceil(blurAmount * 10);
  let blurredTexture = envMap;

  for (let i = 0; i < blurSteps; i++) {
    // ❌ ITERATIVE BLUR APPLICATION
    blurredTexture = this.applyBlurPass(blurredTexture, 0.1);
  }

  return blurredTexture;
}

updateEnvironmentIntensity(intensity) {
  // ❌ RUNTIME INTENSITY UPDATE
  if (this.scene.environment) {
    this.scene.environment.intensity = intensity;

    // ❌ TRIGGER MATERIAL UPDATES
    if (this.pbrLightingController) {
      this.pbrLightingController.updateEnvironmentIntensity(intensity);
    }
  }
}

updateBackgroundIntensity(intensity) {
  // ❌ BACKGROUND INTENSITY UPDATE
  if (this.scene.background) {
    this.scene.background.intensity = intensity;
  }
}

// ❌ PRESET MANAGEMENT
createCustomPreset(name, config) {
  // ❌ RUNTIME PRESET CREATION
  this.environmentPresets[name] = {
    path: config.path,
    intensity: config.intensity || 1.0,
    rotation: config.rotation || 0,
    backgroundIntensity: config.backgroundIntensity || 1.0,
    backgroundBlur: config.backgroundBlur || 0
  };

  // ❌ SIDE EFFECT - Save to storage
  this.savePresetToStorage(name, this.environmentPresets[name]);
}

removePreset(presetName) {
  // ❌ PRESET REMOVAL
  if (presetName === this.currentPreset) {
    console.warn('Cannot remove currently active preset');
    return false;
  }

  delete this.environmentPresets[presetName];
  this.removePresetFromStorage(presetName);
  return true;
}
```

#### **PERFORMANCE + CACHE MANAGEMENT (Lines 321-442)**
```javascript
// Lines 321-442 (Performance + Cache - 122 lignes)
updateMemoryUsage() {
  // ❌ MEMORY CALCULATION
  let totalMemory = 0;

  this.textureCache.forEach((texture) => {
    // ❌ TEXTURE MEMORY ESTIMATION
    const width = texture.image ? texture.image.width : 1024;
    const height = texture.image ? texture.image.height : 512;
    const bytesPerPixel = 16; // HDR RGBA16F

    totalMemory += width * height * bytesPerPixel;
  });

  this.performanceMetrics.memoryUsage = totalMemory;

  // ❌ MEMORY PRESSURE MANAGEMENT
  if (totalMemory > 100 * 1024 * 1024) { // 100MB threshold
    this.cleanupOldTextures();
  }
}

cleanupOldTextures() {
  // ❌ LRU CACHE CLEANUP
  const cacheEntries = Array.from(this.textureCache.entries());

  // Sort by usage (would need usage tracking)
  // For now, remove oldest entries
  while (this.performanceMetrics.memoryUsage > 50 * 1024 * 1024 && cacheEntries.length > 1) {
    const [path, texture] = cacheEntries.shift();

    if (path !== this.currentEnvironment?.path) {
      texture.dispose();
      this.textureCache.delete(path);
      this.updateMemoryUsage();
    }
  }
}

processLoadingQueue() {
  // ❌ LOADING QUEUE PROCESSING
  if (this.loadingQueue.length > 0 && !this.isLoading) {
    const nextPreset = this.loadingQueue.shift();
    this.loadEnvironment(nextPreset);
  }
}

handleLoadingError(error, presetName) {
  // ❌ ERROR HANDLING + FALLBACK
  console.error(`Failed to load environment '${presetName}':`, error);

  // ❌ FALLBACK TO DEFAULT
  if (presetName !== 'studio') {
    console.log('Falling back to studio environment');
    this.loadEnvironment('studio');
  } else {
    // ❌ ULTIMATE FALLBACK - Solid color
    this.scene.background = new THREE.Color(0x222222);
    this.scene.environment = null;
  }
}

// ❌ EVENT SYSTEM
dispatchEnvironmentChanged(preset) {
  // ❌ CUSTOM EVENT DISPATCH
  const event = new CustomEvent('environmentChanged', {
    detail: {
      preset: preset,
      environment: this.currentEnvironment,
      metrics: this.performanceMetrics
    }
  });

  window.dispatchEvent(event);
}

dispatchLoadingProgress(percentage, path) {
  // ❌ LOADING PROGRESS EVENT
  const event = new CustomEvent('environmentLoadingProgress', {
    detail: {
      percentage: percentage,
      path: path
    }
  });

  window.dispatchEvent(event);
}

cleanup() {
  // ❌ CLEANUP ORCHESTRATION
  // Dispose cached textures
  this.textureCache.forEach((texture) => {
    texture.dispose();
  });
  this.textureCache.clear();

  // Cleanup PMREM generator
  if (this.pmremGenerator) {
    this.pmremGenerator.dispose();
  }

  // Reset scene environment
  this.scene.background = null;
  this.scene.environment = null;

  // Clear loading queue
  this.loadingQueue.length = 0;
}
```

---

## 🎮 USELIGHTINGCONTROLS ANALYSE DÉTAILLÉE

### **RESPONSABILITÉS HOOK SYSTEM**
- **Lighting presets** : Interface presets éclairage
- **Environment coordination** : HDR + lighting synchronization
- **Performance monitoring** : Lighting performance tracking
- **UI state management** : Controls state binding

### **IMPLÉMENTATION HOOK ANALYSIS**
```javascript
// useLightingControls.js - 178 lignes
const useLightingControls = () => {
  // ❌ COMPLEX STATE SELECTION
  const lightingState = useLightingStore(
    useCallback((state) => ({
      // PBR Lighting state
      basicLighting: state.lighting.basicLighting,
      threePointLighting: state.lighting.threePointLighting,
      areaLights: state.lighting.areaLights,
      shadows: state.lighting.shadows,

      // Environment state
      hdrEnvironment: state.lighting.hdrEnvironment,
      currentPreset: state.lighting.currentPreset,

      // Performance state
      performance: state.lighting.performance
    }), [])
  );

  // ❌ CONTROLLER INSTANCES ACCESS
  const [pbrController] = useState(() => {
    // ❌ Singleton access pattern
    return window.pbrLightingController;
  });

  const [environmentController] = useState(() => {
    // ❌ Singleton access pattern
    return window.worldEnvironmentController;
  });

  // ❌ PRESET MANAGEMENT
  const applyLightingPreset = useCallback(async (presetName) => {
    if (pbrController) {
      // ❌ ASYNC OPERATION in hook
      try {
        await pbrController.applyLightingPreset(presetName);

        // Update store
        useLightingStore.getState().setCurrentPreset(presetName);

        // ❌ SIDE EFFECT - Environment coordination
        if (environmentController) {
          const environmentPreset = getEnvironmentForLightingPreset(presetName);
          if (environmentPreset) {
            await environmentController.loadEnvironment(environmentPreset);
          }
        }
      } catch (error) {
        console.error('Failed to apply lighting preset:', error);
      }
    }
  }, [pbrController, environmentController]);

  // ❌ ENVIRONMENT MANAGEMENT
  const changeEnvironment = useCallback(async (environmentPreset) => {
    if (environmentController) {
      try {
        await environmentController.loadEnvironment(environmentPreset);

        // ❌ SIDE EFFECT - Update lighting to match
        if (pbrController) {
          pbrController.adjustForEnvironment(environmentPreset);
        }

        // Update store
        useLightingStore.getState().setHdrEnvironment({
          currentPreset: environmentPreset,
          enabled: true
        });
      } catch (error) {
        console.error('Failed to change environment:', error);
      }
    }
  }, [environmentController, pbrController]);

  // ❌ PERFORMANCE OPTIMIZATION
  const optimizeLighting = useCallback((targetFPS) => {
    if (pbrController) {
      pbrController.optimizeLightingPerformance(targetFPS);
    }

    if (environmentController) {
      // ❌ Environment quality reduction
      const currentPreset = environmentController.currentPreset;
      const lowQualityPreset = currentPreset + '_low';

      if (environmentController.environmentPresets[lowQualityPreset]) {
        environmentController.loadEnvironment(lowQualityPreset);
      }
    }
  }, [pbrController, environmentController]);

  // ❌ COMPLEX RETURN OBJECT
  return {
    // State
    ...lightingState,

    // Controllers access
    pbrController,
    environmentController,

    // Actions
    applyLightingPreset,
    changeEnvironment,
    optimizeLighting,

    // Basic lighting controls
    toggleBasicLighting: useCallback((enabled) => {
      useLightingStore.getState().setBasicLighting({ enabled });
      if (pbrController) {
        pbrController.toggleBasicLighting(enabled);
      }
    }, [pbrController]),

    // Three-point lighting controls
    toggleThreePointLighting: useCallback((enabled) => {
      useLightingStore.getState().setThreePointLighting({ enabled });
      if (pbrController) {
        pbrController.toggleThreePointLighting(enabled);
      }
    }, [pbrController]),

    // Shadow controls
    toggleShadows: useCallback((enabled) => {
      useLightingStore.getState().setShadows({ enabled });
      if (pbrController) {
        pbrController.toggleShadows(enabled);
      }
    }, [pbrController]),

    // Performance info
    getPerformanceMetrics: useCallback(() => {
      const pbrMetrics = pbrController?.getPerformanceMetrics() || {};
      const envMetrics = environmentController?.performanceMetrics || {};

      return {
        lighting: pbrMetrics,
        environment: envMetrics,
        combined: {
          totalMemory: (pbrMetrics.memoryUsage || 0) + (envMetrics.memoryUsage || 0),
          loadTime: Math.max(pbrMetrics.renderTime || 0, envMetrics.loadTime || 0)
        }
      };
    }, [pbrController, environmentController])
  };
};
```

**❌ ANTI-PATTERNS IDENTIFIÉS** :
- Singleton access pattern (window.controllers)
- Complex state selection + coordination
- Async operations dans hook
- Side effects multiples par action
- Business logic dans hook (coordination PBR + Environment)

---

## 🎨 LIGHTINGCONTROLPANEL ANALYSE DÉTAILLÉE

### **RESPONSABILITÉS UI COMPONENT**
- **Lighting presets UI** : Interface presets éclairage
- **Environment controls** : HDR environment selection
- **Advanced lighting** : Three-point, area lights, shadows
- **Performance monitoring** : Lighting performance display

### **IMPLÉMENTATION REACT ANALYSIS**
```javascript
// LightingControlPanel.jsx - 267 lignes
const LightingControlPanel = () => {
  // ❌ COMPLEX HOOK USAGE
  const lightingControls = useLightingControls();
  const [activeTab, setActiveTab] = useState('presets');
  const [isLoading, setIsLoading] = useState(false);

  // ❌ PRESET APPLICATION WITH LOADING
  const handlePresetChange = useCallback(async (presetName) => {
    setIsLoading(true);
    try {
      await lightingControls.applyLightingPreset(presetName);
    } catch (error) {
      console.error('Failed to apply preset:', error);
      // ❌ ERROR HANDLING in UI
    } finally {
      setIsLoading(false);
    }
  }, [lightingControls]);

  // ❌ ENVIRONMENT CHANGE WITH LOADING
  const handleEnvironmentChange = useCallback(async (environmentName) => {
    setIsLoading(true);
    try {
      await lightingControls.changeEnvironment(environmentName);
    } catch (error) {
      console.error('Failed to change environment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lightingControls]);

  // ❌ MASSIVE RENDER METHOD (180+ lignes)
  return (
    <div className="lighting-control-panel">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === 'presets' ? 'active' : ''}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
        <button
          className={activeTab === 'environment' ? 'active' : ''}
          onClick={() => setActiveTab('environment')}
        >
          Environment
        </button>
        <button
          className={activeTab === 'advanced' ? 'active' : ''}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
        <button
          className={activeTab === 'performance' ? 'active' : ''}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <span>Loading...</span>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="presets-tab">
          <h3>Lighting Presets</h3>
          {Object.keys(lightingControls.pbrController?.presets || {}).map(presetName => (
            <button
              key={presetName}
              className={lightingControls.currentPreset === presetName ? 'active' : ''}
              onClick={() => handlePresetChange(presetName)}
              disabled={isLoading}
            >
              {presetName}
            </button>
          ))}
        </div>
      )}

      {/* Environment Tab */}
      {activeTab === 'environment' && (
        <div className="environment-tab">
          <h3>HDR Environment</h3>
          {Object.keys(lightingControls.environmentController?.environmentPresets || {}).map(envName => (
            <button
              key={envName}
              className={lightingControls.hdrEnvironment.currentPreset === envName ? 'active' : ''}
              onClick={() => handleEnvironmentChange(envName)}
              disabled={isLoading}
            >
              {envName}
            </button>
          ))}

          <div className="environment-controls">
            <Slider
              label="Environment Intensity"
              value={lightingControls.hdrEnvironment.intensity}
              min={0}
              max={3}
              step={0.1}
              onChange={(value) => {
                lightingControls.environmentController?.updateEnvironmentIntensity(value);
              }}
            />

            <Slider
              label="Background Intensity"
              value={lightingControls.hdrEnvironment.backgroundIntensity}
              min={0}
              max={2}
              step={0.1}
              onChange={(value) => {
                lightingControls.environmentController?.updateBackgroundIntensity(value);
              }}
            />
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="advanced-tab">
          <h3>Advanced Lighting</h3>

          <div className="lighting-type-controls">
            <Toggle
              label="Basic Lighting"
              checked={lightingControls.basicLighting.enabled}
              onChange={lightingControls.toggleBasicLighting}
            />

            <Toggle
              label="Three-Point Lighting"
              checked={lightingControls.threePointLighting.enabled}
              onChange={lightingControls.toggleThreePointLighting}
            />

            <Toggle
              label="Shadows"
              checked={lightingControls.shadows.enabled}
              onChange={lightingControls.toggleShadows}
            />
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="performance-tab">
          <h3>Performance Metrics</h3>
          <LightingPerformanceDisplay
            metrics={lightingControls.getPerformanceMetrics()}
            onOptimize={() => lightingControls.optimizeLighting(60)}
          />
        </div>
      )}
    </div>
  );
};
```

**❌ ANTI-PATTERNS IDENTIFIÉS** :
- Complex async operations dans UI component
- Error handling dans UI (should be in services)
- Direct controller access dans render
- Loading state management dans UI
- Business logic coordination in component

---

## 🔧 LIGHTINGUTILS ANALYSE DÉTAILLÉE

### **RESPONSABILITÉS UTILITIES**
- **Lighting calculations** : Mathematical lighting functions
- **Color space utilities** : HDR color processing
- **Performance helpers** : Lighting optimization
- **Preset utilities** : Preset management functions

### **IMPLÉMENTATION UTILITIES**
```javascript
// lightingUtils.js - 124 lignes
export const lightingUtils = {
  // ✅ PURE FUNCTION - Light intensity calculation
  calculateLightIntensity(distance, baseIntensity, falloff = 2.0) {
    return baseIntensity / Math.pow(1 + distance, falloff);
  },

  // ✅ PURE FUNCTION - Shadow bias calculation
  calculateShadowBias(lightAngle, surfaceNormal) {
    const dot = Math.max(0, lightAngle.dot(surfaceNormal));
    return 0.005 * (1.0 - dot);
  },

  // ✅ COLOR SPACE - HDR to LDR conversion
  hdrToLdr(hdrColor, exposure = 1.0, gamma = 2.2) {
    const exposed = {
      r: hdrColor.r * exposure,
      g: hdrColor.g * exposure,
      b: hdrColor.b * exposure
    };

    return {
      r: Math.pow(exposed.r / (1 + exposed.r), 1 / gamma),
      g: Math.pow(exposed.g / (1 + exposed.g), 1 / gamma),
      b: Math.pow(exposed.b / (1 + exposed.b), 1 / gamma)
    };
  },

  // ✅ UTILITY - Lighting preset validation
  validateLightingPreset(preset) {
    const errors = [];

    if (!preset.basicLighting && !preset.threePointLighting && !preset.areaLights) {
      errors.push('At least one lighting type must be enabled');
    }

    if (preset.hdrEnvironment && preset.hdrEnvironment.intensity < 0) {
      errors.push('HDR environment intensity must be positive');
    }

    if (preset.shadows && preset.shadows.mapSize && !isPowerOfTwo(preset.shadows.mapSize)) {
      errors.push('Shadow map size must be power of two');
    }

    return { valid: errors.length === 0, errors };
  },

  // ✅ PERFORMANCE - Environment quality calculation
  calculateEnvironmentQuality(performanceMetrics, targetFPS = 60) {
    const currentFPS = performanceMetrics.fps || 60;
    const memoryPressure = performanceMetrics.memoryUsage / (100 * 1024 * 1024); // Normalize to 100MB

    let quality = 'high';

    if (currentFPS < targetFPS * 0.7 || memoryPressure > 0.8) {
      quality = 'low';
    } else if (currentFPS < targetFPS * 0.85 || memoryPressure > 0.6) {
      quality = 'medium';
    }

    return quality;
  },

  // ✅ UTILITY - PMREM level calculation
  calculatePMREMLevels(textureSize) {
    const levels = [];
    let currentSize = textureSize;

    while (currentSize >= 16) {
      levels.push(currentSize);
      currentSize = Math.floor(currentSize / 2);
    }

    return levels;
  },

  // ✅ OPTIMIZATION - Light culling
  cullLights(lights, camera, maxDistance = 100) {
    return lights.filter(light => {
      const distance = light.position.distanceTo(camera.position);
      return distance <= maxDistance;
    });
  },

  // ✅ UTILITY - Environment preset coordination
  getEnvironmentForLightingPreset(lightingPreset) {
    const mapping = {
      'chromeShowcase': 'studio',
      'studioProPlus': 'studio',
      'cinematicDark': 'night',
      'outdoorNatural': 'outdoor',
      'productShowcase': 'studio',
      'architecturalViz': 'outdoor',
      'jewelryDisplay': 'studio',
      'automotiveShowroom': 'industrial'
    };

    return mapping[lightingPreset] || 'studio';
  },

  // ✅ PERFORMANCE - Memory estimation
  estimateHDRMemoryUsage(width, height, format = 'RGBA16F') {
    const bytesPerChannel = format.includes('16F') ? 2 : 4;
    const channels = format.includes('RGB') ? (format.includes('A') ? 4 : 3) : 1;

    return width * height * channels * bytesPerChannel;
  }
};

// ✅ HELPER FUNCTION
function isPowerOfTwo(value) {
  return (value & (value - 1)) === 0;
}
```

**✅ EXCELLENTES PRATIQUES IDENTIFIÉES** :
- Pure functions mathématiques
- Color space conversions
- Performance optimization utilities
- Validation comprehensive
- Memory estimation helpers
- Code modulaire et testable

---

## 🚨 ANTI-PATTERNS LIGHTINGSYSTEMS DOMAIN

### **1. HDR ORCHESTRATOR COMPLEXITY**
```
WorldEnvironmentController = 442 lignes orchestrant:
├── HDR loading + caching (5 presets hardcoded)
├── PMREM generation (expensive operations)
├── Scene environment coordination (background + IBL)
├── PBR integration coupling (tight dependency)
├── Performance monitoring (memory + loading metrics)
└── Event system (custom events dispatch)
```

### **2. CONTROLLER COUPLING**
```javascript
// WorldEnvironmentController → PBRLightingController coupling
constructor(scene, renderer, pbrLightingController) {
  this.pbrLightingController = pbrLightingController;  // ❌ Direct dependency
}

applyEnvironment(envMap, preset) {
  if (this.pbrLightingController) {
    this.pbrLightingController.onEnvironmentChanged(envMap, preset);  // ❌ Tight coupling
  }
}
```

### **3. HOOK BUSINESS LOGIC**
```javascript
// useLightingControls - 178L with complex coordination
const applyLightingPreset = useCallback(async (presetName) => {
  await pbrController.applyLightingPreset(presetName);           // PBR operation
  await environmentController.loadEnvironment(environmentPreset); // Environment operation
  // ❌ Business logic coordination in hook
}, []);
```

### **4. SINGLETON ACCESS PATTERN**
```javascript
// Hook accessing global singletons
const [pbrController] = useState(() => {
  return window.pbrLightingController;      // ❌ Global singleton
});

const [environmentController] = useState(() => {
  return window.worldEnvironmentController; // ❌ Global singleton
});
```

### **5. UI ASYNC COMPLEXITY**
```javascript
// LightingControlPanel with async operations + error handling
const handlePresetChange = useCallback(async (presetName) => {
  setIsLoading(true);
  try {
    await lightingControls.applyLightingPreset(presetName);  // ❌ Async in UI
  } catch (error) {
    console.error('Failed to apply preset:', error);        // ❌ Error handling in UI
  } finally {
    setIsLoading(false);
  }
}, []);
```

---

## 🎯 VISION XSTATE CIBLE LIGHTINGSYSTEMS

### **LIGHTING DOMAIN COORDINATION**
```javascript
// Lighting domain → Coordinated actors
const LightingDomainMachine = createMachine({
  id: 'lightingDomain',
  type: 'parallel',
  states: {
    pbrLighting: {
      invoke: {
        src: 'pbrLightingActor',      // From B07 reconstruire
        id: 'pbr'
      }
    },
    environment: {
      invoke: {
        src: 'environmentActor',      // HDR environment management
        id: 'environment'
      }
    },
    presets: {
      invoke: {
        src: 'lightingPresetsActor',  // Preset coordination
        id: 'presets'
      }
    },
    ui: {
      invoke: {
        src: 'lightingUIActor',       // UI controls
        id: 'ui'
      }
    }
  }
});

// ✅ Event-driven coordination without tight coupling
const lightingCoordinationService = createService(async (context, event) => {
  switch (event.type) {
    case 'PRESET.APPLY':
      // ✅ Coordinate PBR + Environment without coupling
      const presetConfig = event.data;
      await Promise.all([
        sendTo('pbr', { type: 'APPLY_LIGHTING', data: presetConfig.lighting }),
        sendTo('environment', { type: 'LOAD_ENVIRONMENT', data: presetConfig.environment })
      ]);
      break;

    case 'ENVIRONMENT.LOADED':
      // ✅ Notify PBR of environment change
      await sendTo('pbr', { type: 'ENVIRONMENT_CHANGED', data: event.data });
      break;
  }
});
```

### **HDR ENVIRONMENT ACTOR**
```javascript
// HDR environment management → Dedicated actor
const EnvironmentActor = createMachine({
  id: 'environment',
  context: {
    currentEnvironment: null,
    textureCache: new Map(),
    loadingQueue: [],
    presets: new Map()
  },
  states: {
    idle: {
      on: {
        'LOAD_ENVIRONMENT': { target: 'loading' },
        'UPDATE_INTENSITY': { actions: 'updateIntensity' }
      }
    },
    loading: {
      invoke: {
        src: 'loadHDREnvironment',
        onDone: {
          target: 'ready',
          actions: 'setEnvironment'
        },
        onError: {
          target: 'error',
          actions: 'handleLoadError'
        }
      }
    },
    ready: {
      on: {
        'LOAD_ENVIRONMENT': { target: 'loading' },
        'ROTATE_ENVIRONMENT': { actions: 'rotateEnvironment' },
        'UPDATE_INTENSITY': { actions: 'updateIntensity' }
      }
    },
    error: {
      on: {
        'RETRY': { target: 'loading' },
        'LOAD_FALLBACK': { target: 'loading' }
      }
    }
  }
});

// ✅ Services without controller coupling
const environmentServices = {
  loadHDREnvironment: createService(async (context, event) => {
    const { presetName } = event.data;

    // ✅ Check cache first
    if (context.textureCache.has(presetName)) {
      return context.textureCache.get(presetName);
    }

    // ✅ Web Worker HDR loading
    const envMap = await loadHDRInWorker(presetName);

    return { envMap, presetName };
  })
};
```

### **LIGHTING PRESETS COORDINATION**
```javascript
// Preset management → Coordination service
const LightingPresetsActor = createMachine({
  id: 'lightingPresets',
  context: {
    availablePresets: new Map(),
    currentPreset: null
  },
  states: {
    idle: {
      on: {
        'APPLY_PRESET': { target: 'applying' },
        'CREATE_PRESET': { actions: 'createCustomPreset' }
      }
    },
    applying: {
      invoke: {
        src: 'applyLightingPreset',
        onDone: 'idle'
      }
    }
  }
});

const presetServices = {
  // ✅ Coordinated preset application without coupling
  applyLightingPreset: createService(async (context, event) => {
    const { presetName } = event.data;

    // ✅ Load preset configuration
    const presetConfig = await loadPresetConfig(presetName);

    // ✅ Coordinate systems without direct coupling
    const results = await Promise.all([
      sendTo('pbr', { type: 'APPLY_CONFIG', data: presetConfig.lighting }),
      sendTo('environment', { type: 'LOAD_ENVIRONMENT', data: presetConfig.environment })
    ]);

    return { preset: presetName, results };
  })
};
```

### **SIMPLIFIED UI INTEGRATION**
```javascript
// UI without business logic
const LightingUIActor = createMachine({
  id: 'lightingUI',
  context: {
    activeTab: 'presets',
    isLoading: false
  },
  states: {
    idle: {
      on: {
        'UI.PRESET_SELECTED': {
          target: 'requestingPreset',
          actions: assign({ isLoading: true })
        },
        'UI.TAB_CHANGED': {
          actions: assign({
            activeTab: (_, event) => event.tab
          })
        }
      }
    },
    requestingPreset: {
      entry: sendParent((context, event) => ({
        type: 'PRESET.APPLY',
        preset: event.preset
      })),
      on: {
        'PRESET.APPLIED': {
          target: 'idle',
          actions: assign({ isLoading: false })
        },
        'PRESET.FAILED': {
          target: 'idle',
          actions: assign({ isLoading: false })
        }
      }
    }
  }
});
```

---

## 📊 MÉTRIQUES LIGHTINGSYSTEMS DOMAIN

### **QUALITÉ CODE PAR COMPOSANT**
| Composant | Lignes | Responsabilités | Anti-patterns | XState Ready |
|-----------|--------|-----------------|---------------|--------------|
| **WorldEnvironmentController** | 442L | HDR orchestration | Controller coupling | Major reconstruire |
| **useLightingControls** | 178L | Business logic hook | Singleton access, async logic | Major reconstruire |
| **LightingControlPanel** | 267L | UI + async operations | Error handling in UI | Moderate reconstruire |
| **lightingUtils** | 124L | Pure utilities | 0 | ✅ Excellent |

### **TOTAL LIGHTINGSYSTEMS (EXCLUDING B07)**
- **1,011 lignes** (sans PBRLightingController déjà analysé)
- **HDR Orchestrator** : WorldEnvironmentController (442L) avec controller coupling
- **Complex Hook** : useLightingControls (178L) avec business logic
- **UI Complexity** : LightingControlPanel (267L) avec async operations
- **✅ Excellent Utilities** : lightingUtils (124L)
- **Priorité refonte totale** : HAUTE (controller coupling)

---

## 🎯 CONCLUSIONS B10

### **LIGHTINGSYSTEMS DOMAIN : CONTROLLER COUPLING**
- ❌ **WorldEnvironmentController coupling** : 442L avec dépendance directe PBRLightingController
- ❌ **Hook business logic** : useLightingControls (178L) coordination PBR + Environment
- ❌ **Singleton access pattern** : window.controllers access in hooks
- ❌ **UI async complexity** : LightingControlPanel avec error handling + loading states
- ✅ **Utilities excellentes** : lightingUtils (124L) pure functions parfaites

### **POTENTIEL XSTATE : DÉCOUPLAGE MAJEUR**
- ✅ **Actor coordination** : 4 actors spécialisés sans couplage direct
- ✅ **Event-driven preset coordination** : Élimination dependencies directes
- ✅ **Service-based HDR** : Web Workers + caching optimisé
- ✅ **Simplified UI** : State machines sans business logic

### **PRIORITÉ REFONTE TOTALE : HAUTE**
- 🎯 **Controller coupling** : WorldEnvironmentController → PBRLightingController
- 🎯 **Hook business logic** : useLightingControls coordination logic
- 🎯 **Integration with B07** : Coordination avec PBRLightingController reconstruire

**RECOMMANDATION** : Construction prioritaire - découplage controllers + hook business logic

---

## 🎯 **BILAN DOMAINE LIGHTING COMPLET**
- **B07** : PBRLightingController (1,443L) - Monolithe critique analysé
- **B10** : LightingSystems domain (1,011L) - Orchestration + coupling + UI + utilities
- **Total domaine lighting** : **2,454L** avec monolithe + controller coupling

---

**SESSION B10 TERMINÉE** ✅
**Prochaine** : B11 - AnimationSystemes Domain Diagnostic Architectural