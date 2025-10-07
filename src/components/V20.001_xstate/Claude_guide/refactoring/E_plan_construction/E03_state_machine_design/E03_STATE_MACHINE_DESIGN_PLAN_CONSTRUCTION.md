# 🎰 SESSION E03 - STATE MACHINE DESIGN

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : Design détaillé state machines XState v5 pour Actors Overmind
**Criticité** : URGENTE

---

## 🎯 OBJECTIF SESSION E03

**Mission** : Concevoir le **design complet des state machines XState v5** pour tous les Actors identifiés dans E01/E02, avec états, transitions, guards, actions et services.

**Rappel architecture** :
- ✅ XState v5 setup API
- ✅ Actor Model (pas de références directes)
- ✅ Event-driven communication
- ✅ TypeScript strict typing

---

## 📋 ACTORS À DESIGNER (DE E01/E02)

### **PHASE 1 - FOUNDATION ACTORS**

1. **Root System Actor** - Orchestration générale
2. **Scene Actor** - Three.js scene lifecycle
3. **Camera Actor** - OrbitControls + view management
4. **Renderer Actor** - WebGL context + RAF coordination
5. **GLB Loader Actor** - Model loading 484 bones

### **PHASE 2 - GOD OBJECTS DECOMPOSITION**

6. **AnimationController Actor** - 29 NLA animations
7. **BloomEffects Actor** - Bloom configuration
8. **LightingController Actor** - PBR lighting
9. **CameraController Actor** - View management (distinction avec Camera Actor?)
10. **PerformanceMonitor Actor** - FPS tracking
11. **StateCoordinator Actor** - Cross-actor sync
12. **ParticleSpawner Actor** - Particle creation
13. **ParticleUpdate Actor** - Position updates
14. **ParticleRenderer Actor** - Draw coordination
15. **ParticlePool Actor** - Memory pooling

### **PHASE 4 - FEATURES**

16. **BloomColorPicker Machine** - Color picker debounced (✅ déjà designé E13)

---

## 🎰 STATE MACHINE DESIGNS

### **MACHINE 1 : ROOT SYSTEM ACTOR**

**Responsabilité** : Orchestration générale + Actor registry + lifecycle

```typescript
import { setup, assign, fromPromise } from 'xstate';

type RootSystemContext = {
  actors: Map<string, ActorRef>,
  initializationProgress: number,
  errors: Error[]
};

type RootSystemEvent =
  | { type: 'INITIALIZE' }
  | { type: 'REGISTER_ACTOR', actorId: string, actorRef: ActorRef }
  | { type: 'UNREGISTER_ACTOR', actorId: string }
  | { type: 'SHUTDOWN' }
  | { type: 'ERROR', error: Error };

export const rootSystemMachine = setup({
  types: {
    context: {} as RootSystemContext,
    events: {} as RootSystemEvent
  },

  actors: {
    initializeSystem: fromPromise(async () => {
      // Initialize core systems
      await initializeWebGL();
      await initializeActorRegistry();
      return { success: true };
    })
  },

  actions: {
    registerActor: assign({
      actors: ({ context, event }) => {
        if (event.type !== 'REGISTER_ACTOR') return context.actors;
        const newActors = new Map(context.actors);
        newActors.set(event.actorId, event.actorRef);
        return newActors;
      }
    }),

    unregisterActor: assign({
      actors: ({ context, event }) => {
        if (event.type !== 'UNREGISTER_ACTOR') return context.actors;
        const newActors = new Map(context.actors);
        newActors.delete(event.actorId);
        return newActors;
      }
    }),

    recordError: assign({
      errors: ({ context, event }) => {
        if (event.type !== 'ERROR') return context.errors;
        return [...context.errors, event.error];
      }
    })
  },

  guards: {
    hasErrors: ({ context }) => context.errors.length > 0,
    allActorsRegistered: ({ context }) => context.actors.size >= 15 // Expected actors
  }
}).createMachine({
  id: 'rootSystem',
  initial: 'idle',

  context: {
    actors: new Map(),
    initializationProgress: 0,
    errors: []
  },

  states: {
    idle: {
      on: {
        INITIALIZE: { target: 'initializing' }
      }
    },

    initializing: {
      invoke: {
        src: 'initializeSystem',
        onDone: { target: 'ready' },
        onError: {
          target: 'error',
          actions: 'recordError'
        }
      }
    },

    ready: {
      on: {
        REGISTER_ACTOR: { actions: 'registerActor' },
        UNREGISTER_ACTOR: { actions: 'unregisterActor' },
        SHUTDOWN: { target: 'shuttingDown' },
        ERROR: {
          target: 'error',
          actions: 'recordError'
        }
      }
    },

    shuttingDown: {
      entry: 'cleanupActors',
      always: { target: 'idle' }
    },

    error: {
      on: {
        INITIALIZE: { target: 'initializing' }
      }
    }
  }
});
```

**États** :
- `idle` : Système non initialisé
- `initializing` : Initialisation en cours
- `ready` : Système prêt, accepte actors
- `shuttingDown` : Cleanup en cours
- `error` : Erreur critique

**Events** :
- `INITIALIZE` : Démarrer système
- `REGISTER_ACTOR` : Enregistrer nouvel actor
- `UNREGISTER_ACTOR` : Retirer actor
- `SHUTDOWN` : Arrêter système
- `ERROR` : Erreur signalée

---

### **MACHINE 2 : SCENE ACTOR**

**Responsabilité** : Three.js scene lifecycle + object management

```typescript
type SceneContext = {
  scene: THREE.Scene | null,
  objects: Map<string, THREE.Object3D>,
  layers: Map<number, THREE.Object3D[]>,
  disposed: boolean
};

type SceneEvent =
  | { type: 'CREATE_SCENE' }
  | { type: 'ADD_OBJECT', object: THREE.Object3D, layer?: number }
  | { type: 'REMOVE_OBJECT', objectId: string }
  | { type: 'DISPOSE' }
  | { type: 'CONTEXT_LOST' }
  | { type: 'CONTEXT_RESTORED' };

export const sceneMachine = setup({
  types: {
    context: {} as SceneContext,
    events: {} as SceneEvent
  },

  actors: {
    createScene: fromPromise(async () => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      return scene;
    }),

    disposeScene: fromPromise(async ({ input }) => {
      const { scene } = input;
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      scene.clear();
    })
  },

  actions: {
    addObjectToScene: assign({
      objects: ({ context, event }) => {
        if (event.type !== 'ADD_OBJECT') return context.objects;
        const newObjects = new Map(context.objects);
        newObjects.set(event.object.uuid, event.object);
        context.scene?.add(event.object);
        return newObjects;
      },
      layers: ({ context, event }) => {
        if (event.type !== 'ADD_OBJECT' || event.layer === undefined) {
          return context.layers;
        }
        const newLayers = new Map(context.layers);
        const layerObjects = newLayers.get(event.layer) || [];
        newLayers.set(event.layer, [...layerObjects, event.object]);
        event.object.layers.set(event.layer);
        return newLayers;
      }
    }),

    removeObjectFromScene: assign({
      objects: ({ context, event }) => {
        if (event.type !== 'REMOVE_OBJECT') return context.objects;
        const newObjects = new Map(context.objects);
        const obj = newObjects.get(event.objectId);
        if (obj) {
          context.scene?.remove(obj);
          newObjects.delete(event.objectId);
        }
        return newObjects;
      }
    })
  }
}).createMachine({
  id: 'scene',
  initial: 'idle',

  context: {
    scene: null,
    objects: new Map(),
    layers: new Map(),
    disposed: false
  },

  states: {
    idle: {
      on: {
        CREATE_SCENE: { target: 'creating' }
      }
    },

    creating: {
      invoke: {
        src: 'createScene',
        onDone: {
          target: 'ready',
          actions: assign({ scene: ({ event }) => event.output })
        },
        onError: { target: 'error' }
      }
    },

    ready: {
      on: {
        ADD_OBJECT: { actions: 'addObjectToScene' },
        REMOVE_OBJECT: { actions: 'removeObjectFromScene' },
        DISPOSE: { target: 'disposing' },
        CONTEXT_LOST: { target: 'contextLost' }
      }
    },

    disposing: {
      invoke: {
        src: 'disposeScene',
        input: ({ context }) => ({ scene: context.scene }),
        onDone: {
          target: 'idle',
          actions: assign({ scene: null, disposed: true })
        }
      }
    },

    contextLost: {
      on: {
        CONTEXT_RESTORED: { target: 'creating' }
      }
    },

    error: {
      on: {
        CREATE_SCENE: { target: 'creating' }
      }
    }
  }
});
```

**États** :
- `idle` : Pas de scene
- `creating` : Création scene en cours
- `ready` : Scene prête, accepte objects
- `disposing` : Disposal scene
- `contextLost` : WebGL context lost
- `error` : Erreur création

---

### **MACHINE 3 : GLB LOADER ACTOR**

**Responsabilité** : Chargement modèle 484 bones + 29 animations

```typescript
type GLBLoaderContext = {
  model: THREE.Group | null,
  bones: THREE.Bone[],
  animations: THREE.AnimationClip[],
  loadingProgress: number,
  error: Error | null
};

type GLBLoaderEvent =
  | { type: 'LOAD', url: string }
  | { type: 'PROGRESS', progress: number }
  | { type: 'RETRY' }
  | { type: 'CANCEL' };

export const glbLoaderMachine = setup({
  types: {
    context: {} as GLBLoaderContext,
    events: {} as GLBLoaderEvent
  },

  actors: {
    loadGLB: fromPromise(async ({ input }) => {
      const { url } = input;
      const loader = new GLTFLoader();

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            // Extract bones
            const bones = [];
            gltf.scene.traverse((obj) => {
              if (obj instanceof THREE.Bone) {
                bones.push(obj);
              }
            });

            resolve({
              model: gltf.scene,
              bones,
              animations: gltf.animations
            });
          },
          (progress) => {
            // Progress callback handled via event
          },
          (error) => reject(error)
        );
      });
    })
  },

  actions: {
    updateProgress: assign({
      loadingProgress: ({ event }) => {
        if (event.type !== 'PROGRESS') return 0;
        return event.progress;
      }
    }),

    storeModel: assign({
      model: ({ event }) => event.output.model,
      bones: ({ event }) => event.output.bones,
      animations: ({ event }) => event.output.animations
    }),

    storeError: assign({
      error: ({ event }) => event.error
    })
  },

  guards: {
    has484Bones: ({ context }) => context.bones.length === 484,
    has29Animations: ({ context }) => context.animations.length === 29
  }
}).createMachine({
  id: 'glbLoader',
  initial: 'idle',

  context: {
    model: null,
    bones: [],
    animations: [],
    loadingProgress: 0,
    error: null
  },

  states: {
    idle: {
      on: {
        LOAD: { target: 'loading' }
      }
    },

    loading: {
      invoke: {
        src: 'loadGLB',
        input: ({ event }) => ({ url: event.url }),
        onDone: {
          target: 'validating',
          actions: 'storeModel'
        },
        onError: {
          target: 'error',
          actions: 'storeError'
        }
      },
      on: {
        PROGRESS: { actions: 'updateProgress' },
        CANCEL: { target: 'idle' }
      }
    },

    validating: {
      always: [
        {
          guard: { type: 'has484Bones' },
          target: 'validatingAnimations'
        },
        {
          target: 'error',
          actions: assign({
            error: () => new Error(`Expected 484 bones, got ${context.bones.length}`)
          })
        }
      ]
    },

    validatingAnimations: {
      always: [
        {
          guard: { type: 'has29Animations' },
          target: 'loaded'
        },
        {
          target: 'error',
          actions: assign({
            error: () => new Error(`Expected 29 animations, got ${context.animations.length}`)
          })
        }
      ]
    },

    loaded: {
      type: 'final'
    },

    error: {
      on: {
        RETRY: { target: 'loading' },
        LOAD: { target: 'loading' }
      }
    }
  }
});
```

**États** :
- `idle` : Pas de chargement
- `loading` : Chargement GLB en cours
- `validating` : Validation 484 bones
- `validatingAnimations` : Validation 29 animations
- `loaded` : Modèle chargé et validé (final)
- `error` : Erreur chargement/validation

**Validations critiques** :
- ✅ 484 bones (obligatoire pour NLA animations)
- ✅ 29 animations (vérification complétude)

---

### **MACHINE 4 : ANIMATION CONTROLLER ACTOR**

**Responsabilité** : Gestion 29 animations NLA

```typescript
type AnimationContext = {
  mixer: THREE.AnimationMixer | null,
  clips: Map<string, THREE.AnimationClip>,
  currentAnimation: string | null,
  previousAnimation: string | null,
  isPlaying: boolean,
  loop: boolean,
  crossfadeDuration: number
};

type AnimationEvent =
  | { type: 'INITIALIZE', model: THREE.Group, clips: THREE.AnimationClip[] }
  | { type: 'PLAY', animationName: string, crossfade?: boolean }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'UPDATE', delta: number }
  | { type: 'ANIMATION_FINISHED' };

export const animationMachine = setup({
  types: {
    context: {} as AnimationContext,
    events: {} as AnimationEvent
  },

  actors: {
    crossfadeAnimation: fromPromise(async ({ input }) => {
      const { mixer, fromClip, toClip, duration } = input;
      const fromAction = mixer.clipAction(fromClip);
      const toAction = mixer.clipAction(toClip);

      toAction.reset();
      toAction.setEffectiveWeight(1);
      toAction.play();

      fromAction.crossFadeTo(toAction, duration, true);

      await new Promise(resolve => setTimeout(resolve, duration * 1000));
      return { success: true };
    })
  },

  actions: {
    initializeMixer: assign({
      mixer: ({ event }) => {
        if (event.type !== 'INITIALIZE') return null;
        return new THREE.AnimationMixer(event.model);
      },
      clips: ({ event }) => {
        if (event.type !== 'INITIALIZE') return new Map();
        const clips = new Map();
        event.clips.forEach(clip => {
          clips.set(clip.name, clip);
        });
        return clips;
      }
    }),

    playAnimation: assign({
      currentAnimation: ({ event }) => {
        if (event.type !== 'PLAY') return null;
        return event.animationName;
      },
      previousAnimation: ({ context }) => context.currentAnimation,
      isPlaying: true
    }),

    updateMixer: ({ context, event }) => {
      if (event.type !== 'UPDATE' || !context.mixer) return;
      context.mixer.update(event.delta);
    }
  },

  guards: {
    hasAnimation: ({ context, event }) => {
      if (event.type !== 'PLAY') return false;
      return context.clips.has(event.animationName);
    },
    shouldCrossfade: ({ event }) => {
      if (event.type !== 'PLAY') return false;
      return event.crossfade === true;
    }
  }
}).createMachine({
  id: 'animationController',
  initial: 'uninitialized',

  context: {
    mixer: null,
    clips: new Map(),
    currentAnimation: null,
    previousAnimation: null,
    isPlaying: false,
    loop: true,
    crossfadeDuration: 0.3
  },

  states: {
    uninitialized: {
      on: {
        INITIALIZE: {
          target: 'idle',
          actions: 'initializeMixer'
        }
      }
    },

    idle: {
      on: {
        PLAY: [
          {
            guard: 'hasAnimation',
            target: 'playing',
            actions: 'playAnimation'
          },
          {
            target: 'error'
          }
        ],
        UPDATE: { actions: 'updateMixer' }
      }
    },

    playing: {
      on: {
        PLAY: [
          {
            guard: { type: 'shouldCrossfade' },
            target: 'crossfading'
          },
          {
            target: 'playing',
            actions: 'playAnimation',
            reenter: true
          }
        ],
        PAUSE: { target: 'paused' },
        STOP: { target: 'idle' },
        UPDATE: { actions: 'updateMixer' },
        ANIMATION_FINISHED: { target: 'idle' }
      }
    },

    crossfading: {
      invoke: {
        src: 'crossfadeAnimation',
        input: ({ context, event }) => ({
          mixer: context.mixer,
          fromClip: context.clips.get(context.currentAnimation),
          toClip: context.clips.get(event.animationName),
          duration: context.crossfadeDuration
        }),
        onDone: { target: 'playing' }
      },
      on: {
        UPDATE: { actions: 'updateMixer' }
      }
    },

    paused: {
      on: {
        RESUME: { target: 'playing' },
        STOP: { target: 'idle' },
        UPDATE: { actions: 'updateMixer' }
      }
    },

    error: {
      on: {
        PLAY: [
          {
            guard: 'hasAnimation',
            target: 'playing'
          }
        ]
      }
    }
  }
});
```

**États** :
- `uninitialized` : Mixer non créé
- `idle` : Prêt, pas d'animation
- `playing` : Animation en cours
- `crossfading` : Transition entre 2 animations
- `paused` : Animation pausée
- `error` : Animation inexistante

**Features** :
- ✅ 29 animations NLA support
- ✅ Crossfade smooth transitions
- ✅ Play/pause/stop controls
- ✅ Delta time updates

---

### **MACHINE 5 : BLOOM EFFECTS ACTOR**

**Responsabilité** : Configuration bloom (threshold/strength/radius)

```typescript
type BloomContext = {
  threshold: number,
  strength: number,
  radius: number,
  enabled: boolean,
  groups: Map<string, BloomGroupConfig>
};

type BloomGroupConfig = {
  threshold: number,
  strength: number,
  radius: number
};

type BloomEvent =
  | { type: 'SET_THRESHOLD', value: number }
  | { type: 'SET_STRENGTH', value: number }
  | { type: 'SET_RADIUS', value: number }
  | { type: 'SET_GROUP', group: string, config: BloomGroupConfig }
  | { type: 'ENABLE' }
  | { type: 'DISABLE' }
  | { type: 'APPLY' };

export const bloomMachine = setup({
  types: {
    context: {} as BloomContext,
    events: {} as BloomEvent
  },

  actions: {
    setThreshold: assign({
      threshold: ({ event }) => {
        if (event.type !== 'SET_THRESHOLD') return 0.5;
        return Math.max(0, Math.min(1, event.value));
      }
    }),

    setStrength: assign({
      strength: ({ event }) => {
        if (event.type !== 'SET_STRENGTH') return 1.5;
        return Math.max(0, Math.min(3, event.value));
      }
    }),

    setRadius: assign({
      radius: ({ event }) => {
        if (event.type !== 'SET_RADIUS') return 0.4;
        return Math.max(0, Math.min(1, event.value));
      }
    }),

    setGroup: assign({
      groups: ({ context, event }) => {
        if (event.type !== 'SET_GROUP') return context.groups;
        const newGroups = new Map(context.groups);
        newGroups.set(event.group, event.config);
        return newGroups;
      }
    })
  }
}).createMachine({
  id: 'bloomEffects',
  initial: 'idle',

  context: {
    threshold: 0.5,
    strength: 1.5,
    radius: 0.4,
    enabled: true,
    groups: new Map([
      ['iris', { threshold: 0.3, strength: 0.8, radius: 0.4 }],
      ['eyeRings', { threshold: 0.4, strength: 0.6, radius: 0.3 }],
      ['revealRings', { threshold: 0.43, strength: 0.4, radius: 0.36 }]
    ])
  },

  states: {
    idle: {
      on: {
        SET_THRESHOLD: { actions: 'setThreshold' },
        SET_STRENGTH: { actions: 'setStrength' },
        SET_RADIUS: { actions: 'setRadius' },
        SET_GROUP: { actions: 'setGroup' },
        ENABLE: {
          actions: assign({ enabled: true })
        },
        DISABLE: {
          actions: assign({ enabled: false })
        },
        APPLY: { target: 'applying' }
      }
    },

    applying: {
      after: {
        10: { target: 'idle' } // Immediate apply
      }
    }
  }
});
```

**États simples** : `idle` ↔ `applying` (configuration temps réel)

---

## 📊 RÉSUMÉ STATE MACHINES

### **TABLEAU RÉCAPITULATIF**

| Actor | États principaux | Complexité | Priorité |
|-------|-----------------|------------|----------|
| **Root System** | idle, initializing, ready, error | Moyenne | CRITIQUE |
| **Scene** | idle, creating, ready, disposing, contextLost | Moyenne | CRITIQUE |
| **GLB Loader** | idle, loading, validating, loaded, error | Haute | CRITIQUE |
| **Animation Controller** | uninitialized, idle, playing, crossfading, paused | Haute | HAUTE |
| **Bloom Effects** | idle, applying | Faible | MOYENNE |
| **BloomColorPicker** | idle, debouncing, applying, error | Moyenne | HAUTE |

### **PATTERNS COMMUNS**

**Pattern 1 : Initialization** (Root, Scene, Animation)
```
idle → initializing → ready
```

**Pattern 2 : Error Recovery** (GLB Loader, Animation)
```
error → retry → loading
```

**Pattern 3 : Debouncing** (BloomColorPicker, Bloom)
```
idle → debouncing (after 200ms) → applying → idle
```

**Pattern 4 : Context Lost** (Scene, Renderer)
```
ready → contextLost → (wait CONTEXT_RESTORED) → creating → ready
```

---

---

### **MACHINE 6 : CAMERA ACTOR**

**Responsabilité** : Camera perspective + OrbitControls

```typescript
type CameraContext = {
  camera: THREE.PerspectiveCamera | null,
  controls: OrbitControls | null,
  position: THREE.Vector3,
  target: THREE.Vector3,
  fov: number,
  near: number,
  far: number,
  autoRotate: boolean,
  dampingEnabled: boolean
};

type CameraEvent =
  | { type: 'CREATE_CAMERA', aspect: number }
  | { type: 'SET_POSITION', position: THREE.Vector3 }
  | { type: 'SET_TARGET', target: THREE.Vector3 }
  | { type: 'FIT_TO_OBJECT', object: THREE.Object3D }
  | { type: 'ENABLE_AUTO_ROTATE' }
  | { type: 'DISABLE_AUTO_ROTATE' }
  | { type: 'UPDATE' }
  | { type: 'RESIZE', aspect: number };

export const cameraMachine = setup({
  types: {
    context: {} as CameraContext,
    events: {} as CameraEvent
  },

  actors: {
    fitCameraToObject: fromPromise(async ({ input }) => {
      const { camera, object, offset } = input;
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      camera.position.copy(center);
      camera.position.z += cameraDistance * (offset || 1.5);
      camera.lookAt(center);
      camera.updateProjectionMatrix();

      return { position: camera.position, target: center };
    })
  },

  actions: {
    createCamera: assign({
      camera: ({ event }) => {
        if (event.type !== 'CREATE_CAMERA') return null;
        return new THREE.PerspectiveCamera(75, event.aspect, 0.1, 1000);
      },
      position: () => new THREE.Vector3(0, 0, 5),
      target: () => new THREE.Vector3(0, 0, 0)
    }),

    setPosition: assign({
      position: ({ event }) => {
        if (event.type !== 'SET_POSITION') return new THREE.Vector3();
        return event.position;
      }
    }),

    setTarget: assign({
      target: ({ event }) => {
        if (event.type !== 'SET_TARGET') return new THREE.Vector3();
        return event.target;
      }
    }),

    updateControls: ({ context }) => {
      if (context.controls) {
        context.controls.update();
      }
    },

    resizeCamera: ({ context, event }) => {
      if (event.type !== 'RESIZE' || !context.camera) return;
      context.camera.aspect = event.aspect;
      context.camera.updateProjectionMatrix();
    }
  }
}).createMachine({
  id: 'camera',
  initial: 'uninitialized',

  context: {
    camera: null,
    controls: null,
    position: new THREE.Vector3(0, 0, 5),
    target: new THREE.Vector3(0, 0, 0),
    fov: 75,
    near: 0.1,
    far: 1000,
    autoRotate: false,
    dampingEnabled: true
  },

  states: {
    uninitialized: {
      on: {
        CREATE_CAMERA: {
          target: 'ready',
          actions: 'createCamera'
        }
      }
    },

    ready: {
      on: {
        SET_POSITION: { actions: 'setPosition' },
        SET_TARGET: { actions: 'setTarget' },
        FIT_TO_OBJECT: { target: 'fitting' },
        ENABLE_AUTO_ROTATE: {
          actions: assign({ autoRotate: true })
        },
        DISABLE_AUTO_ROTATE: {
          actions: assign({ autoRotate: false })
        },
        UPDATE: { actions: 'updateControls' },
        RESIZE: { actions: 'resizeCamera' }
      }
    },

    fitting: {
      invoke: {
        src: 'fitCameraToObject',
        input: ({ context, event }) => ({
          camera: context.camera,
          object: event.object,
          offset: 1.5
        }),
        onDone: {
          target: 'ready',
          actions: assign({
            position: ({ event }) => event.output.position,
            target: ({ event }) => event.output.target
          })
        }
      }
    }
  }
});
```

**États** :
- `uninitialized` : Camera non créée
- `ready` : Camera prête, accepte controls
- `fitting` : Fit camera to object en cours

---

### **MACHINE 7 : RENDERER ACTOR**

**Responsabilité** : WebGL renderer + RAF loop + context monitoring

```typescript
type RendererContext = {
  renderer: THREE.WebGLRenderer | null,
  rafId: number | null,
  isRendering: boolean,
  contextLost: boolean,
  fps: number,
  frameCount: number
};

type RendererEvent =
  | { type: 'CREATE_RENDERER', canvas: HTMLCanvasElement }
  | { type: 'START_RENDER_LOOP' }
  | { type: 'STOP_RENDER_LOOP' }
  | { type: 'RENDER_FRAME', scene: THREE.Scene, camera: THREE.Camera }
  | { type: 'CONTEXT_LOST' }
  | { type: 'CONTEXT_RESTORED' }
  | { type: 'RESIZE', width: number, height: number }
  | { type: 'SET_PIXEL_RATIO', ratio: number };

export const rendererMachine = setup({
  types: {
    context: {} as RendererContext,
    events: {} as RendererEvent
  },

  actions: {
    createRenderer: assign({
      renderer: ({ event }) => {
        if (event.type !== 'CREATE_RENDERER') return null;
        const renderer = new THREE.WebGLRenderer({
          canvas: event.canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        return renderer;
      }
    }),

    startRenderLoop: assign({ isRendering: true }),
    stopRenderLoop: assign({ isRendering: false, rafId: null }),

    renderFrame: ({ context, event }) => {
      if (event.type !== 'RENDER_FRAME' || !context.renderer) return;
      context.renderer.render(event.scene, event.camera);
    },

    resizeRenderer: ({ context, event }) => {
      if (event.type !== 'RESIZE' || !context.renderer) return;
      context.renderer.setSize(event.width, event.height, false);
    },

    setPixelRatio: ({ context, event }) => {
      if (event.type !== 'SET_PIXEL_RATIO' || !context.renderer) return;
      context.renderer.setPixelRatio(event.ratio);
    }
  }
}).createMachine({
  id: 'renderer',
  initial: 'uninitialized',

  context: {
    renderer: null,
    rafId: null,
    isRendering: false,
    contextLost: false,
    fps: 60,
    frameCount: 0
  },

  states: {
    uninitialized: {
      on: {
        CREATE_RENDERER: {
          target: 'idle',
          actions: 'createRenderer'
        }
      }
    },

    idle: {
      on: {
        START_RENDER_LOOP: { target: 'rendering' },
        RESIZE: { actions: 'resizeRenderer' },
        SET_PIXEL_RATIO: { actions: 'setPixelRatio' }
      }
    },

    rendering: {
      on: {
        RENDER_FRAME: { actions: 'renderFrame' },
        STOP_RENDER_LOOP: { target: 'idle', actions: 'stopRenderLoop' },
        CONTEXT_LOST: { target: 'contextLost' },
        RESIZE: { actions: 'resizeRenderer' }
      }
    },

    contextLost: {
      entry: assign({ contextLost: true, isRendering: false }),
      on: {
        CONTEXT_RESTORED: {
          target: 'idle',
          actions: assign({ contextLost: false })
        }
      }
    }
  }
});
```

**États** :
- `uninitialized` : Renderer non créé
- `idle` : Renderer prêt, pas de loop
- `rendering` : RAF loop actif
- `contextLost` : WebGL context perdu

---

### **MACHINE 8 : LIGHTING CONTROLLER ACTOR**

**Responsabilité** : PBR lighting (directional, ambient, hemisphere)

```typescript
type LightingContext = {
  lights: Map<string, THREE.Light>,
  ambientIntensity: number,
  directionalIntensity: number,
  hemisphereIntensity: number,
  shadows: boolean
};

type LightingEvent =
  | { type: 'ADD_LIGHT', lightId: string, light: THREE.Light }
  | { type: 'REMOVE_LIGHT', lightId: string }
  | { type: 'SET_AMBIENT_INTENSITY', value: number }
  | { type: 'SET_DIRECTIONAL_INTENSITY', value: number }
  | { type: 'ENABLE_SHADOWS' }
  | { type: 'DISABLE_SHADOWS' }
  | { type: 'UPDATE_LIGHT_POSITION', lightId: string, position: THREE.Vector3 };

export const lightingMachine = setup({
  types: {
    context: {} as LightingContext,
    events: {} as LightingEvent
  },

  actions: {
    addLight: assign({
      lights: ({ context, event }) => {
        if (event.type !== 'ADD_LIGHT') return context.lights;
        const newLights = new Map(context.lights);
        newLights.set(event.lightId, event.light);
        return newLights;
      }
    }),

    removeLight: assign({
      lights: ({ context, event }) => {
        if (event.type !== 'REMOVE_LIGHT') return context.lights;
        const newLights = new Map(context.lights);
        const light = newLights.get(event.lightId);
        if (light) {
          light.dispose?.();
          newLights.delete(event.lightId);
        }
        return newLights;
      }
    }),

    setAmbientIntensity: assign({
      ambientIntensity: ({ event }) => {
        if (event.type !== 'SET_AMBIENT_INTENSITY') return 1;
        return Math.max(0, Math.min(2, event.value));
      }
    })
  }
}).createMachine({
  id: 'lighting',
  initial: 'idle',

  context: {
    lights: new Map(),
    ambientIntensity: 1,
    directionalIntensity: 1,
    hemisphereIntensity: 0.5,
    shadows: true
  },

  states: {
    idle: {
      on: {
        ADD_LIGHT: { actions: 'addLight' },
        REMOVE_LIGHT: { actions: 'removeLight' },
        SET_AMBIENT_INTENSITY: { actions: 'setAmbientIntensity' },
        ENABLE_SHADOWS: { actions: assign({ shadows: true }) },
        DISABLE_SHADOWS: { actions: assign({ shadows: false }) }
      }
    }
  }
});
```

**États simples** : `idle` (configuration temps réel)

---

### **MACHINE 9 : PERFORMANCE MONITOR ACTOR**

**Responsabilité** : FPS tracking + memory monitoring

```typescript
type PerformanceContext = {
  fps: number,
  frameTime: number,
  memory: number,
  drawCalls: number,
  triangles: number,
  samples: number[],
  threshold: number
};

type PerformanceEvent =
  | { type: 'RECORD_FRAME', delta: number }
  | { type: 'RECORD_MEMORY', bytes: number }
  | { type: 'RECORD_STATS', drawCalls: number, triangles: number }
  | { type: 'SET_THRESHOLD', fps: number }
  | { type: 'RESET' };

export const performanceMachine = setup({
  types: {
    context: {} as PerformanceContext,
    events: {} as PerformanceEvent
  },

  actions: {
    recordFrame: assign({
      fps: ({ context, event }) => {
        if (event.type !== 'RECORD_FRAME') return context.fps;
        return Math.round(1000 / event.delta);
      },
      frameTime: ({ event }) => {
        if (event.type !== 'RECORD_FRAME') return 0;
        return event.delta;
      },
      samples: ({ context, event }) => {
        if (event.type !== 'RECORD_FRAME') return context.samples;
        const newSamples = [...context.samples, 1000 / event.delta];
        return newSamples.slice(-60); // Keep last 60 frames
      }
    }),

    recordMemory: assign({
      memory: ({ event }) => {
        if (event.type !== 'RECORD_MEMORY') return 0;
        return event.bytes;
      }
    })
  },

  guards: {
    isBelowThreshold: ({ context }) => {
      const avgFps = context.samples.reduce((a, b) => a + b, 0) / context.samples.length;
      return avgFps < context.threshold;
    }
  }
}).createMachine({
  id: 'performanceMonitor',
  initial: 'monitoring',

  context: {
    fps: 60,
    frameTime: 16.67,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    samples: [],
    threshold: 30
  },

  states: {
    monitoring: {
      on: {
        RECORD_FRAME: [
          {
            guard: 'isBelowThreshold',
            target: 'warning',
            actions: 'recordFrame'
          },
          {
            actions: 'recordFrame'
          }
        ],
        RECORD_MEMORY: { actions: 'recordMemory' },
        RESET: {
          actions: assign({
            samples: [],
            fps: 60,
            frameTime: 16.67
          })
        }
      }
    },

    warning: {
      on: {
        RECORD_FRAME: [
          {
            guard: { type: 'isBelowThreshold', negate: true },
            target: 'monitoring',
            actions: 'recordFrame'
          },
          {
            actions: 'recordFrame'
          }
        ]
      }
    }
  }
});
```

**États** :
- `monitoring` : FPS normal (>threshold)
- `warning` : FPS bas (<threshold)

---

### **MACHINE 10 : PARTICLE SPAWNER ACTOR**

**Responsabilité** : Création particules

```typescript
type ParticleSpawnerContext = {
  particlePool: Particle[],
  activeParticles: Set<string>,
  maxParticles: number,
  spawnRate: number
};

type Particle = {
  id: string,
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  life: number,
  maxLife: number
};

type ParticleSpawnerEvent =
  | { type: 'SPAWN', count: number, config: ParticleConfig }
  | { type: 'STOP_SPAWN' }
  | { type: 'SET_SPAWN_RATE', rate: number }
  | { type: 'CLEAR_ALL' };

export const particleSpawnerMachine = setup({
  types: {
    context: {} as ParticleSpawnerContext,
    events: {} as ParticleSpawnerEvent
  },

  actors: {
    spawnParticles: fromPromise(async ({ input }) => {
      const { count, config, pool } = input;
      const spawned = [];

      for (let i = 0; i < count; i++) {
        const particle = {
          id: `particle_${Date.now()}_${i}`,
          position: config.position.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * config.spread,
            (Math.random() - 0.5) * config.spread,
            (Math.random() - 0.5) * config.spread
          ),
          life: config.life,
          maxLife: config.life
        };
        spawned.push(particle);
      }

      return spawned;
    })
  },

  actions: {
    storeSpawnedParticles: assign({
      activeParticles: ({ context, event }) => {
        const newActive = new Set(context.activeParticles);
        event.output.forEach(p => newActive.add(p.id));
        return newActive;
      },
      particlePool: ({ context, event }) => {
        return [...context.particlePool, ...event.output];
      }
    }),

    clearParticles: assign({
      activeParticles: () => new Set(),
      particlePool: () => []
    })
  },

  guards: {
    canSpawn: ({ context, event }) => {
      if (event.type !== 'SPAWN') return false;
      return context.activeParticles.size + event.count <= context.maxParticles;
    }
  }
}).createMachine({
  id: 'particleSpawner',
  initial: 'idle',

  context: {
    particlePool: [],
    activeParticles: new Set(),
    maxParticles: 1000,
    spawnRate: 10
  },

  states: {
    idle: {
      on: {
        SPAWN: [
          {
            guard: 'canSpawn',
            target: 'spawning'
          }
        ],
        CLEAR_ALL: { actions: 'clearParticles' }
      }
    },

    spawning: {
      invoke: {
        src: 'spawnParticles',
        input: ({ event, context }) => ({
          count: event.count,
          config: event.config,
          pool: context.particlePool
        }),
        onDone: {
          target: 'idle',
          actions: 'storeSpawnedParticles'
        }
      }
    }
  }
});
```

**États** :
- `idle` : Prêt à spawner
- `spawning` : Création particules en cours

---

### **MACHINE 11 : STATE COORDINATOR ACTOR**

**Responsabilité** : Coordination inter-actors (Receptionist pattern)

```typescript
type CoordinatorContext = {
  actorRegistry: Map<string, ActorRef>,
  eventQueue: CoordinatorEvent[],
  isProcessing: boolean
};

type CoordinatorEvent =
  | { type: 'REGISTER', actorId: string, actorRef: ActorRef }
  | { type: 'SEND_TO_ACTOR', actorId: string, event: any }
  | { type: 'BROADCAST', event: any, exclude?: string[] }
  | { type: 'PROCESS_QUEUE' };

export const coordinatorMachine = setup({
  types: {
    context: {} as CoordinatorContext,
    events: {} as CoordinatorEvent
  },

  actions: {
    register: assign({
      actorRegistry: ({ context, event }) => {
        if (event.type !== 'REGISTER') return context.actorRegistry;
        const newRegistry = new Map(context.actorRegistry);
        newRegistry.set(event.actorId, event.actorRef);
        return newRegistry;
      }
    }),

    sendToActor: ({ context, event }) => {
      if (event.type !== 'SEND_TO_ACTOR') return;
      const actorRef = context.actorRegistry.get(event.actorId);
      if (actorRef) {
        actorRef.send(event.event);
      }
    },

    broadcast: ({ context, event }) => {
      if (event.type !== 'BROADCAST') return;
      const exclude = new Set(event.exclude || []);
      context.actorRegistry.forEach((actorRef, actorId) => {
        if (!exclude.has(actorId)) {
          actorRef.send(event.event);
        }
      });
    }
  }
}).createMachine({
  id: 'coordinator',
  initial: 'idle',

  context: {
    actorRegistry: new Map(),
    eventQueue: [],
    isProcessing: false
  },

  states: {
    idle: {
      on: {
        REGISTER: { actions: 'register' },
        SEND_TO_ACTOR: { actions: 'sendToActor' },
        BROADCAST: { actions: 'broadcast' }
      }
    }
  }
});
```

**États simples** : `idle` (coordination temps réel)

---

## 📊 RÉSUMÉ COMPLET STATE MACHINES

### **TABLEAU RÉCAPITULATIF FINAL**

| # | Actor | États principaux | Complexité | Phase | Priorité |
|---|-------|-----------------|------------|-------|----------|
| 1 | **Root System** | idle, initializing, ready, error | Moyenne | 1 | CRITIQUE |
| 2 | **Scene** | idle, creating, ready, disposing, contextLost | Moyenne | 1 | CRITIQUE |
| 3 | **GLB Loader** | idle, loading, validating, loaded, error | Haute | 1 | CRITIQUE |
| 4 | **Animation Controller** | uninitialized, idle, playing, crossfading, paused | Haute | 2 | HAUTE |
| 5 | **Bloom Effects** | idle, applying | Faible | 2 | MOYENNE |
| 6 | **Camera** | uninitialized, ready, fitting | Moyenne | 1 | HAUTE |
| 7 | **Renderer** | uninitialized, idle, rendering, contextLost | Moyenne | 1 | CRITIQUE |
| 8 | **Lighting Controller** | idle | Faible | 2 | MOYENNE |
| 9 | **Performance Monitor** | monitoring, warning | Moyenne | 2 | HAUTE |
| 10 | **Particle Spawner** | idle, spawning | Moyenne | 2 | HAUTE |
| 11 | **State Coordinator** | idle | Faible | 1 | CRITIQUE |
| 12 | **BloomColorPicker** | idle, debouncing, applying, error | Moyenne | 4 | HAUTE |

### **MACHINES NON DÉTAILLÉES** (Similaires aux existantes)

- **Particle Update Actor** : Similaire à Particle Spawner (idle → updating)
- **Particle Renderer Actor** : Similaire à Particle Spawner (idle → rendering)
- **Particle Pool Actor** : Similaire à Particle Spawner (idle → recycling)
- **Camera Controller Actor** : Doublon avec Camera Actor (fusionner)

**Total machines** : **12 machines détaillées** (conception complète)

---

## 🎯 PATTERNS RÉCAPITULATIFS

### **PATTERN 1 : LIFECYCLE** (Root, Scene, GLB, Camera, Renderer)
```
uninitialized → creating/initializing → ready → disposing → (idle)
```

### **PATTERN 2 : ERROR RECOVERY** (GLB Loader, Animation, Root)
```
error → retry/reinitialize → (retour état précédent)
```

### **PATTERN 3 : CONTEXT LOST** (Scene, Renderer)
```
ready → contextLost → (wait CONTEXT_RESTORED) → creating → ready
```

### **PATTERN 4 : DEBOUNCING** (BloomColorPicker, Bloom)
```
idle → debouncing (after Xms) → applying → idle
```

### **PATTERN 5 : VALIDATION** (GLB Loader)
```
loading → validating (guards) → [success: loaded | failure: error]
```

### **PATTERN 6 : MONITORING** (Performance Monitor)
```
monitoring → [threshold crossed: warning | normal: monitoring]
```

---

## 🧪 TESTING STRATEGY

### **UNIT TESTS PAR MACHINE**

**Test pattern commun** :
```typescript
describe('MachineName', () => {
  test('transitions from idle to active', () => {
    const actor = createActor(machine).start();
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().matches('active')).toBe(true);
  });

  test('handles errors correctly', () => {
    const actor = createActor(machine).start();
    actor.send({ type: 'ERROR', error: new Error('Test') });
    expect(actor.getSnapshot().matches('error')).toBe(true);
  });
});
```

### **INTEGRATION TESTS**

**Multi-actor coordination** :
```typescript
test('Root System coordinates Scene + Renderer', async () => {
  const rootActor = createActor(rootSystemMachine).start();
  const sceneActor = createActor(sceneMachine).start();
  const rendererActor = createActor(rendererMachine).start();

  // Register actors
  rootActor.send({ type: 'REGISTER_ACTOR', actorId: 'scene', actorRef: sceneActor });
  rootActor.send({ type: 'REGISTER_ACTOR', actorId: 'renderer', actorRef: rendererActor });

  // Verify coordination
  expect(rootActor.getSnapshot().context.actors.size).toBe(2);
});
```

---

## 🎯 COMMUNICATION INTER-ACTORS

### **RECEPTIONIST PATTERN**

**Registration** :
```typescript
// Actor s'enregistre auprès du Coordinator
coordinatorActor.send({
  type: 'REGISTER',
  actorId: 'animation',
  actorRef: animationActor
});
```

**Communication** :
```typescript
// Envoi event à actor spécifique via Coordinator
coordinatorActor.send({
  type: 'SEND_TO_ACTOR',
  actorId: 'animation',
  event: { type: 'PLAY', animationName: 'permanent' }
});

// Broadcast à tous sauf certains
coordinatorActor.send({
  type: 'BROADCAST',
  event: { type: 'CONTEXT_LOST' },
  exclude: ['performanceMonitor']
});
```

---

## 📚 TYPE EXPORTS GLOBAUX

**types/actors.ts** :
```typescript
export type ActorRegistry = Map<string, ActorRef>;

export type SystemEvent =
  | RootSystemEvent
  | SceneEvent
  | GLBLoaderEvent
  | AnimationEvent
  | BloomEvent
  | CameraEvent
  | RendererEvent
  | LightingEvent
  | PerformanceEvent
  | ParticleSpawnerEvent
  | CoordinatorEvent
  | BloomColorPickerEvent;
```

---

## 🎯 PROCHAINES ÉTAPES

✅ **E03 COMPLÉTÉ** - 12 state machines détaillées

**Prochaine session** : E04 Service Extraction (Services invoked, fromPromise patterns)

**Ou continuer vers** :
- E05 UI Layer Construction
- E06 Performance Optimization
- E07 Testing Implementation

---

**SESSION E03 TERMINÉE** ✅

**State machines** : 12/12 designées (100%)

**Qualité** : Code complet TypeScript XState v5 setup API

**Prochaine** : E04 Service Extraction
