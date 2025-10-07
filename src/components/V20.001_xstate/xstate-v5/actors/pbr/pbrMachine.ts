// xstate-v5/actors/pbr/pbrMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import { TONE_MAPPING_MAP, type ToneMappingType } from '../../utils/toneMappingMap';
import { PBR_PRESETS, type PBRPresetKey } from '../../utils/pbrPresets';

export type ObjectType = 'eyeRings' | 'iris' | 'magicRings' | 'arms';

export interface ObjectGroup {
  materials: THREE.Material[] | null;
  metalness: number;
  roughness: number;
}

export interface PBRContext {
  renderer: THREE.WebGLRenderer | null;
  toneMapping: ToneMappingType;

  // 4 groupes d'objets
  groups: {
    eyeRings: ObjectGroup;
    iris: ObjectGroup;
    magicRings: ObjectGroup;
    arms: ObjectGroup;
  };

  // Preset actuel (optionnel, pour UI)
  currentPreset: PBRPresetKey | null;
}

export type PBREvents =
  // Initialisation
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }
  | { type: 'SET_GROUP_MATERIALS'; group: ObjectType; materials: THREE.Material[] }

  // Tone Mapping
  | { type: 'SET_TONE_MAPPING'; toneMapping: ToneMappingType }

  // Per-group PBR controls
  | { type: 'UPDATE_GROUP_METALNESS'; group: ObjectType; metalness: number }
  | { type: 'UPDATE_GROUP_ROUGHNESS'; group: ObjectType; roughness: number }

  // Preset (applique à un groupe spécifique)
  | { type: 'APPLY_PRESET_TO_GROUP'; group: ObjectType; preset: PBRPresetKey }

  // Restore defaults
  | { type: 'RESTORE_DEFAULTS' };

export const pbrMachine = setup({
  types: {} as {
    context: PBRContext;
    events: PBREvents;
  },
  actions: {
    // Appliquer tone mapping
    applyToneMapping: ({ context }) => {
      if (context.renderer) {
        context.renderer.toneMapping = TONE_MAPPING_MAP[context.toneMapping];
        console.log(`[pbrMachine] Set tone mapping to ${context.toneMapping}`);
      }
    },

    // Appliquer metalness à un groupe
    applyGroupMetalness: ({ context, event }) => {
      if (event.type === 'UPDATE_GROUP_METALNESS') {
        const group = context.groups[event.group];

        if (group.materials) {
          group.materials.forEach((material) => {
            if ('metalness' in material) {
              (material as THREE.MeshStandardMaterial).metalness = event.metalness;
              material.needsUpdate = true;
            }
          });
          console.log(`[pbrMachine] Set ${event.group} metalness to ${event.metalness}`);
        }
      }
    },

    // Appliquer roughness à un groupe
    applyGroupRoughness: ({ context, event }) => {
      if (event.type === 'UPDATE_GROUP_ROUGHNESS') {
        const group = context.groups[event.group];

        if (group.materials) {
          group.materials.forEach((material) => {
            if ('roughness' in material) {
              (material as THREE.MeshStandardMaterial).roughness = event.roughness;
              material.needsUpdate = true;
            }
          });
          console.log(`[pbrMachine] Set ${event.group} roughness to ${event.roughness}`);
        }
      }
    },

    // Appliquer preset à un groupe
    applyPresetToGroup: ({ context, event }) => {
      if (event.type === 'APPLY_PRESET_TO_GROUP') {
        const preset = PBR_PRESETS[event.preset];
        const group = context.groups[event.group];

        if (group.materials) {
          group.materials.forEach((material) => {
            if ('metalness' in material && 'roughness' in material) {
              const mat = material as THREE.MeshStandardMaterial;
              mat.metalness = preset.metalness;
              mat.roughness = preset.roughness;
              material.needsUpdate = true;
            }
          });
          console.log(`[pbrMachine] Applied preset "${event.preset}" to ${event.group} (metalness: ${preset.metalness}, roughness: ${preset.roughness})`);
        }
      }
    }
  }
}).createMachine({
  id: 'pbr',
  context: {
    renderer: null,
    toneMapping: 'ACESFilmicToneMapping', // Default V6

    groups: {
      eyeRings: {
        materials: null,
        metalness: 0.5,
        roughness: 0.5
      },
      iris: {
        materials: null,
        metalness: 0.5,
        roughness: 0.5
      },
      magicRings: {
        materials: null,
        metalness: 0.5,
        roughness: 0.5
      },
      arms: {
        materials: null,
        metalness: 0.5,
        roughness: 0.5
      }
    },

    currentPreset: null
  },
  on: {
    SET_RENDERER: {
      actions: [
        assign({ renderer: ({ event }) => event.renderer }),
        'applyToneMapping'
      ]
    },

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
        // Appliquer metalness et roughness par défaut immédiatement
        ({ context, event }) => {
          const group = context.groups[event.group];
          if (group.materials) {
            group.materials.forEach((material) => {
              if ('metalness' in material && 'roughness' in material) {
                const mat = material as THREE.MeshStandardMaterial;
                mat.metalness = group.metalness;
                mat.roughness = group.roughness;
                material.needsUpdate = true;
              }
            });
            console.log(`[pbrMachine] Applied default PBR to ${event.group} (metalness: ${group.metalness}, roughness: ${group.roughness})`);
          }
        }
      ]
    },

    SET_TONE_MAPPING: {
      actions: [
        assign({ toneMapping: ({ event }) => event.toneMapping }),
        'applyToneMapping'
      ]
    },

    UPDATE_GROUP_METALNESS: {
      actions: [
        assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              metalness: event.metalness
            }
          })
        }),
        'applyGroupMetalness'
      ]
    },

    UPDATE_GROUP_ROUGHNESS: {
      actions: [
        assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              roughness: event.roughness
            }
          })
        }),
        'applyGroupRoughness'
      ]
    },

    APPLY_PRESET_TO_GROUP: {
      actions: [
        assign({
          groups: ({ context, event }) => {
            const preset = PBR_PRESETS[event.preset];
            return {
              ...context.groups,
              [event.group]: {
                ...context.groups[event.group],
                metalness: preset.metalness,
                roughness: preset.roughness
              }
            };
          },
          currentPreset: ({ event }) => event.preset
        }),
        'applyPresetToGroup'
      ]
    },

    RESTORE_DEFAULTS: {
      actions: [
        assign({
          toneMapping: 'ACESFilmicToneMapping',
          groups: {
            eyeRings: {
              materials: null,
              metalness: 0.8,
              roughness: 0.2
            },
            iris: {
              materials: null,
              metalness: 0.5,
              roughness: 0.5
            },
            magicRings: {
              materials: null,
              metalness: 1.0,
              roughness: 0.5
            },
            arms: {
              materials: null,
              metalness: 0.6,
              roughness: 0.4
            }
          },
          currentPreset: null
        }),
        'applyToneMapping'
      ]
    }
  }
});
