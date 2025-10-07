// xstate-v5/actors/features/bloomColorPicker/bloomColorPickerMachine.ts
import { setup, assign } from 'xstate';
import { applyColorToMaterials } from '../../../services/features/applyColorToMaterials';

export interface BloomColorPickerContext {
  color: string;
  materials: Map<string, any> | null;
  isApplying: boolean;
  debounceTimer: number;
}

export type BloomColorPickerEvents =
  | { type: 'INITIALIZE'; materials: Map<string, any> }
  | { type: 'CHANGE_COLOR'; color: string }
  | { type: 'APPLY_COLOR' }
  | { type: 'DEBOUNCE_COMPLETE' };

export const bloomColorPickerMachine = setup({
  types: {} as {
    context: BloomColorPickerContext;
    events: BloomColorPickerEvents;
  },
  actors: {
    applyColorToMaterials
  },
  delays: {
    debounceDelay: 200 // 200ms debounce
  }
}).createMachine({
  id: 'bloomColorPicker',
  initial: 'idle',
  context: {
    color: '#ffffff',
    materials: null,
    isApplying: false,
    debounceTimer: 200
  },
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: 'ready',
          actions: assign({
            materials: ({ event }) => event.materials
          })
        }
      }
    },
    ready: {
      on: {
        CHANGE_COLOR: {
          target: 'debouncing',
          actions: assign({
            color: ({ event }) => event.color
          })
        }
      }
    },
    debouncing: {
      after: {
        debounceDelay: 'applying'
      },
      on: {
        CHANGE_COLOR: {
          target: 'debouncing',
          actions: assign({
            color: ({ event }) => event.color
          }),
          reenter: true
        }
      }
    },
    applying: {
      invoke: {
        src: 'applyColorToMaterials',
        input: ({ context }) => ({
          materials: context.materials!,
          color: context.color
        }),
        onDone: {
          target: 'ready'
        },
        onError: {
          target: 'ready'
        }
      }
    }
  }
});
