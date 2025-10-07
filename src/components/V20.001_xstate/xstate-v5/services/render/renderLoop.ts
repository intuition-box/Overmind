// xstate-v5/services/render/renderLoop.ts
import { fromCallback } from 'xstate';
import * as THREE from 'three';

export interface RenderLoopInput {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  mixer?: THREE.AnimationMixer;
  onFrame?: (delta: number, fps: number) => void;
}

export const renderLoop = fromCallback<never, RenderLoopInput>(({ input, sendBack }) => {
  const { scene, camera, renderer, mixer, onFrame } = input;

  let animationFrameId: number;
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = 0;
  let currentFPS = 60;

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    const currentTime = performance.now();
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Calculate FPS
    frameCount++;
    fpsTime += delta;
    if (fpsTime >= 1) {
      currentFPS = frameCount / fpsTime;
      frameCount = 0;
      fpsTime = 0;
    }

    // Update mixer
    if (mixer) {
      mixer.update(delta);
    }

    // Render
    renderer.render(scene, camera);

    // Callback
    if (onFrame) {
      onFrame(delta, currentFPS);
    }
  };

  animate();

  // Cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
});
