// xstate-v5/actors/animation/animationMachine.types.ts
import * as THREE from 'three';

export interface AnimationContext {
  mixer: THREE.AnimationMixer | null;
  model: THREE.Group | null;
  animations: THREE.AnimationClip[];
  
  // Actions groupées
  permanentActions: Map<string, THREE.AnimationAction>;
  poseActions: Map<string, THREE.AnimationAction>;
  ringActions: Map<string, THREE.AnimationAction>;
  
  // État actuel
  currentState: 'idle' | 'loop' | 'revealing' | 'returning';
  currentPoseActions: THREE.AnimationAction[];
  permanentWeights: Map<string, number>;
  
  // Configuration
  fadeToRevealDuration: number;
  fadeToLoopDuration: number;
  timeScale: number;
  
  error: Error | null;
}

export type AnimationEvents =
  | { type: 'INITIALIZE'; mixer: THREE.AnimationMixer; model: THREE.Group; animations: THREE.AnimationClip[] }
  | { type: 'START_LOOP' }
  | { type: 'TRIGGER_REVEAL' }
  | { type: 'RINGS_FINISHED' }
  | { type: 'POSE_FINISHED'; actionName: string }
  | { type: 'RETURN_TO_LOOP' }
  | { type: 'STOP_ALL' };
