// xstate-v5/services/animation/stopAnimation.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface StopAnimationInput {
  action: THREE.AnimationAction | null;
  fadeOutDuration?: number;
}

export const stopAnimation = fromPromise<void, StopAnimationInput>(
  async ({ input }) => {
    const { action, fadeOutDuration = 0.3 } = input;

    if (!action) {
      console.warn('[StopAnimation] No action to stop');
      return;
    }

    if (fadeOutDuration > 0) {
      action.fadeOut(fadeOutDuration);
      await new Promise(resolve => setTimeout(resolve, fadeOutDuration * 1000));
    }

    action.stop();
  }
);
