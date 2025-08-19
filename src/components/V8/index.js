// 🚀 Point d'entrée V8 - WORLD ENVIRONMENT ARCHITECTURE
import V3Scene from './components/V3Scene.jsx';

// Export par défaut pour App.jsx
export default V3Scene;

// Export nommé pour compatibilité
export { default as V3Scene } from './components/V3Scene.jsx';

// Export des hooks pour usage avancé
export { useThreeScene } from './hooks/useThreeScene.js';
export { useRevealManager } from './hooks/useRevealManager.js';
export { useModelLoader } from './hooks/useModelLoader.js';
export { useRobotController } from './hooks/useRobotController.js';
export { useTriggerControls } from './hooks/useTriggerControls.js';
export { useCameraFitter } from './hooks/useCameraFitter.js';

// Export des composants UI
export { default as Canvas3D } from './components/Canvas3D.jsx';
export { default as DebugPanel } from './components/DebugPanel.jsx';

// Export des systèmes NOUVEAUX
export { AnimationController } from './systems/animationSystemes/index.js';
export { RevealationSystem } from './systems/revelationSystems/RevealationSystem.js';
export { BloomControlCenter } from './systems/bloomEffects/BloomControlCenter.js';
export { EyeRingRotationManager } from './systems/eyeSystems/EyeRingRotationManager.js';
// ❌ SUPPRIMÉ : SecurityIRISManager (remplacé par BloomControlCenter)
// ❌ SUPPRIMÉ : DecorativeRingsBloomManager (remplacé par BloomControlCenter)

// Export de la configuration
export { V3_CONFIG } from './utils/config.js';
export { 
  RING_MATERIALS, 
  ARM_MATERIALS, 
  SECURITY_STATES,
  DECORATIVE_BLOOM_CONFIG,
  getMaterialType,
  createBloomMaterial,
  createSecurityMaterial
} from './utils/materials.js';

// Export des utilitaires
export {
  fitCameraToObject,
  createTriggerZone,
  createBloomMaterial as createBloomMaterialHelper,
  createSecurityMaterial as createSecurityMaterialHelper,
  analyzeBloomObjects
} from './utils/helpers.js';