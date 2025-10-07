// xstate-v5/services/scene/optimizeModel.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface OptimizeModelInput {
  model: THREE.Group;
  enableShadows?: boolean;
  frustumCulling?: boolean;
}

export interface OptimizeModelOutput {
  optimizedModel: THREE.Group;
  optimizationsApplied: string[];
}

export const optimizeModel = fromPromise<OptimizeModelOutput, OptimizeModelInput>(
  async ({ input }) => {
    const { model, enableShadows = true, frustumCulling = true } = input;
    const optimizationsApplied: string[] = [];

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Enable frustum culling
        if (frustumCulling) {
          object.frustumCulled = true;
          optimizationsApplied.push('frustumCulling');
        }

        // Configure shadows
        if (enableShadows) {
          object.castShadow = true;
          object.receiveShadow = true;
          optimizationsApplied.push('shadows');
        }

        // Optimize geometry
        if (object.geometry) {
          object.geometry.computeBoundingBox();
          object.geometry.computeBoundingSphere();
          optimizationsApplied.push('boundingVolumes');
        }
      }
    });


    return {
      optimizedModel: model,
      optimizationsApplied: [...new Set(optimizationsApplied)]
    };
  }
);
