// xstate-v5/services/rendering/setupBloomPass.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface SetupBloomPassInput {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  threshold?: number;
  strength?: number;
  radius?: number;
}

export interface SetupBloomPassOutput {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
}

export const setupBloomPass = fromPromise<SetupBloomPassOutput, SetupBloomPassInput>(
  async ({ input }) => {
    const {
      renderer,
      scene,
      camera,
      threshold = 0.5,
      strength = 1.5,
      radius = 0.4
    } = input;

    // Create composer
    const composer = new EffectComposer(renderer);

    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Create bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      strength,
      radius,
      threshold
    );

    composer.addPass(bloomPass);

    return { composer, bloomPass };
  }
);
