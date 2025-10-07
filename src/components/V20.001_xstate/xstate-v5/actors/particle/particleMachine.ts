// xstate-v5/actors/particle/particleMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';

export interface ParticleContext {
  particleSystem: THREE.Points | null;
  geometry: THREE.BufferGeometry | null;
  material: THREE.PointsMaterial | null;
  rotationSpeed: number;
  enabled: boolean;
}

export type ParticleEvents =
  | { type: 'INITIALIZE'; particleSystem: THREE.Points; geometry: THREE.BufferGeometry; material: THREE.PointsMaterial }
  | { type: 'UPDATE_ROTATION_SPEED'; speed: number }
  | { type: 'TOGGLE_ENABLED' }
  | { type: 'UPDATE'; delta: number };

export const particleMachine = setup({
  types: {} as {
    context: ParticleContext;
    events: ParticleEvents;
  },
  actions: {
    rotateParticles: ({ context, event }) => {
      if (context.particleSystem && context.enabled && event.type === 'UPDATE') {
        context.particleSystem.rotation.y += context.rotationSpeed * event.delta;
        context.particleSystem.rotation.x += context.rotationSpeed * event.delta * 0.5;
      }
    },
    toggleVisibility: ({ context }) => {
      if (context.particleSystem) {
        context.particleSystem.visible = context.enabled;
      }
    }
  }
}).createMachine({
  id: 'particle',
  initial: 'idle',
  context: {
    particleSystem: null,
    geometry: null,
    material: null,
    rotationSpeed: 0.1,
    enabled: true
  },
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: 'ready',
          actions: assign({
            particleSystem: ({ event }) => event.particleSystem,
            geometry: ({ event }) => event.geometry,
            material: ({ event }) => event.material
          })
        }
      }
    },
    ready: {
      on: {
        UPDATE: {
          actions: 'rotateParticles'
        },
        UPDATE_ROTATION_SPEED: {
          actions: assign({ rotationSpeed: ({ event }) => event.speed })
        },
        TOGGLE_ENABLED: {
          actions: [
            assign({ enabled: ({ context }) => !context.enabled }),
            'toggleVisibility'
          ]
        }
      }
    }
  }
});
