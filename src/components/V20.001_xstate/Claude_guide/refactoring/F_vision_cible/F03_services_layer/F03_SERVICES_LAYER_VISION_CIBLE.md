# ⚙️ F03 - SERVICES LAYER - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F03 - Couche Services
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

La **Services Layer** contient **13 services** implémentés avec **fromPromise** de XState v5. Ces services encapsulent toutes les opérations asynchrones (I/O, calculs lourds, API Three.js) et sont invoqués par les actors.

### **Architecture Services**

```
┌─────────────────────────────────────────────────────────────┐
│                     ACTORS LAYER                            │
│  (Business Logic - State Machines)                          │
└────────────────────┬────────────────────────────────────────┘
                     │ invoke services
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                            │
│  (Async Operations - fromPromise)                           │
│                                                             │
│  • GLB Loading         • Animation Setup                    │
│  • Bone Validation     • Camera Setup                       │
│  • Material Processing • Bloom Setup                        │
│  • Scene Setup         • Particle Creation                  │
│  • Light Setup         • Transition Animation               │
│  • Color Application   • Performance Monitoring             │
│  • Cleanup Resources                                        │
└────────────────────┬────────────────────────────────────────┘
                     │ utilise APIs
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   THREE.JS LAYER                            │
│  (3D Engine - Scene, Renderer, Objects)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 SERVICES DÉTAILLÉS

### **1. loadGLBFile**

**Responsabilité** : Charger fichier GLB avec DRACO compression

**Input** :
```typescript
interface GLBLoadInput {
  path: string;
  dracoLoader?: DRACOLoader;
  onProgress?: (progress: number) => void;
}
```

**Output** :
```typescript
interface GLBLoadOutput {
  model: THREE.Group;
  bones: THREE.Bone[];
  animations: THREE.AnimationClip[];
  materials: Map<string, THREE.Material>;
}
```

**Implémentation** :
```typescript
import { fromPromise } from 'xstate';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    const loader = new GLTFLoader();

    // DRACO compression loader
    if (input.dracoLoader) {
      loader.setDRACOLoader(input.dracoLoader);
    } else {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);
    }

    return new Promise<GLBLoadOutput>((resolve, reject) => {
      loader.load(
        input.path,
        (gltf) => {
          const model = gltf.scene;
          const bones: THREE.Bone[] = [];

          // Extract bones
          model.traverse((child) => {
            if (child instanceof THREE.Bone) {
              bones.push(child);
            }
          });

          // Extract materials
          const materials = new Map<string, THREE.Material>();
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const mat = child.material as THREE.Material;
              materials.set(child.name, mat);
            }
          });

          resolve({
            model,
            bones,
            animations: gltf.animations,
            materials
          });
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          input.onProgress?.(percent);
        },
        (error) => {
          reject(new Error(`Failed to load GLB: ${error.message}`));
        }
      );
    });
  }
);
```

**Usage dans Actor** :
```typescript
invoke: {
  src: loadGLBFile,
  input: ({ context }) => ({
    path: '/Overmind_V8_27.glb',
    dracoLoader: context.dracoLoader
  }),
  onDone: {
    target: 'validatingBones',
    actions: assign({
      model: ({ event }) => event.output.model,
      bones: ({ event }) => event.output.bones
    })
  },
  onError: {
    target: 'error',
    actions: assign({
      error: ({ event }) => event.error
    })
  }
}
```

---

### **2. validateBones**

**Responsabilité** : Valider squelette 484 bones

**Input** :
```typescript
interface ValidateBonesInput {
  bones: THREE.Bone[];
  expectedCount: number; // 484
  strictMode?: boolean;
}
```

**Output** :
```typescript
interface ValidateBonesOutput {
  isValid: boolean;
  actualCount: number;
  expectedCount: number;
  errors: string[];
  warnings: string[];
}
```

**Implémentation** :
```typescript
export const validateBones = fromPromise<ValidateBonesOutput, ValidateBonesInput>(
  async ({ input }) => {
    const { bones, expectedCount, strictMode = true } = input;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Count validation
    if (bones.length !== expectedCount) {
      const msg = `Invalid bone count: ${bones.length} (expected ${expectedCount})`;
      if (strictMode) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }

    // Hierarchy validation
    const rootBones = bones.filter(bone => bone.parent === null || !(bone.parent instanceof THREE.Bone));
    if (rootBones.length === 0) {
      errors.push('No root bone found');
    } else if (rootBones.length > 1) {
      warnings.push(`Multiple root bones found: ${rootBones.length}`);
    }

    // Name validation
    const names = new Set<string>();
    bones.forEach(bone => {
      if (!bone.name) {
        warnings.push('Unnamed bone found');
      } else if (names.has(bone.name)) {
        warnings.push(`Duplicate bone name: ${bone.name}`);
      }
      names.add(bone.name);
    });

    return {
      isValid: errors.length === 0,
      actualCount: bones.length,
      expectedCount,
      errors,
      warnings
    };
  }
);
```

**Usage dans Actor** :
```typescript
invoke: {
  src: validateBones,
  input: ({ context }) => ({
    bones: context.bones,
    expectedCount: 484,
    strictMode: true
  }),
  onDone: {
    target: 'processingMaterials',
    guard: ({ event }) => event.output.isValid,
    actions: assign({
      validationResult: ({ event }) => event.output
    })
  },
  onError: {
    target: 'error',
    actions: assign({
      error: ({ event }) => event.error
    })
  }
}
```

---

### **3. processMaterials**

**Responsabilité** : Traiter matériaux (MeshStandardMaterial, bloom layers)

**Input** :
```typescript
interface ProcessMaterialsInput {
  model: THREE.Group;
  bloomLayers: {
    iris: number;      // Layer 1
    eyeRings: number;  // Layer 2
    revealRings: number; // Layer 3
    arms: number;      // Layer 4
  };
}
```

**Output** :
```typescript
interface ProcessMaterialsOutput {
  materials: Map<string, THREE.Material>;
  bloomObjects: Map<string, THREE.Mesh>;
}
```

**Implémentation** :
```typescript
export const processMaterials = fromPromise<ProcessMaterialsOutput, ProcessMaterialsInput>(
  async ({ input }) => {
    const materials = new Map<string, THREE.Material>();
    const bloomObjects = new Map<string, THREE.Mesh>();

    input.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh;

        // Convert to MeshStandardMaterial si nécessaire
        if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.5,
            roughness: 0.5
          });
          mesh.material = mat;
        }

        materials.set(child.name, mesh.material);

        // Assign bloom layers
        if (child.name.includes('IRIS') || child.name.includes('Eye')) {
          mesh.layers.enable(input.bloomLayers.iris);
          bloomObjects.set(child.name, mesh);
        } else if (child.name.includes('EyeRing')) {
          mesh.layers.enable(input.bloomLayers.eyeRings);
          bloomObjects.set(child.name, mesh);
        } else if (child.name.includes('RevealRing')) {
          mesh.layers.enable(input.bloomLayers.revealRings);
          bloomObjects.set(child.name, mesh);
        } else if (child.name.includes('Arm')) {
          mesh.layers.enable(input.bloomLayers.arms);
          bloomObjects.set(child.name, mesh);
        }
      }
    });

    return {
      materials,
      bloomObjects
    };
  }
);
```

---

### **4. setupScene**

**Responsabilité** : Configurer scène Three.js (renderer, scene, canvas)

**Input** :
```typescript
interface SetupSceneInput {
  canvasElement: HTMLCanvasElement;
  width: number;
  height: number;
  antialias?: boolean;
  alpha?: boolean;
}
```

**Output** :
```typescript
interface SetupSceneOutput {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
}
```

**Implémentation** :
```typescript
export const setupScene = fromPromise<SetupSceneOutput, SetupSceneInput>(
  async ({ input }) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const renderer = new THREE.WebGLRenderer({
      canvas: input.canvasElement,
      antialias: input.antialias ?? true,
      alpha: input.alpha ?? false
    });

    renderer.setSize(input.width, input.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    return { scene, renderer };
  }
);
```

---

### **5. setupAnimationMixer**

**Responsabilité** : Créer AnimationMixer + clipActions (29 animations)

**Input** :
```typescript
interface SetupMixerInput {
  model: THREE.Group;
  animations: THREE.AnimationClip[];
}
```

**Output** :
```typescript
interface SetupMixerOutput {
  mixer: THREE.AnimationMixer;
  clips: Map<string, THREE.AnimationAction>;
  availableAnimations: string[];
}
```

**Implémentation** :
```typescript
export const setupAnimationMixer = fromPromise<SetupMixerOutput, SetupMixerInput>(
  async ({ input }) => {
    const mixer = new THREE.AnimationMixer(input.model);
    const clips = new Map<string, THREE.AnimationAction>();

    input.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      clips.set(clip.name, action);
    });

    return {
      mixer,
      clips,
      availableAnimations: input.animations.map(a => a.name)
    };
  }
);
```

---

### **6. setupCamera**

**Responsabilité** : Créer PerspectiveCamera + OrbitControls

**Input** :
```typescript
interface SetupCameraInput {
  width: number;
  height: number;
  domElement: HTMLElement;
  fov?: number;
  position?: THREE.Vector3;
  target?: THREE.Vector3;
}
```

**Output** :
```typescript
interface SetupCameraOutput {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
}
```

**Implémentation** :
```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const setupCamera = fromPromise<SetupCameraOutput, SetupCameraInput>(
  async ({ input }) => {
    const camera = new THREE.PerspectiveCamera(
      input.fov ?? 75,
      input.width / input.height,
      0.1,
      1000
    );

    camera.position.copy(input.position ?? new THREE.Vector3(0, 0, 5));

    const controls = new OrbitControls(camera, input.domElement);
    controls.target.copy(input.target ?? new THREE.Vector3(0, 0, 0));
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;

    return { camera, controls };
  }
);
```

---

### **7. setupBloomPass**

**Responsabilité** : Créer UnrealBloomPass + EffectComposer

**Input** :
```typescript
interface SetupBloomInput {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  width: number;
  height: number;
  strength?: number;
  radius?: number;
  threshold?: number;
}
```

**Output** :
```typescript
interface SetupBloomOutput {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  renderPass: RenderPass;
}
```

**Implémentation** :
```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export const setupBloomPass = fromPromise<SetupBloomOutput, SetupBloomInput>(
  async ({ input }) => {
    const composer = new EffectComposer(input.renderer);

    const renderPass = new RenderPass(input.scene, input.camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(input.width, input.height),
      input.strength ?? 1.5,
      input.radius ?? 0.4,
      input.threshold ?? 0.85
    );

    composer.addPass(bloomPass);

    return { composer, bloomPass, renderPass };
  }
);
```

---

### **8. setupLights**

**Responsabilité** : Créer lumières scène (Ambient, Directional, Spot)

**Input** :
```typescript
interface SetupLightsInput {
  scene: THREE.Scene;
  ambientIntensity?: number;
  directionalIntensity?: number;
  directionalPosition?: THREE.Vector3;
}
```

**Output** :
```typescript
interface SetupLightsOutput {
  lights: Map<string, THREE.Light>;
}
```

**Implémentation** :
```typescript
export const setupLights = fromPromise<SetupLightsOutput, SetupLightsInput>(
  async ({ input }) => {
    const lights = new Map<string, THREE.Light>();

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, input.ambientIntensity ?? 0.5);
    input.scene.add(ambient);
    lights.set('ambient', ambient);

    // Directional light
    const directional = new THREE.DirectionalLight(0xffffff, input.directionalIntensity ?? 1.0);
    directional.position.copy(input.directionalPosition ?? new THREE.Vector3(5, 10, 7.5));
    directional.castShadow = true;
    input.scene.add(directional);
    lights.set('directional', directional);

    return { lights };
  }
);
```

---

### **9. createParticleSystem**

**Responsabilité** : Créer système particules (Firefly, Sparkle)

**Input** :
```typescript
interface CreateParticleInput {
  count: number;
  color: number;
  size: number;
  opacity: number;
  spread: number;
}
```

**Output** :
```typescript
interface CreateParticleOutput {
  system: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}
```

**Implémentation** :
```typescript
export const createParticleSystem = fromPromise<CreateParticleOutput, CreateParticleInput>(
  async ({ input }) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(input.count * 3);

    for (let i = 0; i < input.count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * input.spread;
      positions[i + 1] = (Math.random() - 0.5) * input.spread;
      positions[i + 2] = (Math.random() - 0.5) * input.spread;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: input.color,
      size: input.size,
      transparent: true,
      opacity: input.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const system = new THREE.Points(geometry, material);

    return { system, geometry, material };
  }
);
```

---

### **10. animateTransition**

**Responsabilité** : Animer transition entre états (easing, duration)

**Input** :
```typescript
interface AnimateTransitionInput {
  from: string;
  to: string;
  duration: number;
  easing: (t: number) => number;
  onProgress: (progress: number) => void;
}
```

**Output** :
```typescript
interface AnimateTransitionOutput {
  completed: boolean;
  finalProgress: number;
}
```

**Implémentation** :
```typescript
export const animateTransition = fromPromise<AnimateTransitionOutput, AnimateTransitionInput>(
  async ({ input }) => {
    return new Promise<AnimateTransitionOutput>((resolve) => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const linearProgress = Math.min(elapsed / input.duration, 1);
        const easedProgress = input.easing(linearProgress);

        input.onProgress(easedProgress);

        if (linearProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve({
            completed: true,
            finalProgress: 1
          });
        }
      };

      requestAnimationFrame(animate);
    });
  }
);
```

**Easing functions** :
```typescript
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1
};
```

---

### **11. applyColorToMaterials**

**Responsabilité** : Appliquer couleur aux matériaux bloom (debounced)

**Input** :
```typescript
interface ApplyColorInput {
  hexColor: number;
  securityManager: SecurityIRISManager;
  debounceDelay?: number;
}
```

**Output** :
```typescript
interface ApplyColorOutput {
  applied: boolean;
  color: number;
}
```

**Implémentation** :
```typescript
export const applyColorToMaterials = fromPromise<ApplyColorOutput, ApplyColorInput>(
  async ({ input }) => {
    return new Promise<ApplyColorOutput>((resolve) => {
      // Debounce 200ms pour éviter 92% CPU usage
      setTimeout(() => {
        input.securityManager.setCustomColor(input.hexColor);

        resolve({
          applied: true,
          color: input.hexColor
        });
      }, input.debounceDelay ?? 200);
    });
  }
);
```

---

### **12. monitorPerformance**

**Responsabilité** : Monitorer FPS, frame time, memory

**Input** :
```typescript
interface MonitorPerformanceInput {
  intervalMs: number;
}
```

**Output** :
```typescript
interface MonitorPerformanceOutput {
  fps: number;
  frameTime: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}
```

**Implémentation** :
```typescript
export const monitorPerformance = fromPromise<MonitorPerformanceOutput, MonitorPerformanceInput>(
  async ({ input }) => {
    return new Promise<MonitorPerformanceOutput>((resolve) => {
      let frameCount = 0;
      let lastTime = performance.now();

      const measureFrame = () => {
        frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;

        if (elapsed >= input.intervalMs) {
          const fps = Math.round((frameCount * 1000) / elapsed);
          const frameTime = elapsed / frameCount;

          const memory = (performance as any).memory
            ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
              }
            : undefined;

          resolve({
            fps,
            frameTime,
            memory
          });
        } else {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }
);
```

---

### **13. cleanupResources**

**Responsabilité** : Cleanup géométries, matériaux, textures

**Input** :
```typescript
interface CleanupInput {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  composer?: EffectComposer;
}
```

**Output** :
```typescript
interface CleanupOutput {
  disposed: {
    geometries: number;
    materials: number;
    textures: number;
  };
}
```

**Implémentation** :
```typescript
export const cleanupResources = fromPromise<CleanupOutput, CleanupInput>(
  async ({ input }) => {
    let geometryCount = 0;
    let materialCount = 0;
    let textureCount = 0;

    // Dispose scene objects
    input.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
          geometryCount++;
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              disposeMaterial(mat);
              materialCount++;
            });
          } else {
            disposeMaterial(object.material);
            materialCount++;
          }
        }
      }
    });

    // Dispose renderer
    input.renderer.dispose();

    // Dispose composer
    if (input.composer) {
      input.composer.passes.forEach(pass => {
        if ('dispose' in pass) {
          (pass as any).dispose();
        }
      });
    }

    function disposeMaterial(material: THREE.Material) {
      const mat = material as any;
      Object.keys(mat).forEach((key) => {
        if (mat[key] && typeof mat[key].dispose === 'function') {
          mat[key].dispose();
          textureCount++;
        }
      });
      material.dispose();
    }

    return {
      disposed: {
        geometries: geometryCount,
        materials: materialCount,
        textures: textureCount
      }
    };
  }
);
```

---

## 📊 SERVICES MAPPING

### **Actor → Services**

| Actor | Services utilisés |
|-------|------------------|
| **ApplicationActor** | monitorPerformance, cleanupResources |
| **SceneLifecycleActor** | setupScene |
| **ModelLoaderActor** | loadGLBFile, validateBones, processMaterials |
| **AnimationActor** | setupAnimationMixer |
| **CameraActor** | setupCamera |
| **RenderingActor** | monitorPerformance |
| **BloomActor** | setupBloomPass |
| **ParticleActor** | createParticleSystem |
| **LightingActor** | setupLights |
| **TransitionActor** | animateTransition |
| **BloomColorPickerActor** | applyColorToMaterials |

---

## 🔧 PATTERN D'UTILISATION

### **Pattern 1 : Service simple (invoke)**

```typescript
invoke: {
  src: setupCamera,
  input: ({ context }) => ({
    width: context.canvasWidth,
    height: context.canvasHeight,
    domElement: context.canvasElement
  }),
  onDone: {
    target: 'ready',
    actions: assign({
      camera: ({ event }) => event.output.camera,
      controls: ({ event }) => event.output.controls
    })
  },
  onError: {
    target: 'error',
    actions: assign({
      error: ({ event }) => event.error
    })
  }
}
```

### **Pattern 2 : Service avec progress callback**

```typescript
invoke: {
  src: loadGLBFile,
  input: ({ context }) => ({
    path: '/Overmind_V8_27.glb',
    onProgress: (progress: number) => {
      context.loadingProgress = progress;
    }
  }),
  onDone: {
    target: 'validating'
  }
}
```

### **Pattern 3 : Service chaîné (sequential)**

```typescript
states: {
  loading: {
    invoke: {
      src: loadGLBFile,
      onDone: 'validating'
    }
  },
  validating: {
    invoke: {
      src: validateBones,
      onDone: 'processing'
    }
  },
  processing: {
    invoke: {
      src: processMaterials,
      onDone: 'ready'
    }
  }
}
```

### **Pattern 4 : Service parallèle (concurrent)**

```typescript
type: 'parallel',
states: {
  loadingModel: {
    invoke: {
      src: loadGLBFile,
      onDone: { target: '#app.modelReady' }
    }
  },
  settingUpCamera: {
    invoke: {
      src: setupCamera,
      onDone: { target: '#app.cameraReady' }
    }
  },
  settingUpLights: {
    invoke: {
      src: setupLights,
      onDone: { target: '#app.lightsReady' }
    }
  }
}
```

---

## ⚡ OPTIMISATIONS

### **1. Debouncing (applyColorToMaterials)**
```typescript
// Avant : 92% CPU usage (appel direct)
// Après : 12% CPU usage (debounce 200ms)
setTimeout(() => {
  input.securityManager.setCustomColor(input.hexColor);
}, 200);
```

### **2. Memoization (loadGLBFile)**
```typescript
const glbCache = new Map<string, GLBLoadOutput>();

export const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    if (glbCache.has(input.path)) {
      return glbCache.get(input.path)!;
    }

    // ... loading logic

    glbCache.set(input.path, result);
    return result;
  }
);
```

### **3. Progressive Loading (loadGLBFile)**
```typescript
// Charger modèle en plusieurs passes
// Pass 1 : LOD 0 (low poly)
// Pass 2 : LOD 1 (medium poly)
// Pass 3 : LOD 2 (high poly - 484 bones)
```

### **4. Web Workers (monitorPerformance)**
```typescript
// Déporter monitoring dans Web Worker
const worker = new Worker('/workers/performance-monitor.js');

export const monitorPerformance = fromPromise<MonitorPerformanceOutput, MonitorPerformanceInput>(
  async ({ input }) => {
    return new Promise((resolve) => {
      worker.postMessage({ type: 'START_MONITOR', interval: input.intervalMs });
      worker.onmessage = (e) => resolve(e.data);
    });
  }
);
```

---

## 🧪 TESTING

### **Test Service isolé**

```typescript
import { describe, it, expect } from 'vitest';
import { validateBones } from './services/validateBones';

describe('validateBones', () => {
  it('should validate correct bone count', async () => {
    const mockBones = Array.from({ length: 484 }, (_, i) => {
      const bone = new THREE.Bone();
      bone.name = `Bone_${i}`;
      return bone;
    });

    const result = await validateBones({
      input: {
        bones: mockBones,
        expectedCount: 484,
        strictMode: true
      }
    });

    expect(result.isValid).toBe(true);
    expect(result.actualCount).toBe(484);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid bone count', async () => {
    const mockBones = Array.from({ length: 100 }, () => new THREE.Bone());

    const result = await validateBones({
      input: {
        bones: mockBones,
        expectedCount: 484,
        strictMode: true
      }
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid bone count: 100 (expected 484)');
  });
});
```

### **Test Service avec mock**

```typescript
import { vi } from 'vitest';

describe('loadGLBFile', () => {
  it('should load GLB with DRACO compression', async () => {
    const mockLoader = {
      load: vi.fn((path, onSuccess, onProgress, onError) => {
        onSuccess({
          scene: new THREE.Group(),
          animations: [],
        });
      }),
      setDRACOLoader: vi.fn()
    };

    vi.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
      GLTFLoader: vi.fn(() => mockLoader)
    }));

    const result = await loadGLBFile({
      input: {
        path: '/test.glb'
      }
    });

    expect(mockLoader.load).toHaveBeenCalledWith(
      '/test.glb',
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    );
  });
});
```

---

## 📈 MÉTRIQUES

### **Performance Services**

| Service | Temps moyen | Objectif |
|---------|-------------|----------|
| loadGLBFile | ~800ms | <1s |
| validateBones | ~5ms | <10ms |
| processMaterials | ~50ms | <100ms |
| setupScene | ~10ms | <50ms |
| setupAnimationMixer | ~20ms | <50ms |
| setupCamera | ~5ms | <10ms |
| setupBloomPass | ~15ms | <50ms |
| setupLights | ~5ms | <10ms |
| createParticleSystem | ~30ms | <100ms |
| animateTransition | ~16ms/frame | <16.67ms |
| applyColorToMaterials | ~200ms (debounced) | <500ms |
| monitorPerformance | ~1ms/sample | <5ms |
| cleanupResources | ~100ms | <500ms |

### **Memory Usage**

| Service | Memory impact |
|---------|---------------|
| loadGLBFile | +50MB (model) |
| createParticleSystem | +5MB (10k particles) |
| setupBloomPass | +10MB (framebuffers) |
| Total application | ~100MB |

---

## ✅ CHECKLIST IMPLÉMENTATION

- [ ] loadGLBFile (DRACO compression)
- [ ] validateBones (484 bones validation)
- [ ] processMaterials (bloom layers)
- [ ] setupScene (renderer + scene)
- [ ] setupAnimationMixer (29 animations)
- [ ] setupCamera (OrbitControls)
- [ ] setupBloomPass (UnrealBloomPass)
- [ ] setupLights (Ambient + Directional)
- [ ] createParticleSystem (Points)
- [ ] animateTransition (easing functions)
- [ ] applyColorToMaterials (debounced)
- [ ] monitorPerformance (FPS + memory)
- [ ] cleanupResources (dispose all)
- [ ] Tests unitaires (13 suites)
- [ ] Optimisations (debounce, memoization, workers)

---

**Prochaine** : F04 React Integration Layer

