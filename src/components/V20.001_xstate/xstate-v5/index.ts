// xstate-v5/index.ts
// Export all machines
export { bloomMachine } from './actors/bloom/bloomMachine';
export { lightingMachine } from './actors/lighting/lightingMachine';
export { pbrMachine } from './actors/pbr/pbrMachine';
export { performanceMonitor } from './actors/performance/performanceMonitor';
export { effectsMachine } from './actors/effects/effectsMachine';
export { sceneMachine } from './actors/scene/sceneMachine';
export { materialMachine } from './actors/material/materialMachine';
export { applicationMachine } from './actors/applicationMachine';

// Export all hooks
export { useBloom } from './hooks/useBloom';
export { useLighting } from './hooks/useLighting';
export { usePBR } from './hooks/usePBR';
export { usePerformance } from './hooks/usePerformance';
export { useEffects } from './hooks/useEffects';
export { useScene } from './hooks/useScene';
export { useMaterial } from './hooks/useMaterial';
export { useApplication } from './hooks/useApplication';

// Export all utils
export { LIGHT_POSITION_PRESETS, type PresetKey, type LightPreset } from './utils/lightPresets';
export { PBR_PRESETS, type PBRPresetKey, type PBRPreset } from './utils/pbrPresets';
export { TONE_MAPPING_MAP, TONE_MAPPING_OPTIONS, type ToneMappingType } from './utils/toneMappingMap';
export { EFFECT_PRESETS, type EffectPresetKey, type EffectPreset } from './utils/effectPresets';

// Export types
export type { BloomContext, BloomEvents } from './actors/bloom/bloomMachine';
export type { LightingContext, LightingEvents } from './actors/lighting/lightingMachine';
export type { PBRContext, PBREvents, ObjectType } from './actors/pbr/pbrMachine';
export type { PerformanceContext, PerformanceEvents } from './actors/performance/performanceMonitor';
export type { EffectsContext, EffectsEvents } from './actors/effects/effectsMachine';
export type { SceneContext, SceneEvents } from './actors/scene/sceneMachine';
export type { MaterialContext, MaterialEvents, MaterialGroup } from './actors/material/materialMachine';
export type { ApplicationContext, ApplicationEvents } from './actors/applicationMachine';
