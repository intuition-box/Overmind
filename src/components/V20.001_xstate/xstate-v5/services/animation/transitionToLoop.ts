// xstate-v5/services/animation/transitionToLoop.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface TransitionToLoopInput {
  permanentActions: Map<string, THREE.AnimationAction>;
  poseActions: Map<string, THREE.AnimationAction>;
  ringActions: Map<string, THREE.AnimationAction>;
  fadeDuration: number;
}

// Courbe easeOutCubic (comme l'ancien code)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const transitionToLoop = fromPromise<void, TransitionToLoopInput>(
  async ({ input }) => {
    const { permanentActions, poseActions, ringActions, fadeDuration } = input;


    const poseR1R2 = poseActions.get('R1&R2_Pose');
    const poseR2R1 = poseActions.get('R2&R1_Pose');
    const brasR1 = permanentActions.get('Bras_R1_Mouv');
    const brasR2 = permanentActions.get('Bras_R2_Mouv');

    if (!poseR1R2 || !poseR2R1 || !brasR1 || !brasR2) {
      throw new Error('Missing animations for loop transition');
    }


    // Arrêter les rings
    ringActions.forEach((action) => {
      action.stop();
    });

    // Préparer les permanents: reset() pour synchroniser à time=0
    // Cela garantit une transition smooth depuis la pose (frame 0 ≈ dernière frame pour LoopRepeat)
    brasR1.reset();  // Force time=0 pour éviter drift temporel
    brasR1.play();
    brasR1.setEffectiveWeight(0);

    brasR2.reset();  // Force time=0 pour éviter drift temporel
    brasR2.play();
    brasR2.setEffectiveWeight(0);

    // Crossfade: poses → permanents

    await new Promise<void>((resolve) => {
      const startTime = Date.now();
      let frameCount = 0;

      function animate() {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / fadeDuration, 1);
        const eased = easeOutCubic(progress);

        // Log toutes les 30 frames (~0.5s à 60fps)
        if (frameCount % 30 === 0) {
        }
        frameCount++;

        // Fade out poses, fade in permanents
        poseR1R2.setEffectiveWeight(1 - eased);
        poseR2R1.setEffectiveWeight(1 - eased);
        brasR1.setEffectiveWeight(eased);
        brasR2.setEffectiveWeight(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          poseR1R2.stop();
          poseR2R1.stop();
          resolve();
        }
      }

      animate();
    });

    // Debug: vérifier l'état de toutes les animations permanentes
    permanentActions.forEach((action, name) => {
    });

  }
);
