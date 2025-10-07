// xstate-v5/services/rendering/setupLights.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface SetupLightsInput {
  scene: THREE.Scene;
}

export interface SetupLightsOutput {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  pointLight: THREE.PointLight;
}

export const setupLights = fromPromise<SetupLightsOutput, SetupLightsInput>(
  async ({ input }) => {
    const { scene } = input;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point light
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    return { ambientLight, directionalLight, pointLight };
  }
);
