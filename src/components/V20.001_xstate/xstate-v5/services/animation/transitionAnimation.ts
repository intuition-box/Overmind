// xstate-v5/services/animation/transitionAnimation.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface TransitionAnimationInput {
  mixer: THREE.AnimationMixer;
  fromAction: THREE.AnimationAction | null;
  toClip: THREE.AnimationClip;
  duration: number;
}

export interface TransitionAnimationOutput {
  newAction: THREE.AnimationAction;
}

export const transitionAnimation = fromPromise<TransitionAnimationOutput, TransitionAnimationInput>(
  async ({ input }) => {
    const { mixer, fromAction, toClip, duration } = input;

    const newAction = mixer.clipAction(toClip);
    newAction.reset();
    newAction.setLoop(THREE.LoopRepeat, Infinity);

    if (fromAction) {
      // Crossfade from current animation to new one
      fromAction.fadeOut(duration);
      newAction.fadeIn(duration);
    } else {
      newAction.fadeIn(duration);
    }

    newAction.play();

    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, duration * 1000));

    return { newAction };
  }
);
