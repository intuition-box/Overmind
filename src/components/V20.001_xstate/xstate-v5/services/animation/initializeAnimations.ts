// xstate-v5/services/animation/initializeAnimations.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';
import { V3_CONFIG } from '../../../utils/config.js';

export interface InitAnimationsInput {
  mixer: THREE.AnimationMixer;
  animations: THREE.AnimationClip[];
}

export interface InitAnimationsOutput {
  permanentActions: Map<string, THREE.AnimationAction>;
  poseActions: Map<string, THREE.AnimationAction>;
  ringActions: Map<string, THREE.AnimationAction>;
}

// Classification helpers
function isBigArmAnimation(name: string): boolean {
  return V3_CONFIG.animations.bigArms.includes(name);
}

function isLittleArmAnimation(name: string): boolean {
  return V3_CONFIG.animations.littleArms.includes(name);
}

function isPoseAnimation(name: string): boolean {
  return name === 'R1&R2_Pose' || name === 'R2&R1_Pose';
}

function isRingAnimation(name: string): boolean {
  return V3_CONFIG.animations.rings.includes(name);
}

export const initializeAnimations = fromPromise<InitAnimationsOutput, InitAnimationsInput>(
  async ({ input }) => {
    const { mixer, animations } = input;

    // DEBUG: vérifier les constantes THREE
    // console.log('[InitAnimations] THREE.LoopOnce:', THREE.LoopOnce);
    // console.log('[InitAnimations] THREE.LoopRepeat:', THREE.LoopRepeat);
    // console.log('[InitAnimations] THREE.LoopPingPong:', THREE.LoopPingPong);

    const permanentActions = new Map<string, THREE.AnimationAction>();
    const poseActions = new Map<string, THREE.AnimationAction>();
    const ringActions = new Map<string, THREE.AnimationAction>();

    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setEffectiveWeight(0);
      action.setEffectiveTimeScale(0.6);

      const isBig = isBigArmAnimation(clip.name);
      const isLittle = isLittleArmAnimation(clip.name);

      if (isBig || isLittle) {
        // Animation permanente (loop)
        action.setLoop(THREE.LoopRepeat);
        permanentActions.set(clip.name, action);
      } else if (isPoseAnimation(clip.name)) {
        // Animation pose (transition)
        // Note: Dans cette version THREE.js, LoopOnce=2200 (inverted). On utilise la constante directement.
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.setEffectiveTimeScale(0.8);
        poseActions.set(clip.name, action);
      } else if (isRingAnimation(clip.name)) {
        // Animation ring (révélation)
        // Note: Dans cette version THREE.js, LoopOnce=2200 (inverted). On utilise la constante directement.
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.setEffectiveTimeScale(0.6);
        ringActions.set(clip.name, action);
      }
    });

    //   permanent: permanentActions.size,
    //   poses: poseActions.size,
    //   rings: ringActions.size
    // });

    return { permanentActions, poseActions, ringActions };
  }
);
