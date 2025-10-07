# 💻 PHASE H - CODE : sceneMachine

**Date** : 3 octobre 2025
**Objectif** : Code complet pour créer sceneMachine

---

## 📁 FICHIERS À CRÉER

### **1. Créer : sceneMachine.ts**
### **2. Créer : useScene.ts** (hook)

---

## 1️⃣ CRÉER : sceneMachine.ts

**Chemin** : `xstate-v5/actors/scene/sceneMachine.ts`

```typescript
// xstate-v5/actors/scene/sceneMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';

export interface SceneContext {
  scene: THREE.Scene | null;

  // Background Color
  backgroundColor: string;

  // Grid Helper
  gridEnabled: boolean;
  gridSize: number;
  gridDivisions: number;
  gridColor1: string;
  gridColor2: string;
  gridHelper: THREE.GridHelper | null;

  // Axes Helper
  axesEnabled: boolean;
  axesSize: number;
  axesHelper: THREE.AxesHelper | null;
}

export type SceneEvents =
  // Initialisation
  | { type: 'SET_SCENE'; scene: THREE.Scene }

  // Background
  | { type: 'SET_BACKGROUND_COLOR'; color: string }

  // Grid Helper
  | { type: 'TOGGLE_GRID' }
  | { type: 'ENABLE_GRID' }
  | { type: 'DISABLE_GRID' }
  | { type: 'UPDATE_GRID_SIZE'; size: number }
  | { type: 'UPDATE_GRID_DIVISIONS'; divisions: number }
  | { type: 'UPDATE_GRID_COLOR1'; color: string }
  | { type: 'UPDATE_GRID_COLOR2'; color: string }

  // Axes Helper
  | { type: 'TOGGLE_AXES' }
  | { type: 'ENABLE_AXES' }
  | { type: 'DISABLE_AXES' }
  | { type: 'UPDATE_AXES_SIZE'; size: number };

export const sceneMachine = setup({
  types: {} as {
    context: SceneContext;
    events: SceneEvents;
  },
  actions: {
    // Background
    updateBackground: ({ context }) => {
      if (context.scene) {
        context.scene.background = new THREE.Color(context.backgroundColor);
        console.log(`[updateBackground] Set to ${context.backgroundColor}`);
      }
    },

    // Grid Helper
    toggleGrid: ({ context }) => {
      if (!context.scene) return;

      if (context.gridEnabled) {
        // Create if doesn't exist
        if (!context.gridHelper) {
          const grid = new THREE.GridHelper(
            context.gridSize,
            context.gridDivisions,
            new THREE.Color(context.gridColor1),
            new THREE.Color(context.gridColor2)
          );
          context.gridHelper = grid;
        }
        context.scene.add(context.gridHelper);
        console.log(`[toggleGrid] ENABLED (size: ${context.gridSize}, divisions: ${context.gridDivisions})`);
      } else {
        // Remove
        if (context.gridHelper) {
          context.scene.remove(context.gridHelper);
          console.log(`[toggleGrid] DISABLED`);
        }
      }
    },

    recreateGrid: ({ context }) => {
      if (!context.scene || !context.gridEnabled) return;

      // Remove and dispose old
      if (context.gridHelper) {
        context.scene.remove(context.gridHelper);
        context.gridHelper.geometry.dispose();
        if (Array.isArray(context.gridHelper.material)) {
          context.gridHelper.material.forEach(m => m.dispose());
        } else {
          context.gridHelper.material.dispose();
        }
      }

      // Create new
      const grid = new THREE.GridHelper(
        context.gridSize,
        context.gridDivisions,
        new THREE.Color(context.gridColor1),
        new THREE.Color(context.gridColor2)
      );
      context.gridHelper = grid;
      context.scene.add(grid);

      console.log(`[recreateGrid] Recreated with size ${context.gridSize}, divisions ${context.gridDivisions}`);
    },

    // Axes Helper
    toggleAxes: ({ context }) => {
      if (!context.scene) return;

      if (context.axesEnabled) {
        // Create if doesn't exist
        if (!context.axesHelper) {
          const axes = new THREE.AxesHelper(context.axesSize);
          context.axesHelper = axes;
        }
        context.scene.add(context.axesHelper);
        console.log(`[toggleAxes] ENABLED (size: ${context.axesSize})`);
      } else {
        // Remove
        if (context.axesHelper) {
          context.scene.remove(context.axesHelper);
          console.log(`[toggleAxes] DISABLED`);
        }
      }
    },

    recreateAxes: ({ context }) => {
      if (!context.scene || !context.axesEnabled) return;

      // Remove and dispose old
      if (context.axesHelper) {
        context.scene.remove(context.axesHelper);
        context.axesHelper.geometry.dispose();
        if (Array.isArray(context.axesHelper.material)) {
          context.axesHelper.material.forEach(m => m.dispose());
        } else {
          context.axesHelper.material.dispose();
        }
      }

      // Create new
      const axes = new THREE.AxesHelper(context.axesSize);
      context.axesHelper = axes;
      context.scene.add(axes);

      console.log(`[recreateAxes] Recreated with size ${context.axesSize}`);
    }
  }
}).createMachine({
  id: 'scene',
  initial: 'idle',
  context: {
    scene: null,

    // Background (V6 default)
    backgroundColor: '#0a0a0a',

    // Grid Helper (disabled by default)
    gridEnabled: false,
    gridSize: 20,
    gridDivisions: 20,
    gridColor1: '#444444',
    gridColor2: '#222222',
    gridHelper: null,

    // Axes Helper (disabled by default)
    axesEnabled: false,
    axesSize: 5,
    axesHelper: null
  },
  states: {
    idle: {
      on: {
        SET_SCENE: {
          target: 'ready',
          actions: [
            assign({ scene: ({ event }) => event.scene }),
            'updateBackground'
          ]
        }
      }
    },
    ready: {
      on: {
        // Background
        SET_BACKGROUND_COLOR: {
          actions: [
            assign({ backgroundColor: ({ event }) => event.color }),
            'updateBackground'
          ]
        },

        // Grid Helper
        TOGGLE_GRID: {
          actions: [
            assign({ gridEnabled: ({ context }) => !context.gridEnabled }),
            'toggleGrid'
          ]
        },
        ENABLE_GRID: {
          actions: [
            assign({ gridEnabled: true }),
            'toggleGrid'
          ]
        },
        DISABLE_GRID: {
          actions: [
            assign({ gridEnabled: false }),
            'toggleGrid'
          ]
        },
        UPDATE_GRID_SIZE: {
          actions: [
            assign({ gridSize: ({ event }) => event.size }),
            'recreateGrid'
          ]
        },
        UPDATE_GRID_DIVISIONS: {
          actions: [
            assign({ gridDivisions: ({ event }) => event.divisions }),
            'recreateGrid'
          ]
        },
        UPDATE_GRID_COLOR1: {
          actions: [
            assign({ gridColor1: ({ event }) => event.color }),
            'recreateGrid'
          ]
        },
        UPDATE_GRID_COLOR2: {
          actions: [
            assign({ gridColor2: ({ event }) => event.color }),
            'recreateGrid'
          ]
        },

        // Axes Helper
        TOGGLE_AXES: {
          actions: [
            assign({ axesEnabled: ({ context }) => !context.axesEnabled }),
            'toggleAxes'
          ]
        },
        ENABLE_AXES: {
          actions: [
            assign({ axesEnabled: true }),
            'toggleAxes'
          ]
        },
        DISABLE_AXES: {
          actions: [
            assign({ axesEnabled: false }),
            'toggleAxes'
          ]
        },
        UPDATE_AXES_SIZE: {
          actions: [
            assign({ axesSize: ({ event }) => event.size }),
            'recreateAxes'
          ]
        }
      }
    }
  }
});
```

---

## 2️⃣ CRÉER : useScene.ts

**Chemin** : `xstate-v5/hooks/useScene.ts`

```typescript
// xstate-v5/hooks/useScene.ts
import { useSelector, useActorRef } from '@xstate/react';
import { sceneMachine } from '../actors/scene/sceneMachine';

export function useScene() {
  const actorRef = useActorRef(sceneMachine);

  // Background
  const backgroundColor = useSelector(actorRef, (state) => state.context.backgroundColor);

  // Grid
  const gridEnabled = useSelector(actorRef, (state) => state.context.gridEnabled);
  const gridSize = useSelector(actorRef, (state) => state.context.gridSize);
  const gridDivisions = useSelector(actorRef, (state) => state.context.gridDivisions);
  const gridColor1 = useSelector(actorRef, (state) => state.context.gridColor1);
  const gridColor2 = useSelector(actorRef, (state) => state.context.gridColor2);

  // Axes
  const axesEnabled = useSelector(actorRef, (state) => state.context.axesEnabled);
  const axesSize = useSelector(actorRef, (state) => state.context.axesSize);

  // Actions - Background
  const setBackgroundColor = (color: string) => {
    actorRef.send({ type: 'SET_BACKGROUND_COLOR', color });
  };

  // Actions - Grid
  const toggleGrid = () => actorRef.send({ type: 'TOGGLE_GRID' });
  const updateGridSize = (size: number) => actorRef.send({ type: 'UPDATE_GRID_SIZE', size });
  const updateGridDivisions = (divisions: number) => actorRef.send({ type: 'UPDATE_GRID_DIVISIONS', divisions });
  const updateGridColor1 = (color: string) => actorRef.send({ type: 'UPDATE_GRID_COLOR1', color });
  const updateGridColor2 = (color: string) => actorRef.send({ type: 'UPDATE_GRID_COLOR2', color });

  // Actions - Axes
  const toggleAxes = () => actorRef.send({ type: 'TOGGLE_AXES' });
  const updateAxesSize = (size: number) => actorRef.send({ type: 'UPDATE_AXES_SIZE', size });

  return {
    // State - Background
    backgroundColor,

    // State - Grid
    grid: {
      enabled: gridEnabled,
      size: gridSize,
      divisions: gridDivisions,
      color1: gridColor1,
      color2: gridColor2
    },

    // State - Axes
    axes: {
      enabled: axesEnabled,
      size: axesSize
    },

    // Actions
    setBackgroundColor,
    toggleGrid,
    updateGridSize,
    updateGridDivisions,
    updateGridColor1,
    updateGridColor2,
    toggleAxes,
    updateAxesSize
  };
}
```

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] `sceneMachine.ts` créé avec machine complète
- [ ] `useScene.ts` créé (hook)
- [ ] TypeScript compile sans erreurs
- [ ] Imports corrects (THREE, xstate)
- [ ] Console.log présents pour debug
- [ ] Dispose helpers correctement (geometry + material)
- [ ] Recreate helpers quand params changent

---

## ➡️ PROCHAINE ÉTAPE

**Voir [H04_TESTS.md](H04_TESTS.md)** pour tester le code.

---

**FIN CODE PHASE H**
