// xstate-v5/services/animation/playAnimation.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface PlayAnimationInput {
  mixer: THREE.AnimationMixer;
  clip: THREE.AnimationClip;
  loop: boolean;
  fadeInDuration?: number;
}

export interface PlayAnimationOutput {
  action: THREE.AnimationAction;
}

export const playAnimation = fromPromise<PlayAnimationOutput, PlayAnimationInput>(
  async ({ input }) => {
    const { mixer, clip, loop, fadeInDuration = 0.3 } = input;

    const action = mixer.clipAction(clip);
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !loop;

    if (fadeInDuration > 0) {
      action.fadeIn(fadeInDuration);
    }

    action.play();


    return { action };
  }
);
