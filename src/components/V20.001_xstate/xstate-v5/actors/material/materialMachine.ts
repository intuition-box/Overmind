// xstate-v5/actors/material/materialMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';

export type MaterialGroup = 'iris' | 'eyeRings' | 'revealRings';

export interface GroupConfig {
  materials: THREE.Material[] | null;
  emissiveColor: string;
  emissiveIntensity: number;
  visible: boolean;
  objects: THREE.Object3D[] | null; // For reveal rings visibility
}

export interface MaterialContext {
  groups: {
    iris: GroupConfig;
    eyeRings: GroupConfig;
    revealRings: GroupConfig;
  };
}

export type MaterialEvents =
  // Initialisation
  | { type: 'SET_GROUP_MATERIALS'; group: MaterialGroup; materials: THREE.Material[] }
  | { type: 'SET_REVEAL_OBJECTS'; objects: THREE.Object3D[] }

  // Per-group emissive controls
  | { type: 'UPDATE_GROUP_EMISSIVE_COLOR'; group: MaterialGroup; color: string }
  | { type: 'UPDATE_GROUP_EMISSIVE_INTENSITY'; group: MaterialGroup; intensity: number }

  // Apply color to ALL groups (from bloomMachine via BloomColorPicker)
  | { type: 'SET_ALL_GROUPS_COLOR'; color: string }

  // Reveal visibility toggle
  | { type: 'TOGGLE_REVEAL_VISIBILITY' }
  | { type: 'SHOW_REVEAL' }
  | { type: 'HIDE_REVEAL' }

  // Restore defaults
  | { type: 'RESTORE_DEFAULTS' };

export const materialMachine = setup({
  types: {} as {
    context: MaterialContext;
    events: MaterialEvents;
  },
  actions: {
    // Apply emissive color to a specific group
    applyGroupEmissiveColor: ({ context, event }) => {
      if (event.type === 'UPDATE_GROUP_EMISSIVE_COLOR') {
        const group = context.groups[event.group];

        if (group.materials) {
          const color = new THREE.Color(event.color);
          group.materials.forEach((material) => {
            if ('emissive' in material) {
              (material as THREE.MeshStandardMaterial).emissive.copy(color);
              material.needsUpdate = true;
            }
          });
          console.log(`[materialMachine] Set ${event.group} emissive color to ${event.color}`);
        }
      }
    },

    // Apply emissive intensity to a specific group
    applyGroupEmissiveIntensity: ({ context, event }) => {
      if (event.type === 'UPDATE_GROUP_EMISSIVE_INTENSITY') {
        const group = context.groups[event.group];

        if (group.materials) {
          group.materials.forEach((material) => {
            if ('emissiveIntensity' in material) {
              (material as THREE.MeshStandardMaterial).emissiveIntensity = event.intensity;
              material.needsUpdate = true;
            }
          });
          console.log(`[materialMachine] Set ${event.group} emissive intensity to ${event.intensity}`);
        }
      }
    },

    // Apply color to ALL groups (BloomColorPicker)
    applyColorToAllGroups: ({ context, event }) => {
      if (event.type === 'SET_ALL_GROUPS_COLOR') {
        const color = new THREE.Color(event.color);

        (['iris', 'eyeRings', 'revealRings'] as MaterialGroup[]).forEach((groupName) => {
          const group = context.groups[groupName];

          if (group.materials) {
            group.materials.forEach((material) => {
              if ('emissive' in material) {
                (material as THREE.MeshStandardMaterial).emissive.copy(color);
                material.needsUpdate = true;
              }
            });
          }
        });

        console.log(`[materialMachine] Applied color ${event.color} to ALL groups`);
      }
    },

    // Toggle reveal visibility
    applyRevealVisibility: ({ context }) => {
      const revealGroup = context.groups.revealRings;

      console.log('[materialMachine] applyRevealVisibility called');
      console.log('[materialMachine] revealGroup.visible:', revealGroup.visible);

      if (revealGroup.objects) {
        revealGroup.objects.forEach((obj) => {
          // SIMPLE approach: just set visible, nothing else
          // This avoids conflicts with material properties
          obj.visible = revealGroup.visible;

          // Also traverse children to ensure they follow parent visibility
          obj.traverse((child) => {
            child.visible = revealGroup.visible;
          });
        });

        console.log(`[materialMachine] ✅ Reveal rings ${revealGroup.visible ? 'VISIBLE' : 'HIDDEN'}`);
      } else {
        console.warn('[materialMachine] ⚠️ No objects registered for reveal rings');
      }
    }
  }
}).createMachine({
  id: 'material',
  context: {
    groups: {
      iris: {
        materials: null,
        emissiveColor: '#00ff88', // Green V6 default
        emissiveIntensity: 0.5,
        visible: true,
        objects: null
      },
      eyeRings: {
        materials: null,
        emissiveColor: '#4488ff', // Blue V6 default
        emissiveIntensity: 0.5,
        visible: true,
        objects: null
      },
      revealRings: {
        materials: null,
        emissiveColor: '#ffaa00', // Orange V6 default
        emissiveIntensity: 0.5,
        visible: false, // Hidden by default
        objects: null
      }
    }
  },
  on: {
    SET_GROUP_MATERIALS: {
      actions: [
        assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              materials: event.materials
            }
          })
        }),
        // Appliquer emissiveColor et emissiveIntensity par défaut immédiatement
        ({ context, event }) => {
          const group = context.groups[event.group];
          if (group.materials) {
            const color = new THREE.Color(group.emissiveColor);
            group.materials.forEach((material) => {
              if ('emissive' in material && 'emissiveIntensity' in material) {
                const mat = material as THREE.MeshStandardMaterial;
                mat.emissive.copy(color);
                mat.emissiveIntensity = group.emissiveIntensity;
                material.needsUpdate = true;
              }
            });
            console.log(`[materialMachine] Applied default emissive to ${event.group} (color: ${group.emissiveColor}, intensity: ${group.emissiveIntensity})`);
          }
        }
      ]
    },

    SET_REVEAL_OBJECTS: {
      actions: assign({
        groups: ({ context, event }) => ({
          ...context.groups,
          revealRings: {
            ...context.groups.revealRings,
            objects: event.objects
          }
        })
      })
    },

    UPDATE_GROUP_EMISSIVE_COLOR: {
      actions: [
        assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              emissiveColor: event.color
            }
          })
        }),
        'applyGroupEmissiveColor'
      ]
    },

    UPDATE_GROUP_EMISSIVE_INTENSITY: {
      actions: [
        assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              emissiveIntensity: event.intensity
            }
          })
        }),
        'applyGroupEmissiveIntensity'
      ]
    },

    SET_ALL_GROUPS_COLOR: {
      actions: [
        assign({
          groups: ({ context, event }) => ({
            iris: { ...context.groups.iris, emissiveColor: event.color },
            eyeRings: { ...context.groups.eyeRings, emissiveColor: event.color },
            revealRings: { ...context.groups.revealRings, emissiveColor: event.color }
          })
        }),
        'applyColorToAllGroups'
      ]
    },

    TOGGLE_REVEAL_VISIBILITY: {
      actions: [
        assign({
          groups: ({ context }) => ({
            ...context.groups,
            revealRings: {
              ...context.groups.revealRings,
              visible: !context.groups.revealRings.visible
            }
          })
        }),
        'applyRevealVisibility'
      ]
    },

    SHOW_REVEAL: {
      actions: [
        assign({
          groups: ({ context }) => ({
            ...context.groups,
            revealRings: {
              ...context.groups.revealRings,
              visible: true
            }
          })
        }),
        'applyRevealVisibility'
      ]
    },

    HIDE_REVEAL: {
      actions: [
        assign({
          groups: ({ context }) => ({
            ...context.groups,
            revealRings: {
              ...context.groups.revealRings,
              visible: false
            }
          })
        }),
        'applyRevealVisibility'
      ]
    },

    RESTORE_DEFAULTS: {
      actions: assign({
        groups: {
          iris: {
            materials: null,
            emissiveColor: '#00ff88',
            emissiveIntensity: 0.5,
            visible: true,
            objects: null
          },
          eyeRings: {
            materials: null,
            emissiveColor: '#4488ff',
            emissiveIntensity: 0.5,
            visible: true,
            objects: null
          },
          revealRings: {
            materials: null,
            emissiveColor: '#ffaa00',
            emissiveIntensity: 0.5,
            visible: false,
            objects: null
          }
        }
      })
    }
  }
});
