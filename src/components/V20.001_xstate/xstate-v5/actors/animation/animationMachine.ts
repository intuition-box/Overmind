// xstate-v5/actors/animation/animationMachine.ts
import { setup, assign } from 'xstate';
import type { AnimationContext, AnimationEvents } from './animationMachine.types';
import { initializeAnimations } from '../../services/animation/initializeAnimations';
import { startPermanentLoop } from '../../services/animation/startPermanentLoop';
import { crossfadeTransition } from '../../services/animation/crossfadeTransition';
import { transitionToReveal } from '../../services/animation/transitionToReveal';
import { transitionToLoop } from '../../services/animation/transitionToLoop';

export const animationMachine = setup({
  types: {} as {
    context: AnimationContext;
    events: AnimationEvents;
  },
  actors: {
    initializeAnimations,
    startPermanentLoop,
    transitionToReveal,
    transitionToLoop
  },
  actions: {
    logError: ({ context }) => {
      console.error('[AnimationMachine] Error:', context.error);
    }
  }
}).createMachine({
  id: 'animation',
  initial: 'idle',
  context: {
    mixer: null,
    model: null,
    animations: [],
    permanentActions: new Map(),
    poseActions: new Map(),
    ringActions: new Map(),
    currentState: 'idle',
    currentPoseActions: [],
    permanentWeights: new Map(),
    fadeToRevealDuration: 10.0,
    fadeToLoopDuration: 10.0,
    timeScale: 1.0,
    error: null
  },
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: 'initializing',
          actions: assign({
            mixer: ({ event }) => event.mixer,
            model: ({ event }) => event.model,
            animations: ({ event }) => event.animations
          })
        }
      }
    },
    initializing: {
      invoke: {
        src: 'initializeAnimations',
        input: ({ context }) => ({
          mixer: context.mixer!,
          animations: context.animations
        }),
        onDone: {
          target: 'startingLoop',
          actions: assign({
            permanentActions: ({ event }) => event.output.permanentActions,
            poseActions: ({ event }) => event.output.poseActions,
            ringActions: ({ event }) => event.output.ringActions,
            currentState: 'idle'
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
    startingLoop: {
      // DEBUG: entry: () => console.log('[AnimationMachine] Starting loop after initialization'),
      invoke: {
        src: 'startPermanentLoop',
        input: ({ context }) => ({
          permanentActions: context.permanentActions
        }),
        onDone: {
          target: 'looping',
          actions: assign({ currentState: 'loop' })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as Error
          })
        }
      }
    },
    looping: {
      on: {
        TRIGGER_REVEAL: 'revealing',
        STOP_ALL: 'idle'
      }
    },
    revealing: {
      invoke: {
        src: 'transitionToReveal',
        input: ({ context }) => ({
          permanentActions: context.permanentActions,
          poseActions: context.poseActions,
          ringActions: context.ringActions,
          fadeDuration: context.fadeToRevealDuration
        })
      },
      on: {
        RINGS_FINISHED: {
          target: 'returning'
          // DEBUG: actions: () => console.log('[AnimationMachine] Rings finished, auto-returning to loop')
        },
        RETURN_TO_LOOP: 'returning'
      }
    },
    returning: {
      invoke: {
        src: 'transitionToLoop',
        input: ({ context }) => ({
          permanentActions: context.permanentActions,
          poseActions: context.poseActions,
          ringActions: context.ringActions,
          fadeDuration: context.fadeToLoopDuration
        }),
        onDone: {
          target: 'looping',
          actions: assign({ currentState: 'loop' })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as Error
          })
        }
      }
    },
    error: {
      entry: 'logError',
      on: {
        INITIALIZE: 'idle'
      }
    }
  }
});
