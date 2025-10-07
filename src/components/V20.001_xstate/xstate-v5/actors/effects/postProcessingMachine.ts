// xstate-v5/actors/effects/postProcessingMachine.ts
import { setup, assign } from 'xstate';
import { applyPostProcessing } from '../../services/effects/applyPostProcessing';

export interface PostProcessingContext {
  bloomEnabled: boolean;
  bloomStrength: number;
  ssaoEnabled: boolean;
  ssaoStrength: number;
}

export type PostProcessingEvents =
  | { type: 'ENABLE_BLOOM'; strength?: number }
  | { type: 'DISABLE_BLOOM' }
  | { type: 'ENABLE_SSAO'; strength?: number }
  | { type: 'DISABLE_SSAO' };

export const postProcessingMachine = setup({
  types: {} as {
    context: PostProcessingContext;
    events: PostProcessingEvents;
  },
  actors: {
    applyPostProcessing
  }
}).createMachine({
  id: 'postProcessing',
  initial: 'idle',
  context: {
    bloomEnabled: false,
    bloomStrength: 0.8,
    ssaoEnabled: false,
    ssaoStrength: 0.5
  },
  states: {
    idle: {
      on: {
        ENABLE_BLOOM: {
          actions: assign({
            bloomEnabled: true,
            bloomStrength: ({ event }) => event.strength || 0.8
          })
        },
        DISABLE_BLOOM: {
          actions: assign({ bloomEnabled: false })
        },
        ENABLE_SSAO: {
          actions: assign({
            ssaoEnabled: true,
            ssaoStrength: ({ event }) => event.strength || 0.5
          })
        },
        DISABLE_SSAO: {
          actions: assign({ ssaoEnabled: false })
        }
      }
    }
  }
});
