// xstate-v5/actors/render/renderMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import { renderLoop } from '../../services/render/renderLoop';

export interface RenderContext {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
  mixer: THREE.AnimationMixer | null;
  fps: number;
  isRendering: boolean;
}

export type RenderEvents =
  | { type: 'START_RENDER' }
  | { type: 'STOP_RENDER' }
  | { type: 'UPDATE_FPS'; fps: number };

export const renderMachine = setup({
  types: {} as {
    context: RenderContext;
    events: RenderEvents;
  },
  actors: {
    renderLoop
  },
  actions: {
    updateFPS: assign({
      fps: ({ event }) => event.fps
    })
  }
}).createMachine({
  id: 'render',
  initial: 'idle',
  context: {
    scene: null,
    camera: null,
    renderer: null,
    mixer: null,
    fps: 0,
    isRendering: false
  },
  states: {
    idle: {
      on: {
        START_RENDER: 'rendering'
      }
    },
    rendering: {
      entry: assign({ isRendering: true }),
      invoke: {
        src: 'renderLoop',
        input: ({ context }) => ({
          scene: context.scene!,
          camera: context.camera!,
          renderer: context.renderer!,
          mixer: context.mixer,
          onFrame: (delta: number, fps: number) => {
            // FPS tracking handled in renderLoop
          }
        })
      },
      on: {
        STOP_RENDER: 'idle',
        UPDATE_FPS: {
          actions: 'updateFPS'
        }
      },
      exit: assign({ isRendering: false })
    }
  }
});
