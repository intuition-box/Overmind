// xstate-v5/actors/lighting/lightingMachine.ts
import { setup, assign } from 'xstate';
import * as THREE from 'three';
import { LIGHT_POSITION_PRESETS, type PresetKey } from '../../utils/lightPresets';

export interface LightingContext {
  ambientLight: THREE.AmbientLight | null;
  directionalLight: THREE.DirectionalLight | null;
  pointLight: THREE.PointLight | null;
  ambientIntensity: number;
  directionalIntensity: number;
  pointIntensity: number;

  // Renderer + Exposure
  renderer: THREE.WebGLRenderer | null;
  exposure: number;

  // HDR Boost
  hdrBoostEnabled: boolean;
  hdrBoostMultiplier: number;

  // Light Position
  directionalPosition: { x: number; y: number; z: number };
  currentPreset: PresetKey;
}

export type LightingEvents =
  | { type: 'SET_LIGHTS'; ambientLight: THREE.AmbientLight; directionalLight: THREE.DirectionalLight; pointLight: THREE.PointLight }
  | { type: 'UPDATE_AMBIENT_INTENSITY'; intensity: number }
  | { type: 'UPDATE_DIRECTIONAL_INTENSITY'; intensity: number }
  | { type: 'UPDATE_POINT_INTENSITY'; intensity: number }
  | { type: 'SET_RENDERER'; renderer: THREE.WebGLRenderer }
  | { type: 'UPDATE_EXPOSURE'; exposure: number }
  | { type: 'TOGGLE_HDR_BOOST' }
  | { type: 'ENABLE_HDR_BOOST' }
  | { type: 'DISABLE_HDR_BOOST' }
  | { type: 'UPDATE_HDR_MULTIPLIER'; multiplier: number }
  | { type: 'UPDATE_DIRECTIONAL_POSITION'; position: { x: number; y: number; z: number } }
  | { type: 'APPLY_LIGHT_PRESET'; preset: PresetKey };

export const lightingMachine = setup({
  types: {} as {
    context: LightingContext;
    events: LightingEvents;
  },
  actions: {
    updateAmbientLight: ({ context }) => {
      if (context.ambientLight) {
        context.ambientLight.intensity = context.ambientIntensity;
      }
    },
    updateDirectionalLight: ({ context }) => {
      if (context.directionalLight) {
        context.directionalLight.intensity = context.directionalIntensity;
      }
    },
    updatePointLight: ({ context }) => {
      if (context.pointLight) {
        context.pointLight.intensity = context.pointIntensity;
      }
    },
    updateExposure: ({ context }) => {
      if (context.renderer) {
        const finalExposure = context.hdrBoostEnabled
          ? context.exposure * context.hdrBoostMultiplier
          : context.exposure;

        context.renderer.toneMappingExposure = finalExposure;
        console.log(`[lightingMachine] Set exposure to ${finalExposure} (base: ${context.exposure}, HDR: ${context.hdrBoostEnabled ? 'ON' : 'OFF'})`);
      }
    },
    updateDirectionalPosition: ({ context }) => {
      if (context.directionalLight) {
        const { x, y, z } = context.directionalPosition;
        context.directionalLight.position.set(x, y, z);
        console.log(`[lightingMachine] Set position to (${x}, ${y}, ${z})`);
      }
    }
  }
}).createMachine({
  id: 'lighting',
  context: {
    ambientLight: null,
    directionalLight: null,
    pointLight: null,
    ambientIntensity: 0.5,
    directionalIntensity: 0.8,
    pointIntensity: 1.0,

    renderer: null,
    exposure: 1.7,
    hdrBoostEnabled: true,
    hdrBoostMultiplier: 2.5,
    directionalPosition: { x: 1, y: 2, z: 3 },
    currentPreset: 'studio-classic'
  },
  on: {
    SET_LIGHTS: {
      actions: [
        assign({
          ambientLight: ({ event }) => event.ambientLight,
          directionalLight: ({ event }) => event.directionalLight,
          pointLight: ({ event }) => event.pointLight
        }),
        // Appliquer les intensités par défaut immédiatement
        'updateAmbientLight',
        'updateDirectionalLight',
        'updatePointLight',
        'updateDirectionalPosition'
      ]
    },
    UPDATE_AMBIENT_INTENSITY: {
      actions: [
        assign({ ambientIntensity: ({ event }) => event.intensity }),
        'updateAmbientLight'
      ]
    },
    UPDATE_DIRECTIONAL_INTENSITY: {
      actions: [
        assign({ directionalIntensity: ({ event }) => event.intensity }),
        'updateDirectionalLight'
      ]
    },
    UPDATE_POINT_INTENSITY: {
      actions: [
        assign({ pointIntensity: ({ event }) => event.intensity }),
        'updatePointLight'
      ]
    },
    SET_RENDERER: {
      actions: [
        assign({ renderer: ({ event }) => event.renderer }),
        'updateExposure' // Appliquer l'exposure/HDR immédiatement au démarrage
      ]
    },
    UPDATE_EXPOSURE: {
      actions: [
        assign({ exposure: ({ event }) => event.exposure }),
        'updateExposure'
      ]
    },
    TOGGLE_HDR_BOOST: {
      actions: [
        assign({ hdrBoostEnabled: ({ context }) => !context.hdrBoostEnabled }),
        'updateExposure'
      ]
    },
    ENABLE_HDR_BOOST: {
      actions: [
        assign({ hdrBoostEnabled: true }),
        'updateExposure'
      ]
    },
    DISABLE_HDR_BOOST: {
      actions: [
        assign({ hdrBoostEnabled: false }),
        'updateExposure'
      ]
    },
    UPDATE_HDR_MULTIPLIER: {
      actions: [
        assign({ hdrBoostMultiplier: ({ event }) => event.multiplier }),
        'updateExposure'
      ]
    },
    UPDATE_DIRECTIONAL_POSITION: {
      actions: [
        assign({
          directionalPosition: ({ event }) => event.position,
          currentPreset: 'studio-classic' as PresetKey
        }),
        'updateDirectionalPosition'
      ]
    },
    APPLY_LIGHT_PRESET: {
      actions: [
        assign(({ event }) => {
          const preset = LIGHT_POSITION_PRESETS[event.preset];
          return {
            directionalPosition: preset.position,
            currentPreset: event.preset
          };
        }),
        'updateDirectionalPosition'
      ]
    }
  }
});
