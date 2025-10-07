// xstate-v5/services/materials/applyMaterialEffect.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface ApplyMaterialEffectInput {
  material: THREE.Material;
  color?: string;
  metalness?: number;
  roughness?: number;
}

export const applyMaterialEffect = fromPromise<void, ApplyMaterialEffectInput>(
  async ({ input }) => {
    const { material, color, metalness, roughness } = input;

    if (material instanceof THREE.MeshStandardMaterial) {
      if (color) {
        material.color.set(color);
      }
      if (metalness !== undefined) {
        material.metalness = metalness;
      }
      if (roughness !== undefined) {
        material.roughness = roughness;
      }
      material.needsUpdate = true;
    }

  }
);
