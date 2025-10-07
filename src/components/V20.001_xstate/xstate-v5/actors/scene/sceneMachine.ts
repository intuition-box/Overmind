// xstate-v5/actors/scene/sceneMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';

export interface SceneContext {
  scene: THREE.Scene | null;

  // Background
  backgroundColor: string; // Hex color

  // Grid helper
  gridHelper: THREE.GridHelper | null;
  gridVisible: boolean;
  gridSize: number;
  gridDivisions: number;
  gridColor1: string; // Center line color
  gridColor2: string; // Grid line color

  // Axes helper
  axesHelper: THREE.AxesHelper | null;
  axesVisible: boolean;
  axesSize: number;
}

export type SceneEvents =
  // Initialisation
  | { type: 'SET_SCENE'; scene: THREE.Scene }

  // Background
  | { type: 'SET_BACKGROUND_COLOR'; color: string }

  // Grid Helper
  | { type: 'INITIALIZE_GRID'; gridHelper: THREE.GridHelper }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SHOW_GRID' }
  | { type: 'HIDE_GRID' }
  | { type: 'UPDATE_GRID_SIZE'; size: number }
  | { type: 'UPDATE_GRID_DIVISIONS'; divisions: number }
  | { type: 'UPDATE_GRID_COLORS'; color1: string; color2: string }

  // Axes Helper
  | { type: 'INITIALIZE_AXES'; axesHelper: THREE.AxesHelper }
  | { type: 'TOGGLE_AXES' }
  | { type: 'SHOW_AXES' }
  | { type: 'HIDE_AXES' }
  | { type: 'UPDATE_AXES_SIZE'; size: number }

  // Restore defaults
  | { type: 'RESTORE_DEFAULTS' };

export const sceneMachine = setup({
  types: {} as {
    context: SceneContext;
    events: SceneEvents;
  },
  actions: {
    // Apply background color
    applyBackgroundColor: ({ context }) => {
      if (context.scene) {
        context.scene.background = new THREE.Color(context.backgroundColor);
        console.log(`[sceneMachine] Set background color to ${context.backgroundColor}`);
      }
    },

    // Toggle grid visibility
    applyGridVisibility: ({ context }) => {
      if (context.gridHelper) {
        context.gridHelper.visible = context.gridVisible;
        console.log(`[sceneMachine] Grid ${context.gridVisible ? 'VISIBLE' : 'HIDDEN'}`);
      }
    },

    // Update grid helper (requires recreation)
    recreateGridHelper: ({ context }) => {
      if (context.scene && context.gridHelper) {
        // Remove old grid
        context.scene.remove(context.gridHelper);
        context.gridHelper.dispose();

        // Create new grid
        const newGrid = new THREE.GridHelper(
          context.gridSize,
          context.gridDivisions,
          new THREE.Color(context.gridColor1),
          new THREE.Color(context.gridColor2)
        );
        newGrid.visible = context.gridVisible;

        // Add to scene
        context.scene.add(newGrid);

        // Update reference (mutation OK in action)
        context.gridHelper = newGrid;

        console.log(`[sceneMachine] Grid recreated (size: ${context.gridSize}, divisions: ${context.gridDivisions})`);
      }
    },

    // Toggle axes visibility
    applyAxesVisibility: ({ context }) => {
      if (context.axesHelper) {
        context.axesHelper.visible = context.axesVisible;
        console.log(`[sceneMachine] Axes ${context.axesVisible ? 'VISIBLE' : 'HIDDEN'}`);
      }
    },

    // Update axes helper (requires recreation)
    recreateAxesHelper: ({ context }) => {
      if (context.scene && context.axesHelper) {
        // Remove old axes
        context.scene.remove(context.axesHelper);
        context.axesHelper.dispose();

        // Create new axes
        const newAxes = new THREE.AxesHelper(context.axesSize);
        newAxes.visible = context.axesVisible;

        // Add to scene
        context.scene.add(newAxes);

        // Update reference
        context.axesHelper = newAxes;

        console.log(`[sceneMachine] Axes recreated (size: ${context.axesSize})`);
      }
    }
  }
}).createMachine({
  id: 'scene',
  context: {
    scene: null,

    backgroundColor: '#1a1a1a', // Dark gray default

    gridHelper: null,
    gridVisible: false,
    gridSize: 10,
    gridDivisions: 10,
    gridColor1: '#888888', // Center line
    gridColor2: '#444444', // Grid lines

    axesHelper: null,
    axesVisible: false,
    axesSize: 5
  },
  on: {
    SET_SCENE: {
      actions: [
        assign({ scene: ({ event }) => event.scene }),
        'applyBackgroundColor'
      ]
    },

    // Background
    SET_BACKGROUND_COLOR: {
      actions: [
        assign({ backgroundColor: ({ event }) => event.color }),
        'applyBackgroundColor'
      ]
    },

    // Grid Helper
    INITIALIZE_GRID: {
      actions: assign({ gridHelper: ({ event }) => event.gridHelper })
    },

    TOGGLE_GRID: {
      actions: [
        assign({ gridVisible: ({ context }) => !context.gridVisible }),
        'applyGridVisibility'
      ]
    },

    SHOW_GRID: {
      actions: [
        assign({ gridVisible: true }),
        'applyGridVisibility'
      ]
    },

    HIDE_GRID: {
      actions: [
        assign({ gridVisible: false }),
        'applyGridVisibility'
      ]
    },

    UPDATE_GRID_SIZE: {
      actions: [
        assign({ gridSize: ({ event }) => event.size }),
        'recreateGridHelper'
      ]
    },

    UPDATE_GRID_DIVISIONS: {
      actions: [
        assign({ gridDivisions: ({ event }) => event.divisions }),
        'recreateGridHelper'
      ]
    },

    UPDATE_GRID_COLORS: {
      actions: [
        assign({
          gridColor1: ({ event }) => event.color1,
          gridColor2: ({ event }) => event.color2
        }),
        'recreateGridHelper'
      ]
    },

    // Axes Helper
    INITIALIZE_AXES: {
      actions: assign({ axesHelper: ({ event }) => event.axesHelper })
    },

    TOGGLE_AXES: {
      actions: [
        assign({ axesVisible: ({ context }) => !context.axesVisible }),
        'applyAxesVisibility'
      ]
    },

    SHOW_AXES: {
      actions: [
        assign({ axesVisible: true }),
        'applyAxesVisibility'
      ]
    },

    HIDE_AXES: {
      actions: [
        assign({ axesVisible: false }),
        'applyAxesVisibility'
      ]
    },

    UPDATE_AXES_SIZE: {
      actions: [
        assign({ axesSize: ({ event }) => event.size }),
        'recreateAxesHelper'
      ]
    },

    // Restore defaults
    RESTORE_DEFAULTS: {
      actions: [
        assign({
          backgroundColor: '#1a1a1a',
          gridVisible: false,
          gridSize: 10,
          gridDivisions: 10,
          gridColor1: '#888888',
          gridColor2: '#444444',
          axesVisible: false,
          axesSize: 5
        }),
        'applyBackgroundColor',
        'applyGridVisibility',
        'applyAxesVisibility'
      ]
    }
  }
});
