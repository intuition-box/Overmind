// xstate-v5/services/scene/cleanupScene.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface CleanupSceneInput {
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  mixer: THREE.AnimationMixer | null;
}

export const cleanupScene = fromPromise<void, CleanupSceneInput>(
  async ({ input }) => {
    const { scene, renderer, mixer } = input;

    // Stop animations
    if (mixer) {
      mixer.stopAllAction();
    }

    // Dispose scene resources
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      scene.clear();
    }

    // Dispose renderer
    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
    }

  }
);
