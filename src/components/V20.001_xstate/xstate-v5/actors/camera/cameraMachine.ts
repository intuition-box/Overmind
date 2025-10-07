// xstate-v5/actors/camera/cameraMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import { updateCamera } from '../../services/camera/updateCamera';

export interface CameraContext {
  camera: THREE.PerspectiveCamera | null;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  error: Error | null;
}

export type CameraEvents =
  | { type: 'UPDATE_POSITION'; position: { x: number; y: number; z: number } }
  | { type: 'UPDATE_TARGET'; target: { x: number; y: number; z: number } }
  | { type: 'UPDATE_FOV'; fov: number }
  | { type: 'RESET_CAMERA' };

export const cameraMachine = setup({
  types: {} as {
    context: CameraContext;
    events: CameraEvents;
  },
  actors: {
    updateCamera
  }
}).createMachine({
  id: 'camera',
  initial: 'idle',
  context: {
    camera: null,
    position: { x: 0, y: 2, z: 5 },
    target: { x: 0, y: 0, z: 0 },
    fov: 75,
    error: null
  },
  states: {
    idle: {
      on: {
        UPDATE_POSITION: 'updating',
        UPDATE_TARGET: 'updating',
        UPDATE_FOV: 'updating',
        RESET_CAMERA: 'resetting'
      }
    },
    updating: {
      invoke: {
        src: 'updateCamera',
        input: ({ context, event }) => {
          const input: any = { camera: context.camera! };

          if (event.type === 'UPDATE_POSITION') {
            input.position = event.position;
          } else if (event.type === 'UPDATE_TARGET') {
            input.target = event.target;
          } else if (event.type === 'UPDATE_FOV') {
            input.fov = event.fov;
          }

          return input;
        },
        onDone: {
          target: 'idle',
          actions: assign(({ context, event }) => {
            const updates: Partial<CameraContext> = {};

            if (event.type === 'UPDATE_POSITION') {
              updates.position = (event as any).position;
            } else if (event.type === 'UPDATE_TARGET') {
              updates.target = (event as any).target;
            } else if (event.type === 'UPDATE_FOV') {
              updates.fov = (event as any).fov;
            }

            return updates;
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
    resetting: {
      invoke: {
        src: 'updateCamera',
        input: ({ context }) => ({
          camera: context.camera!,
          position: { x: 0, y: 2, z: 5 },
          target: { x: 0, y: 0, z: 0 },
          fov: 75
        }),
        onDone: {
          target: 'idle',
          actions: assign({
            position: { x: 0, y: 2, z: 5 },
            target: { x: 0, y: 0, z: 0 },
            fov: 75
          })
        }
      }
    },
    error: {
      on: {
        UPDATE_POSITION: 'idle',
        UPDATE_TARGET: 'idle',
        UPDATE_FOV: 'idle',
        RESET_CAMERA: 'idle'
      }
    }
  }
});
