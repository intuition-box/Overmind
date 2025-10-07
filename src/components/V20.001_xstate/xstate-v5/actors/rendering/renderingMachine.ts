// xstate-v5/actors/rendering/renderingMachine.ts
import { setup, assign, fromCallback } from 'xstate';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

export interface RenderingContext {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  composer: EffectComposer | null;
  useComposer: boolean;
  fps: number;
  frameCount: number;
}

export type RenderingEvents =
  | { type: 'INITIALIZE'; renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera; composer?: EffectComposer }
  | { type: 'START_RENDERING' }
  | { type: 'STOP_RENDERING' }
  | { type: 'TOGGLE_COMPOSER' }
  | { type: 'UPDATE_FPS'; fps: number };

const renderLoop = fromCallback<any, { context: RenderingContext }>(({ sendBack, input }) => {
  const { context } = input;
  let animationId: number;
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    frameCount++;
    fpsTime += delta;

    if (fpsTime >= 1) {
      const fps = frameCount / fpsTime;
      sendBack({ type: 'UPDATE_FPS', fps });
      frameCount = 0;
      fpsTime = 0;
    }

    if (context.renderer && context.scene && context.camera) {
      if (context.useComposer && context.composer) {
        context.composer.render();
      } else {
        context.renderer.render(context.scene, context.camera);
      }
    }
  }

  animate();

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
});

export const renderingMachine = setup({
  types: {} as {
    context: RenderingContext;
    events: RenderingEvents;
  },
  actors: {
    renderLoop
  }
}).createMachine({
  id: 'rendering',
  initial: 'idle',
  context: {
    renderer: null,
    scene: null,
    camera: null,
    composer: null,
    useComposer: false,
    fps: 0,
    frameCount: 0
  },
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: 'ready',
          actions: assign({
            renderer: ({ event }) => event.renderer,
            scene: ({ event }) => event.scene,
            camera: ({ event }) => event.camera,
            composer: ({ event }) => event.composer ?? null,
            useComposer: ({ event }) => !!event.composer
          })
        }
      }
    },
    ready: {
      on: {
        START_RENDERING: 'rendering'
      }
    },
    rendering: {
      invoke: {
        src: 'renderLoop',
        input: ({ context }) => ({ context })
      },
      on: {
        STOP_RENDERING: 'ready',
        TOGGLE_COMPOSER: {
          actions: assign({ useComposer: ({ context }) => !context.useComposer })
        },
        UPDATE_FPS: {
          actions: assign({ fps: ({ event }) => event.fps })
        }
      }
    }
  }
});
