// xstate-v5/services/camera/updateCamera.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface UpdateCameraInput {
  camera: THREE.PerspectiveCamera;
  position?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  fov?: number;
}

export const updateCamera = fromPromise<void, UpdateCameraInput>(
  async ({ input }) => {
    const { camera, position, target, fov } = input;

    if (position) {
      camera.position.set(position.x, position.y, position.z);
    }

    if (target) {
      camera.lookAt(target.x, target.y, target.z);
    }

    if (fov !== undefined) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }
);
