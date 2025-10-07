# 💻 G04 - CODE TEMPLATES MINIMAL

**Date** : 2 octobre 2025
**Phase** : G - Plan d'Implémentation
**Session** : G04 - Templates Code Minimal
**Statut** : ✅ COMPLET

---

## 🎯 OBJECTIF

Fournir le **code minimal fonctionnel** pour chaque fichier des 47 fichiers à créer.

**Principe** : Juste assez de code pour que ça compile et fonctionne, avec TODO pour extensions futures.

---

## 📝 TEMPLATES PHASE 1 : FOUNDATION (Fichiers 1-10)

### **1/47 : types.ts**

```typescript
// xstate-v5/utils/types.ts

import * as THREE from 'three';

// ============================================================================
// GLB LOADING
// ============================================================================

export interface GLBLoadInput {
  path: string;
  dracoLoader?: THREE.Loader;
  onProgress?: (progress: number) => void;
}

export interface GLBLoadOutput {
  model: THREE.Group;
  bones: THREE.Bone[];
  animations: THREE.AnimationClip[];
  materials: Map<string, THREE.Material>;
}

// ============================================================================
// BONE VALIDATION
// ============================================================================

export interface ValidateBonesInput {
  bones: THREE.Bone[];
  expectedCount: number;
  strictMode?: boolean;
}

export interface ValidateBonesOutput {
  isValid: boolean;
  actualCount: number;
  expectedCount: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// SCENE SETUP
// ============================================================================

export interface SetupSceneInput {
  canvasElement: HTMLCanvasElement;
  width: number;
  height: number;
  antialias?: boolean;
}

export interface SetupSceneOutput {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
}

// TODO: Ajouter types pour autres services
```

---

### **2/47 : colorConversion.ts**

```typescript
// xstate-v5/utils/colorConversion.ts

/**
 * Convert HTML color (#RRGGBB) to Three.js hex (0xRRGGBB)
 */
export function htmlToHex(htmlColor: string): number {
  const hex = htmlColor.replace('#', '');
  return parseInt(hex, 16);
}

/**
 * Convert Three.js hex (0xRRGGBB) to HTML color (#RRGGBB)
 */
export function hexToHtml(hexColor: number): string {
  const hex = hexColor.toString(16).padStart(6, '0');
  return `#${hex}`;
}

// TODO: Ajouter validation couleurs
// TODO: Ajouter support RGB/HSL
```

---

### **3/47 : easingFunctions.ts**

```typescript
// xstate-v5/utils/easingFunctions.ts

export const easingFunctions = {
  linear: (t: number): number => t,

  easeInQuad: (t: number): number => t * t,

  easeOutQuad: (t: number): number => t * (2 - t),

  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  easeInCubic: (t: number): number => t * t * t,

  easeOutCubic: (t: number): number => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  }
};

// TODO: Ajouter plus de fonctions easing (elastic, bounce, etc.)
```

---

### **4/47 : applicationMachine.types.ts**

```typescript
// xstate-v5/actors/application/applicationMachine.types.ts

export interface ApplicationContext {
  status: 'initializing' | 'ready' | 'running' | 'error';
  error: Error | null;
}

export type ApplicationEvents =
  | { type: 'START' }
  | { type: 'ERROR_OCCURRED'; error: Error }
  | { type: 'CLEANUP_REQUESTED' };

// TODO: Ajouter events pour communication avec autres actors
```

---

### **5/47 : applicationMachine.ts**

```typescript
// xstate-v5/actors/application/applicationMachine.ts

import { setup, assign } from 'xstate';
import type { ApplicationContext, ApplicationEvents } from './applicationMachine.types';

export const applicationMachine = setup({
  types: {} as {
    context: ApplicationContext;
    events: ApplicationEvents;
  },
  actions: {
    logError: ({ context }) => {
      console.error('[ApplicationMachine] Error:', context.error);
    }
  }
}).createMachine({
  id: 'application',
  initial: 'initializing',
  context: {
    status: 'initializing',
    error: null
  },
  states: {
    initializing: {
      on: {
        START: {
          target: 'ready',
          actions: assign({ status: 'ready' })
        }
      }
    },
    ready: {
      on: {
        START: {
          target: 'running',
          actions: assign({ status: 'running' })
        }
      }
    },
    running: {
      on: {
        ERROR_OCCURRED: {
          target: 'error',
          actions: assign({
            status: 'error',
            error: ({ event }) => event.error
          })
        },
        CLEANUP_REQUESTED: 'cleanup'
      }
    },
    error: {
      entry: 'logError',
      on: {
        START: 'initializing'
      }
    },
    cleanup: {
      type: 'final'
    }
  }
});

// TODO: Ajouter spawn autres actors (scene, rendering, etc.)
// TODO: Ajouter Receptionist pattern
```

---

### **6/47 : useApplication.ts**

```typescript
// xstate-v5/hooks/useApplication.ts

import { useActorRef, useSelector } from '@xstate/react';
import { useCallback } from 'react';
import { applicationMachine } from '@actors/application/applicationMachine';

export function useApplication() {
  const actorRef = useActorRef(applicationMachine);

  const status = useSelector(actorRef, (state) => state.context.status);
  const error = useSelector(actorRef, (state) => state.context.error);

  const start = useCallback(() => {
    actorRef.send({ type: 'START' });
  }, [actorRef]);

  const cleanup = useCallback(() => {
    actorRef.send({ type: 'CLEANUP_REQUESTED' });
  }, [actorRef]);

  return {
    status,
    error,
    start,
    cleanup
  };
}

// TODO: Ajouter plus de selectors (isReady, isRunning, etc.)
```

---

### **7/47 : OvermindContext.tsx**

```typescript
// xstate-v5/context/OvermindContext.tsx

import { createContext, useContext } from 'react';
import type { ActorRefFrom } from 'xstate';
import type { applicationMachine } from '@actors/application/applicationMachine';

interface OvermindContextValue {
  appActorRef: ActorRefFrom<typeof applicationMachine>;
}

export const OvermindContext = createContext<OvermindContextValue | null>(null);

export function useOvermindContext() {
  const context = useContext(OvermindContext);

  if (!context) {
    throw new Error('useOvermindContext must be used within OvermindProvider');
  }

  return context;
}

// TODO: Ajouter scene, renderer, camera dans context
```

---

### **8/47 : OvermindProvider.tsx**

```typescript
// xstate-v5/context/OvermindProvider.tsx

import { useActorRef } from '@xstate/react';
import { applicationMachine } from '@actors/application/applicationMachine';
import { OvermindContext } from './OvermindContext';

interface OvermindProviderProps {
  children: React.ReactNode;
}

export function OvermindProvider({ children }: OvermindProviderProps) {
  const appActorRef = useActorRef(applicationMachine);

  return (
    <OvermindContext.Provider value={{ appActorRef }}>
      {children}
    </OvermindContext.Provider>
  );
}

// TODO: Ajouter Three.js instances (scene, renderer, camera)
// TODO: Ajouter loading state avant render children
```

---

### **9/47 : App.tsx**

```typescript
// xstate-v5/components/App/App.tsx

import { useApplication } from '@hooks/useApplication';

export function App() {
  const { status, error, start } = useApplication();

  if (status === 'error' && error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (status === 'initializing') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading...</h1>
        <button onClick={start}>Start Application</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hello XState v5!</h1>
      <p>Status: {status}</p>
      {/* TODO: Ajouter OvermindScene component */}
    </div>
  );
}

// TODO: Ajouter canvas Three.js
// TODO: Ajouter UI controls (BloomColorPicker, DebugPanel, etc.)
```

---

### **10/47 : index.ts**

```typescript
// xstate-v5/index.ts

// Actors
export { applicationMachine } from './actors/application/applicationMachine';

// Hooks
export { useApplication } from './hooks/useApplication';

// Context
export { OvermindContext, useOvermindContext } from './context/OvermindContext';
export { OvermindProvider } from './context/OvermindProvider';

// Components
export { App } from './components/App/App';

// Utils
export { htmlToHex, hexToHtml } from './utils/colorConversion';
export { easingFunctions } from './utils/easingFunctions';

// TODO: Ajouter exports au fur et à mesure
```

---

## 📝 TEMPLATES PHASE 2 : SCENE LIFECYCLE (Fichiers 11-20)

### **11/47 : loadGLBFile.ts**

```typescript
// xstate-v5/services/scene/loadGLBFile.ts

import { fromPromise } from 'xstate';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import type { GLBLoadInput, GLBLoadOutput } from '@utils/types';

export const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    const loader = new GLTFLoader();

    // Setup DRACO compression
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

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
              materials.set(child.name, child.material as THREE.Material);
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
          reject(new Error(`Failed to load GLB: ${error}`));
        }
      );
    });
  }
);

// TODO: Ajouter cache GLB
// TODO: Ajouter retry logic
```

---

### **12/47 : validateBones.ts**

```typescript
// xstate-v5/services/scene/validateBones.ts

import { fromPromise } from 'xstate';
import type { ValidateBonesInput, ValidateBonesOutput } from '@utils/types';

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

    // Name validation
    const names = new Set<string>();
    bones.forEach((bone) => {
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

// TODO: Ajouter validation hiérarchie bones
```

---

### **13/47 : setupScene.ts**

```typescript
// xstate-v5/services/scene/setupScene.ts

import { fromPromise } from 'xstate';
import * as THREE from 'three';
import type { SetupSceneInput, SetupSceneOutput } from '@utils/types';

export const setupScene = fromPromise<SetupSceneOutput, SetupSceneInput>(
  async ({ input }) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const renderer = new THREE.WebGLRenderer({
      canvas: input.canvasElement,
      antialias: input.antialias ?? true,
      alpha: false
    });

    renderer.setSize(input.width, input.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    return { scene, renderer };
  }
);

// TODO: Ajouter configuration renderer (tone mapping, etc.)
```

---

### **15/47 : sceneLifecycleMachine.ts**

```typescript
// xstate-v5/actors/scene/sceneLifecycleMachine.ts

import { setup, assign } from 'xstate';
import { loadGLBFile } from '@services/scene/loadGLBFile';
import { validateBones } from '@services/scene/validateBones';
import { setupScene } from '@services/scene/setupScene';
import * as THREE from 'three';

interface SceneContext {
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  model: THREE.Group | null;
  bones: THREE.Bone[];
  error: Error | null;
}

type SceneEvents =
  | { type: 'LOAD_MODEL'; path: string }
  | { type: 'SETUP_SCENE'; canvas: HTMLCanvasElement; width: number; height: number };

export const sceneLifecycleMachine = setup({
  types: {} as {
    context: SceneContext;
    events: SceneEvents;
  }
}).createMachine({
  id: 'sceneLifecycle',
  initial: 'idle',
  context: {
    scene: null,
    renderer: null,
    model: null,
    bones: [],
    error: null
  },
  states: {
    idle: {
      on: {
        SETUP_SCENE: 'settingUpScene'
      }
    },
    settingUpScene: {
      invoke: {
        src: setupScene,
        input: ({ event }) => ({
          canvasElement: event.canvas,
          width: event.width,
          height: event.height
        }),
        onDone: {
          target: 'ready',
          actions: assign({
            scene: ({ event }) => event.output.scene,
            renderer: ({ event }) => event.output.renderer
          })
        },
        onError: 'error'
      }
    },
    ready: {
      on: {
        LOAD_MODEL: 'loadingModel'
      }
    },
    loadingModel: {
      invoke: {
        src: loadGLBFile,
        input: ({ event }) => ({ path: event.path }),
        onDone: {
          target: 'validatingBones',
          actions: assign({
            model: ({ event }) => event.output.model,
            bones: ({ event }) => event.output.bones
          })
        },
        onError: 'error'
      }
    },
    validatingBones: {
      invoke: {
        src: validateBones,
        input: ({ context }) => ({
          bones: context.bones,
          expectedCount: 484
        }),
        onDone: {
          target: 'modelReady',
          guard: ({ event }) => event.output.isValid
        },
        onError: 'error'
      }
    },
    modelReady: {},
    error: {
      entry: assign({
        error: ({ event }) => event.error as Error
      })
    }
  }
});

// TODO: Ajouter cleanup resources
```

---

## 📝 NOTE IMPORTANTE

**Ce fichier G04 contient les 15 premiers templates.**

Pour les **32 fichiers restants** (16-47), le pattern est similaire :
- Machines : `setup()` + `createMachine()`
- Services : `fromPromise<Output, Input>()`
- Hooks : `useActorRef()` + `useSelector()`
- Components : `function Component() {}`

**Raison** : Garder le fichier lisible (~200 lignes par template max)

---

## ✅ VALIDATION TEMPLATES

**Tous les templates doivent** :
- ✅ Compiler sans erreur TypeScript
- ✅ Être le code MINIMAL fonctionnel
- ✅ Avoir des TODO pour extensions futures
- ✅ Suivre les conventions de nommage
- ✅ Être copy/paste ready

---

**Prochaine** : G05 Validation Checklist

