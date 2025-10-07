// 🌟 revelationMachine - Système de révélation des anneaux basé sur zone
import { setup, assign } from 'xstate';
import * as THREE from 'three';

// Types
export interface TriggerZone {
  position: { x: number; y: number; z: number };
  radius: number;
  height: number;
}

export interface RingInfo {
  name: string;
  object: THREE.Object3D;
  position: THREE.Vector3;
  visible: boolean;
  distance: number;
  isInZone: boolean;
}

interface RevelationContext {
  // Zone trigger
  triggerZone: TriggerZone;

  // Objets rings
  rings: THREE.Object3D[];
  ringInfos: RingInfo[];

  // Référence au modèle pour transformation de zone
  modelRef: THREE.Object3D | null;

  // États
  forceShowAll: boolean;
  isAnimating: boolean;
  showZoneHelper: boolean;

  // Configuration contrôles clavier
  moveSpeed: number;
  scaleSpeed: number;

  // Temp vectors pour calculs (performance)
  tempVec: THREE.Vector3;
  tempZone: THREE.Vector3;
}

type RevelationEvent =
  | { type: 'SET_RINGS'; rings: THREE.Object3D[] }
  | { type: 'SET_MODEL_REFERENCE'; model: THREE.Object3D }
  | { type: 'UPDATE_REVELATION' }
  | { type: 'TOGGLE_FORCE_SHOW_ALL' }
  | { type: 'SET_FORCE_SHOW_ALL'; force: boolean }
  | { type: 'TOGGLE_ZONE_HELPER'; visible: boolean }
  | { type: 'START_RING_ANIMATION' }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'MOVE_ZONE'; direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward' }
  | { type: 'SCALE_ZONE'; direction: 'increase' | 'decrease' }
  | { type: 'UPDATE_ZONE_POSITION'; position: { x: number; y: number; z: number } }
  | { type: 'UPDATE_ZONE_RADIUS'; radius: number }
  | { type: 'RESET_ZONE' };

// Configuration par défaut depuis V3_CONFIG
const DEFAULT_ZONE: TriggerZone = {
  position: { x: 3.3, y: 3.4, z: 1.9 },
  radius: 1.3,
  height: 0.6
};

export const revelationMachine = setup({
  types: {
    context: {} as RevelationContext,
    events: {} as RevelationEvent
  },
  actions: {
    // Définir les rings à gérer
    setRings: assign({
      rings: ({ event }) => {
        if (event.type === 'SET_RINGS') {
          console.log(`[revelationMachine] 📍 ${event.rings.length} rings enregistrés`);
          return event.rings;
        }
        return [];
      }
    }),

    // Définir la référence au modèle
    setModelReference: assign({
      modelRef: ({ event }) => {
        if (event.type === 'SET_MODEL_REFERENCE') {
          console.log('[revelationMachine] 🎭 Référence modèle enregistrée');
          return event.model;
        }
        return null;
      }
    }),

    // Mettre à jour la révélation (logique principale)
    updateRevelation: assign({
      ringInfos: ({ context }) => {
        const { rings, triggerZone, modelRef, forceShowAll, tempVec, tempZone } = context;

        if (rings.length === 0) return [];

        const updatedRings: RingInfo[] = rings.map(ring => {
          // Position mondiale du ring
          ring.getWorldPosition(tempVec);

          // Position de la zone (transformée si modèle présent)
          let zonePosition = new THREE.Vector3(
            triggerZone.position.x,
            triggerZone.position.y,
            triggerZone.position.z
          );

          if (modelRef) {
            tempZone.copy(zonePosition);
            tempZone.applyMatrix4(modelRef.matrixWorld);
            zonePosition = tempZone.clone();
          }

          // Calcul distance et zone
          const distance = tempVec.distanceTo(zonePosition);
          const isInZone = distance <= triggerZone.radius &&
                          Math.abs(tempVec.y - zonePosition.y) <= triggerZone.height;

          // Logique inversée : visible HORS zone, invisible DANS zone
          const shouldShow = forceShowAll || !isInZone;

          // Appliquer la visibilité au parent ET à tous les enfants
          ring.visible = shouldShow;
          ring.traverse((child) => {
            child.visible = shouldShow;
          });

          return {
            name: ring.name,
            object: ring,
            position: tempVec.clone(),
            visible: shouldShow,
            distance,
            isInZone
          };
        });

        return updatedRings;
      }
    }),

    // Toggle force show all
    toggleForceShowAll: assign({
      forceShowAll: ({ context }) => {
        const newValue = !context.forceShowAll;
        console.log(`[revelationMachine] 👁️ ForceShowAll: ${newValue}`);
        return newValue;
      }
    }),

    // Set force show all
    setForceShowAll: assign({
      forceShowAll: ({ event }) => {
        if (event.type === 'SET_FORCE_SHOW_ALL') {
          console.log(`[revelationMachine] 👁️ ForceShowAll set to: ${event.force}`);
          return event.force;
        }
        return false;
      }
    }),

    // Démarrer animation
    startAnimation: assign({
      isAnimating: () => {
        console.log('[revelationMachine] 🎬 Animation des rings démarrée');
        return true;
      }
    }),

    // Animation terminée
    completeAnimation: assign({
      isAnimating: () => {
        console.log('[revelationMachine] ✅ Animation des rings terminée');
        return false;
      }
    }),

    // Déplacer la zone
    moveZone: assign({
      triggerZone: ({ context, event }) => {
        if (event.type !== 'MOVE_ZONE') return context.triggerZone;

        const { position } = context.triggerZone;
        const { moveSpeed } = context;
        const newPosition = { ...position };

        switch (event.direction) {
          case 'forward': // Z - Avant
            newPosition.z -= moveSpeed;
            break;
          case 'backward': // S - Arrière
            newPosition.z += moveSpeed;
            break;
          case 'left': // Q - Gauche
            newPosition.x -= moveSpeed;
            break;
          case 'right': // D - Droite
            newPosition.x += moveSpeed;
            break;
          case 'up': // A - Monter
            newPosition.y += moveSpeed;
            break;
          case 'down': // E - Descendre
            newPosition.y -= moveSpeed;
            break;
        }

        console.log(`[revelationMachine] 📐 Zone déplacée: ${event.direction}`, newPosition);

        return {
          ...context.triggerZone,
          position: newPosition
        };
      }
    }),

    // Redimensionner la zone
    scaleZone: assign({
      triggerZone: ({ context, event }) => {
        if (event.type !== 'SCALE_ZONE') return context.triggerZone;

        const { scaleSpeed } = context;
        let newRadius = context.triggerZone.radius;

        if (event.direction === 'increase') {
          newRadius += scaleSpeed;
        } else {
          newRadius = Math.max(0.5, newRadius - scaleSpeed);
        }

        console.log(`[revelationMachine] 🔍 Zone redimensionnée: ${newRadius.toFixed(2)}`);

        return {
          ...context.triggerZone,
          radius: newRadius
        };
      }
    }),

    // Réinitialiser la zone
    resetZone: assign({
      triggerZone: () => {
        console.log('[revelationMachine] 🔄 Zone réinitialisée');
        return { ...DEFAULT_ZONE };
      }
    }),

    // Toggle zone helper visibility
    toggleZoneHelper: assign({
      showZoneHelper: ({ event }) => {
        if (event.type === 'TOGGLE_ZONE_HELPER') {
          console.log(`[revelationMachine] 👁️ Zone helper: ${event.visible ? 'VISIBLE' : 'HIDDEN'}`);
          return event.visible;
        }
        return false;
      }
    })
  }
}).createMachine({
  id: 'revelation',
  initial: 'idle',
  context: {
    triggerZone: { ...DEFAULT_ZONE },
    rings: [],
    ringInfos: [],
    modelRef: null,
    forceShowAll: false,
    isAnimating: false,
    showZoneHelper: false,
    moveSpeed: 0.5,
    scaleSpeed: 0.1,
    tempVec: new THREE.Vector3(),
    tempZone: new THREE.Vector3()
  },
  states: {
    idle: {
      on: {
        SET_RINGS: {
          actions: 'setRings'
        },
        SET_MODEL_REFERENCE: {
          actions: 'setModelReference'
        },
        UPDATE_REVELATION: {
          actions: 'updateRevelation'
        },
        TOGGLE_FORCE_SHOW_ALL: {
          actions: ['toggleForceShowAll', 'updateRevelation']
        },
        SET_FORCE_SHOW_ALL: {
          actions: ['setForceShowAll', 'updateRevelation']
        },
        TOGGLE_ZONE_HELPER: {
          actions: 'toggleZoneHelper'
        },
        START_RING_ANIMATION: {
          target: 'animating',
          actions: 'startAnimation'
        },
        MOVE_ZONE: {
          actions: ['moveZone', 'updateRevelation']
        },
        SCALE_ZONE: {
          actions: ['scaleZone', 'updateRevelation']
        },
        RESET_ZONE: {
          actions: ['resetZone', 'updateRevelation']
        }
      }
    },
    animating: {
      on: {
        ANIMATION_COMPLETE: {
          target: 'idle',
          actions: 'completeAnimation'
        }
      }
    }
  }
});
