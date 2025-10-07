// xstate-v5/services/animation/crossfadeTransition.ts
import { fromCallback } from 'xstate';
import * as THREE from 'three';

export interface CrossfadeInput {
  fromAction: THREE.AnimationAction;
  toAction: THREE.AnimationAction;
  duration: number;
  onComplete?: () => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const crossfadeTransition = fromCallback<never, CrossfadeInput>(
  ({ input, sendBack }) => {
    const { fromAction, toAction, duration, onComplete } = input;

    // Préparer l'action destination
    toAction.reset();
    toAction.play();
    toAction.setEffectiveWeight(0);

    const startTime = Date.now();
    const fromStartWeight = fromAction.getEffectiveWeight();

    function animate() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      // Crossfade: from 1→0, to 0→1
      fromAction.setEffectiveWeight(fromStartWeight * (1 - easedProgress));
      toAction.setEffectiveWeight(easedProgress);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        fromAction.stop();
        if (onComplete) onComplete();
      }
    }

    let animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }
);
