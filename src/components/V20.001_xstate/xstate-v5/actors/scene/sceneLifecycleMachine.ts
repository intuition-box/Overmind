// xstate-v5/actors/scene/sceneLifecycleMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import type { SceneLifecycleContext, SceneLifecycleEvents } from './sceneLifecycleMachine.types';
import { loadGLBFile } from '../../services/scene/loadGLBFile';
import { validateBones } from '../../services/scene/validateBones';
import { setupScene } from '../../services/scene/setupScene';
import { animationMachine } from '../animation/animationMachine';

export const sceneLifecycleMachine = setup({
  types: {} as {
    context: SceneLifecycleContext;
    events: SceneLifecycleEvents;
  },
  actors: {
    loadGLBFile,
    validateBones,
    setupScene,
    animationMachine
  },
  actions: {
    logSceneLoaded: ({ context }) => {
    },
    initializeAnimationActor: ({ context }) => {
      if (context.animationActor && context.mixer && context.model && context.animations) {
        context.animationActor.send({
          type: 'INITIALIZE',
          mixer: context.mixer,
          model: context.model,
          animations: context.animations
        });
      }
    },
    logError: ({ context }) => {
      console.error('[SceneLifecycle] Error:', context.error);
    }
  }
}).createMachine({
  id: 'sceneLifecycle',
  initial: 'idle',
  context: {
    model: null,
    bones: [],
    animations: [],
    materials: new Map(),
    scene: null,
    camera: null,
    renderer: null,
    mixer: null,
    containerElement: null,
    path: null,
    animationActor: null,
    error: null
  },
  states: {
    idle: {
      entry: assign({
        animationActor: ({ spawn }) => spawn('animationMachine', { id: 'animationActor' })
      }),
      on: {
        LOAD_SCENE: {
          target: 'loading',
          actions: assign({
            path: ({ event }) => event.path,
            containerElement: ({ event }) => event.containerElement
          })
        }
      }
    },
    loading: {
      invoke: {
        src: 'loadGLBFile',
        input: ({ context }) => ({
          path: context.path!
          // DEBUG: onProgress: (progress: number) => console.log(`Loading: ${progress}%`)
        }),
        onDone: {
          target: 'validating',
          actions: assign({
            model: ({ event }) => event.output.model,
            bones: ({ event }) => event.output.bones,
            animations: ({ event }) => event.output.animations,
            materials: ({ event }) => event.output.materials
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as Error
          })
        }
      }
    },
    validating: {
      invoke: {
        src: 'validateBones',
        input: ({ context }) => ({
          bones: context.bones,
          expectedCount: 484,
          strictMode: false
        }),
        onDone: {
          target: 'settingUpScene',
          actions: ({ event }) => {
            if (event.output.warnings.length > 0) {
              console.warn('[SceneLifecycle] Validation warnings:', event.output.warnings);
            }
          }
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as Error
          })
        }
      }
    },
    settingUpScene: {
      invoke: {
        src: 'setupScene',
        input: ({ context }) => ({
          containerElement: context.containerElement!,
          canvasWidth: 800,
          canvasHeight: 600
        }),
        onDone: {
          target: 'loaded',
          actions: [
            assign({
              scene: ({ event }) => event.output.scene,
              camera: ({ event }) => event.output.camera,
              renderer: ({ event }) => event.output.renderer,
              mixer: ({ context }) => new THREE.AnimationMixer(context.model!)
            }),
            'logSceneLoaded',
            'initializeAnimationActor'
          ]
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as Error
          })
        }
      }
    },
    loaded: {
      on: {
        CLEANUP_SCENE: 'cleanup'
      }
    },
    error: {
      entry: 'logError',
      on: {
        RETRY_LOAD: 'idle'
      }
    },
    cleanup: {
      type: 'final'
    }
  }
});
