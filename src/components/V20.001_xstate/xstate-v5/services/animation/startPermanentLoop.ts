// xstate-v5/services/animation/startPermanentLoop.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface StartLoopInput {
  permanentActions: Map<string, THREE.AnimationAction>;
}

export const startPermanentLoop = fromPromise<void, StartLoopInput>(
  async ({ input }) => {
    const { permanentActions } = input;

    if (permanentActions.size === 0) {
      console.warn('[StartLoop] No permanent animations found');
      return;
    }

    permanentActions.forEach((action, name) => {
      action.reset();
      action.play();
      action.setEffectiveWeight(1);
    });

  }
);
