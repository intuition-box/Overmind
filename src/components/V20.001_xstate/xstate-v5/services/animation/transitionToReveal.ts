// xstate-v5/services/animation/transitionToReveal.ts
import { fromCallback } from 'xstate';
import * as THREE from 'three';

export interface TransitionToRevealInput {
  permanentActions: Map<string, THREE.AnimationAction>;
  poseActions: Map<string, THREE.AnimationAction>;
  ringActions: Map<string, THREE.AnimationAction>;
  fadeDuration: number;
}

export type TransitionToRevealEvent =
  | { type: 'RINGS_FINISHED' };

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const transitionToReveal = fromCallback<TransitionToRevealEvent, TransitionToRevealInput>(
  ({ input, sendBack }) => {
    const { permanentActions, poseActions, ringActions, fadeDuration } = input;


    // Récupérer les actions nécessaires
    const brasR1 = permanentActions.get('Bras_R1_Mouv');
    const brasR2 = permanentActions.get('Bras_R2_Mouv');
    const poseR1R2 = poseActions.get('R1&R2_Pose');
    const poseR2R1 = poseActions.get('R2&R1_Pose');

    if (!brasR1 || !brasR2 || !poseR1R2 || !poseR2R1) {
      console.error('[TransitionToReveal] Missing animations');
      return;
    }

    // Préparer les poses
    poseR1R2.reset();
    poseR1R2.play();
    poseR1R2.setEffectiveWeight(0);
    poseR2R1.reset();
    poseR2R1.play();
    poseR2R1.setEffectiveWeight(0);

    // ✅ DÉMARRER LES RINGS IMMÉDIATEMENT (comme dans l'ancienne version)
    const mixer = brasR1.getMixer();
    let finishedPoseCount = 0;
    const totalPoses = 2;

    // Listener pour détecter la fin des POSES (pas des rings!)
    function createPoseFinishedListener(action: THREE.AnimationAction, name: string) {
      const listener = (event: any) => {
        if (event.action === action) {
          finishedPoseCount++;
          mixer.removeEventListener('finished', listener);

          if (finishedPoseCount >= totalPoses) {
            sendBack({ type: 'RINGS_FINISHED' });
          }
        }
      };
      return listener;
    }

    // Attacher les listeners sur les poses
    const poseR1R2Listener = createPoseFinishedListener(poseR1R2, 'R1&R2_Pose');
    const poseR2R1Listener = createPoseFinishedListener(poseR2R1, 'R2&R1_Pose');
    mixer.addEventListener('finished', poseR1R2Listener);
    mixer.addEventListener('finished', poseR2R1Listener);

    // Démarrer toutes les rings MAINTENANT (pas après le crossfade!)
    // Important: Synchroniser le timeScale avec les poses (0.8) pour que tout finisse en même temps
    const SYNC_TIMESCALE = 0.8;
    ringActions.forEach((action, name) => {
      action.reset();
      action.play();
      action.setEffectiveWeight(1);
      action.setEffectiveTimeScale(SYNC_TIMESCALE);

      const clip = action.getClip();
      const effectiveDuration = clip.duration / action.getEffectiveTimeScale();
    });

    // Crossfade: permanents → poses (en parallèle des rings)
    const startTime = Date.now();
    let crossfadeAnimId: number;

    function crossfadeAnimate() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / fadeDuration, 1);
      const eased = easeOutCubic(progress);

      // Fade out permanents, fade in poses
      brasR1.setEffectiveWeight(1 - eased);
      brasR2.setEffectiveWeight(1 - eased);
      poseR1R2.setEffectiveWeight(eased);
      poseR2R1.setEffectiveWeight(eased);

      if (progress < 1) {
        crossfadeAnimId = requestAnimationFrame(crossfadeAnimate);
      } else {
        // NE PAS stopper les bras permanents, juste les laisser à weight=0
        // pour éviter le lag quand on les redémarre au retour
      }
    }

    crossfadeAnimate();

    // Cleanup
    return () => {
      if (crossfadeAnimId) {
        cancelAnimationFrame(crossfadeAnimId);
      }
    };
  }
);
