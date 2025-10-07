// xstate-v5/actors/scene/sceneLifecycleMachine.types.ts
import * as THREE from 'three';
import type { ActorRefFrom } from 'xstate';
import type { animationMachine } from '../animation/animationMachine';

export interface SceneLifecycleContext {
  model: THREE.Group | null;
  bones: THREE.Bone[];
  animations: THREE.AnimationClip[];
  materials: Map<string, THREE.Material>;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  mixer: THREE.AnimationMixer | null;
  containerElement: HTMLElement | null;
  path: string | null;
  animationActor: ActorRefFrom<typeof animationMachine> | null;
  error: Error | null;
}

export type SceneLifecycleEvents =
  | { type: 'LOAD_SCENE'; path: string; containerElement: HTMLElement }
  | { type: 'CLEANUP_SCENE' }
  | { type: 'RETRY_LOAD' };
