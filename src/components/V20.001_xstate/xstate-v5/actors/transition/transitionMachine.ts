// xstate-v5/actors/transition/transitionMachine.ts
import { setup, assign } from 'xstate';

export interface TransitionContext {
  from: string | null;
  to: string | null;
  duration: number;
  progress: number;
  isTransitioning: boolean;
}

export type TransitionEvents =
  | { type: 'START_TRANSITION'; from: string; to: string; duration?: number }
  | { type: 'UPDATE_PROGRESS'; progress: number }
  | { type: 'COMPLETE_TRANSITION' }
  | { type: 'CANCEL_TRANSITION' };

export const transitionMachine = setup({
  types: {} as {
    context: TransitionContext;
    events: TransitionEvents;
  }
}).createMachine({
  id: 'transition',
  initial: 'idle',
  context: {
    from: null,
    to: null,
    duration: 1.0,
    progress: 0,
    isTransitioning: false
  },
  states: {
    idle: {
      on: {
        START_TRANSITION: {
          target: 'transitioning',
          actions: assign({
            from: ({ event }) => event.from,
            to: ({ event }) => event.to,
            duration: ({ event }) => event.duration ?? 1.0,
            progress: 0,
            isTransitioning: true
          })
        }
      }
    },
    transitioning: {
      on: {
        UPDATE_PROGRESS: {
          actions: assign({ progress: ({ event }) => event.progress })
        },
        COMPLETE_TRANSITION: {
          target: 'idle',
          actions: assign({
            from: null,
            to: null,
            progress: 1,
            isTransitioning: false
          })
        },
        CANCEL_TRANSITION: {
          target: 'idle',
          actions: assign({
            from: null,
            to: null,
            progress: 0,
            isTransitioning: false
          })
        }
      }
    }
  }
});
