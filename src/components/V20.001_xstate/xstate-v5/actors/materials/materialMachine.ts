// xstate-v5/actors/materials/materialMachine.ts
import { setup, assign } from 'xstate';
import { applyMaterialEffect } from '../../services/materials/applyMaterialEffect';

export interface MaterialContext {
  color: string;
  metalness: number;
  roughness: number;
}

export type MaterialEvents =
  | { type: 'UPDATE_COLOR'; color: string }
  | { type: 'UPDATE_METALNESS'; metalness: number }
  | { type: 'UPDATE_ROUGHNESS'; roughness: number };

export const materialMachine = setup({
  types: {} as {
    context: MaterialContext;
    events: MaterialEvents;
  },
  actors: {
    applyMaterialEffect
  }
}).createMachine({
  id: 'material',
  initial: 'idle',
  context: {
    color: '#ffffff',
    metalness: 0.5,
    roughness: 0.5
  },
  states: {
    idle: {
      on: {
        UPDATE_COLOR: {
          actions: assign({
            color: ({ event }) => event.color
          })
        },
        UPDATE_METALNESS: {
          actions: assign({
            metalness: ({ event }) => event.metalness
          })
        },
        UPDATE_ROUGHNESS: {
          actions: assign({
            roughness: ({ event }) => event.roughness
          })
        }
      }
    }
  }
});
