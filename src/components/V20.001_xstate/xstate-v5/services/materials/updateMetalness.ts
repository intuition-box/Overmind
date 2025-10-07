// xstate-v5/services/materials/updateMetalness.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface UpdateMetalnessInput {
  material: THREE.Material;
  metalness: number;
}

export const updateMetalness = fromPromise<void, UpdateMetalnessInput>(
  async ({ input }) => {
    const { material, metalness } = input;

    if (material instanceof THREE.MeshStandardMaterial) {
      material.metalness = metalness;
      material.needsUpdate = true;
    }
  }
);
