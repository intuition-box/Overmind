// xstate-v5/actors/pop/popMachine.ts
import { setup, assign, raise } from 'xstate';
import * as THREE from 'three';

// Context
export interface PopContext {
  scene: THREE.Scene | null;

  // Pop_Sup
  popSupObject: THREE.Object3D | null;
  popSupStartAngle: number;    // Angle ouvert: 0°
  popSupTargetAngle: number;   // Angle fermé: 45.5°
  popSupCurrentAngle: number;

  // Pop_Inf
  popInfObject: THREE.Object3D | null;
  popInfStartAngle: number;    // Angle ouvert: 0°
  popInfTargetAngle: number;   // Angle fermé: -43°
  popInfCurrentAngle: number;

  // Animation NLA Blender - 6 animations
  startPopSupAction: THREE.AnimationAction | null;      // Start_pop_sup (joué une fois au démarrage)
  startPopInfAction: THREE.AnimationAction | null;      // Start_pop_inf
  actionPopSupAction: THREE.AnimationAction | null;     // Action_pop_sup
  actionPopInfAction: THREE.AnimationAction | null;     // Action_pop_inf
  suspicionPopSupAction: THREE.AnimationAction | null;  // Suspicion_pop_sup
  suspicionPopInfAction: THREE.AnimationAction | null;  // Suspicion_pop_inf

  // Animation
  isAnimating: boolean;
  blinkSpeed: number;          // Vitesse de fermeture/ouverture (ms)
  minBlinkInterval: number;    // Intervalle min entre clignements (ms)
  maxBlinkInterval: number;    // Intervalle max entre clignements (ms)
  nextBlinkTime: number | null; // Timestamp du prochain clignement
  useActionAnimation: boolean;  // true = Action, false = Suspicion (alternance)

  // Interpolation smooth
  blinkStartTime: number | null; // Timestamp du début du clignement
  blinkPhase: 'closing' | 'opening' | null; // Phase actuelle
}

// Events
export type PopEvents =
  | { type: 'SET_SCENE'; scene: THREE.Scene }
  | { type: 'INITIALIZE_OBJECTS'; popSup: THREE.Object3D; popInf: THREE.Object3D }
  | {
      type: 'SET_ANIMATION_ACTIONS';
      startPopSupAction: THREE.AnimationAction;
      startPopInfAction: THREE.AnimationAction;
      actionPopSupAction: THREE.AnimationAction;
      actionPopInfAction: THREE.AnimationAction;
      suspicionPopSupAction: THREE.AnimationAction;
      suspicionPopInfAction: THREE.AnimationAction;
    }
  | { type: 'PLAY_START_ANIMATION' }

  // Pop_Sup controls (manuel)
  | { type: 'SET_POP_SUP_START_ANGLE'; angle: number }
  | { type: 'SET_POP_SUP_TARGET_ANGLE'; angle: number }
  | { type: 'UPDATE_POP_SUP_ROTATION'; angle: number }

  // Pop_Inf controls (manuel)
  | { type: 'SET_POP_INF_START_ANGLE'; angle: number }
  | { type: 'SET_POP_INF_TARGET_ANGLE'; angle: number }
  | { type: 'UPDATE_POP_INF_ROTATION'; angle: number }

  // Animation controls
  | { type: 'START_ANIMATION' }
  | { type: 'STOP_ANIMATION' }
  | { type: 'SET_BLINK_SPEED'; speed: number }
  | { type: 'SET_BLINK_INTERVAL'; min: number; max: number }
  | { type: 'TICK'; timestamp: number }
  | { type: 'APPLY_ROTATIONS' }
  | { type: 'BLINK_CLOSE_DONE' }
  | { type: 'BLINK_OPEN_DONE' }
  | { type: 'NOOP' };

export const popMachine = setup({
  types: {
    context: {} as PopContext,
    events: {} as PopEvents
  },
  actions: {
    // Play NLA blink animation - alterne entre Action et Suspicion
    playBlinkAnimation: ({ context }) => {
      // Choisir quelle animation jouer selon useActionAnimation
      const popSupAction = context.useActionAnimation
        ? context.actionPopSupAction
        : context.suspicionPopSupAction;
      const popInfAction = context.useActionAnimation
        ? context.actionPopInfAction
        : context.suspicionPopInfAction;

      if (popSupAction && popInfAction) {
        // Reset et joue les animations
        popSupAction.reset();
        popInfAction.reset();
        popSupAction.setLoop(THREE.LoopOnce, 1);
        popInfAction.setLoop(THREE.LoopOnce, 1);
        popSupAction.clampWhenFinished = true;
        popInfAction.clampWhenFinished = true;
        popSupAction.play();
        popInfAction.play();

        const animType = context.useActionAnimation ? 'Action' : 'Suspicion';
        console.log(`[popMachine] 🎬 Playing ${animType} blink animation`);
      } else {
        console.warn('[popMachine] ⚠️ Animation actions not initialized!');
      }
    },

    // Stop blink animation et reset à la position ouverte
    stopBlinkAnimation: ({ context }) => {
      // Arrêter toutes les animations au cas où
      if (context.startPopSupAction) context.startPopSupAction.stop();
      if (context.startPopInfAction) context.startPopInfAction.stop();
      if (context.actionPopSupAction) context.actionPopSupAction.stop();
      if (context.actionPopInfAction) context.actionPopInfAction.stop();
      if (context.suspicionPopSupAction) context.suspicionPopSupAction.stop();
      if (context.suspicionPopInfAction) context.suspicionPopInfAction.stop();

      // Reset toutes les animations pour revenir à la position T-pose
      if (context.startPopSupAction) context.startPopSupAction.reset();
      if (context.startPopInfAction) context.startPopInfAction.reset();
      if (context.actionPopSupAction) context.actionPopSupAction.reset();
      if (context.actionPopInfAction) context.actionPopInfAction.reset();
      if (context.suspicionPopSupAction) context.suspicionPopSupAction.reset();
      if (context.suspicionPopInfAction) context.suspicionPopInfAction.reset();

      console.log('[popMachine] 🛑 Stopped all animations and reset to T-pose');
    },

    // Apply Pop_Sup rotation
    applyPopSupRotation: ({ context }) => {
      if (context.popSupObject) {
        // Rotation directe sur l'objet (axe X - orange)
        const radians = THREE.MathUtils.degToRad(context.popSupCurrentAngle);
        context.popSupObject.rotation.x = radians;

        // Debug log (only when angle changes significantly)
        if (Math.abs(context.popSupCurrentAngle) > 1) {
          console.log(`[POP] Pop_Sup rotation: ${context.popSupCurrentAngle.toFixed(1)}° (${radians.toFixed(3)} rad)`);
        }
      } else {
        console.warn('[POP] ⚠️ applyPopSupRotation called but popSupObject is null!');
      }
    },

    // Apply Pop_Inf rotation
    applyPopInfRotation: ({ context }) => {
      if (context.popInfObject) {
        // IMPORTANT: Pop_Inf mesh has inverted rotation in GLTF (-π), add π offset to compensate
        const radians = THREE.MathUtils.degToRad(context.popInfCurrentAngle) + Math.PI;
        context.popInfObject.rotation.x = radians;

        // Debug log (only when angle changes significantly)
        if (Math.abs(context.popInfCurrentAngle) > 1) {
          console.log(`[POP] Pop_Inf rotation: ${context.popInfCurrentAngle.toFixed(1)}° + 180° offset = ${(radians * 180 / Math.PI).toFixed(1)}°`);
        }
      } else {
        console.warn('[POP] ⚠️ applyPopInfRotation called but popInfObject is null!');
      }
    },

    // Interpolate smooth blink
    interpolateBlink: ({ context }) => {
      if (!context.blinkStartTime || !context.blinkPhase) {
        return;
      }

      const now = Date.now();
      const elapsed = now - context.blinkStartTime;
      const progress = Math.min(elapsed / context.blinkSpeed, 1.0);

      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (context.blinkPhase === 'closing') {
        // Interpoler de 0° vers target
        context.popSupCurrentAngle = THREE.MathUtils.lerp(0, context.popSupTargetAngle, eased);
        context.popInfCurrentAngle = THREE.MathUtils.lerp(0, context.popInfTargetAngle, eased);

        // Debug log (throttled)
        if (!(window as any)._interpLogTime || now - (window as any)._interpLogTime > 100) {
          console.log('[POP] 🔁 Interpolating CLOSING:', {
            elapsed: elapsed.toFixed(0),
            progress: (progress * 100).toFixed(1) + '%',
            popSup: context.popSupCurrentAngle.toFixed(1) + '°',
            popInf: context.popInfCurrentAngle.toFixed(1) + '°'
          });
          (window as any)._interpLogTime = now;
        }
      } else {
        // Interpoler de target vers 0°
        context.popSupCurrentAngle = THREE.MathUtils.lerp(context.popSupTargetAngle, 0, eased);
        context.popInfCurrentAngle = THREE.MathUtils.lerp(context.popInfTargetAngle, 0, eased);

        // Debug log (throttled)
        if (!(window as any)._interpLogTime || now - (window as any)._interpLogTime > 100) {
          console.log('[POP] 🔁 Interpolating OPENING:', {
            elapsed: elapsed.toFixed(0),
            progress: (progress * 100).toFixed(1) + '%',
            popSup: context.popSupCurrentAngle.toFixed(1) + '°',
            popInf: context.popInfCurrentAngle.toFixed(1) + '°'
          });
          (window as any)._interpLogTime = now;
        }
      }
    },

    // Schedule next blink (random interval)
    scheduleNextBlink: assign({
      nextBlinkTime: ({ context }) => {
        const interval = Math.random() * (context.maxBlinkInterval - context.minBlinkInterval) + context.minBlinkInterval;
        const nextTime = Date.now() + interval;
        console.log(`[popMachine] ⏰ Next blink scheduled in ${Math.round(interval)}ms (at ${nextTime})`);
        return nextTime;
      }
    }),

    // Clear next blink time
    clearNextBlink: assign({
      nextBlinkTime: null
    }),

    // Reset to open position
    resetToOpen: ({ context }) => {
      context.popSupCurrentAngle = 0;
      context.popInfCurrentAngle = 0;
    },

    // Log initialization
    logInitialization: () => {
      console.log('[popMachine] ✓ Machine initialized');
    },

    // Log objects found
    logObjectsFound: ({ context }) => {
      console.log('[popMachine] ✓ Pop objects found:', {
        popSup: context.popSupObject?.name,
        popInf: context.popInfObject?.name
      });
    }
  },
  guards: {
    hasPopSupObject: ({ context }) => context.popSupObject !== null,
    hasPopInfObject: ({ context }) => context.popInfObject !== null,
    hasObjects: ({ context }) => {
      const hasSup = context.popSupObject !== null;
      const hasInf = context.popInfObject !== null;
      const result = hasSup && hasInf;

      // Debug log (only when guard fails, throttled)
      if (!result && !(window as any)._popGuardCheckTime || Date.now() - (window as any)._popGuardCheckTime > 2000) {
        console.log('[popMachine] 🔍 hasObjects guard check:', {
          popSupObject: context.popSupObject?.name || null,
          popInfObject: context.popInfObject?.name || null,
          hasSup,
          hasInf,
          result
        });
        (window as any)._popGuardCheckTime = Date.now();
      }

      return result;
    },
    shouldBlink: ({ context, event }) => {
      if (event.type !== 'TICK' || !context.nextBlinkTime) return false;
      return event.timestamp >= context.nextBlinkTime;
    }
  }
}).createMachine({
  id: 'popMachine',
  initial: 'idle',
  context: {
    scene: null,

    // Pop_Sup defaults (valeurs trouvées)
    popSupObject: null,
    popSupStartAngle: 0,
    popSupTargetAngle: 45.5,
    popSupCurrentAngle: 0,

    // Pop_Inf defaults (valeurs trouvées)
    popInfObject: null,
    popInfStartAngle: 0,
    popInfTargetAngle: -43,
    popInfCurrentAngle: 0,

    // Animation NLA defaults - 6 animations
    startPopSupAction: null,
    startPopInfAction: null,
    actionPopSupAction: null,
    actionPopInfAction: null,
    suspicionPopSupAction: null,
    suspicionPopInfAction: null,

    // Animation defaults
    isAnimating: false,
    blinkSpeed: 150,           // 150ms pour fermer/ouvrir (interpolation smooth)
    minBlinkInterval: 2000,    // Min 2s entre clignements
    maxBlinkInterval: 7000,    // Max 7s entre clignements
    nextBlinkTime: null,
    useActionAnimation: true,  // Commencer avec Action, puis alterner

    // Interpolation defaults
    blinkStartTime: null,
    blinkPhase: null
  },
  on: {
    SET_SCENE: {
      actions: [
        // IMPORTANT: Can't use assign() for THREE.js Scene - not serializable
        ({ context, event }) => {
          context.scene = event.scene;
        },
        'logInitialization'
      ]
    },

    INITIALIZE_OBJECTS: {
      actions: [
        // IMPORTANT: Can't use assign() for THREE.js objects - they're not serializable
        // Must mutate context directly
        ({ context, event }) => {
          context.popSupObject = event.popSup;
          context.popInfObject = event.popInf;
          console.log('[popMachine] 🔧 Objects assigned directly to context (bypassing assign)');
          console.log('[popMachine] 🔍 Context after assignment:', {
            popSupObject: context.popSupObject?.name,
            popInfObject: context.popInfObject?.name,
            hasPopSup: context.popSupObject !== null,
            hasPopInf: context.popInfObject !== null
          });
        },
        'logObjectsFound'
      ]
    },

    SET_ANIMATION_ACTIONS: {
      actions: [
        ({ context, event }) => {
          context.startPopSupAction = event.startPopSupAction;
          context.startPopInfAction = event.startPopInfAction;
          context.actionPopSupAction = event.actionPopSupAction;
          context.actionPopInfAction = event.actionPopInfAction;
          context.suspicionPopSupAction = event.suspicionPopSupAction;
          context.suspicionPopInfAction = event.suspicionPopInfAction;
          console.log('[popMachine] 🎬 All 6 animation actions assigned:', {
            startPopSup: context.startPopSupAction?.getClip().name,
            startPopInf: context.startPopInfAction?.getClip().name,
            actionPopSup: context.actionPopSupAction?.getClip().name,
            actionPopInf: context.actionPopInfAction?.getClip().name,
            suspicionPopSup: context.suspicionPopSupAction?.getClip().name,
            suspicionPopInf: context.suspicionPopInfAction?.getClip().name
          });
        }
      ]
    },

    PLAY_START_ANIMATION: {
      actions: [
        ({ context }) => {
          if (context.startPopSupAction && context.startPopInfAction) {
            // Jouer l'animation Start une seule fois SANS clampWhenFinished
            // pour que les paupières reviennent à T-pose après
            context.startPopSupAction.reset();
            context.startPopInfAction.reset();
            context.startPopSupAction.setLoop(THREE.LoopOnce, 1);
            context.startPopInfAction.setLoop(THREE.LoopOnce, 1);
            context.startPopSupAction.clampWhenFinished = false; // Important: retour à T-pose
            context.startPopInfAction.clampWhenFinished = false;
            context.startPopSupAction.play();
            context.startPopInfAction.play();
            console.log('[popMachine] 🎬 Playing Start animation (once, will reset to T-pose)');
          } else {
            console.warn('[popMachine] ⚠️ Start animation actions not initialized!');
          }
        }
      ]
    },

    // Apply rotations every frame (called after mixer.update)
    APPLY_ROTATIONS: [
      {
        guard: 'hasObjects',
        actions: ['interpolateBlink', 'applyPopSupRotation', 'applyPopInfRotation']
      },
      {
        // Log when guard fails (only once per second to avoid spam)
        actions: ({ context }) => {
          const now = Date.now();
          if (!context.popSupObject || !context.popInfObject) {
            if (!(window as any)._popGuardLogTime || now - (window as any)._popGuardLogTime > 1000) {
              console.warn('[POP] ⚠️ APPLY_ROTATIONS guard failed - objects not initialized:', {
                popSup: !!context.popSupObject,
                popInf: !!context.popInfObject
              });
              (window as any)._popGuardLogTime = now;
            }
          }
        }
      }
    ],

    // Pop_Sup angle controls
    SET_POP_SUP_START_ANGLE: {
      actions: assign({
        popSupStartAngle: ({ event }) => event.angle
      })
    },

    SET_POP_SUP_TARGET_ANGLE: {
      actions: assign({
        popSupTargetAngle: ({ event }) => event.angle
      })
    },

    // Pop_Inf angle controls
    SET_POP_INF_START_ANGLE: {
      actions: assign({
        popInfStartAngle: ({ event }) => event.angle
      })
    },

    SET_POP_INF_TARGET_ANGLE: {
      actions: assign({
        popInfTargetAngle: ({ event }) => event.angle
      })
    },

    // Animation controls
    START_ANIMATION: {
      target: '.animating'
    },

    STOP_ANIMATION: {
      target: '.idle'
    },

    SET_BLINK_SPEED: {
      actions: assign({
        blinkSpeed: ({ event }) => event.speed
      })
    },

    SET_BLINK_INTERVAL: {
      actions: assign({
        minBlinkInterval: ({ event }) => event.min,
        maxBlinkInterval: ({ event }) => event.max
      })
    }
  },
  states: {
    idle: {
      entry: [
        assign({ isAnimating: false }),
        'resetToOpen'
      ],
      on: {
        START_ANIMATION: 'animating',
        // Manual controls only work in idle state
        UPDATE_POP_SUP_ROTATION: {
          actions: [
            ({ context, event }) => {
              context.popSupCurrentAngle = event.angle;
            },
            'applyPopSupRotation'
          ]
        },
        UPDATE_POP_INF_ROTATION: {
          actions: [
            ({ context, event }) => {
              context.popInfCurrentAngle = event.angle;
            },
            'applyPopInfRotation'
          ]
        }
      }
    },

    animating: {
      entry: [
        assign({ isAnimating: true }),
        'scheduleNextBlink'
      ],
      initial: 'waiting',
      on: {
        STOP_ANIMATION: 'idle'
      },
      states: {
        waiting: {
          on: {
            TICK: {
              guard: 'shouldBlink',
              target: 'closing'
            }
          }
        },

        closing: {
          entry: [
            // Clear next blink time pour éviter re-trigger
            'clearNextBlink',
            // Start NLA animation
            'playBlinkAnimation',
            assign({
              blinkStartTime: Date.now(),
              blinkPhase: 'closing' as const
            }),
            () => console.log('[popMachine] 🔽 Starting blink animation')
          ],
          on: {
            APPLY_ROTATIONS: {
              actions: [
                // Check if animation complete and transition
                raise(({ context }) => {
                  if (!context.blinkStartTime) return { type: 'NOOP' };

                  // Vérifier quelle animation est en cours
                  const popSupAction = context.useActionAnimation
                    ? context.actionPopSupAction
                    : context.suspicionPopSupAction;

                  // L'animation NLA dure le temps défini dans Blender
                  // On attend que l'animation soit terminée (vérifier avec isRunning())
                  if (popSupAction && !popSupAction.isRunning()) {
                    return { type: 'BLINK_CLOSE_DONE' };
                  }
                  return { type: 'NOOP' };
                })
              ]
            },
            BLINK_CLOSE_DONE: {
              target: 'opening'
            }
          }
        },

        opening: {
          entry: [
            // Reset animation to open position
            'stopBlinkAnimation',
            assign({
              blinkStartTime: Date.now(),
              blinkPhase: 'opening' as const
            }),
            'scheduleNextBlink',
            () => console.log('[popMachine] 🔼 Opening eyelids')
          ],
          on: {
            APPLY_ROTATIONS: {
              actions: [
                // Check if animation complete and transition
                raise(({ context }) => {
                  if (!context.blinkStartTime) return { type: 'NOOP' };
                  const elapsed = Date.now() - context.blinkStartTime;
                  if (elapsed >= context.blinkSpeed) {
                    return { type: 'BLINK_OPEN_DONE' };
                  }
                  return { type: 'NOOP' };
                })
              ]
            },
            BLINK_OPEN_DONE: {
              target: 'waiting',
              actions: [
                assign({
                  blinkPhase: null,
                  blinkStartTime: null,
                  // Alterner entre Action et Suspicion pour le prochain clignement
                  useActionAnimation: ({ context }) => !context.useActionAnimation
                }),
                ({ context }) => {
                  const nextAnim = context.useActionAnimation ? 'Action' : 'Suspicion';
                  console.log(`[popMachine] ⏱️ Back to waiting - Next animation: ${nextAnim}`);
                }
              ]
            }
          }
        }
      }
    }
  }
});
