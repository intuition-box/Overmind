// xstate-v5/services/rendering/createParticleSystem.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface CreateParticleSystemInput {
  scene: THREE.Scene;
  count?: number;
  size?: number;
  color?: number;
}

export interface CreateParticleSystemOutput {
  particleSystem: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

export const createParticleSystem = fromPromise<CreateParticleSystemOutput, CreateParticleSystemInput>(
  async ({ input }) => {
    const { scene, count = 1000, size = 0.1, color = 0xffffff } = input;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;     // x
      positions[i + 1] = (Math.random() - 0.5) * 10; // y
      positions[i + 2] = (Math.random() - 0.5) * 10; // z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      size,
      color,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Create particle system
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    return { particleSystem, geometry, material };
  }
);
