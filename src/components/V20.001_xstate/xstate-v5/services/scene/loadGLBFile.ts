// xstate-v5/services/scene/loadGLBFile.ts
import { fromPromise } from 'xstate';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import type { GLBLoadInput, GLBLoadOutput } from '../../utils/types';

export const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    return new Promise<GLBLoadOutput>((resolve, reject) => {
      loader.load(
        input.path,
        (gltf) => {
          const model = gltf.scene;
          const bones: THREE.Bone[] = [];
          model.traverse((child) => {
            if (child instanceof THREE.Bone) bones.push(child);
          });

          const materials = new Map<string, THREE.Material>();
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              materials.set(child.name, child.material as THREE.Material);
            }
          });

          resolve({ model, bones, animations: gltf.animations, materials });
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          input.onProgress?.(percent);
        },
        (error) => reject(new Error(`Failed to load GLB: ${error}`))
      );
    });
  }
);
