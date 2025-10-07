// xstate-v5/hooks/useLighting.ts
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { lightingMachine } from '../actors/lighting/lightingMachine';
import type { PresetKey } from '../utils/lightPresets';

export function useLighting(actorRef: ActorRefFrom<typeof lightingMachine>) {
  // Intensities
  const ambientIntensity = useSelector(actorRef, (state) => state.context.ambientIntensity);
  const directionalIntensity = useSelector(actorRef, (state) => state.context.directionalIntensity);
  const pointIntensity = useSelector(actorRef, (state) => state.context.pointIntensity);

  // Exposure
  const exposure = useSelector(actorRef, (state) => state.context.exposure);

  // HDR Boost
  const hdrBoostEnabled = useSelector(actorRef, (state) => state.context.hdrBoostEnabled);
  const hdrBoostMultiplier = useSelector(actorRef, (state) => state.context.hdrBoostMultiplier);

  // Light Position
  const directionalPosition = useSelector(actorRef, (state) => state.context.directionalPosition);
  const currentPreset = useSelector(actorRef, (state) => state.context.currentPreset);

  // Actions
  const updateAmbientIntensity = (intensity: number) => {
    actorRef.send({ type: 'UPDATE_AMBIENT_INTENSITY', intensity });
  };

  const updateDirectionalIntensity = (intensity: number) => {
    actorRef.send({ type: 'UPDATE_DIRECTIONAL_INTENSITY', intensity });
  };

  const updatePointIntensity = (intensity: number) => {
    actorRef.send({ type: 'UPDATE_POINT_INTENSITY', intensity });
  };

  const updateExposure = (exposure: number) => {
    actorRef.send({ type: 'UPDATE_EXPOSURE', exposure });
  };

  const toggleHDRBoost = () => {
    actorRef.send({ type: 'TOGGLE_HDR_BOOST' });
  };

  const updateHDRMultiplier = (multiplier: number) => {
    actorRef.send({ type: 'UPDATE_HDR_MULTIPLIER', multiplier });
  };

  const updateDirectionalPosition = (position: { x: number; y: number; z: number }) => {
    actorRef.send({ type: 'UPDATE_DIRECTIONAL_POSITION', position });
  };

  const applyLightPreset = (preset: PresetKey) => {
    actorRef.send({ type: 'APPLY_LIGHT_PRESET', preset });
  };

  return {
    // State
    ambientIntensity,
    directionalIntensity,
    pointIntensity,
    exposure,
    hdrBoostEnabled,
    hdrBoostMultiplier,
    directionalPosition,
    currentPreset,

    // Actions
    updateAmbientIntensity,
    updateDirectionalIntensity,
    updatePointIntensity,
    updateExposure,
    toggleHDRBoost,
    updateHDRMultiplier,
    updateDirectionalPosition,
    applyLightPreset
  };
}
