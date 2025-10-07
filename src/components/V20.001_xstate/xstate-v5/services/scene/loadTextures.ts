// xstate-v5/services/scene/loadTextures.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface LoadTexturesInput {
  texturePaths: string[];
  onProgress?: (progress: number) => void;
}

export interface LoadTexturesOutput {
  textures: Map<string, THREE.Texture>;
}

export const loadTextures = fromPromise<LoadTexturesOutput, LoadTexturesInput>(
  async ({ input }) => {
    const { texturePaths, onProgress } = input;
    const loader = new THREE.TextureLoader();
    const textures = new Map<string, THREE.Texture>();

    let loadedCount = 0;

    for (const path of texturePaths) {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          path,
          (tex) => {
            loadedCount++;
            onProgress?.((loadedCount / texturePaths.length) * 100);
            resolve(tex);
          },
          undefined,
          (error) => reject(new Error(`Failed to load texture ${path}: ${error}`))
        );
      });

      textures.set(path, texture);
    }

    return { textures };
  }
);
