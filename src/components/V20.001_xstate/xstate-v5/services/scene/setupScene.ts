// xstate-v5/services/scene/setupScene.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';
import type { SceneSetupInput, SceneSetupOutput } from '../../utils/types';

export const setupScene = fromPromise<SceneSetupOutput, SceneSetupInput>(
  async ({ input }) => {
    const { containerElement, canvasWidth, canvasHeight } = input;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasWidth / canvasHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerElement.appendChild(renderer.domElement);

    return { scene, camera, renderer };
  }
);
