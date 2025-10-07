// xstate-v5/actors/application/applicationMachine.ts
import { setup, assign } from 'xstate';
import type { ApplicationContext, ApplicationEvents } from './applicationMachine.types';
import { sceneLifecycleMachine } from '../scene/sceneLifecycleMachine';

export const applicationMachine = setup({
  types: {} as {
    context: ApplicationContext;
    events: ApplicationEvents;
  },
  actors: {
    sceneLifecycleMachine
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
    error: null,
    sceneActor: null
  },
  states: {
    initializing: {
      entry: assign({
        sceneActor: ({ spawn }) => spawn('sceneLifecycleMachine', { id: 'sceneActor' })
      }),
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
        },
        LOAD_SCENE: {
          actions: ({ context, event }) => {
            if (context.sceneActor) {
              context.sceneActor.send({
                type: 'LOAD_SCENE',
                path: event.path,
                containerElement: event.containerElement
              });
            }
          }
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
