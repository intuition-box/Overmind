// xstate-v5/hooks/useEffects.ts
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { effectsMachine } from '../actors/effects/effectsMachine';
import type { EffectPresetKey } from '../utils/effectPresets';

export function useEffects(actorRef: ActorRefFrom<typeof effectsMachine>) {
  // State selectors
  const glowEnabled = useSelector(actorRef, (state) => state.context.glowEnabled);
  const ultraBloomEnabled = useSelector(actorRef, (state) => state.context.ultraBloomEnabled);
  const motionTrailEnabled = useSelector(actorRef, (state) => state.context.motionTrailEnabled);
  const currentPreset = useSelector(actorRef, (state) => state.context.currentPreset);

  // Actions
  const toggleGlow = () => {
    actorRef.send({ type: 'TOGGLE_GLOW' });
  };

  const toggleUltraBloom = () => {
    actorRef.send({ type: 'TOGGLE_ULTRA_BLOOM' });
  };

  const toggleMotionTrail = () => {
    actorRef.send({ type: 'TOGGLE_MOTION_TRAIL' });
  };

  const enableGlow = () => {
    actorRef.send({ type: 'ENABLE_GLOW' });
  };

  const disableGlow = () => {
    actorRef.send({ type: 'DISABLE_GLOW' });
  };

  const enableUltraBloom = () => {
    actorRef.send({ type: 'ENABLE_ULTRA_BLOOM' });
  };

  const disableUltraBloom = () => {
    actorRef.send({ type: 'DISABLE_ULTRA_BLOOM' });
  };

  const enableMotionTrail = () => {
    actorRef.send({ type: 'ENABLE_MOTION_TRAIL' });
  };

  const disableMotionTrail = () => {
    actorRef.send({ type: 'DISABLE_MOTION_TRAIL' });
  };

  const applyEffectPreset = (preset: EffectPresetKey) => {
    actorRef.send({ type: 'APPLY_EFFECT_PRESET', preset });
  };

  const restoreDefaults = () => {
    actorRef.send({ type: 'RESTORE_DEFAULTS' });
  };

  return {
    // State
    glowEnabled,
    ultraBloomEnabled,
    motionTrailEnabled,
    currentPreset,

    // Actions
    toggleGlow,
    toggleUltraBloom,
    toggleMotionTrail,
    enableGlow,
    disableGlow,
    enableUltraBloom,
    disableUltraBloom,
    enableMotionTrail,
    disableMotionTrail,
    applyEffectPreset,
    restoreDefaults
  };
}
