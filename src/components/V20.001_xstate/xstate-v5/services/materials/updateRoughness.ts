// xstate-v5/services/materials/updateRoughness.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface UpdateRoughnessInput {
  material: THREE.Material;
  roughness: number;
}

export const updateRoughness = fromPromise<void, UpdateRoughnessInput>(
  async ({ input }) => {
    const { material, roughness } = input;

    if (material instanceof THREE.MeshStandardMaterial) {
      material.roughness = roughness;
      material.needsUpdate = true;
    }
  }
);
