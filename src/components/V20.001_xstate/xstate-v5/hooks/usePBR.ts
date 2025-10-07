// xstate-v5/hooks/usePBR.ts
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { pbrMachine, ObjectType } from '../actors/pbr/pbrMachine';
import type { ToneMappingType } from '../utils/toneMappingMap';
import type { PBRPresetKey } from '../utils/pbrPresets';

export function usePBR(actorRef: ActorRefFrom<typeof pbrMachine>) {
  // Tone Mapping
  const toneMapping = useSelector(actorRef, (state) => state.context.toneMapping);

  // Groups
  const eyeRingsMetalness = useSelector(actorRef, (state) => state.context.groups.eyeRings.metalness);
  const eyeRingsRoughness = useSelector(actorRef, (state) => state.context.groups.eyeRings.roughness);

  const irisMetalness = useSelector(actorRef, (state) => state.context.groups.iris.metalness);
  const irisRoughness = useSelector(actorRef, (state) => state.context.groups.iris.roughness);

  const magicRingsMetalness = useSelector(actorRef, (state) => state.context.groups.magicRings.metalness);
  const magicRingsRoughness = useSelector(actorRef, (state) => state.context.groups.magicRings.roughness);

  const armsMetalness = useSelector(actorRef, (state) => state.context.groups.arms.metalness);
  const armsRoughness = useSelector(actorRef, (state) => state.context.groups.arms.roughness);

  const currentPreset = useSelector(actorRef, (state) => state.context.currentPreset);

  // Actions
  const setToneMapping = (toneMapping: ToneMappingType) => {
    actorRef.send({ type: 'SET_TONE_MAPPING', toneMapping });
  };

  const updateGroupMetalness = (group: ObjectType, metalness: number) => {
    actorRef.send({ type: 'UPDATE_GROUP_METALNESS', group, metalness });
  };

  const updateGroupRoughness = (group: ObjectType, roughness: number) => {
    actorRef.send({ type: 'UPDATE_GROUP_ROUGHNESS', group, roughness });
  };

  const applyPresetToGroup = (group: ObjectType, preset: PBRPresetKey) => {
    actorRef.send({ type: 'APPLY_PRESET_TO_GROUP', group, preset });
  };

  const restoreDefaults = () => {
    actorRef.send({ type: 'RESTORE_DEFAULTS' });
  };

  return {
    // State
    toneMapping,
    eyeRings: {
      metalness: eyeRingsMetalness,
      roughness: eyeRingsRoughness
    },
    iris: {
      metalness: irisMetalness,
      roughness: irisRoughness
    },
    magicRings: {
      metalness: magicRingsMetalness,
      roughness: magicRingsRoughness
    },
    arms: {
      metalness: armsMetalness,
      roughness: armsRoughness
    },
    currentPreset,

    // Actions
    setToneMapping,
    updateGroupMetalness,
    updateGroupRoughness,
    applyPresetToGroup,
    restoreDefaults
  };
}
